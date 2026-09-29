"""Forced-align episode 3's words at three playback speeds, line by line, with two aligners.

    python music/ep03/align_multi.py <vocal stem> <lyrics.json (rough times)> <out estimates.json> [rates...]

The take's patter runs at five to eight syllables a second, which leaves a character-level CTC
aligner one or two 20 ms frames per letter and makes its word times drift by 100 ms or more. Slowing
the voice down (pitch kept) gives it room: at rate 0.65 a syllable is about a third longer. Each
line is aligned inside a window that also holds the line before and the line after, so a word at
the edge of the window belongs to a real neighbour and is not forced onto one of this line's
words. Only the middle line's words are kept. The estimates (one per rate and aligner, original
time) go to the output for the vote in combine.py.
"""
import json
import sys

import librosa
import numpy as np

sys.path.insert(0, "music/ep03")
import align_words as aw  # noqa: E402


def main(stem, lyr_path, out_path, *rates):
    rates = [float(r) for r in rates] or [1.0, 0.8, 0.65]
    lines = json.load(open(lyr_path))
    x = aw.load(stem, aw.SR)
    dur = len(x) / aw.SR
    stretched = {r: (x if r == 1.0 else librosa.effects.time_stretch(x, rate=r)) for r in rates}
    aligners = {"mms": aw.Aligner(), "en": aw.EnglishAligner()}
    out = []
    for i, l in enumerate(lines):
        ctx = [i]
        for j in (i - 1, i + 1):
            if 0 <= j < len(lines) and abs(lines[j]["start"] - lines[i]["start"]) < 6.5:
                ctx.append(j)
        ctx.sort()
        words, owner = [], []
        for j in ctx:
            for k, w in enumerate(lines[j]["words"]):
                words.append(aw.token(w["w"]))
                owner.append((j, k))
        t0 = max(0.0, min(lines[j]["start"] for j in ctx) - 0.5)
        t1 = min(dur, max(lines[j]["end"] for j in ctx) + 0.7)
        est = [dict() for _ in lines[i]["words"]]
        for r in rates:
            xs = stretched[r]
            for name, al in aligners.items():
                res = al.words(xs, t0 / r, t1 / r, words)
                for (j, k), (s, e, sc) in zip(owner, res):
                    if j == i and s is not None:
                        est[k][f"{name}@{r}"] = [round(s * r, 3), round(e * r, 3)]
        out.append({"line": i, "text": l["text"], "section": l["section"], "words": [
            {"w": w["w"], "est": e} for w, e in zip(l["words"], est)]})
        print(f"line {i} {l['section']}: {l['text'][:50]}", flush=True)
    json.dump(out, open(out_path, "w"), indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:])
