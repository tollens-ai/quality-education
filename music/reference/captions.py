"""Time caption lines against a take's Whisper word timestamps and write an SRT.

Usage: python music/reference/captions.py captions.txt take.words.json out.srt [lyrics.json]

With a fourth argument it also writes every caption word with its sung start and end, for kinetic
type. Words Whisper missed get times interpolated within their line; backing-vocal words (in
brackets) get no times.

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


def main(cap_path, words_path, out_path, lyrics_path=None):
    lines = [l.rstrip("\n") for l in open(cap_path) if l.strip() and not l.startswith("#")]
    heard = [w for seg in json.load(open(words_path)) for w in seg["words"]]
    heard_toks = []
    heard_idx = []
    for i, w in enumerate(heard):
        for t in tokens(w["w"]):
            heard_toks.append(t)
            heard_idx.append(i)

    cap_toks, owner, word_of = [], [], []
    display = []  # per line: [(word, is_backing)]
    for n, line in enumerate(lines):
        words, backing = [], False
        for w in line.split():
            if w.startswith("("):
                backing = True
            words.append((w, backing))
            if w.endswith(")"):
                backing = False
        all_backing = all(b for _, b in words)
        display.append(words)
        for i, (w, b) in enumerate(words):
            if b and not all_backing:
                continue
            ts = tokens(w.strip("()"))
            cap_toks += ts
            owner += [n] * len(ts)
            word_of += [(n, i)] * len(ts)

    times = [[] for _ in lines]
    word_times = {}
    sm = difflib.SequenceMatcher(None, cap_toks, heard_toks, autojunk=False)
    for a, b, size in sm.get_matching_blocks():
        for k in range(size):
            w = heard[heard_idx[b + k]]
            times[owner[a + k]].append((w["s"], w["e"]))
            word_times.setdefault(word_of[a + k], []).append((w["s"], w["e"]))

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
    if lyrics_path:
        write_lyrics(lines, display, spans, word_times, lyrics_path)


def write_lyrics(lines, display, spans, word_times, path):
    out = []
    for n, (line, words) in enumerate(zip(lines, display)):
        all_backing = all(b for _, b in words)
        rows = []
        for i, (w, b) in enumerate(words):
            t = word_times.get((n, i))
            rows.append({"w": w, "backing": b and not all_backing,
                         "s": round(min(x for x, _ in t), 3) if t else None,
                         "e": round(max(y for _, y in t), 3) if t else None})
        # Interpolate sung words Whisper missed, between their timed neighbours in the line.
        sung = [r for r in rows if not r["backing"]]
        for j, r in enumerate(sung):
            if r["s"] is None:
                prev = next((x["e"] for x in reversed(sung[:j]) if x["e"] is not None), None)
                nxt = next((x["s"] for x in sung[j + 1:] if x["s"] is not None), None)
                a = prev if prev is not None else (spans[n][0] if spans[n] else nxt)
                b = nxt if nxt is not None else (a + 0.3 if a is not None else None)
                if a is not None and b is not None:
                    r["s"], r["e"] = round(a, 3), round(max(a, b), 3)
        out.append({"text": line, "start": spans[n][0] if spans[n] else None,
                    "end": spans[n][1] if spans[n] else None, "words": rows})
    json.dump(out, open(path, "w"), indent=1)
    print(f"{sum(len(l['words']) for l in out)} words -> {path}")


if __name__ == "__main__":
    main(*sys.argv[1:])
