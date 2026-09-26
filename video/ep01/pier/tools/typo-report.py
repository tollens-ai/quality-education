"""Judge a typography audit (typo-audit.mjs output) against the film's lyrics.

    python3 video/ep01/pier/tools/typo-report.py audit.jsonl

For every sung word, looks at the first time it's lettered on screen and checks:
- size: cap height in master pixels (1080 x 1920). 50 px is about an 18 px cap on a phone 390
  points wide.
- time: how long it stays fully written.
- edges: how much of the ring of pixels round the letter faces is too close in brightness to tell
  apart (contrast under 2:1). Shades and ink outlines count in the letters' favour.
- covered: how much of the letter faces something else was drawn over.
- tilt, and whether it's cut off at the frame edge.
Then checks every sung word is lettered while it's sung, and every line reads in sung order.
"""
import json, re, sys, statistics as st
from collections import defaultdict

MIN_CAP, MIN_TIME, MAX_EDGE, MAX_COVER, MAX_TILT = 50, .6, .35, .25, .15

frames = [json.loads(x) for x in open(sys.argv[1])]
step = round(frames[1]['t'] - frames[0]['t'], 3)
lyrics = json.load(open('music/ep01/lyrics.json'))
lines = [l for l in lyrics if l['start'] is not None]
lead = [[w for w in l['words'] if not w.get('backing') and w['s'] is not None] for l in lines]
lead[0][0] = {**lead[0][0], 's': -.4}
norm = lambda s: re.sub(r"[^A-Z0-9']", '', s.upper().replace('’', "'"))

def inside(b):
    area = max(1, (b[2] - b[0]) * (b[3] - b[1]))
    return max(0, min(b[2], 1080) - max(b[0], 0)) * max(0, min(b[3], 1920) - max(b[1], 0)) / area

# What each record says, in terms of lyric words: (line, word) pairs it shows.
def words_of(r):
    c = r.get('ctx') or {}
    if c.get('deco'): return []
    if 'line' in c and 'word' in c: return [(c['line'], c['word'])]
    if 'line' in c and c.get('backing'): return [(c['line'], 'back')]
    src = c['group'].split(':', 1)[1] if 'group' in c else r['str']
    toks = [norm(x) for x in re.split(r'\s+', src)]
    return [('tok', tk) for tk in toks if tk]

# Collect, per lyric word, every frame it's visible and fully written.
seen = defaultdict(list)      # key -> list of (t, rec)
for f in frames:
    for r in f['recs']:
        c = r.get('ctx') or {}
        if c.get('mark') or not (r['main'] or r.get('note')): continue
        if r['alpha'] < .5 or r['prog'] < .95 or inside(r['box']) < .6: continue
        if f['t'] > 199.1: continue   # the tide and the fade to black take the last words on purpose
        for key in words_of(r): seen[key].append((f['t'], r))

def runs(entries):
    out, cur = [], []
    for t, r in sorted(entries, key=lambda e: e[0]):
        if cur and t - cur[-1][0] > step * 1.6: out.append(cur); cur = []
        if not cur or t != cur[-1][0]: cur.append((t, r))
    if cur: out.append(cur)
    return out

def judge(run):
    t0, t1 = run[0][0], run[-1][0]
    early = [r for t, r in run if t - t0 <= 1.0]
    for r in early:
        if (r.get('ctx') or {}).get('bulbs'): r['edge'] = None
    med = lambda k, rs=early: st.median([r[k] for r in rs if r.get(k) is not None]) if any(r.get(k) is not None for r in rs) else None
    return {'t0': t0, 'time': round(t1 - t0 + step, 2), 'cap': med('cap'), 'edge': med('edge'), 'hidden': med('hidden'),
            'tilt': max(abs(r['rot']) for r in early), 'cut': sum(inside(r['box']) < .97 for r in early) / len(early) > .3,
            'multi': len(early[0]['textL']) > 1, 'str': early[0]['str']}

issues, missing = [], []
for li, words in enumerate(lead):
    for wi, w in enumerate(words):
        cand = seen.get((li, wi), []) + [e for e in seen.get(('tok', norm(w['w'])), []) if abs(e[0] - w['s']) < 3]
        rs = [r for r in runs(cand) if r[-1][0] >= w['s'] - .05 and r[0][0] <= w['s'] + 1.0]
        if not rs: missing.append((w['s'], lines[li]['start'], w['w'])); continue
        j = judge(rs[0])
        flags = []
        if j['cap'] < MIN_CAP: flags.append(f"small ({j['cap']:.0f} px)")
        last = wi == len(words) - 1
        if j['time'] < (.4 if last else MIN_TIME): flags.append(f"brief ({j['time']:.2f} s)" + (" (last word)" if last else ''))
        if j['edge'] is not None and j['edge'] > MAX_EDGE: flags.append(f"edges blend ({j['edge'] * 100:.0f}%)")
        if j['hidden'] is not None and j['hidden'] > MAX_COVER and not j['multi']: flags.append(f"covered ({j['hidden'] * 100:.0f}%)")
        if j['tilt'] > MAX_TILT: flags.append(f"tilted ({j['tilt']:.2f})")
        if j['cut']: flags.append("cut off at the edge")
        if flags: issues.append((w['s'], lines[li]['start'], w['w'], flags, j))

# Backing vocals: judged as one piece per line.
for li, l in enumerate(lines):
    if not any(w.get('backing') for w in l['words']): continue
    rs = runs(seen.get((li, 'back'), []))
    if not rs: continue
    j = judge(rs[0]); flags = []
    if j['cap'] < MIN_CAP: flags.append(f"small ({j['cap']:.0f} px)")
    if j['edge'] is not None and j['edge'] > MAX_EDGE: flags.append(f"edges blend ({j['edge'] * 100:.0f}%)")
    if flags: issues.append((j['t0'], l['start'], '(' + j['str'] + ')', flags, j))

# Reading order, at the moment each line is complete.
order = []
for li, words in enumerate(lead):
    if len(words) < 2: continue
    T = max(w['s'] for w in words) + .4
    f = min(frames, key=lambda f: abs(f['t'] - T))
    placed = {}
    for r in f['recs']:
        c = r.get('ctx') or {}
        if c.get('mark') or r['alpha'] < .5 or inside(r['box']) < .6: continue
        for key in words_of(r):
            if key[0] == li and key[1] != 'back': placed.setdefault(key[1], r)
            elif key[0] == 'tok':
                for wi, w in enumerate(words):
                    if norm(w['w']) == key[1] and wi not in placed: placed[wi] = r; break
    if len(placed) < 2: continue
    items = sorted(placed.items(), key=lambda kv: kv[1]['base'][1])
    rows = []
    for wi, r in items:
        if rows and abs(r['base'][1] - rows[-1][-1][1]['base'][1]) < .35 * min(r['cap'], rows[-1][-1][1]['cap']): rows[-1].append((wi, r))
        else: rows.append([(wi, r)])
    seq = [wi for row in rows for wi, r in sorted(row, key=lambda x: x[1]['base'][0])]
    if any(seq[i] > seq[i + 1] for i in range(len(seq) - 1)):
        order.append((lines[li]['start'], ' '.join(w['w'] for w in words), ' '.join(words[i]['w'] for i in seq)))

words_total = sum(len(w) for w in lead)
print(f"# Typography audit: {len(frames)} frames every {step} s, {words_total} sung words\n")
print(f"## Sung words with a problem ({len(issues)})\n")
for s, ls, w, flags, j in sorted(issues):
    print(f"- {s:6.2f}s  {w!r:18} {', '.join(flags)}   [line at {ls:.2f}, cap {j['cap']:.0f}, up {j['time']:.1f} s]")
print(f"\n## Sung words not lettered while sung ({len(missing)})\n")
for s, ls, w in missing: print(f"- {s:6.2f}s  {w!r} (line at {ls:.2f})")
print(f"\n## Lines that don't read in sung order ({len(order)})\n")
for ls, sung, seen_ in order: print(f"- {ls:6.2f}s  sung:  {sung}\n           reads: {seen_}")
