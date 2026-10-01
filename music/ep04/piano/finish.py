"""Merge the piano take's lead and backing word times into one lyrics.json, in sung order.

    python3 music/ep04/piano/finish.py <lead lyrics.json> <lead-stem lyrics.json> <lines> <backing lyrics.json> \
        <lyrics.json out> <captions.srt out>

<lines> (comma-separated line indices) are taken from the run snapped on the karaoke lead stem
instead of the whole vocal stem: the chorus endings, where the backing echoes sound under the
lead's held notes and would otherwise pull its onsets and tails.

Lead lines keep their couplet numbers. Each backing echo ("What did you try?", "What did you
find?") takes the couplet and line_in_couplet of the lead line it is sung under, and is marked
`back: true` with `backing: true` on its words. Lines are ordered by start time, so an echo sits
between the lead line it answers and the next one; a renderer that shows one main line at a time
should skip `back` lines when choosing it.
"""
import json
import sys

# Onsets set by hand where the snap to the stem's onsets treated a repeat differently from the
# others, though the aligners placed all three choruses alike (2026-10-01, from the vocal stem's
# spectrograms in .private/ep04-piano/views/find-c*.png):
# - Chorus 1 "Find": snapped to the vowel (45.970); choruses 2 and 3 snapped to the start of the
#   /f/. Set to chorus 1's /f/ start, as the others.
# - Chorus 3 "you" in "What did you find?": snapped 60 ms before the aligners' median (160.56),
#   which matches choruses 1 and 2 after the chorus shift; the earlier onset is the end of "did".
OVERRIDES = {("Chorus 1", "Find a clue? Congratulations!", 0): 45.865,
             ("Chorus 3", "What did you try? What did you find?", 6): 160.560}


def main(lead_p, lead_stem_p, swap, back_p, out_p, srt_p):
    lead = json.load(open(lead_p))
    alt = json.load(open(lead_stem_p))
    for i in (int(x) for x in swap.split(",") if x):
        assert alt[i]["text"] == lead[i]["text"]
        lead[i] = alt[i]
    for l in lead:
        for k, w in enumerate(l["words"]):
            t = OVERRIDES.get((l["section"], l["text"], k))
            if t is not None:
                w["s"] = t
                if k:
                    l["words"][k - 1]["e"] = min(l["words"][k - 1]["e"], round(t - 0.01, 3))
        l["start"] = l["words"][0]["s"]
    back = json.load(open(back_p))
    for b in back:
        host = max((l for l in lead if l["section"] == b["section"] and l["start"] <= b["start"]), key=lambda l: l["start"])
        b["couplet"], b["line_in_couplet"], b["back"] = host["couplet"], host["line_in_couplet"], True
        for w in b["words"]:
            w["backing"] = True
    L = sorted(lead + back, key=lambda l: l["start"])
    keys = ["text", "section", "start", "end", "back", "words", "couplet", "line_in_couplet"]
    L = [{k: l[k] for k in keys} for l in L]
    json.dump(L, open(out_p, "w"), indent=1, ensure_ascii=False)

    def ts(x):
        ms = round(x * 1000)
        return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
    with open(srt_p, "w") as f:
        for n, l in enumerate(L, 1):
            text = f"({l['text']})" if l["back"] else l["text"]
            f.write(f"{n}\n{ts(l['start'])} --> {ts(l['end'] + 0.3)}\n{text}\n\n")
    print(f"{len(lead)} lead lines, {len(back)} backing lines, {sum(len(l['words']) for l in L)} words")


if __name__ == "__main__":
    main(*sys.argv[1:])
