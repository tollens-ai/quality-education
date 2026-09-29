"""Vote episode 3's word times from every estimate, snap them to the voice, and check them.

    python music/ep03/combine.py <vocal stem> <lyrics rough.json> <estimates.json> <lyrics.json out> \
        <captions.srt out> <report.txt> <whisper words.json>...

The estimates are align_multi.py's: two aligners (torchaudio's MMS_FA and English wav2vec2) at
three playback speeds of the voice, in original time. Whisper's word times, from runs on the vocal
stem and on the mix, are a further two votes once their own bias (measured against the aligners on
words where all of them agree) is taken off.

1. Vote. Each word's onset is the median of all the votes. The spread (inter-quartile range) of
   the aligner votes is how sure that onset is.
2. Snap. The onset moves to the nearest onset of sound on the stem, if one lies within 90 ms
   before or 60 ms after it, and never before the previous word.
3. Check. Words with a wide spread or no voiced sound at the onset are flagged; repeated lines (the
   three choruses) should be sung much alike, so a word that sits far from its repeats is flagged.

Output keeps lyrics.json's schema ({text, section, back, start, end, words: [{w, s, e, backing}]});
a word's `s` is its sung onset, `flag` is set where a check failed, and `syl` is left for later.
"""
import difflib
import json
import re
import sys

import numpy as np

sys.path.insert(0, "music/ep03")
import align_words as aw  # noqa: E402


def main(stem_path, rough_path, est_path, out_path, srt_path, rep_path, *whisper_paths):
    lines = json.load(open(rough_path))
    est = json.load(open(est_path))
    stem = aw.Stem(stem_path)
    refs = aw.whisper_refs(whisper_paths, lines)  # (line, word) -> [times]
    keys = sorted({k for e in est for w in e["words"] for k in w["est"]})
    rows = []
    for e in est:
        for k, w in enumerate(e["words"]):
            rows.append(((e["line"], k), {n: v[0] for n, v in w["est"].items()}))
    # Whisper's bias against the aligners' median, on words where everything agrees within 90 ms.
    bias = {}
    for r in range(len(whisper_paths)):
        d = []
        for key, votes in rows:
            if key in refs and len(refs[key]) > r and len(votes) >= 4:
                med = float(np.median(list(votes.values())))
                allv = list(votes.values()) + [refs[key][r]]
                if max(allv) - min(allv) < 0.09:
                    d.append(refs[key][r] - med)
        bias[f"whisper{r + 1}"] = float(np.median(d)) if d else 0.0
    out_lines, report = [], []
    spreads, per_key = [], {n: [] for n in keys}
    for li, l in enumerate(lines):
        new, prev = [], -1.0
        for k, w in enumerate(l["words"]):
            votes = dict(next(v for kk, v in rows if kk == (li, k)))
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
            nw = {"w": w["w"], "s": round(onset, 3), "e": round(onset + 0.12, 3), "backing": False, "votes": {n: round(v, 3) for n, v in votes.items()}}
            if flag:
                nw["flag"] = "; ".join(flag)
            new.append(nw)
        for a, b in zip(new, new[1:]):
            a["e"] = round(max(a["s"] + 0.05, b["s"] - 0.01), 3)
        new[-1]["e"] = round(new[-1]["s"] + 0.35, 3)
        out_lines.append({"text": l["text"], "section": l["section"], "back": False, "start": new[0]["s"], "end": new[-1]["e"], "words": new})
    # Repeated lines should be sung alike. Each repeat's times are compared with the others' after
    # a shift chosen so that most of its words agree (not by its first word, which may be the one that
    # is wrong). A single word far from the consensus, with the rest of its line agreeing, is put at the
    # consensus time if the stem has sound there; several words drifting together is a real difference
    # in how that repeat was sung (a held or slowed line), and is flagged and left.
    reps = {}
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
        for r, i in enumerate(idx):
            bad = [k for k in range(S_.shape[1]) if abs(res[r, k]) > 0.10]
            for k in bad:
                w = out_lines[i]["words"][k]
                note = f"{1000 * res[r, k]:+.0f} ms from its repeats"
                pred = float(c[r] + m[k])
                isolated = len(bad) <= max(1, int(0.2 * S_.shape[1])) and abs(res[r, k]) > 0.15
                if isolated:
                    snapped, hit = stem.snap(pred, lo=(out_lines[i]["words"][k - 1]["s"] + 0.05) if k else -1.0, before=0.09, after=0.09)
                    if hit and stem.loud(snapped, snapped + 0.18) > 0.12:
                        note = f"moved from {w['s']:.3f} to {snapped:.3f}, where its repeats put it ({note})"
                        w["s"] = round(snapped, 3)
                w["flag"] = (w["flag"] + "; " if w.get("flag") else "") + note
        for i in idx:
            ws = out_lines[i]["words"]
            for a_, b_ in zip(ws, ws[1:]):
                a_["e"] = round(max(a_["s"] + 0.05, b_["s"] - 0.01), 3)
            out_lines[i]["start"] = ws[0]["s"]
    # Report.
    for n in keys:
        pass
    agree = {}
    for rate in ("1.0", "0.8", "0.65"):
        dd = [abs(votes[f"mms@{rate}"] - votes[f"en@{rate}"]) for _, votes in rows if f"mms@{rate}" in votes and f"en@{rate}" in votes]
        agree[rate] = (float(np.median(dd)) * 1000, float(np.percentile(dd, 90)) * 1000)
    report.append(f"{len(spreads)} words. Whisper bias against the aligners: " + ", ".join(f"{n} {1000 * b:+.0f} ms" for n, b in bias.items()))
    report.append("MMS vs English aligner, median and 90th-percentile gap by playback rate: " +
                  "; ".join(f"{r}: {m:.0f}/{p:.0f} ms" for r, (m, p) in agree.items()))
    report.append(f"Aligner spread (IQR): median {1000 * np.median(spreads):.0f} ms, {sum(1 for s in spreads if s > .12)} words over 120 ms")
    flags = [f"  {l['section']}: {w['w']} at {w['s']:.2f}: {w['flag']}" for l in out_lines for w in l["words"] if w.get("flag")]
    report.append(f"Flagged words ({len(flags)}):")
    report += flags
    open(rep_path, "w").write("\n".join(report) + "\n")
    print("\n".join(report[:3]), f"\nflagged {len(flags)}")
    for l in out_lines:
        for w in l["words"]:
            del w["votes"]
    json.dump(out_lines, open(out_path, "w"), indent=1)

    def ts(x):
        ms = round(x * 1000)
        return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
    with open(srt_path, "w") as f:
        for n, l in enumerate(sorted(out_lines, key=lambda l: l["start"]), 1):
            f.write(f"{n}\n{ts(l['start'])} --> {ts(l['end'] + 0.4)}\n{l['text']}\n\n")


if __name__ == "__main__":
    main(*sys.argv[1:])
