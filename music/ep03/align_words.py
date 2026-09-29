"""Time every sung word of episode 3 from the voice itself. Adapted from episode 2's aligner.

    python music/ep03/align_words.py <vocal stem> <backing stem> <lyrics.json in> \
        <lyrics.json out> <captions.srt out> <report.txt> <whisper words.json>...

1. Align. Each section's words, lead and backing in sung order, are force-aligned to the vocal
   stem with torchaudio's MMS_FA model (a character-level CTC aligner). Keeping echoes in the run
   stops a lead word from being taken for its own echo, and each section's window opens where the
   previous section's last word ended. The whole vocal stem is used, not the karaoke lead stem,
   because the karaoke split put chorus 2's first line in the backing stem.
2. Cross-check. Whisper's word times from independent runs (given as the last arguments) are
   matched to the caption words. A line whose aligned times disagree with Whisper (median gap over
   200 ms, or a third of its words over 350 ms) is aligned again on its own, in a window set by
   Whisper's times for it; the version that agrees better with Whisper is kept, and if neither
   does, Whisper's times are used, corrected by its measured bias.
3. Snap. Each onset moves to the nearest onset of sound on its stem (spectral flux, backtracked to
   the energy minimum before it), if one lies within 90 ms before or 60 ms after, and never
   before the previous word. Wordless backing ("oooh", "ohhh") takes the voiced onsets inside its
   measured span on the backing stem.
4. Report. How far each onset moved, which lines were re-aligned, every word whose onset doesn't
   sit on voiced sound, and repeated lines (choruses, pre-choruses) whose timing differs.

Output keeps lyrics.json's schema ({text, section, back, start, end, words: [{w, s, e,
backing}]}), adding a `flag` to any word where a check failed; a word's `s` is its sung onset.
Every word's four estimates are in the report.
"""
import difflib
import json
import re
import sys

import librosa
import numpy as np
import soundfile as sf
import torch
import torchaudio

# Onsets set by hand from the stem, where every estimate agrees and is wrong: (line, word) -> s.
# Episode 3 has none yet.
OVERRIDES = {}

SR = 16000
FRAME = 320 / SR  # MMS_FA emits one frame per 20 ms
VOCALISE = re.compile(r"^(o+h+|oo+h?|ooh-ooh|ahh+)$")


def load(path, sr):
    x, r = sf.read(path, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    return librosa.resample(x, orig_sr=r, target_sr=sr) if r != sr else x


def norm_word(w):
    return re.sub(r"[^a-z']", "", w.lower().replace("’", "'"))


def raw_word(w):
    return re.sub(r"[^a-z\-']", "", w.lower())


def token(w):
    """The aligner's spelling of a caption word: a wordless vocal becomes a plain 'oh' or 'ooh'."""
    r = raw_word(w)
    if r.startswith("oh") and VOCALISE.match(r):
        return "oh"
    if VOCALISE.match(r or ""):
        return "ooh"
    return norm_word(r) or "x"


class Aligner:
    def __init__(self):
        b = torchaudio.pipelines.MMS_FA
        self.model = b.get_model().eval()
        self.tok = b.get_tokenizer()
        self.align = b.get_aligner()

    def words(self, x16, t0, t1, words):
        """Align `words` inside [t0, t1] of x16; returns [(s, e, score)] per word."""
        a, b = int(max(0, t0) * SR), int(t1 * SR)
        seg = torch.from_numpy(x16[a:b]).unsqueeze(0)
        with torch.inference_mode():
            em, _ = self.model(seg)
            em = torch.log_softmax(em, dim=-1)
        spans = self.align(em[0], self.tok(words))
        t0 = max(0, t0)
        return [(t0 + sp[0].start * FRAME, t0 + sp[-1].end * FRAME,
                 float(np.mean([c.score for c in sp]))) for sp in spans]


class EnglishAligner:
    """A second opinion: torchaudio's English wav2vec2 (large, LV-60k, 960 h) forced alignment,
    which spells words in capitals with '|' between them."""

    def __init__(self):
        b = torchaudio.pipelines.WAV2VEC2_ASR_LARGE_LV60K_960H
        self.model = b.get_model().eval()
        self.labels = b.get_labels()
        self.idx = {c: i for i, c in enumerate(self.labels)}

    def words(self, x16, t0, t1, words):
        a, b = int(max(0, t0) * SR), int(t1 * SR)
        with torch.inference_mode():
            em, _ = self.model(torch.from_numpy(x16[a:b]).unsqueeze(0))
            em = torch.log_softmax(em, dim=-1)
        spell = [re.sub(r"[^A-Z']", "", w.upper()) or "X" for w in words]
        ids, owner = [], []
        for wi, w in enumerate(spell):
            for c in w:
                ids.append(self.idx[c])
                owner.append(wi)
            if wi < len(spell) - 1:
                ids.append(self.idx["|"])
                owner.append(-1)
        ali, sc = torchaudio.functional.forced_align(em, torch.tensor([ids], dtype=torch.int32), blank=0)
        spans = torchaudio.functional.merge_tokens(ali[0], sc[0].exp())
        t0 = max(0, t0)
        out = [[None, None, []] for _ in words]
        for sp, o in zip(spans, owner):
            if o < 0:
                continue
            s_, e_ = t0 + sp.start * FRAME, t0 + sp.end * FRAME
            out[o][0] = s_ if out[o][0] is None else out[o][0]
            out[o][1] = e_
            out[o][2].append(float(np.log(sp.score + 1e-9)))
        return [(s_, e_, float(np.mean(c)) if c else None) for s_, e_, c in out]


class Stem:
    """Onsets and voicing measured on one stem, for snapping and checking word onsets."""

    def __init__(self, path):
        self.sr = 22050
        y = load(path, self.sr)
        hop = 128
        env = librosa.onset.onset_strength(y=y, sr=self.sr, hop_length=hop)
        self.onsets = np.asarray(librosa.onset.onset_detect(
            onset_envelope=env, sr=self.sr, hop_length=hop, backtrack=True, units="time", delta=0.04))
        rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=hop)[0]
        self.rms_t = librosa.frames_to_time(np.arange(len(rms)), sr=self.sr, hop_length=hop)
        self.rms = rms / (np.quantile(rms, 0.98) + 1e-9)
        _, _, vprob = librosa.pyin(y, fmin=80, fmax=1100, sr=self.sr, hop_length=512)
        self.v_t = librosa.frames_to_time(np.arange(len(vprob)), sr=self.sr, hop_length=512)
        self.vprob = np.nan_to_num(vprob)

    def snap(self, t, lo=-1.0, before=0.09, after=0.06):
        c = self.onsets[(self.onsets >= max(t - before, lo)) & (self.onsets <= t + after)]
        return (float(c[np.argmin(np.abs(c - t))]), True) if len(c) else (t, False)

    def loud(self, t0, t1):
        m = (self.rms_t >= t0) & (self.rms_t < t1)
        return float(self.rms[m].max()) if m.any() else 0.0

    def voiced_in(self, t0, t1):
        m = (self.v_t >= t0) & (self.v_t < t1)
        return float(self.vprob[m].max()) if m.any() else 0.0

    def voiced_onsets(self, t0, t1, n):
        """The first n onsets inside [t0, t1] that lead into voiced sound."""
        c = [float(o) for o in self.onsets if t0 - 0.05 <= o <= t1 and self.voiced_in(o, o + 0.15) > 0.3]
        return c[:n]


def whisper_refs(paths, lines):
    """Per caption word, the start times Whisper gave it in each run, matched by spelling a
    section at a time against the words Whisper heard near that section (repeated choruses have
    the same words, so matching across the whole song would pair them with the wrong repeat)."""
    secs = []
    for li, l in enumerate(lines):
        if not secs or secs[-1][0] != l["section"]:
            secs.append((l["section"], []))
        secs[-1][1].append(li)
    refs = {}
    for p in paths:
        d = json.load(open(p))
        flat = [w for seg in d for w in seg["words"]] if d and "words" in d[0] else d
        heard = [(norm_word(w["w"]), w["s"]) for w in flat if norm_word(w["w"])]
        for _, idx in secs:
            t0 = min(lines[i]["start"] for i in idx) - 1.0
            t1 = max(lines[i]["end"] for i in idx) + 1.0
            near = [h for h in heard if t0 <= h[1] <= t1]
            cap, where = [], []
            for li in idx:
                for k, w in enumerate(lines[li]["words"]):
                    t = norm_word(raw_word(w["w"]))
                    if t:
                        cap.append(t)
                        where.append((li, k))
            sm = difflib.SequenceMatcher(None, cap, [h[0] for h in near], autojunk=False)
            for a, b, size in sm.get_matching_blocks():
                for j in range(size):
                    refs.setdefault(where[a + j], []).append(near[b + j][1])
    return refs


def agreement(times, refs, keys):
    d = [times[i] - np.median(refs[k]) for i, k in enumerate(keys) if k in refs and times[i] is not None]
    if not d:
        return None, None
    d = np.abs(np.array(d))
    return float(np.median(d)), float((d > 0.35).mean())


def main(full_path, back_path, lyr_path, out_path, srt_path, rep_path, *ref_paths):
    lines = json.load(open(lyr_path))
    full16 = load(full_path, SR)
    full, back = Stem(full_path), Stem(back_path)
    aligners = {"mms": Aligner(), "en": EnglishAligner()}
    refs = whisper_refs(ref_paths, lines)
    keys_of = lambda li: [(li, k) for k in range(len(lines[li]["words"]))]

    # 1. Align each section in sung order, with both aligners, in the same windows.
    order = []
    for li, l in enumerate(lines):
        if not order or order[-1][0] != l["section"]:
            order.append((l["section"], []))
        order[-1][1].append(li)
    est = {name: {} for name in aligners}
    prev_end = 0.0
    for si, (sec, idx) in enumerate(order):
        t0 = max(prev_end + 0.02, min(lines[i]["start"] for i in idx) - 0.6)
        nxt = order[si + 1][1] if si + 1 < len(order) else None
        t1 = (min(lines[i]["start"] for i in nxt) + 0.1) if nxt else len(full16) / SR
        flat = [(i, k) for i in idx for k in range(len(lines[i]["words"]))]
        toks = [token(lines[i]["words"][k]["w"]) for i, k in flat]
        for name, al in aligners.items():
            for key, tm in zip(flat, al.words(full16, t0, t1, toks)):
                est[name][key] = tm
        prev_end = max(est["mms"][key][1] for key in flat)

    # 2. Re-align, on its own and in a window set by Whisper, any line where both aligners
    #    disagree with Whisper; keep whichever version agrees best.
    how = {li: "section" for li in range(len(lines))}
    for li, l in enumerate(lines):
        keys = keys_of(li)
        scores = {n: agreement([est[n][k][0] for k in keys], refs, keys) for n in aligners}
        if any(m is None or (m <= 0.2 and f <= 0.3) for m, f in scores.values()):
            continue
        rs = [np.median(refs[k]) for k in keys if k in refs]
        w0, w1 = min(rs) - 0.35, max(rs) + 0.6
        if li > 0:
            w0 = max(w0, min(est["mms"][k][0] for k in keys_of(li - 1)) + 0.05)
        if w1 - w0 < 0.12 * len(keys) + 0.2:
            continue
        toks = [token(w["w"]) for w in l["words"]]
        for n, al in aligners.items():
            alt = al.words(full16, w0, w1, toks)
            m2, _ = agreement([a[0] for a in alt], refs, keys)
            if m2 is not None and m2 < scores[n][0]:
                for k, a in zip(keys, alt):
                    est[n][k] = a
        how[li] = "re-aligned on its own in Whisper's window"

    # 3. Each source's bias against the MMS aligner, on words where every source agrees.
    srcs = {n: {k: v[0] for k, v in est[n].items()} for n in aligners}
    for r in range(len(ref_paths)):
        srcs[f"whisper{r + 1}"] = {k: v[r] for k, v in refs.items() if len(v) > r}
    bias = {}
    for n, src in srcs.items():
        d = [src[k] - srcs["mms"][k] for k in src if all(k in s2 for s2 in srcs.values())
             and max(s2[k] for s2 in srcs.values()) - min(s2[k] for s2 in srcs.values()) < 0.1]
        bias[n] = float(np.median(d)) if d else 0.0

    # 4. Vote, snap, and time wordless backing from the backing stem.
    rep = []
    for li, l in enumerate(lines):
        words = l["words"]
        stem = full
        if l["back"] and back.loud(l["start"], l["end"]) > 0.5 * full.loud(l["start"], l["end"]):
            stem = back
        raws = [raw_word(w["w"]) for w in words]
        voc = l["back"] and all(VOCALISE.match(r or "") for r in raws)
        new, prev = [], -1.0
        for k, w in enumerate(words):
            key = (li, k)
            cand = {n: src[key] - bias[n] for n, src in srcs.items() if key in src}
            vals = sorted(cand.values())
            s = float(np.median(vals))
            spread = vals[-1] - vals[0]
            if voc and k == 0:
                ons = back.voiced_onsets(l["start"] - 0.1, l["end"], 1) or \
                    [float(o) for o in back.onsets if l["start"] - 0.1 <= o <= l["end"]][:1]
                if ons:
                    s, spread, stem = ons[0], 0.0, back
                    how[li] = "onset on the backing stem"
            snapped, hit = stem.snap(s, lo=prev + 0.05)
            onset = max(snapped if hit else s, prev + 0.05)
            prev = onset
            e = max(est["mms"][key][1], onset + 0.08)
            flag = []
            if stem.voiced_in(onset, onset + 0.18) < 0.25 and stem.loud(onset, onset + 0.18) < 0.12:
                flag.append("no voiced sound")
            if spread > 0.15:
                flag.append(f"estimates spread {1000 * spread:.0f} ms")
            if (li, k) in OVERRIDES:
                onset = OVERRIDES[(li, k)]
                flag.append("set by hand from the stem")
            nw = {"w": w["w"], "s": round(onset, 3), "e": round(e, 3), "backing": w["backing"],
                  "est": {n: round(v, 3) for n, v in cand.items()}}
            if flag:
                nw["flag"] = "; ".join(flag)
            new.append(nw)
        for a, b in zip(new, new[1:]):
            a["e"] = min(a["e"], b["s"])
        l["words"] = new
        l["start"], l["end"] = new[0]["s"], max(w["e"] for w in new)
        rep.append(f"--- line {li} ({l['section']}, {'backing' if l['back'] else 'lead'}): {how[li]}")
        for w in new:
            ests = "  ".join(f"{n} {v:7.2f}" for n, v in w["est"].items())
            rep.append(f"  {w['w']:14s} onset {w['s']:7.2f}   {ests}" + (f"   ** {w['flag']}" if w.get("flag") else ""))

    # 4. Repeated lines should be sung much alike.
    reps = {}
    for li, l in enumerate(lines):
        if not l["back"]:
            reps.setdefault(l["text"].lower().replace(",", ""), []).append(li)
    cons = []
    for idx in reps.values():
        if len(idx) < 2:
            continue
        offs = np.array([[w["s"] - lines[i]["words"][0]["s"] for w in lines[i]["words"]] for i in idx])
        med = np.median(offs, axis=0)
        for r, i in enumerate(idx):
            bad = [(lines[i]["words"][k]["w"], round(1000 * (offs[r, k] - med[k]))) for k in range(len(med))
                   if abs(offs[r, k] - med[k]) > 0.15]
            if bad:
                cons.append(f"  line {i} ({lines[i]['section']}): {bad}")

    allw = [w for l in lines for w in l["words"]]
    spread = np.array([max(w["est"].values()) - min(w["est"].values()) for w in allw if len(w["est"]) > 1])
    for w in allw:
        del w["est"]
    json.dump(lines, open(out_path, "w"), indent=1)

    def ts(x):
        ms = round(x * 1000)
        return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
    with open(srt_path, "w") as f:
        for n, l in enumerate(sorted(lines, key=lambda l: l["start"]), 1):
            f.write(f"{n}\n{ts(l['start'])} --> {ts(l['end'] + 0.4)}\n{l['text']}\n\n")
    flags = [f"  {l['section']}: {w['w']} at {w['s']:.2f}: {w['flag']}" for l in lines for w in l["words"] if w.get("flag")]
    head = [f"{len(allw)} words. Bias of each source against the MMS aligner: "
            + ", ".join(f"{n} {1000 * b:+.0f} ms" for n, b in bias.items()) + ".",
            f"Spread of the estimates per word: median {1000 * np.median(spread):.0f} ms; "
            f"{(spread > 0.15).sum()} words over 150 ms.",
            "Lines not taken from the section alignment:"] + \
           [f"  line {li} ({lines[li]['section']}): {h}" for li, h in how.items() if h != "section"] + \
           [f"Flagged words ({len(flags)}):"] + flags + \
           ["Repeated lines off the other repeats by more than 150 ms:"] + (cons or ["  none"]) + [""]
    open(rep_path, "w").write("\n".join(head + rep) + "\n")
    print("\n".join(head))


if __name__ == "__main__":
    main(*sys.argv[1:])
