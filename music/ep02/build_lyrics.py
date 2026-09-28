"""Time episode 2's captions: lead lines from Whisper's word timestamps, backing lines by hand.

Usage: python music/ep02/build_lyrics.py <lead.words.json> music/ep02/captions.txt \
           music/ep02/backing.json music/ep02/captions.srt music/ep02/lyrics.json

Each bracketed (backing) line takes its [start, end] from backing.json, measured on the
backing-vocal stem. Heard words inside that span that match the line's words are its words, timed
as heard, and are kept away from the lead lines; any the transcript missed share the span in
proportion to their length (Whisper hears few "ooh"s). Lead lines are then aligned with difflib
over the remaining words, as in music/reference/captions.py. lead.words.json is a flat list of
{w, s, e}.
"""
import difflib
import json
import re
import sys

sys.path.insert(0, "music/reference")
from captions import tokens  # noqa: E402


def main(words_path, cap_path, back_path, srt_path, out_path):
    heard = json.load(open(words_path))
    heard_toks, heard_idx = [], []
    for i, w in enumerate(heard):
        for t in tokens(w["w"]):
            heard_toks.append(t)
            heard_idx.append(i)
    section, lines = None, []
    for raw in open(cap_path):
        raw = raw.rstrip("\n")
        if raw.startswith("# ") and len(raw) < 30:
            section = raw[2:]
        elif raw.strip() and not raw.startswith("#"):
            lines.append({"text": raw, "section": section, "back": raw.startswith("(")})
    backing = json.load(open(back_path))
    back_lines = [l for l in lines if l["back"]]
    if len(backing) != len(back_lines):
        sys.exit(f"backing.json has {len(backing)} spans for {len(back_lines)} backing lines")
    for l, span in zip(back_lines, backing):
        l["span"] = span

    # Backing lines claim the heard words inside their spans first.
    taken = set()
    for l in back_lines:
        s0, e0 = l["span"]
        want = [t for w in l["text"].split() for t in tokens(w.strip("()"))]
        near = [i for i, w in enumerate(heard) if s0 - .15 <= (w["s"] + w["e"]) / 2 <= e0 + .15 and i not in taken]
        l["heard"] = {}
        k = 0
        for i in near:
            ts = tokens(heard[i]["w"])
            if ts and k < len(want) and ts[0] == want[k]:
                l["heard"][k] = heard[i]
                taken.add(i)
                k += 1
    heard_toks = [t for t, i in zip(heard_toks, heard_idx) if i not in taken]
    heard_idx = [i for i in heard_idx if i not in taken]

    cap_toks, word_of = [], []
    for n, l in enumerate(lines):
        l["words"] = [{"w": w} for w in l["text"].split()]
        if l["back"]:
            continue
        for i, w in enumerate(l["words"]):
            for t in tokens(w["w"]):
                cap_toks.append(t)
                word_of.append((n, i))
    got = {}
    sm = difflib.SequenceMatcher(None, cap_toks, heard_toks, autojunk=False)
    for a, b, size in sm.get_matching_blocks():
        for k in range(size):
            w = heard[heard_idx[b + k]]
            got.setdefault(word_of[a + k], []).append((w["s"], w["e"]))

    out = []
    for n, l in enumerate(lines):
        rows = l["words"]
        if l["back"]:
            s0, e0 = l["span"]
            lens = [max(1, len(re.sub(r"[^A-Za-z]", "", r["w"]))) for r in rows]
            tot, acc = sum(lens), 0
            for j, (r, k) in enumerate(zip(rows, lens)):
                h = l["heard"].get(j)
                if h:
                    r["s"], r["e"] = round(max(s0, h["s"]), 3), round(min(e0, h["e"]), 3)
                else:
                    r["s"] = round(s0 + (e0 - s0) * acc / tot, 3)
                    r["e"] = round(s0 + (e0 - s0) * (acc + k) / tot, 3)
                acc += k
                r["backing"] = True
            # Keep the words in order: a proportional guess never lands before a heard word.
            for j in range(1, len(rows)):
                if rows[j]["s"] < rows[j - 1]["s"]:
                    rows[j]["s"] = rows[j - 1]["s"]
                    rows[j]["e"] = max(rows[j]["e"], rows[j]["s"])
        else:
            for i, r in enumerate(rows):
                t = got.get((n, i))
                r["s"] = round(min(x for x, _ in t), 3) if t else None
                r["e"] = round(max(y for _, y in t), 3) if t else None
                r["backing"] = False
            # Words Whisper missed take the time between their timed neighbours.
            for i, r in enumerate(rows):
                if r["s"] is None:
                    prev = next((rows[j]["e"] for j in range(i - 1, -1, -1) if rows[j]["e"] is not None), None)
                    nxt = next((rows[j]["s"] for j in range(i + 1, len(rows)) if rows[j]["s"] is not None), None)
                    if prev is None or nxt is None:
                        print(f"untimed word {r['w']!r} in line {n}: {l['text']}", file=sys.stderr)
                        continue
                    r["s"], r["e"] = prev, nxt
        timed = [r for r in rows if r["s"] is not None]
        start = min(r["s"] for r in timed) if timed else None
        end = max(r["e"] for r in timed) if timed else None
        out.append({"text": l["text"], "section": l["section"], "back": l["back"], "start": start, "end": end, "words": rows})
        if start is None:
            print(f"unmatched: {l['text']}", file=sys.stderr)

    json.dump(out, open(out_path, "w"), indent=1)

    def ts(x):
        ms = round(x * 1000)
        return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
    timed = [l for l in out if l["start"] is not None]
    with open(srt_path, "w") as f:
        for k, l in enumerate(sorted(timed, key=lambda l: l["start"]), 1):
            f.write(f"{k}\n{ts(l['start'])} --> {ts(l['end'] + 0.4)}\n{l['text']}\n\n")
    print(f"{len(timed)}/{len(out)} lines timed -> {out_path}, {srt_path}")


if __name__ == "__main__":
    main(*sys.argv[1:])
