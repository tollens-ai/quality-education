"""Sung notes of a vocal stem between two times, with bar positions and the word under each note.

Usage: python music/reference/pitch.py <vocals.wav> <take.words.json> <offset_s> <t0> <t1> <beat0_s> <beat_s>
offset_s shifts stem times to take times (0 if the stem is the whole take); beat0_s is the time
of a bar-1 downbeat and beat_s one beat's length, both from rhythm.py.
"""
import json
import sys

import librosa
import numpy as np

vocals, words_json, OFF, T0, T1, beat0, bp = sys.argv[1], sys.argv[2], *map(float, sys.argv[3:8])
y, sr = librosa.load(vocals, sr=22050)
f0, vf, vp = librosa.pyin(y, fmin=110, fmax=1000, sr=sr, frame_length=2048, hop_length=256)
t = librosa.times_like(f0, sr=sr, hop_length=256) + OFF
midi = librosa.hz_to_midi(f0)


def pos(x):
    b = (x - beat0) / bp
    return f"bar{int(b // 4) + 1}.{b % 4 + 1:.2f}"


notes, cur = [], None
for ti, m in zip(t, midi):
    if ti < T0 or ti > T1:
        continue
    if np.isnan(m):
        if cur:
            notes.append(cur)
            cur = None
        continue
    if cur and abs(m - np.median(cur["m"])) < 0.8:
        cur["m"].append(m)
        cur["e"] = ti
    else:
        if cur:
            notes.append(cur)
        cur = {"s": ti, "e": ti, "m": [m]}
if cur:
    notes.append(cur)

words = [w for s in json.load(open(words_json)) for w in s["words"] if T0 < w["s"] < T1]


def wordat(x):
    for w in words:
        if w["s"] - 0.05 <= x <= w["e"] + 0.05:
            return w["w"].strip()
    return ""


print("words:", " | ".join(f'{w["w"].strip()}@{w["s"]:.2f}({pos(w["s"])})' for w in words))
for n in notes:
    d = n["e"] - n["s"]
    if d < 0.07:
        continue
    m = float(np.median(n["m"]))
    s = n["s"]
    print(f"{s:6.2f} {pos(s):>11} {d / bp:4.2f}b {librosa.midi_to_note(round(m)):>4} ({m:5.1f})  {wordat(s + 0.02)}")
