"""Join align_range.py's parts into one estimates file, in line order.

    python3 music/ep04/piano/merge_estimates.py <out.json> <part.json>...

A later part replaces an earlier one's lines (used to swap in the chorus endings aligned on the
karaoke lead stem, where the backing echoes overlap the lead on the full vocal stem).
"""
import json
import sys

by_line = {}
for p in sys.argv[2:]:
    for e in json.load(open(p)):
        by_line[e["line"]] = e
out = [by_line[k] for k in sorted(by_line)]
assert [e["line"] for e in out] == list(range(len(out))), "missing lines"
json.dump(out, open(sys.argv[1], "w"), indent=1, ensure_ascii=False)
print(len(out), "lines")
