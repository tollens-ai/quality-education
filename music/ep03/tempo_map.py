"""How the take's tempo moves: the beat tracker's interval, smoothed, along the song.

    python music/ep03/tempo_map.py <take.wav> [drums.wav]

A generated take has no click track, so the bar is never exactly the same length twice. This prints
the local tempo every four beats (from the tracker run on the whole mix) so drifts and lurches can
be seen, and the phase check: whether the tracker's beats sit on loud onsets or between them.
"""
import sys

import librosa
import numpy as np


def main(path, drums=None):
    y, sr = librosa.load(path, sr=22050, mono=True)
    hop = 256
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop, aggregate=np.median)
    tempo, beats = librosa.beat.beat_track(onset_envelope=env, sr=sr, hop_length=hop, start_bpm=140, tightness=400, trim=False)
    bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
    d = np.diff(bt)
    print(f"{len(bt)} beats; median interval {np.median(d):.4f}s = {60 / np.median(d):.1f} bpm; "
          f"5th-95th pct {np.percentile(d, 5):.3f}-{np.percentile(d, 95):.3f}s")
    print("\nlocal tempo (bpm) every 8 beats:")
    for i in range(0, len(d) - 8, 8):
        seg = d[i:i + 8]
        print(f"  beat {i:3d}  t {bt[i]:7.2f}s  {60 / np.median(seg):6.1f} bpm  (min {60 / seg.max():5.1f}, max {60 / seg.min():5.1f})")
    # Beat phase: how much onset strength sits on the tracker's beats, on the halfway points between
    # them, and elsewhere.
    ot = librosa.frames_to_time(np.arange(len(env)), sr=sr, hop_length=hop)
    on = np.interp(bt, ot, env)
    half = np.interp((bt[:-1] + bt[1:]) / 2, ot, env)
    print(f"\nonset strength on beats {on.mean():.2f}, halfway between {half.mean():.2f} (ratio {on.mean() / half.mean():.2f})")
    if drums:
        yd, _ = librosa.load(drums, sr=22050, mono=True)
        envd = librosa.onset.onset_strength(y=yd, sr=sr, hop_length=hop)
        od = np.interp(bt, ot[:len(envd)], envd)
        hd = np.interp((bt[:-1] + bt[1:]) / 2, ot[:len(envd)], envd)
        print(f"drum onsets on beats {od.mean():.2f}, halfway {hd.mean():.2f}")
    # Odd and even beats: which parity is the oom (stronger)?
    print(f"even-numbered beats {on[0::2].mean():.2f}, odd-numbered {on[1::2].mean():.2f}")


if __name__ == "__main__":
    main(*sys.argv[1:])
