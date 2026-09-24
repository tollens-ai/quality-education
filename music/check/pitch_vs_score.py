"""Pitch-track a solo vocal render and compare each sung note with the score.

Usage: python music/check/pitch_vs_score.py <solo.wav> <events.json> <voice> [--offset SECONDS]
Reports each note's median error in cents (after its glide) and flags anything over 30 cents.
"""
import json
import sys

import librosa
import numpy as np

wav, events_path, voice = sys.argv[1:4]
offset = float(sys.argv[sys.argv.index("--offset") + 1]) if "--offset" in sys.argv else 0.0
y, sr = librosa.load(wav, sr=22050, mono=True)
hop = 128
f0, _, _ = librosa.pyin(y, fmin=100, fmax=900, sr=sr, frame_length=2048, hop_length=hop)
t = librosa.times_like(f0, sr=sr, hop_length=hop) - offset
cents = 1200 * np.log2(f0 / 440.0) / 100 + 69  # in midi units

evs = [e for e in json.load(open(events_path))["vocals"] if e["voice"] == voice]
errs, flagged, missing = [], [], 0
for e in evs:
    dur = e["end"] - e["time"]
    a = e["time"] + min(0.12, dur * 0.3) + 0.02  # skip the glide
    b = e["end"] - 0.02
    sel = (t >= a) & (t <= b) & ~np.isnan(cents)
    if sel.sum() < 3:
        missing += 1
        continue
    err = 100 * (np.median(cents[sel]) - e["midi"])
    errs.append(abs(err))
    if abs(err) > 30:
        flagged.append((e["time"], e["text"], e["midi"], round(err)))
print(f"{len(evs)} notes, {len(errs)} measured, {missing} too short to measure")
print(f"median |error| {np.median(errs):.1f} cents, 95th pct {np.percentile(errs, 95):.1f} cents")
for f in flagged[:40]:
    print(f"  FLAG {f[0]:7.2f}s '{f[1]}' midi {f[2]} off by {f[3]} cents")
print(f"{len(flagged)} flagged")
