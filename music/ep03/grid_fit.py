"""Fit a steady beat grid to the take and see how far each stretch of it drifts from that grid.

    python music/ep03/grid_fit.py <take.wav>

Scans beat length and phase for the comb of onset strength that is highest over the whole song,
then does the same per 20-second window with the length fixed, so a tempo change or a drifting
phase shows as a moving offset.
"""
import sys

import librosa
import numpy as np


def comb(env, ot, T, phi, t_end):
    ts = np.arange(phi, t_end, T)
    return np.interp(ts, ot, env).sum() / len(ts)


def main(path):
    y, sr = librosa.load(path, sr=22050, mono=True)
    hop = 128
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    ot = librosa.frames_to_time(np.arange(len(env)), sr=sr, hop_length=hop)
    dur = ot[-1]
    best = (0, 0, 0)
    for T in np.arange(0.420, 0.440, 0.0002):
        for phi in np.arange(0, T, 0.004):
            s = comb(env, ot, T, phi, dur)
            if s > best[0]:
                best = (s, T, phi)
    s, T, phi = best
    print(f"whole-song comb: beat {T:.4f}s = {60 / T:.2f} bpm, first beat at {phi:.3f}s, mean onset on grid {s:.2f} (overall mean {env.mean():.2f})")
    # Windowed phase with the tempo fixed.
    print("\nphase of the best comb per 20 s window (ms after the fitted grid):")
    for w0 in np.arange(0, dur - 10, 10):
        w1 = w0 + 20
        m = (ot >= w0) & (ot < w1)
        bestp, bs = 0, -1
        for off in np.arange(-0.12, 0.12, 0.004):
            ts = np.arange(phi + off, dur, T)
            ts = ts[(ts >= w0) & (ts < w1)]
            sc = np.interp(ts, ot, env).mean()
            if sc > bs:
                bs, bestp = sc, off
        print(f"  {w0:5.0f}-{w1:5.0f}s  offset {1000 * bestp:6.0f} ms   grid strength {bs:.2f}")


if __name__ == "__main__":
    main(sys.argv[1])
