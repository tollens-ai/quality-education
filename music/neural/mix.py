"""Rough mix of a neural lead vocal over the band, to hear it in context.

The vocal is render.py's song.wav, in which sample 0 is the song start (meta.startT), as in the
band render. It is resampled to the band's rate, levelled so it sits a set number of dB above
the band while it sings (RMS over the sung spans), given a light high-pass, added in the
centre, and peak-normalised. Not a mix-down for release: no EQ, compression or reverb.

Usage: python music/neural/mix.py --vocal=song.wav --band=music/out/ep01-band.wav --out=mix
       [--over=1.5]   # vocal level over the band while singing, in dB
Writes <out>.wav and <out>.mp3.
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, resample_poly, sosfilt

sys.path.insert(0, str(Path(__file__).resolve().parent))
from render import arg, write_mp3  # noqa: E402


def main():
    band, sr = sf.read(arg("band"), dtype="float32", always_2d=True)
    voc, vsr = sf.read(arg("vocal"), dtype="float32")
    if vsr != sr:
        g = np.gcd(sr, vsr)
        voc = resample_poly(voc, sr // g, vsr // g).astype(np.float32)
    voc = sosfilt(butter(2, 120, "highpass", fs=sr, output="sos"), voc).astype(np.float32)
    n = max(len(band), len(voc))
    band = np.pad(band, ((0, n - len(band)), (0, 0)))
    voc = np.pad(voc, (0, n - len(voc)))
    # Level: compare RMS where the vocal is present (above -40 dB of its peak, 50 ms frames).
    f = int(0.05 * sr)
    frames = n // f
    ve = np.sqrt((voc[: frames * f].reshape(frames, f) ** 2).mean(1))
    be = np.sqrt((band[: frames * f].mean(1).reshape(frames, f) ** 2).mean(1))
    on = ve > ve.max() * 10 ** (-40 / 20)
    gain = 10 ** (float(arg("over", 1.5)) / 20) * be[on].mean() / max(ve[on].mean(), 1e-9)
    mix = band + gain * voc[:, None]
    mix *= 0.89 / np.abs(mix).max()
    out = arg("out")
    sf.write(f"{out}.wav", mix, sr)
    write_mp3(f"{out}.mp3", mix.reshape(-1), sr, channels=mix.shape[1])
    print(f"vocal gain {20 * np.log10(gain):.1f} dB -> {out}.mp3")


if __name__ == "__main__":
    main()
