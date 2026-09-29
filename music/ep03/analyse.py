"""Measure episode 3's take for the video: a beat and bar grid, loudness by stem, and the events.

    python music/ep03/analyse.py <take.wav> <stems dir> <out dir> [first downbeat seconds]

Writes beats.json (the 2/4 grid: every beat, every bar, sections are added by sections.py) and
audio.json (loudness curves for the mix and each stem at 20 Hz, the percussion's hits with their
weight and register, the loud chord stabs in the orchestra, rolls, stops and swells, and the bass
notes). The take has no click track, so the beat times are the tracker's, then smoothed along the
song (the tempo is steady, so the jitter in single beats is measurement noise), and each beat is
checked against the strongest nearby onset.
"""
import json
import sys

import librosa
import numpy as np
from scipy.signal import find_peaks, medfilt

SR = 22050
HOP = 128  # 5.8 ms


def load(p):
    y, _ = librosa.load(p, sr=SR, mono=True)
    return y


def db_curve(y, fps=20):
    h = SR // fps
    n = len(y) // h
    rms = np.sqrt(np.array([np.mean(y[i * h:(i + 1) * h] ** 2) for i in range(n)]) + 1e-12)
    return 20 * np.log10(rms + 1e-9)


def beat_grid(y_mix, y_low):
    """Tracker beats, refined to the strongest low-band onset within 40 ms, then smoothed."""
    env = librosa.onset.onset_strength(y=y_mix, sr=SR, hop_length=256, aggregate=np.median)
    _, beats = librosa.beat.beat_track(onset_envelope=env, sr=SR, hop_length=256, start_bpm=140, tightness=400, trim=False)
    bt = librosa.frames_to_time(beats, sr=SR, hop_length=256)
    envs = librosa.onset.onset_strength(y=y_mix, sr=SR, hop_length=HOP)
    ts = librosa.frames_to_time(np.arange(len(envs)), sr=SR, hop_length=HOP)
    ref = []
    for b in bt:
        m = (ts >= b - 0.04) & (ts <= b + 0.04)
        ref.append(ts[m][np.argmax(envs[m])] if m.any() else b)
    ref = np.array(ref)
    # Robust local linear smoothing along the beat index.
    n = np.arange(len(ref))
    out = np.zeros_like(ref)
    for i in range(len(ref)):
        lo, hi = max(0, i - 8), min(len(ref), i + 9)
        x, yv = n[lo:hi], ref[lo:hi]
        A = np.polyfit(x, yv, 1)
        res = yv - np.polyval(A, x)
        keep = np.abs(res) < max(0.03, 2 * np.median(np.abs(res)))
        if keep.sum() >= 4:
            A = np.polyfit(x[keep], yv[keep], 1)
        out[i] = np.polyval(A, i)
    return out


def hits(y, name, delta=0.05, min_gap=0.06):
    """Onsets on a stem with weight (0-1) and a register: low (< 300 Hz), mid, or high (> 3 kHz)."""
    env = librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP)
    ts = librosa.frames_to_time(np.arange(len(env)), sr=SR, hop_length=HOP)
    pk, _ = find_peaks(env, height=max(env.max() * 0.12, 1e-3), distance=int(min_gap * SR / HOP), prominence=env.max() * 0.06)
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
    fr = librosa.fft_frequencies(sr=SR, n_fft=2048)
    out = []
    for p in pk:
        seg = S[:, p:p + 4].mean(axis=1)
        tot = seg.sum() + 1e-9
        cen = float((fr * seg).sum() / tot)
        low = float(seg[fr < 300].sum() / tot)
        high = float(seg[fr > 3000].sum() / tot)
        reg = "low" if low > 0.5 else "high" if high > 0.45 else "mid"
        out.append({"t": round(float(ts[p]), 3), "w": round(float(env[p] / env.max()), 3), "centroid": round(cen), "reg": reg})
    return out


def rolls(evs, window=0.7, n=6, gap=0.13):
    out, i = [], 0
    while i < len(evs):
        j = i
        while j + 1 < len(evs) and evs[j + 1]["t"] - evs[j]["t"] <= gap:
            j += 1
        if j - i + 1 >= n:
            out.append({"a": evs[i]["t"], "b": evs[j]["t"], "n": j - i + 1})
        i = j + 1
    return out


def bass_notes(y):
    f0, voiced, prob = librosa.pyin(y, fmin=40, fmax=400, sr=SR, hop_length=512, frame_length=2048)
    ts = librosa.frames_to_time(np.arange(len(f0)), sr=SR, hop_length=512)
    notes, cur = [], None
    for t, f, v in zip(ts, f0, voiced):
        m = int(round(librosa.hz_to_midi(f))) if v and np.isfinite(f) else None
        if m is None:
            if cur:
                cur["b"] = round(float(t), 3)
                notes.append(cur)
                cur = None
        elif cur and cur["midi"] == m:
            continue
        else:
            if cur:
                cur["b"] = round(float(t), 3)
                notes.append(cur)
            cur = {"a": round(float(t), 3), "midi": m}
    return [n for n in notes if n.get("b") and n["b"] - n["a"] > 0.06]


def main(take, stems, out, first_down=None):
    y = load(take)
    dur = len(y) / SR
    st = {k: load(f"{stems}/{k}.wav") for k in ("vocals", "drums", "bass", "other")}
    low = st["bass"] + st["drums"]
    beats = beat_grid(y, low)
    bt = np.array(beats)
    d = np.diff(bt)
    beat_s = float(np.median(d))
    # Which parity is the downbeat? The one with more low-band onset energy (the oom).
    envl = librosa.onset.onset_strength(y=low + st["other"], sr=SR, hop_length=HOP)
    tl = librosa.frames_to_time(np.arange(len(envl)), sr=SR, hop_length=HOP)
    at = np.interp(bt, tl, envl)
    par = 0 if at[0::2].mean() >= at[1::2].mean() else 1
    if first_down is not None:
        fd = float(first_down)
        par = int(np.argmin(np.abs(bt - fd)) % 2)
    beat_rows, bar_rows, bar = [], [], 0
    for i, t in enumerate(bt):
        down = (i % 2) == par
        if down:
            bar += 1
        beat_rows.append({"t": round(float(t), 3), "bar": max(bar, 0), "beat": 1 if down else 2, "down": bool(down)})
    downs = [r for r in beat_rows if r["down"]]
    env_db = db_curve(y, 20)
    for k, r in enumerate(downs):
        a = r["t"]
        b = downs[k + 1]["t"] if k + 1 < len(downs) else dur
        i0, i1 = int(a * 20), max(int(b * 20), int(a * 20) + 1)
        bar_rows.append({"bar": r["bar"], "t": r["t"], "db": round(float(env_db[i0:i1].mean()), 1)})
    curves = {"mix": env_db, **{k: db_curve(v, 20) for k, v in st.items()}}
    ev = {}
    ev["drums"] = hits(st["drums"], "drums")
    ev["other"] = hits(st["other"], "other", min_gap=0.08)
    ev["bass"] = hits(st["bass"], "bass", min_gap=0.15)
    ev["vocals"] = hits(st["vocals"], "vocals", min_gap=0.08)
    strong = lambda L, w: [e for e in L if e["w"] >= w]
    audio = {"fps": 20, "duration": round(dur, 3),
             "db": {k: [round(float(x), 1) for x in v] for k, v in curves.items()},
             "hits": {k: strong(v, 0.25) for k, v in ev.items()},
             "rolls": rolls([e for e in ev["drums"] if e["w"] > 0.1]),
             "bass_notes": bass_notes(st["bass"])}
    json.dump(audio, open(f"{out}/audio.json", "w"))
    json.dump({"take": "take", "duration": round(dur, 3), "meter": "2/4", "bpm": round(60 / beat_s, 2),
               "beat_seconds": round(beat_s, 4), "bar_seconds": round(2 * beat_s, 4),
               "downbeat_parity": par, "beats": beat_rows, "bars": bar_rows},
              open(f"{out}/beats.json", "w"))
    print(f"{dur:.1f}s, {60 / beat_s:.2f} bpm, {len(beat_rows)} beats, {len(bar_rows)} bars; downbeats on {'even' if par == 0 else 'odd'} tracker beats "
          f"(low-band onset strength {at[0::2].mean():.2f} vs {at[1::2].mean():.2f})")
    print("drum hits", len(ev["drums"]), "strong", len(audio["hits"]["drums"]), "rolls", len(audio["rolls"]),
          "other hits", len(ev["other"]), "bass notes", len(audio["bass_notes"]))


if __name__ == "__main__":
    main(*sys.argv[1:])
