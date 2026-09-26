"""Measure the song for the picture: per-frame loudness of the vocal, the kick, the snare and the
whole mix, so the animation can move with the record rather than with a guessed grid.

    python analyse.py <take.mp3> <no_vocals.wav> <out.json>

The vocal is the take minus Demucs's instrumental stem (the vocal stem on disk is truncated),
aligned by cross-correlation first. Envelopes are sampled at 60 per second and normalised so each
track's loud passages sit near 1.
"""
import json
import subprocess
import sys

import numpy as np

SR = 44100
HOP = SR // 60


def decode(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def align(a, b):
    """Samples to shift b so it lines up with a (small lags only)."""
    seg = slice(SR * 30, SR * 40)
    x, y = a[seg], b[seg]
    n = 1 << (len(x) * 2 - 1).bit_length()
    c = np.fft.irfft(np.fft.rfft(x, n) * np.conj(np.fft.rfft(y, n)), n)
    lags = np.concatenate([np.arange(0, 4000), np.arange(n - 4000, n)])
    best = lags[np.argmax(c[lags])]
    return int(best if best < n // 2 else best - n)


def frames(x):
    n = len(x) // HOP
    return x[: n * HOP].reshape(n, HOP)


def band_env(x, lo, hi):
    """Energy in [lo, hi] Hz per hop, from 2048-point windows centred on each hop."""
    win = 2048
    pad = np.pad(x, (win // 2, win // 2))
    n = len(x) // HOP
    idx = np.arange(win)[None, :] + (np.arange(n) * HOP)[:, None]
    spec = np.abs(np.fft.rfft(pad[idx] * np.hanning(win), axis=1))
    f = np.fft.rfftfreq(win, 1 / SR)
    sel = (f >= lo) & (f < hi)
    return np.sqrt((spec[:, sel] ** 2).mean(axis=1))


def norm(e, q=0.97):
    e = np.maximum(e, 0)
    return np.clip(e / (np.quantile(e, q) + 1e-9), 0, 1.5)


def onset(e):
    d = np.diff(e, prepend=e[0])
    return norm(np.maximum(d, 0), 0.995)


def main():
    take, inst_path, out = sys.argv[1:4]
    mix = decode(take)
    inst = decode(inst_path)
    lag = align(mix, inst)
    inst = np.roll(inst, lag)
    n = min(len(mix), len(inst))
    mix, inst = mix[:n], inst[:n]
    voc = mix - inst
    rms = lambda x: np.sqrt((frames(x) ** 2).mean(axis=1))
    kick = band_env(inst, 35, 140)
    snare = band_env(inst, 1800, 6000)
    data = {
        "fps": 60,
        "lag_samples": lag,
        "mix": np.round(norm(rms(mix)), 3).tolist(),
        "vocal": np.round(norm(rms(voc), 0.98), 3).tolist(),
        "kick": np.round(onset(kick), 3).tolist(),
        "snare": np.round(onset(snare), 3).tolist(),
        "low": np.round(norm(kick), 3).tolist(),
    }
    with open(out, "w") as fh:
        json.dump(data, fh, separators=(",", ":"))
    print(f"lag {lag} samples; {len(data['mix'])} frames -> {out}")


if __name__ == "__main__":
    main()
