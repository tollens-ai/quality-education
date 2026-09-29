#!/usr/bin/env python3
"""How far ahead of the voice each sung word is fully written, from a frame-exact typography audit.

    node video/ep03/polka/tools/typo-audit.mjs --step 0.0333333 --from A --to B > audit.jsonl   (in segments)
    python3 video/ep03/polka/tools/sync-report.py audit.jsonl [audit2.jsonl ...]

For every sung word: the first frame at which it is fully written (`prog` >= .98), and its lead: the word's measured
onset minus that time. Qing chose an 85 ms lead for episode 2's lettering ("between a and b [...] maybe 80-90") and
this film aims for the same; drawing on twos, rounded to the nearest tick, moves a word by up to 33 ms either way.
Flags a lead under 20 ms or over 200 ms; prints the distribution. A word already written when the audit's first
frame was recorded is skipped (its lead can't be measured)."""
import json, sys, collections, statistics
rows = []
for f in sys.argv[1:]:
    rows += [json.loads(l) for l in open(f) if l.strip().startswith('{')]
words = collections.defaultdict(list)
for r in rows:
    words[(r['li'], r['wi'])].append(r)
leads, flags, skipped = [], [], 0
for key, rs in sorted(words.items()):
    rs.sort(key=lambda r: r['t'])
    r0 = rs[0]
    if r0['prog'] >= .98:
        skipped += 1
        continue
    done = next((r['t'] for r in rs if r['prog'] >= .98), None)
    if done is None:
        flags.append((r0['s'], f"line {key[0]} word {key[1]} '{r0['str']}': never fully written"))
        continue
    lead = (r0['s'] - done) * 1000
    leads.append(lead)
    if lead < 20 or lead > 200:
        flags.append((r0['s'], f"line {key[0]} word {key[1]} '{r0['str']}': lead {lead:.0f} ms (written at {done:.3f}, sung at {r0['s']:.3f})"))
if leads:
    leads.sort()
    q = lambda p: leads[int(p * (len(leads) - 1))]
    print(f"{len(leads)} words measured ({skipped} already written when the audit began)")
    print(f"lead in ms: min {leads[0]:.0f}, 10% {q(.1):.0f}, median {statistics.median(leads):.0f}, mean {statistics.mean(leads):.0f}, 90% {q(.9):.0f}, max {leads[-1]:.0f}")
print(f"{len(flags)} flags")
for s, m in sorted(flags):
    print(f"  {s:7.2f}  {m}")
