"""Judge the typography audit: every sung word, over every frame it was on screen.

    python3 tools/typo-report.py video/out/audit-*.jsonl

Reports, per word: its size, how long it was fully up for, whether it strayed into the platform
UI's corners, and how its arrival sat against its sung onset. The flags are for looking at, not for
obeying: some of them are the design (a stamp that starts pale is meant to).

Thresholds, and why each is what it is:

  MIN_SIZE  the smallest cap height that reads on a phone at 390px wide. The master is 1080, so
            this is a third of that in film terms.
  MIN_HOLD  seconds a word stays up after it is sung. A word you have finished reading may go; one
            you are still reading may not.
  STEP      the audit samples every tenth of a second, so it can only see a word's arrival to
            within half a sample. Words.js finishes a word LEAD_WANT ahead of its onset by
            construction; LEAD_WANT is inside that resolution, so a word measured up within
            STEP/2 of its onset cannot be called late on this evidence — and that is the honest
            limit of this check, not a pass.
"""

import json
import sys
from collections import defaultdict

MIN_SIZE = 40
MIN_HOLD = 0.55
STEP = 0.1
LEAD_WANT = 0.085
LATE_TOL = STEP / 2      # the measurement's own resolution, see the note above

# Platform UI: the bottom 400px of a phone, and its right 140px below the middle.
UI_BOTTOM = 1520
UI_RIGHT = 936
UI_SPLIT = 960


def main(paths):
    words = defaultdict(list)
    for path in paths:
        with open(path) as fh:
            for line in fh:
                if line.strip():
                    r = json.loads(line)
                    words[(r["line"], r["word"], r["on"])].append(r)

    # each line's own last word, so the note about a line ending is per line
    line_last = {}
    for (line, word, on) in words:
        if on is not None and (line not in line_last or on > line_last[line]):
            line_last[line] = on

    print(f"{len(words)} words\n")
    flags = []
    # A backing vocal has no measured onset, so it sorts last rather than crashing the sort.
    for (line, word, on), recs in sorted(words.items(), key=lambda kv: (kv[1][0]["on"] is None, kv[1][0]["on"] or 0)):
        recs.sort(key=lambda r: r["t"])
        size = recs[0]["size"]
        x, y, w, h = recs[0]["x"], recs[0]["y"], recs[0]["w"], recs[0]["h"]
        # "fully up" is the first frame at full opacity, which is the arrival finishing
        full = next((r["t"] for r in recs if r["alpha"] >= 0.98), recs[0]["t"])
        before = full - on if on is not None else 0
        after = recs[-1]["t"] - max(on or full, full)
        # A line's last word only has to be readable: the line ends there and the next line's words
        # arrive on the next cut, so holding it longer would put two lines in one band.
        final_of_line = on is not None and on == line_last.get(line)

        if on is not None and before > LATE_TOL:
            flags.append(f"LATE   {word!r:16} up {before:+.2f}s vs onset {on:.2f} (want {LEAD_WANT:+.3f})")
        if size < MIN_SIZE:
            flags.append(f"SMALL  {word!r:16} {size:.0f}px")
        if y + h > UI_BOTTOM:
            flags.append(f"UI     {word!r:16} foot y={y + h:.0f} (limit {UI_BOTTOM})")
        if y > UI_SPLIT and x + w > UI_RIGHT:
            flags.append(f"UI     {word!r:16} right edge x={x + w:.0f} (limit {UI_RIGHT})")
        if after < MIN_HOLD:
            tag = "SHORT*" if final_of_line else "SHORT "
            flags.append(f"{tag} {word!r:16} up {after:.2f}s after it is sung")

    if flags:
        print("\n".join(flags))
    starred = sum(1 for f in flags if f.startswith("SHORT*"))
    print(f"\n{len(flags)} flags on {len(words)} words ({starred} are a line's last word)")
    small = sorted((r[0]["size"], w, l) for (l, w, _), r in words.items())[:8]
    print("\nsmallest: " + ", ".join(f"{w!r} {s:.0f}px" for s, w, _ in small))


if __name__ == "__main__":
    main(sys.argv[1:])