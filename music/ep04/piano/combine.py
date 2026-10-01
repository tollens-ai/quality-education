"""Vote the piano take's word times, snap them to the voice, measure held tails, and check them.

    python music/ep04/piano/combine.py <vocal stem> <rough.json> <estimates.json> <lyrics.json out> \
        <captions.srt out> <report.txt> <stem lag s> <whisper words.json>...

Adapted from music/ep03/combine.py. The estimates are align_multi.py's (music/ep03): two aligners
(MMS_FA and English wav2vec2) at playback rates 1.0, 0.8 and 0.65, a line at a time with its
neighbours. Whisper's word starts, from runs on the vocal stem and the mix, are two further votes
once their bias against the aligners is taken off.

1. Vote. A word's onset is the median of all votes. `timing_spread_ms` is the inter-quartile range
   of the six aligner votes.
2. Snap. The onset moves to the nearest onset of sound on the stem within 90 ms before or 60 ms
   after, never before the previous word.
3. Tails. A word ends where the next word starts, unless the voice falls silent first: then it ends
   where the stem's energy has fallen 20 dB below the word's own peak and stays there for 0.15 s.
   So a held last word keeps its real length, and a rest inside a line stays a rest.
4. Check. Repeated lines (the three choruses) are compared after a per-line shift (median polish);
   an isolated word far from its repeats is moved to where they put it if the stem has an onset there.

`stem lag` is the separation's delay against the mix (positive: the stem is late); it is taken off
every time so the output is on the mix's clock.
Output: the shape of music/ep04/lyrics.json, plus `couplet` and `line_in_couplet`.
"""
import json
import re
import sys

import numpy as np

sys.path.insert(0, "music/ep03")
import align_words as aw  # noqa: E402


def decay_end(stem, s, limit, drop_db=20.0, hold=0.15):
    """When the voice after onset s falls drop_db below its peak (in s..s+0.35) and stays down."""
    t, r = stem.rms_t, stem.rms
    m = (t >= s) & (t < s + 0.35)
    if not m.any():
        return s + 0.2
    peak = r[m].max()
    thr = peak * 10 ** (-drop_db / 20)
    idx = np.where(t >= s + 0.06)[0]
    n_hold = max(1, int(hold / (t[1] - t[0])))
    below = r < thr
    for i in idx:
        if t[i] >= limit:
            return limit
        if below[i:i + n_hold].all():
            return float(t[i])
    return limit


def main(stem_path, rough_path, est_path, out_path, srt_path, rep_path, lag, *whisper_paths):
    lag = float(lag)
    lines = json.load(open(rough_path))
    est = json.load(open(est_path))
    stem = aw.Stem(stem_path)
    refs = aw.whisper_refs(whisper_paths, lines)
    rows = {}
    for e in est:
        for k, w in enumerate(e["words"]):
            rows[(e["line"], k)] = {n: v[0] for n, v in w["est"].items()}
    bias = {}
    for r in range(len(whisper_paths)):
        d = []
        for key, votes in rows.items():
            if key in refs and len(refs[key]) > r and len(votes) >= 4:
                med = float(np.median(list(votes.values())))
                allv = list(votes.values()) + [refs[key][r]]
                if max(allv) - min(allv) < 0.09:
                    d.append(refs[key][r] - med)
        bias[f"whisper{r + 1}"] = float(np.median(d)) if d else 0.0
    out_lines, report, spreads = [], [], []
    for li, l in enumerate(lines):
        new, prev = [], -1.0
        for k, w in enumerate(l["words"]):
            votes = dict(rows[(li, k)])
            for r, t in enumerate(refs.get((li, k), [])[:len(whisper_paths)]):
                votes[f"whisper{r + 1}"] = t - bias[f"whisper{r + 1}"]
            av = np.array([v for n, v in votes.items() if not n.startswith("whisper")])
            allv = np.array(list(votes.values()))
            s = float(np.median(allv))
            iqr = float(np.percentile(av, 75) - np.percentile(av, 25)) if len(av) >= 4 else 0.0
            spreads.append(iqr)
            snapped, hit = stem.snap(s, lo=prev + 0.05)
            onset = max(snapped if hit else s, prev + 0.05)
            prev = onset
            flag = []
            if stem.voiced_in(onset, onset + 0.18) < 0.25 and stem.loud(onset, onset + 0.18) < 0.12:
                flag.append("no voiced sound")
            if iqr > 0.12:
                flag.append(f"aligners spread {1000 * iqr:.0f} ms")
            nw = {"w": w["w"], "s": round(onset, 3), "e": None, "backing": False,
                  "timing_spread_ms": int(round(1000 * iqr)),
                  "votes": {n: round(v, 3) for n, v in votes.items()}, "moved_ms": int(round(1000 * (onset - s)))}
            if flag:
                nw["flag"] = "; ".join(flag)
            new.append(nw)
        out_lines.append({"text": l["text"], "section": l["section"], "start": new[0]["s"], "end": None,
                          "back": False, "words": new})
    # Repeated lines should be sung alike (median polish over the repeats; see ep03/combine.py).
    reps, rep_notes = {}, []
    for li, l in enumerate(out_lines):
        reps.setdefault(re.sub(r"[^a-z ]", "", l["text"].lower()), []).append(li)
    for idx in reps.values():
        if len(idx) < 2:
            continue
        S_ = np.array([[w["s"] for w in out_lines[i]["words"]] for i in idx])
        c = np.median(S_, axis=1)
        for _ in range(6):
            m = np.median(S_ - c[:, None], axis=0)
            c = np.median(S_ - m[None, :], axis=1)
        m = np.median(S_ - c[:, None], axis=0)
        res = S_ - c[:, None] - m[None, :]
        rep_notes.append(f"  {out_lines[idx[0]]['text']}: residual ms per repeat " + "; ".join(
            f"{out_lines[i]['section']} [" + " ".join(f"{1000 * v:+.0f}" for v in res[r]) + "]" for r, i in enumerate(idx)))
        for r, i in enumerate(idx):
            bad = [k for k in range(S_.shape[1]) if abs(res[r, k]) > 0.10]
            for k in bad:
                w = out_lines[i]["words"][k]
                note = f"{1000 * res[r, k]:+.0f} ms from its repeats"
                pred = float(c[r] + m[k])
                isolated = len(bad) <= max(1, int(0.2 * S_.shape[1])) and abs(res[r, k]) > 0.15
                if isolated:
                    lo = (out_lines[i]["words"][k - 1]["s"] + 0.05) if k else -1.0
                    snapped, hit = stem.snap(pred, lo=lo, before=0.09, after=0.09)
                    if hit and stem.loud(snapped, snapped + 0.18) > 0.12:
                        note = f"moved from {w['s']:.3f} to {snapped:.3f}, where its repeats put it ({note})"
                        w["s"] = round(snapped, 3)
                w["flag"] = (w["flag"] + "; " if w.get("flag") else "") + note
    # Tails: a word ends at the next word's onset, or earlier where the voice stops.
    allw = [(li, k) for li, l in enumerate(out_lines) for k in range(len(l["words"]))]
    for n, (li, k) in enumerate(allw):
        w = out_lines[li]["words"][k]
        nxt = out_lines[allw[n + 1][0]]["words"][allw[n + 1][1]]["s"] if n + 1 < len(allw) else stem.rms_t[-1]
        w["e"] = round(max(w["s"] + 0.05, min(nxt - 0.01, decay_end(stem, w["s"], nxt - 0.01))), 3)
    # Onto the mix's clock, and couplets.
    couplet, seen = 0, {}
    for l in out_lines:
        i = seen.get(l["section"], 0)
        seen[l["section"]] = i + 1
        if i % 2 == 0:
            couplet += 1
        l["couplet"], l["line_in_couplet"] = couplet, i % 2
        for w in l["words"]:
            w["s"] = round(w["s"] - lag, 3)
            w["e"] = round(w["e"] - lag, 3)
        l["start"], l["end"] = l["words"][0]["s"], l["words"][-1]["e"]
    # Report.
    agree = {}
    for rate in ("1.0", "0.8", "0.65"):
        dd = [abs(v[f"mms@{rate}"] - v[f"en@{rate}"]) for v in rows.values() if f"mms@{rate}" in v and f"en@{rate}" in v]
        agree[rate] = (float(np.median(dd)) * 1000, float(np.percentile(dd, 90)) * 1000)
    moved = np.array([abs(w["moved_ms"]) for l in out_lines for w in l["words"]])
    sp = np.array(spreads) * 1000
    report.append(f"{len(spreads)} words. Whisper bias against the aligners: " + ", ".join(f"{n} {1000 * b:+.0f} ms" for n, b in bias.items()))
    report.append(f"Whisper matched words: " + ", ".join(f"run {r + 1}: {sum(1 for v in refs.values() if len(v) > r)}" for r in range(len(whisper_paths))))
    report.append("MMS vs English aligner, median/90th-percentile gap by playback rate: " +
                  "; ".join(f"{r}: {m:.0f}/{p:.0f} ms" for r, (m, p) in agree.items()))
    report.append(f"Aligner spread (IQR of six votes): median {np.median(sp):.0f} ms, 90th percentile {np.percentile(sp, 90):.0f} ms, "
                  f"max {sp.max():.0f} ms, {int((sp > 120).sum())} words over 120 ms")
    report.append(f"Snap to stem onset: median move {np.median(moved):.0f} ms, 90th percentile {np.percentile(moved, 90):.0f} ms")
    report.append(f"Stem lag taken off: {1000 * lag:+.1f} ms")
    report.append("Repeated lines (median polish residuals):")
    report += rep_notes
    flags = [f"  {l['section']}: {w['w']} at {w['s']:.3f}: {w['flag']}" for l in out_lines for w in l["words"] if w.get("flag")]
    report.append(f"Flagged words ({len(flags)}):")
    report += flags
    report.append("Per word: onset, end, spread, snap move, votes")
    for l in out_lines:
        report.append(f"--- {l['section']}: {l['text']}")
        for w in l["words"]:
            vs = " ".join(f"{n}={v:.3f}" for n, v in sorted(w["votes"].items()))
            report.append(f"  {w['w']:16s} {w['s']:8.3f} {w['e']:8.3f} iqr {w['timing_spread_ms']:4d} snap {w['moved_ms']:+4d}  {vs}")
    open(rep_path, "w").write("\n".join(report) + "\n")
    print("\n".join(report[:7]), f"\nflagged {len(flags)}")
    for l in out_lines:
        for w in l["words"]:
            for key in ("votes", "moved_ms", "flag"):
                w.pop(key, None)
    json.dump(out_lines, open(out_path, "w"), indent=1, ensure_ascii=False)

    def ts(x):
        ms = round(x * 1000)
        return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
    with open(srt_path, "w") as f:
        for n, l in enumerate(out_lines, 1):
            f.write(f"{n}\n{ts(l['start'])} --> {ts(l['end'] + 0.3)}\n{l['text']}\n\n")


if __name__ == "__main__":
    main(*sys.argv[1:])
