"""Look at a stretch of the take: spectrogram, loudness, the beat grid and each word's onset.

    python music/ep03/view.py <stem.wav> <lyrics.json> <t0> <t1> <out.png> [beats.json]

The model can't listen, but it can see where a syllable starts: a consonant burst or a vowel's
harmonics switching on. Word onsets are drawn as coloured ticks with the word above them, the
beat grid as thin grey lines (beats, with the bar's downbeats heavier), and the loudness curve
under the picture, so an onset that isn't on the start of a sound stands out.
Needs numpy, scipy and pillow.
"""
import json
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.io import wavfile
from scipy.signal import spectrogram


def main(stem, lyr_path, t0, t1, out, beats_path=None):
    t0, t1 = float(t0), float(t1)
    sr, x = wavfile.read(stem)
    x = x.astype(np.float32)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if x.dtype != np.float32 or np.abs(x).max() > 2:
        x = x / 32768.0
    a, b = int(max(0, t0 - 0.1) * sr), int(min(len(x) / sr, t1 + 0.1) * sr)
    seg = x[a:b]
    nper = 1024
    f, t, S = spectrogram(seg, fs=sr, nperseg=nper, noverlap=nper - 128, window="hann")
    keep = (f >= 60) & (f <= 7000)
    f, S = f[keep], S[keep]
    # Log-frequency rows.
    rows = 220
    edges = np.geomspace(60, 7000, rows + 1)
    img = np.zeros((rows, S.shape[1]), np.float32)
    for i in range(rows):
        m = (f >= edges[i]) & (f < edges[i + 1])
        if m.any():
            img[i] = S[m].mean(axis=0)
    img = 10 * np.log10(img + 1e-12)
    img = np.clip((img - (img.max() - 70)) / 70, 0, 1)[::-1]
    px_per_s = 260
    W = int((t1 - t0) * px_per_s)
    H_spec, H_env = rows * 2, 90
    im = Image.new("RGB", (W + 60, H_spec + H_env + 60), (250, 248, 240))
    tt = t + max(0, t0 - 0.1)
    xs = ((tt - t0) * px_per_s).astype(int) + 30
    g = (255 * (1 - img)).astype(np.uint8)
    spec = Image.fromarray(g, "L").resize((int((t[-1] - t[0]) * px_per_s) + 1, H_spec), Image.BILINEAR)
    im.paste(spec.convert("RGB"), (int(xs[0]), 40))
    d = ImageDraw.Draw(im)
    font = ImageFont.load_default()
    # Loudness under it.
    hop = int(sr * 0.005)
    rms = np.array([np.sqrt(np.mean(seg[i:i + hop * 2] ** 2)) for i in range(0, len(seg) - hop * 2, hop)])
    rt = t0 - 0.1 + np.arange(len(rms)) * 0.005
    env = 20 * np.log10(rms + 1e-6)
    env = np.clip((env + 60) / 50, 0, 1)
    pts = [((r - t0) * px_per_s + 30, 40 + H_spec + H_env - e * H_env) for r, e in zip(rt, env)]
    d.line(pts, fill=(200, 60, 40), width=1)
    d.rectangle([30, 40, 30 + W, 40 + H_spec + H_env], outline=(120, 120, 120))
    if beats_path:
        bj = json.load(open(beats_path))
        for bt in bj["beats"]:
            if t0 <= bt["t"] <= t1:
                xx = (bt["t"] - t0) * px_per_s + 30
                d.line([xx, 40, xx, 40 + H_spec + H_env], fill=(120, 120, 220) if bt.get("down") else (190, 190, 220), width=2 if bt.get("down") else 1)
    words = [w for l in json.load(open(lyr_path)) for w in l["words"]]
    for i, w in enumerate(words):
        if t0 <= w["s"] <= t1:
            xx = (w["s"] - t0) * px_per_s + 30
            col = (20, 120, 30) if not w.get("flag") else (200, 120, 0)
            d.line([xx, 40, xx, 40 + H_spec + H_env], fill=col, width=2)
            d.text((xx + 2, 8 + 12 * (i % 3)), w["w"], fill=col, font=font)
    for s in np.arange(np.ceil(t0), t1, 1.0):
        xx = (s - t0) * px_per_s + 30
        d.text((xx, H_spec + H_env + 44), f"{s:.0f}s", fill=(0, 0, 0), font=font)
    im.save(out)
    print(out, im.size)


if __name__ == "__main__":
    main(*sys.argv[1:])
