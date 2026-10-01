"""Look for the piano take's pulse before committing to a beat map.

    python music/ep04/piano/explore.py <take.wav> <stems dir>

Prints: per-stem levels over time (2 s blocks), the tempogram's strongest periods on the mix and
on the piano ("other") stem, beat_track results from several starting tempos, and a whole-song
comb fit (beat length and phase) with its drift per 20 s window.
"""
import sys

import librosa
import numpy as np

SR = 22050
HOP = 128


def main(take, stems):
    y, _ = librosa.load(take, sr=SR, mono=True)
    st = {k: librosa.load(f"{stems}/{k}.wav", sr=SR, mono=True)[0] for k in ("vocals", "drums", "bass", "other")}
    dur = len(y) / SR
    print(f"duration {dur:.2f}")
    # Levels per 2 s block.
    blk = 2 * SR
    print("block  mix  voc  drum bass other (dBFS RMS)")
    for i in range(int(dur // 2)):
        seg = lambda a: 20 * np.log10(np.sqrt(np.mean(a[i * blk:(i + 1) * blk] ** 2)) + 1e-9)
        print(f"{2 * i:5d} {seg(y):5.1f} {seg(st['vocals']):5.1f} {seg(st['drums']):5.1f} {seg(st['bass']):5.1f} {seg(st['other']):5.1f}")
    for name, sig in (("mix", y), ("other", st["other"]), ("inst", st["other"] + st["bass"] + st["drums"])):
        env = librosa.onset.onset_strength(y=sig, sr=SR, hop_length=HOP)
        ac = librosa.autocorrelate(env, max_size=int(3.0 * SR / HOP))
        lags = np.arange(len(ac)) * HOP / SR
        m = (lags > 0.2) & (lags < 2.5)
        order = np.argsort(ac[m])[::-1]
        picks = []
        for j in order:
            L = lags[m][j]
            if all(abs(L - p) > 0.03 for p in picks):
                picks.append(L)
            if len(picks) == 8:
                break
        print(f"{name}: autocorrelation peaks (s / bpm):", ", ".join(f"{p:.3f}/{60 / p:.1f}" for p in picks))
        for sb in (80, 100, 120, 140, 160, 200):
            tempo, beats = librosa.beat.beat_track(onset_envelope=env, sr=SR, hop_length=HOP, start_bpm=sb, trim=False)
            bt = librosa.frames_to_time(beats, sr=SR, hop_length=HOP)
            d = np.diff(bt)
            print(f"   start {sb}: tempo {float(np.atleast_1d(tempo)[0]):.1f}, {len(bt)} beats, median ibi {np.median(d):.4f}")
    env = librosa.onset.onset_strength(y=st["other"] + st["bass"] + st["drums"], sr=SR, hop_length=HOP)
    ot = librosa.frames_to_time(np.arange(len(env)), sr=SR, hop_length=HOP)
    best = (0, 0, 0)
    for T in np.arange(0.25, 0.80, 0.0005):
        for phi in np.arange(0, T, 0.005):
            ts = np.arange(phi, dur, T)
            s = np.interp(ts, ot, env).mean()
            if s > best[0]:
                best = (s, T, phi)
    s, T, phi = best
    print(f"comb best: beat {T:.4f}s = {60 / T:.2f} bpm, phase {phi:.3f}, strength {s:.2f} (mean {env.mean():.2f})")
    for mult in (0.5, 2 / 3, 1.5, 2.0):
        T2 = T * mult
        b2 = max(np.interp(np.arange(p, dur, T2), ot, env).mean() for p in np.arange(0, T2, 0.005))
        print(f"   x{mult:.2f} ({60 / T2:.1f} bpm): strength {b2:.2f}")
    for w0 in np.arange(0, dur - 10, 10):
        w1 = w0 + 20
        bs, bo = -1, 0
        for off in np.arange(-T / 2, T / 2, 0.004):
            ts = np.arange(phi + off, dur, T)
            ts = ts[(ts >= w0) & (ts < w1)]
            if len(ts) == 0:
                continue
            sc = np.interp(ts, ot, env).mean()
            if sc > bs:
                bs, bo = sc, off
        print(f"  {w0:5.0f}-{w1:5.0f}s offset {1000 * bo:6.0f} ms strength {bs:.2f}")


if __name__ == "__main__":
    main(*sys.argv[1:])
