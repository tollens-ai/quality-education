"""First, rough word times for the episode 4 piano take: a section at a time, on the vocal stem.

    python music/ep04/piano/rough.py <vocal stem> <sheet.txt> <take-lyrics.srt> <rough.json out>

The sheet gives the words and sections; Suno's embedded lyric track (the .srt) gives each line a
window that can be seconds out, so it is used only to place a section. Each section is
force-aligned (MMS_FA and English wav2vec2, from music/ep03/align_words.py) together with the last
line of the section before and the first line of the section after, so that the window's edges
belong to real neighbours; only the section's own words are kept. The result is the rough
lyrics.json that align_multi.py refines a line at a time.
"""
import json
import re
import sys

import numpy as np

sys.path.insert(0, "music/ep03")
import align_words as aw  # noqa: E402


def display_words(text):
    """Split a sung line into display words; an em dash stays on the word before it."""
    out = []
    for tok in text.split():
        parts = re.split(r"(?<=—)(?=\w)", tok)
        out += [p for p in parts if p]
    return out


def parse_sheet(path):
    lines, sec = [], None
    for raw in open(path, encoding="utf-8"):
        raw = raw.strip()
        if not raw:
            continue
        m = re.match(r"^\[(.+)\]$", raw)
        if m:
            sec = m.group(1)
            continue
        lines.append({"text": raw, "section": sec, "words": [{"w": w} for w in display_words(raw)]})
    return lines


def parse_srt(path):
    cues = []
    for block in open(path, encoding="utf-8").read().strip().split("\n\n"):
        rows = block.strip().split("\n")
        if len(rows) < 3:
            continue
        a, b = rows[1].split(" --> ")
        sec = lambda s: int(s[:2]) * 3600 + int(s[3:5]) * 60 + float(s[6:].replace(",", "."))
        text = " ".join(rows[2:])
        if not text.startswith("["):
            cues.append((sec(a), sec(b), text))
    return cues


def main(stem, sheet, srt, out_path):
    lines = parse_sheet(sheet)
    cues = parse_srt(srt)
    assert len(cues) == len(lines), (len(cues), len(lines))
    for l, (a, b, _) in zip(lines, cues):
        l["srt"] = [a, b]
    x = aw.load(stem, aw.SR)
    dur = len(x) / aw.SR
    aligners = {"mms": aw.Aligner(), "en": aw.EnglishAligner()}
    secs = []
    for i, l in enumerate(lines):
        if not secs or secs[-1][0] != l["section"]:
            secs.append((l["section"], []))
        secs[-1][1].append(i)
    for si, (name, idx) in enumerate(secs):
        ctx = ([secs[si - 1][1][-1]] if si else []) + idx + ([secs[si + 1][1][0]] if si + 1 < len(secs) else [])
        t0 = max(0.0, lines[ctx[0]]["srt"][0] - 1.0)
        t1 = min(dur, lines[ctx[-1]]["srt"][1] + 1.5)
        toks, owner = [], []
        for j in ctx:
            for k, w in enumerate(lines[j]["words"]):
                toks.append(aw.token(w["w"]))
                owner.append((j, k))
        res = {n: al.words(x, t0, t1, toks) for n, al in aligners.items()}
        for n, r in res.items():
            for (j, k), (s, e, _) in zip(owner, r):
                if j in idx and s is not None:
                    lines[j]["words"][k].setdefault("est", {})[n] = [round(s, 3), round(e, 3)]
        for j in idx:
            for w in lines[j]["words"]:
                ss = [v[0] for v in w["est"].values()]
                w["s"] = round(float(np.median(ss)), 3)
                w["e"] = round(w["est"]["mms"][1], 3)
                w["gap"] = round(max(ss) - min(ss), 3)
            l = lines[j]
            l["start"], l["end"] = l["words"][0]["s"], l["words"][-1]["e"]
            print(f"{name:10s} {l['start']:7.2f}-{l['end']:7.2f} (srt {l['srt'][0]:7.2f}) "
                  f"max gap {max(w['gap'] for w in l['words']):.2f}  {l['text'][:48]}", flush=True)
    json.dump(lines, open(out_path, "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main(*sys.argv[1:])
