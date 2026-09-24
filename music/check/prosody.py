"""Prosody check: do the words' natural stresses fit where the score puts them?

The model can't hear scansion, so this makes its judgment explicit and testable. Stresses come
from the CMU pronouncing dictionary (plus a small sung-lexicon for words it lacks), not from the
score's own capitals. Rules, from LYRICS.md and Qing's corrections:
  - a stressed syllable on a weak position costs, most of all off the beat;
  - adjacent stresses (a stress clash, as in "GYM LOG") need only one of them on a beat;
  - a stress pushed onto the & and held over the next beat is an anticipation, idiomatic in
    pop ("sturdy or CHEAP" in the reference chorus), and costs little;
  - a weak word on beat 1 costs a lot ("A launch demo" limps); on beat 3 it costs a little, and
    very little at patter speed; a preposition left at the end of a line takes stress;
  - breaking the rhythm template that a group of parallel lines shares costs the most,
    because at speed the template carries the line ("2FA on YOUR gym LOG").
Calibrate first against Qing's past verdicts, then score the song:
  python music/check/prosody.py --calibrate
  python music/check/prosody.py --score music/out/ep01-guide-events.json music/ep01/lines.json
"""
import json
import re
import sys
from collections import Counter

import pronouncing

# Sung syllabification and stress for words CMU lacks or sings differently (1 primary,
# 2 secondary, 0 unstressed).
LEXICON = {
    "every": "10", "kubernetes": "2010", "2fa": "221", "subagents": "120", "api": "221",
    "diags": "10", "quota's": "10", "'em": "0", "nan's": "1", "they'll": "1", "summer's": "10",
    "uni": "10", "debugging": "010", "didn't": "10", "you're": "1", "i'm": "1", "it's": "1",
    "can't": "1", "confetti": "010", "someone": "12", "software": "12",
}
# Function words take no stress of their own; pronouns and possessives are weak but can be
# focused ("good for YOU").
FUNCTION = set("a an the to of for in on at by with from and or but if as is be are was it its it's can".split())
WEAK = set("i i'm me my you you're your they they'll them their we our he she his her 'em who what just then so where".split())
PREPOSITIONS = set("to of for in on at by with from".split())
FOCAL = {"who", "what", "you", "that"}  # the hook's question words are the point of the line


def word_stresses(w):
    w = w.lower()
    if w in LEXICON:
        pat = LEXICON[w]
    else:
        phones = pronouncing.phones_for_word(w)
        if not phones:
            raise KeyError(f"no pronunciation for '{w}': add it to LEXICON")
        pat = pronouncing.stresses(phones[0])
    levels = [{"1": 1.0, "2": 0.6, "0": 0.0}[c] for c in pat]
    if len(levels) == 1:
        if w in FUNCTION:
            levels = [0.0]
        elif w in WEAK:
            levels = [0.5]
    return levels


def metric_weight(pos16):
    p = pos16 % 16
    if p == 0:
        return 4
    if p == 8:
        return 3
    if p % 4 == 0:
        return 2
    if p % 2 == 0:
        return 1
    return 0


def score_line(text, onsets, bpm, template=None, last_line=True, ends=None):
    """onsets: sixteenth positions of each syllable (melismas dropped); ends: where each note
    stops sounding, including any melisma (defaults to the next onset)."""
    words = text.split()
    ends = ends or [*onsets[1:], onsets[-1] + 2]
    syl = []  # (word, level)
    for k, w in enumerate(words):
        last = k == len(words) - 1
        focal = last and (w.lower() in FOCAL or w.lower() in PREPOSITIONS)
        for lv in word_stresses(w):
            syl.append((w, 1.0 if focal else lv))
    notes = []
    if len(syl) != len(onsets):
        return {"error": f"{len(syl)} syllables in the words, {len(onsets)} notes in the score"}, notes
    dur = (onsets[-1] - onsets[0]) / 4 * 60 / bpm if len(onsets) > 1 else 1
    rate = (len(onsets) - 1) / dur if dur > 0 else 0
    fast = rate >= 5.0
    total = 0.0
    for i, ((w, lv), t) in enumerate(zip(syl, onsets)):
        wgt = metric_weight(t)
        pen = 0.0
        held_over_beat = t % 4 != 0 and ends[i] >= (t // 4 + 1) * 4 + 1
        if lv >= 0.6 and wgt <= 1 and held_over_beat:
            pen = 0.2  # anticipation: pushed onto the & and held through the beat
        elif lv >= 0.6 and wgt <= 1:
            pen = lv * (2 - wgt)
            # Stress clash: a stressed neighbour on a beat can carry the stress for both.
            for j in (i - 1, i + 1):
                if 0 <= j < len(syl) and syl[j][1] >= 0.6 and metric_weight(onsets[j]) >= 2:
                    pen *= 0.3
                    break
        elif lv == 0.0 and wgt == 4:
            pen = 1.0  # a weak word on the downbeat: the line has nothing to land on
        elif lv == 0.0 and wgt == 3:
            pen = 0.5 * (0.3 if fast else 1)
        if pen >= 0.3:
            notes.append(f"'{w}' ({'stressed' if lv >= 0.6 else 'weak'}) on {'1 e & a 2 e & a 3 e & a 4 e & a'.split()[t % 16]}: {pen:.1f}")
        total += pen
    # The last content stress of the line should land on a beat.
    content = [k for k, (w, lv) in enumerate(syl) if lv >= 0.6]
    k = content[-1] if content else None
    anticipated = k is not None and onsets[k] % 4 != 0 and ends[k] >= (onsets[k] // 4 + 1) * 4 + 1
    if last_line and content and metric_weight(onsets[k]) < 2 and not anticipated:
        total += 1.0
        notes.append(f"line's last stress '{syl[content[-1]][0]}' is off the beat: 1.0")
    # Template: the rhythm signature relative to the line's first downbeat.
    sig = signature(onsets)
    if template is not None and sig != template:
        total += 1.5
        notes.append("breaks the rhythm its parallel lines share: 1.5")
    return {"score": round(total, 2), "rate": round(rate, 1), "sig": sig}, notes


def signature(onsets):
    """The rhythm from the line's first downbeat on; a pickup before it doesn't count."""
    base = (onsets[0] // 16) * 16 if onsets[0] % 16 < 12 else (onsets[0] // 16 + 1) * 16
    return tuple(t - base for t in onsets if t >= base)


# ---- Grid notation (same as music/lib/notation.mjs) for calibration cases -------------------

def parse_grid(bars, with_ends=False):
    """bars: list of 8-slot strings; returns onset sixteenths of syllables (bar 0 first), and
    optionally where each note stops (holds and melismas extend it; rests end it)."""
    out, ends, cur = [], [], None
    for b, grid in enumerate(bars):
        toks = grid.split()
        assert len(toks) == 8, grid
        for i, tok in enumerate(toks):
            subs = tok.split("·")
            for j, s in enumerate(subs):
                t = b * 16 + i * 2 + j * (2 // len(subs))
                if s == "~" or s.startswith("-"):
                    continue
                if ends and ends[-1] is None:
                    ends[-1] = t
                if s == ".":
                    continue
                out.append(t)
                ends.append(None)
    if ends and ends[-1] is None:
        ends[-1] = len(bars) * 16
    return (out, ends) if with_ends else out


# Qing's verdicts (LYRICS.md and the 2026-09-24 corrections). The verse template is straight
# eighths from beat 1: onsets 0 2 4 6 8 10 12.
VERSE_TEMPLATE = (0, 2, 4, 6, 8, 10, 12)
CALIBRATION = [
    ("good", "product demo wow them fast", ["PRO duct DE mo WOW them FAST ."]),
    ("good", "group chat bot just make 'em laugh", ["GROUP chat BOT just MAKE 'em LAUGH ."]),
    ("good", "2fa on your gym log", ["TWO eff AY on YOUR gym LOG ."]),
    ("good", "kubernetes for your blog", ["KOO ber NET eez for your BLOG ."]),
    ("good", "twelve subagents round the clock", ["TWELVE sub A gents ROUND the CLOCK ."]),
    ("good", "paying users make it last", ["PAY ing US ers MAKE it LAST ."]),
    ("good", "fast to run sturdy or cheap", ["FAST . to . RUN ~ ~ ~", "STUR dy or CHEAP ~ ~ ~ ."]),
    ("good", "wow for a week or built to keep", ["WOW . for a WEEK ~ . or", "BUILT to KEEP ~ . . . ."]),
    ("bad", "group chat bot make 'em laugh", ["GROUP chat BOT . MAKE 'em LAUGH ."]),
    ("bad", "a launch demo wow them fast", ["a LAUNCH DE mo WOW them FAST ."]),
    ("bad", "bot for the group chat make it fun", [". . . . . . . bot", "for the GROUP chat MAKE it FUN ."]),
    ("bad", "2fa on your gym log", ["TWO eff AY on·your GYM . LOG ."]),
    ("bad", "twelve subagents round the clock", ["TWELVE . SUB a·gents ROUND the CLOCK ."]),
]


def calibrate():
    rows = []
    for verdict, text, bars in CALIBRATION:
        on, ends = parse_grid(bars, with_ends=True)
        template = VERSE_TEMPLATE if len(bars) == 1 or bars[0].startswith(". . . .") else None
        res, notes = score_line(text, on, 180, template, ends=ends)
        rows.append((verdict, res.get("score", 99), text, bars[-1], res.get("error"), notes))
    for v, s, t, g, err, notes in sorted(rows, key=lambda r: r[1]):
        print(f"{v:4}  {s:5}  {t:40} {g}" + (f"  ERROR {err}" if err else ""))
        for n in notes:
            print(f"                 {n}")
    good = [r[1] for r in rows if r[0] == "good"]
    bad = [r[1] for r in rows if r[0] == "bad"]
    thr = (max(good) + min(bad)) / 2
    agree = sum(1 for r in rows if (r[1] < thr) == (r[0] == "good"))
    print(f"\ngood max {max(good)}, bad min {min(bad)}; threshold {thr:.2f}; agreement {agree}/{len(rows)}")
    return thr


def score_song(events_path, lines_path):
    ev = json.load(open(events_path))
    bpm = ev["bpm"]
    lead = [e for e in ev["vocals"] if e["voice"] == "lead" and not e["melisma"]]
    lines = json.load(open(lines_path))["lines"]
    per = []
    allv = [e for e in ev["vocals"] if e["voice"] == "lead"]
    # Walk the score's syllables in order, taking as many as each line's words have.
    k = 0
    for text, group in lines:
        n = sum(len(word_stresses(w)) for w in text.split())
        chunk = lead[k:k + n]
        k += n
        if len(chunk) < n:
            print(f"ERROR: the score runs out of syllables at '{text}'")
            break
        on = [e["t"] for e in chunk]
        ends = []
        for e in chunk:
            if True:
                # a note's sound runs through any melisma that follows it
                nxt = [x for x in allv if x["t"] > e["t"]]
                end = e["t"] + round((e["end"] - e["time"]) * ev["bpm"] / 15)
                for x in nxt:
                    if not x["melisma"]:
                        break
                    end = x["t"] + round((x["end"] - x["time"]) * ev["bpm"] / 15)
                ends.append(end)
        per.append((on[0], text, group, on, ends))
    if k != len(lead):
        print(f"ERROR: {len(lead) - k} score syllables left over after the last line: the words and the score disagree")
    # Only groups marked strict (trailing "!") must share one rhythm: the verse list lines.
    temps = {}
    for g in {p[2] for p in per if p[2].endswith("!")}:
        sigs = Counter(signature(p[3]) for p in per if p[2] == g and p[3])
        temps[g] = sigs.most_common(1)[0][0]
    thr = 1.0
    worst = []
    for a, text, group, on, ends in per:
        res, notes = score_line(text, on, bpm, temps.get(group), ends=ends)
        s = res.get("score", 99)
        worst.append((s, a, text, res, notes))
    for s, a, text, res, notes in sorted(worst, reverse=True):
        mark = "FLAG" if s > thr else "    "
        print(f"{mark} {s:5}  b{a // 16}  {text}" + (f"  ERROR {res['error']}" if "error" in res else ""))
        if s > thr:
            for n in notes:
                print(f"              {n}")


if __name__ == "__main__":
    if "--calibrate" in sys.argv:
        calibrate()
    if "--score" in sys.argv:
        i = sys.argv.index("--score")
        score_song(sys.argv[i + 1], sys.argv[i + 2])
