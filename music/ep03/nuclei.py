"""Syllable nuclei on the vocal stem, and how tightly they sit on an eighth-note grid.

    python music/ep03/nuclei.py <vocals.wav> <t0> <t1> [eighth seconds]

Finds the loudness peaks of the voice (one per sung syllable, roughly), then folds their times
on the eighth-note period and reports where in the period they cluster and how tightly. A
generated patter vocal on a steady grid should cluster within a few tens of milliseconds.
"""
import sys

import librosa
import numpy as np
from scipy.signal import butter, find_peaks, sosfiltfilt


def nuclei(y, sr, lo=250, hi=3500, hop=0.005, smooth=0.03):
    sos = butter(4, [lo, hi], btype="band", fs=sr, output="sos")
    z = sosfiltfilt(sos, y)
    h = int(sr * hop)
    rms = np.sqrt(np.convolve(z ** 2, np.ones(h * 2) / (h * 2), mode="same"))[::h]
    t = np.arange(len(rms)) * hop
    k = int(smooth / hop)
    g = np.exp(-0.5 * (np.arange(-3 * k, 3 * k + 1) / k) ** 2)
    env = np.convolve(rms, g / g.sum(), mode="same")
    env = 20 * np.log10(env + 1e-7)
    pk, prop = find_peaks(env, distance=int(0.11 / hop), prominence=2.5)
    return t, env, t[pk], prop["prominences"]


def main(path, t0, t1, eighth=0.2151):
    t0, t1, eighth = float(t0), float(t1), float(eighth)
    y, sr = librosa.load(path, sr=22050, mono=True)
    t, env, pk, prom = nuclei(y, sr)
    m = (pk >= t0) & (pk <= t1)
    pk, prom = pk[m], prom[m]
    print(f"{len(pk)} nuclei between {t0} and {t1} s, {len(pk) / (t1 - t0):.2f} per second (an eighth grid gives {1 / eighth:.2f})")
    ang = 2 * np.pi * (pk % eighth) / eighth
    R = np.abs(np.mean(np.exp(1j * ang)))
    mean = (np.angle(np.mean(np.exp(1j * ang))) % (2 * np.pi)) / (2 * np.pi) * eighth
    dev = ((pk - mean + eighth / 2) % eighth) - eighth / 2
    print(f"phase concentration R = {R:.2f} (1 = perfectly on a grid); grid offset {mean * 1000:.0f} ms into each {eighth * 1000:.0f} ms cell")
    print(f"deviation from the grid: median abs {np.median(np.abs(dev)) * 1000:.0f} ms, 90th pct {np.percentile(np.abs(dev), 90) * 1000:.0f} ms")
    hist, edges = np.histogram(dev * 1000, bins=np.arange(-110, 111, 20))
    for c, e in zip(hist, edges):
        print(f"  {e:5.0f} ms  {'#' * c}")


if __name__ == "__main__":
    main(*sys.argv[1:])
