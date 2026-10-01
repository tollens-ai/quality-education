"""music/ep03/align_multi.py for a range of lines, so the work can be split across machines.

    python music/ep04/piano/align_range.py <stem> <rough.json> <out.json> <first line> <end line>

Same method as ep03's align_multi.py (each line aligned inside a window holding its neighbours,
with MMS_FA and English wav2vec2, at playback rates 1.0, 0.8 and 0.65 with the pitch kept); only
lines first..end-1 are aligned, and the output is rewritten after every line. The time-stretch is
done on the stretch of the stem the range needs, not the whole song. Merge the parts with
merge_estimates.py.
"""
import json
import sys

import librosa

sys.path.insert(0, "music/ep03")
import align_words as aw  # noqa: E402

RATES = [1.0, 0.8, 0.65]


def main(stem, lyr_path, out_path, first, end):
    first, end = int(first), int(end)
    lines = json.load(open(lyr_path))
    end = min(end, len(lines))
    x = aw.load(stem, aw.SR)
    dur = len(x) / aw.SR
    lo = max(0.0, min(l["start"] for l in lines[max(0, first - 1):end + 1]) - 2.0)
    hi = min(dur, max(l["end"] for l in lines[max(0, first - 1):end + 1]) + 2.0)
    part = x[int(lo * aw.SR):int(hi * aw.SR)]
    stretched = {r: (part if r == 1.0 else librosa.effects.time_stretch(part, rate=r)) for r in RATES}
    aligners = {"mms": aw.Aligner(), "en": aw.EnglishAligner()}
    out = []
    for i in range(first, end):
        l = lines[i]
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
        t0 = max(lo, min(lines[j]["start"] for j in ctx) - 0.5) - lo
        t1 = min(hi, max(lines[j]["end"] for j in ctx) + 0.7) - lo
        est = [dict() for _ in l["words"]]
        for r in RATES:
            for name, al in aligners.items():
                res = al.words(stretched[r], t0 / r, t1 / r, words)
                for (j, k), (s, e, sc) in zip(owner, res):
                    if j == i and s is not None:
                        est[k][f"{name}@{r}"] = [round(s * r + lo, 3), round(e * r + lo, 3)]
        out.append({"line": i, "text": l["text"], "section": l["section"], "words": [
            {"w": w["w"], "est": e} for w, e in zip(l["words"], est)]})
        json.dump(out, open(out_path, "w"), indent=1, ensure_ascii=False)
        print(f"line {i} {l['section']}: {l['text'][:50]}", flush=True)


if __name__ == "__main__":
    main(*sys.argv[1:])
