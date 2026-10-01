"""Judge the typography audit: every lead word's arrival against its sung onset, how long it is fully
on screen, its size, and whether it strays outside the safe area (the frame's edges, the bottom 400 px
and the right 140 px of the lower half, where the phone apps' buttons sit).

    python3 video/ep04/ball/tools/typo-report.py music/ep04/piano/lyrics.json audit*.jsonl
"""
import json, sys
from collections import defaultdict

lyrics = json.load(open(sys.argv[1]))
words = [(w['w'], w['s'], w.get('e') or w['s']) for l in lyrics if not l.get('back') for w in l['words']]
frames = [json.loads(x) for f in sys.argv[2:] for x in open(f) if x.strip()]
frames.sort(key=lambda f: f['t'])
seen = defaultdict(list)          # (word, onset) -> [(t, rec)]
for f in frames:
    for r in f['words']:
        seen[(r['w'], round(r['s'], 3))].append((f['t'], r))
flags = []
W, H = 1080, 1920
for w, s, e in words:
    recs = seen.get((w, round(s, 3)), [])
    full = [t for t, r in recs if r['full']]
    if not full:
        flags.append((s, w, 'never fully on screen')); continue
    first = min(full)
    if first > s + .05: flags.append((s, w, f'late: fully up {first - s:+.2f} s from onset'))
    if first < s - .4: flags.append((s, w, f'early: fully up {first - s:+.2f} s'))
    span = max(full) - first + .1
    if span < .6: flags.append((s, w, f'on screen fully only {span:.1f} s'))
    for t, r in recs:
        if not r['full']: continue
        if r['size'] < 56: flags.append((s, w, f'small: {r["size"]:.0f} px')); break
        if r['x0'] < 24 or r['x1'] > W - 24 or r['y0'] < 90: flags.append((s, w, f'outside the frame margins at {t}')); break
        if r['y1'] > H - 400 or (r['y1'] > H / 2 and r['x1'] > W - 140): flags.append((s, w, f'in the phone UI zone at {t}')); break
# overlaps between fully shown words at the same moment
over = set()
for f in frames:
    rs = [r for r in f['words'] if r['full']]
    for i in range(len(rs)):
        for j in range(i + 1, len(rs)):
            a, b = rs[i], rs[j]
            ix = min(a['x1'], b['x1']) - max(a['x0'], b['x0']); iy = min(a['y1'], b['y1']) - max(a['y0'], b['y0'])
            if ix > 8 and iy > 8: over.add((round(f['t'], 1), a['w'], b['w']))
print(f'{len(words)} lead words, {len(frames)} frames, {len(flags)} flags, {len(over)} overlapping moments')
for s, w, m in sorted(flags): print(f'{s:7.2f}  {w:16} {m}')
for o in sorted(over)[:40]: print('overlap', o)
