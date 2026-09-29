"""First look at episode 3's take: tempo, beat phase and loudness by bar.

    python music/ep03/explore.py <take.wav>

Prints what the take's grid looks like before any of it is committed to beats.json.
"""
import sys

import librosa
import numpy as np


def main(path):
    y, sr = librosa.load(path, sr=22050, mono=True)
    dur = len(y) / sr
    hop = 256
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    tempo, beats = librosa.beat.beat_track(onset_envelope=env, sr=sr, hop_length=hop, start_bpm=140, tightness=200)
    bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
    d = np.diff(bt)
    print(f"duration {dur:.2f}s  tempo {float(np.atleast_1d(tempo)[0]):.2f}  beats {len(bt)}")
    print(f"beat interval median {np.median(d):.4f}s -> {60 / np.median(d):.2f} bpm; sd {d.std():.4f}")
    print("first 12 beats", np.round(bt[:12], 3))
    print("last 6 beats", np.round(bt[-6:], 3))
    # A regular fit: least-squares line through the beat times, so drift shows up.
    n = np.arange(len(bt))
    a, b = np.polyfit(n, bt, 1)
    res = bt - (a * n + b)
    print(f"linear fit: interval {a:.5f}s ({60 / a:.3f} bpm), offset {b:.3f}s, residual sd {res.std() * 1000:.1f} ms, max {np.abs(res).max() * 1000:.0f} ms")
    # Loudness per beat pair (a 2/4 bar).
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    rt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
    bars = bt[::2]
    for i, t in enumerate(bars[:-1]):
        m = (rt >= t) & (rt < bars[i + 1])
        db = 20 * np.log10(rms[m].mean() + 1e-9)
        print(f"bar {i + 1:3d} t {t:7.3f}  {db:6.1f} dB  " + "#" * int(max(0, (db + 60) * 1.2)))


if __name__ == "__main__":
    main(sys.argv[1])
