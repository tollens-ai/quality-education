"""Time caption lines against a take's Whisper word timestamps and write an SRT.

Usage: python music/reference/captions.py captions.txt take.words.json out.srt

captions.txt has one caption per line; lines starting with # are comments. Bracketed text is
backing vocals: it's shown but not aligned. A line that is all backing vocals is aligned on its
words anyway, since Whisper often hears them. Alignment is difflib over normalised words, so a
few mishearings ("bill to keep") don't matter; a line with no matched words is reported.
"""
import difflib
import json
import re
import sys

NUMS = {"12": "twelve"}


def norm(w):
    w = re.sub(r"[^a-z0-9']", "", w.lower().replace("-", " ")).strip("'")
    return NUMS.get(w, w)


def tokens(text):
    return [t for t in (norm(w) for w in re.split(r"[\s-]+", text)) if t]


def main(cap_path, words_path, out_path):
    lines = [l.rstrip("\n") for l in open(cap_path) if l.strip() and not l.startswith("#")]
    heard = [w for seg in json.load(open(words_path)) for w in seg["words"]]
    heard_toks = []
    heard_idx = []
    for i, w in enumerate(heard):
        for t in tokens(w["w"]):
            heard_toks.append(t)
            heard_idx.append(i)

    cap_toks, owner = [], []
    for n, line in enumerate(lines):
        sung = re.sub(r"\([^)]*\)", " ", line)
        ts = tokens(sung if sung.strip() else line)
        cap_toks += ts
        owner += [n] * len(ts)

    times = [[] for _ in lines]
    sm = difflib.SequenceMatcher(None, cap_toks, heard_toks, autojunk=False)
    for a, b, size in sm.get_matching_blocks():
        for k in range(size):
            w = heard[heard_idx[b + k]]
            times[owner[a + k]].append((w["s"], w["e"]))

    spans = []
    for n, t in enumerate(times):
        if not t:
            print(f"unmatched: {lines[n]}", file=sys.stderr)
            spans.append(None)
        else:
            spans.append([min(s for s, _ in t), max(e for _, e in t)])
    # A caption stays up until the next one starts, for at most 1.5 s past its last sung word.
    starts = [s[0] for s in spans if s]
    for s in spans:
        if s:
            later = [x for x in starts if x > s[0]]
            s[1] = min(later[0] if later else s[1] + 1.5, s[1] + 1.5)

    def ts(x):
        ms = round(x * 1000)
        return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"

    with open(out_path, "w") as f:
        k = 0
        for line, s in zip(lines, spans):
            if s:
                k += 1
                f.write(f"{k}\n{ts(s[0])} --> {ts(s[1])}\n{line}\n\n")
    print(f"{k}/{len(lines)} captions timed -> {out_path}")


if __name__ == "__main__":
    main(*sys.argv[1:])
