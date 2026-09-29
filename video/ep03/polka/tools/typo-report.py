#!/usr/bin/env python3
"""Judge typo-audit.mjs's output (one JSON line per lettered sung word per frame).

    python3 video/ep03/polka/tools/typo-report.py audit.jsonl [audit2.jsonl ...]

Flags: a word never drawn; finished writing later than 150 ms after its due time (its `v`); gone before its
line's last word has begun; cap height under 44 px; ink contrast under 3:1 against what is behind it; a box
outside the safe area (x 24-1056, y 90-1500: the phone apps' button strip starts at 1520).
"""
import json, sys, collections
rows = []
for f in sys.argv[1:]:
    rows += [json.loads(l) for l in open(f) if l.strip().startswith('{')]
words = collections.defaultdict(list)
for r in rows:
    words[(r['li'], r['wi'])].append(r)
line_last = collections.defaultdict(float)
for (li, wi), rs in words.items():
    line_last[li] = max(line_last[li], rs[0]['s'])
flags = []
for (li, wi), rs in sorted(words.items()):
    rs.sort(key=lambda r: r['t'])
    r0 = rs[0]
    done = next((r['t'] for r in rs if r['prog'] >= .98), None)
    tag = f"line {li} word {wi} '{r0['str']}'"
    if done is None:
        flags.append((r0['s'], tag, 'never fully written'))
        continue
    # (A word already fully written in the first frame recorded was written before the audit window opened, so its lateness can't be judged.)
    if r0['prog'] < .98 and done > r0['v'] + .15:
        flags.append((r0['s'], tag, f"finished {done - r0['v']:+.2f}s after due ({r0['v']:.2f})"))
    last = rs[-1]['t']
    if last < line_last[li] - .05:
        flags.append((r0['s'], tag, f"gone at {last:.2f} before its line's last word starts ({line_last[li]:.2f})"))
    vis = [r for r in rs if r['prog'] >= .98 and r['alpha'] > .9 and not r.get('inJoin')]
    if vis:
        size = min(r['size'] for r in vis)
        if size < 44:
            flags.append((r0['s'], tag, f'cap height {size:.0f}px'))
        cs = [r['contrast'] for r in vis if r['contrast'] is not None]
        if cs and min(cs) < 3:
            flags.append((r0['s'], tag, f'contrast {min(cs):.1f}:1 at worst'))
        for r in vis:
            if r['x'] < 24 or r['x'] + r['w'] > 1056 or r['y'] - r['size'] < 90 or r['y'] > 1500:
                flags.append((r0['s'], tag, f"box out of the safe area at {r['t']:.1f}s: x {r['x']:.0f}-{r['x'] + r['w']:.0f}, y {r['y'] - r['size']:.0f}-{r['y']:.0f}"))
                break
print(f'{len(words)} sung words drawn; {len(flags)} flags')
for s, tag, msg in sorted(flags):
    print(f'  {s:7.2f}  {tag}: {msg}')
