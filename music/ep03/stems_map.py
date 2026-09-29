"""Where the voice, drums, bass and everything else are loud, second by second.

    python music/ep03/stems_map.py <stems dir> [hop seconds]

Prints one row per hop with each stem's level in dB, so the sung stretches, the instrumentals
and the stops can be read off before the beat grid is built.
"""
import sys

import librosa
import numpy as np

STEMS = ["vocals", "drums", "bass", "other"]


def main(d, hop_s="1.0"):
    hop_s = float(hop_s)
    env = {}
    for s in STEMS:
        y, sr = librosa.load(f"{d}/{s}.wav", sr=22050, mono=True)
        h = 512
        rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=h)[0]
        env[s] = (librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=h), rms)
    dur = env["vocals"][0][-1]
    print("   t   " + "  ".join(f"{s:>7s}" for s in STEMS))
    t = 0.0
    while t < dur:
        row = []
        for s in STEMS:
            tt, r = env[s]
            m = (tt >= t) & (tt < t + hop_s)
            row.append(20 * np.log10(r[m].mean() + 1e-9) if m.any() else -99)
        bars = " ".join("#" * int(max(0, (x + 60) / 4)) if s == "vocals" else "" for x, s in zip(row, STEMS))
        print(f"{t:6.1f} " + "  ".join(f"{x:7.1f}" for x in row) + "  " + bars)
        t += hop_s


if __name__ == "__main__":
    main(*sys.argv[1:])
