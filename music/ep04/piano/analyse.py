"""Measure the episode 4 piano take for the renderer: beats, bars, sections, curves and stabs.

    python music/ep04/piano/analyse.py <take.wav> <stems dir> <lead.wav> <backing.wav> <lyrics.json> <out dir>

Adapted from music/ep03/analyse.py. Writes beats.json and audio.json into <out dir> and prints the
evidence behind the metre and bar phase.

Beats. librosa's tracker runs on the onset strength of the instruments (htdemucs drums + bass +
other), plus a little of the voice so it keeps its footing where the band stops. Each beat is moved
to the strongest onset within 40 ms, then smoothed with a robust local line over 17 beats (the
tempo drifts slowly; single-beat jitter is measurement noise). Each beat keeps its raw time.

Metre and bar phase. Per beat: bass and low-drum onset strength (the "oom"), piano onset strength
(the chord stabs), and harmonic change (chroma distance between the beat before and the beat
after, from the piano and bass stems). Averaged by beat index modulo 2 and 4, these show where
the accents and the chord changes fall; the sung lines' first stressed words are a second check.

Sections. From lyrics.json: each sung section runs from its first word to where the voice stops
after its last word (the word ends in lyrics.json already follow the voice's decay); gaps longer
than a second between sections are instrumental.

Curves (audio.json, 30 fps): dBFS RMS of the mix, the vocal stem, the karaoke lead and backing,
the piano ("other"), bass and drum stems; piano onset strength ("stab" curve, 0-1) and drum
onset strength; voice present (vocal stem above -40 dBFS). Events: the piano stabs (onset peaks
of the piano stem, with weight, register and position against the beat) and the band stops
(stretches where every instrument stem falls 18 dB below its level around it).
"""
import json
import sys

import librosa
import numpy as np
from scipy.signal import find_peaks

SR = 22050
HOP = 128
FPS = 30


def load(p):
    return librosa.load(p, sr=SR, mono=True)[0]


def rms_db(y, fps=FPS, win=None):
    h = SR // fps
    win = win or h
    n = len(y) // h
    out = np.empty(n)
    for i in range(n):
        c = i * h + h // 2
        seg = y[max(0, c - win // 2):c + win // 2]
        out[i] = np.sqrt(np.mean(seg ** 2) + 1e-12)
    return 20 * np.log10(out + 1e-9)


def stem_lag(y, s):
    """Lag of the stem sum against the mix, by cross-correlation over +-100 ms (positive: stems late)."""
    a, b = y[: SR * 60], s[: SR * 60]
    best, lag = -1e9, 0
    for L in range(-int(0.1 * SR), int(0.1 * SR) + 1, 1):
        v = np.dot(a[max(0, -L):len(a) - max(0, L)], b[max(0, L):len(b) - max(0, -L)])
        if v > best:
            best, lag = v, L
    return lag / SR


def smooth_beats(ref):
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


def main(take, stems, lead_p, back_p, lyr_p, out):
    y = load(take)
    dur = len(y) / SR
    st = {k: load(f"{stems}/{k}.wav") for k in ("vocals", "drums", "bass", "other")}
    st["lead"], st["backing"] = load(lead_p), load(back_p)
    lag = stem_lag(y, st["vocals"] + st["drums"] + st["bass"] + st["other"])
    print(f"duration {dur:.3f}s; stem lag against the mix {1000 * lag:+.1f} ms")

    inst = st["drums"] + st["bass"] + st["other"]
    env_i = librosa.onset.onset_strength(y=inst, sr=SR, hop_length=HOP)
    env_v = librosa.onset.onset_strength(y=st["vocals"], sr=SR, hop_length=HOP)
    env = env_i / env_i.max() + 0.25 * env_v / env_v.max()
    ts = librosa.frames_to_time(np.arange(len(env)), sr=SR, hop_length=HOP)
    tempo, beats = librosa.beat.beat_track(onset_envelope=env, sr=SR, hop_length=HOP, start_bpm=107, tightness=400, trim=False)
    bt = librosa.frames_to_time(beats, sr=SR, hop_length=HOP)
    raw = []
    for b in bt:
        m = (ts >= b - 0.04) & (ts <= b + 0.04)
        raw.append(ts[m][np.argmax(env[m])] if m.any() else b)
    raw = np.array(raw)
    sm = smooth_beats(raw)
    d = np.diff(sm)
    beat_s = float(np.median(d))
    print(f"tracker tempo {float(np.atleast_1d(tempo)[0]):.2f}; {len(sm)} beats; median beat {beat_s:.4f}s = {60 / beat_s:.2f} bpm; "
          f"beat length range {d.min():.3f}-{d.max():.3f}; raw-smoothed |diff| median {1000 * np.median(np.abs(raw - sm)):.1f} ms, "
          f"p90 {1000 * np.percentile(np.abs(raw - sm), 90):.1f} ms")
    # Local tempo by 16-beat window.
    loc = [(float(sm[i]), 60 / float(np.median(d[i:i + 16]))) for i in range(0, len(d) - 8, 16)]
    print("local bpm:", " ".join(f"{t:.0f}s:{b:.1f}" for t, b in loc))
    # Drift against a constant grid.
    k = np.arange(len(sm))
    A = np.polyfit(k, sm, 1)
    drift = sm - np.polyval(A, k)
    print(f"drift from one straight grid: {1000 * drift.min():+.0f} to {1000 * drift.max():+.0f} ms")

    # Per-beat features.
    low = st["bass"] + librosa.effects.preemphasis(st["drums"], coef=-0.97)  # de-emphasised drums: the low end
    env_low = librosa.onset.onset_strength(y=low, sr=SR, hop_length=HOP)
    env_bass = librosa.onset.onset_strength(y=st["bass"], sr=SR, hop_length=HOP)
    env_dr = librosa.onset.onset_strength(y=st["drums"], sr=SR, hop_length=HOP)
    env_p = librosa.onset.onset_strength(y=st["other"], sr=SR, hop_length=HOP)
    at = lambda e, t: float(np.max(e[(ts >= t - 0.03) & (ts <= t + 0.03)])) if ((ts >= t - 0.03) & (ts <= t + 0.03)).any() else 0.0
    f_low = np.array([at(env_low, t) for t in sm])
    f_bass = np.array([at(env_bass, t) for t in sm])
    f_dr = np.array([at(env_dr, t) for t in sm])
    f_p = np.array([at(env_p, t) for t in sm])
    half = (sm[:-1] + sm[1:]) / 2
    f_p_off = np.array([at(env_p, t) for t in half])
    f_dr_off = np.array([at(env_dr, t) for t in half])
    chroma = librosa.feature.chroma_cqt(y=st["other"] + st["bass"], sr=SR, hop_length=512)
    ct = librosa.frames_to_time(np.arange(chroma.shape[1]), sr=SR, hop_length=512)

    def chroma_between(a, b):
        m = (ct >= a) & (ct < b)
        v = chroma[:, m].mean(axis=1) if m.any() else np.zeros(12)
        return v / (np.linalg.norm(v) + 1e-9)
    f_ch = np.zeros(len(sm))
    for i in range(1, len(sm) - 1):
        f_ch[i] = 1 - float(np.dot(chroma_between(sm[i - 1], sm[i]), chroma_between(sm[i], sm[i + 1])))
    band = (inst ** 2)
    print("\nOn-beat vs half-beat (offbeat) onset strength, mean: piano "
          f"{f_p.mean():.2f} vs {f_p_off.mean():.2f}; drums {f_dr.mean():.2f} vs {f_dr_off.mean():.2f}")
    feats = {"low (bass+drum lows)": f_low, "bass": f_bass, "drums": f_dr, "piano": f_p, "harmonic change": f_ch}
    scores = {}
    for name, f in feats.items():
        m4 = [f[p::4].mean() for p in range(4)]
        print(f"  {name:22s} by beat mod 4: " + " ".join(f"{v:6.3f}" for v in m4))
        scores[name] = m4
    # Metre. Lines are four beats long, but the sections join with two extra beats before choruses
    # 1 and 3 (and not before chorus 2), so no single 4-beat bar phase fits the whole song, while a
    # 2-beat bar does. The downbeat parity is the one with the stronger low-end accents (the "oom")
    # and more harmonic change, checked section by section.
    z = lambda v: (np.array(v) - np.mean(v)) / (np.std(v) + 1e-9)
    m2 = {k: [float(v[p::2].mean()) for p in range(2)] for k, v in feats.items()}
    total = z(m2["harmonic change"]) + z(m2["low (bass+drum lows)"]) + z(m2["drums"])
    phase = int(np.argmax(total))
    for k, v in m2.items():
        print(f"  {k:22s} even/odd tracker beats: {v[0]:.3f} / {v[1]:.3f}")
    print(f"  2/4 downbeat parity -> {'even' if phase == 0 else 'odd'} tracker beats")

    L = json.load(open(lyr_p))

    def beat_pos(s):
        i = int(np.searchsorted(sm, s)) - 1
        if 0 <= i < len(sm) - 1:
            return float(i + (s - sm[i]) / (sm[i + 1] - sm[i]))
        return None
    order_ = list(dict.fromkeys(l["section"] for l in L))
    parity_by_section = {}
    print("  per section: low+drum accent on downbeats / upbeats; line first-word positions in 4-beat units from the section's first line")
    for sec in order_:
        ls = [l for l in L if l["section"] == sec and not l.get("back")]
        a0, b0 = ls[0]["start"], ls[-1]["end"]
        idx = [i for i, t in enumerate(sm) if a0 - 0.3 <= t <= b0]
        dn = [f_low[i] + f_dr[i] for i in idx if (i - phase) % 2 == 0]
        up = [f_low[i] + f_dr[i] for i in idx if (i - phase) % 2 == 1]
        ratio = float(np.mean(dn) / (np.mean(up) + 1e-9)) if dn and up else None
        parity_by_section[sec] = round(ratio, 2) if ratio else None
        p0 = beat_pos(ls[0]["words"][0]["s"])
        rel = [((beat_pos(l["words"][0]["s"]) - p0)) for l in ls]
        print(f"    {sec:10s} accent ratio {ratio if ratio is None else round(ratio, 2)}  starts: " + " ".join(f"{r:5.2f}" for r in rel))
    scores = {"per_beat_even_odd": {k: [round(v[0], 3), round(v[1], 3)] for k, v in m2.items()},
              "downbeat_over_upbeat_accent_by_section": parity_by_section}

    # Beat and bar rows (2/4: two beats a bar).
    beat_rows, bars = [], []
    bar = 0
    for i, t in enumerate(sm):
        bi = (i - phase) % 2
        if bi == 0:
            bar += 1
        beat_rows.append({"t": round(float(t), 3), "bar": bar, "beat": bi + 1, "down": bi == 0, "raw_t": round(float(raw[i]), 3)})
    # Beats before the first downbeat carry bar 0.
    mix_db = rms_db(y)
    for r in beat_rows:
        if r["down"]:
            bars.append({"bar": r["bar"], "t": r["t"]})
    for k_, b in enumerate(bars):
        a_ = b["t"]
        e_ = bars[k_ + 1]["t"] if k_ + 1 < len(bars) else dur
        i0_ = min(int(a_ * FPS), len(mix_db) - 1)
        seg_ = mix_db[i0_:max(int(e_ * FPS), i0_ + 1)]
        b["db"] = round(float(10 * np.log10(np.mean(10 ** (seg_ / 10)))), 1)

    # Curves.
    curves = {"mix": mix_db, "vocals": rms_db(st["vocals"]), "lead": rms_db(st["lead"]), "backing": rms_db(st["backing"]),
              "piano": rms_db(st["other"]), "bass": rms_db(st["bass"]), "drums": rms_db(st["drums"])}
    nfr = min(len(v) for v in curves.values())
    ft = np.arange(nfr) / FPS

    def per_frame(e):
        out_ = np.zeros(nfr)
        for i in range(nfr):
            m = (ts >= ft[i] - 0.5 / FPS) & (ts < ft[i] + 0.5 / FPS)
            out_[i] = e[m].max() if m.any() else 0
        return np.clip(out_ / (np.percentile(e, 99.5) + 1e-9), 0, 1)
    piano_on = per_frame(env_p)
    drum_on = per_frame(env_dr)
    inst_db = rms_db(inst, win=int(0.1 * SR))[:nfr]
    voice = (curves["vocals"][:nfr] > -40).astype(int)

    # Piano stabs.
    pk, prop = find_peaks(env_p, height=np.percentile(env_p, 99.5) * 0.3, distance=int(0.12 * SR / HOP),
                          prominence=np.percentile(env_p, 99.5) * 0.2)
    S = np.abs(librosa.stft(st["other"], n_fft=2048, hop_length=HOP))
    fr = librosa.fft_frequencies(sr=SR, n_fft=2048)
    top = np.percentile(env_p[pk], 99) if len(pk) else 1
    stabs = []
    for p in pk:
        t = float(ts[p])
        seg = S[:, p:p + 6].mean(axis=1)
        tot = seg.sum() + 1e-9
        lowf = float(seg[fr < 250].sum() / tot)
        highf = float(seg[fr > 1500].sum() / tot)
        reg = "low" if lowf > 0.45 else "high" if highf > 0.35 else "mid"
        i = int(np.searchsorted(sm, t)) - 1
        bp = None
        if 0 <= i < len(sm) - 1:
            fpos = i + (t - sm[i]) / (sm[i + 1] - sm[i])
            bp = round(float(fpos - phase) % 2 + 1, 2)
        stabs.append({"t": round(t - lag, 3), "w": round(min(1.0, float(env_p[p] / top)), 3), "reg": reg,
                      "beat_pos": bp, "drum": bool(at(env_dr, t) > np.percentile(env_dr, 90))})
    strong = [s for s in stabs if s["w"] >= 0.35]
    bp = np.array([s["beat_pos"] for s in strong if s["beat_pos"] is not None])
    onbeat = np.minimum(((bp - 1) % 1), 1 - ((bp - 1) % 1)) < 0.12
    offbeat = np.abs(((bp - 1) % 1) - 0.5) < 0.12
    print(f"\npiano onset peaks {len(stabs)}; strong (w >= 0.35) {len(strong)}: on a beat {int(onbeat.sum())}, "
          f"on the half-beat {int(offbeat.sum())}, elsewhere {int(len(bp) - onbeat.sum() - offbeat.sum())}")
    hb = np.histogram((bp - 1) % 2, bins=8, range=(0, 2))[0]
    print("  strong stabs by sixteenth of the 2/4 bar (1 e & a 2 e & a):", [int(h) for h in hb])

    # Band stops: every instrument stem well below its level around it.
    stops = []
    ref = np.array([np.median(inst_db[max(0, i - 60):i + 60]) for i in range(nfr)])
    quiet = inst_db < ref - 18
    i = 0
    while i < nfr:
        if quiet[i]:
            j = i
            while j + 1 < nfr and quiet[j + 1]:
                j += 1
            if (j - i + 1) / FPS >= 0.25:
                stops.append({"a": round(ft[i] - lag, 3), "b": round(ft[j] + 1 / FPS - lag, 3),
                              "inst_db": round(float(inst_db[i:j + 1].mean()), 1), "around_db": round(float(ref[i]), 1)})
            i = j + 1
        else:
            i += 1
    print("band stops:", ", ".join(f"{s['a']:.2f}-{s['b']:.2f}" for s in stops))

    # Sections from the lyrics.
    order = []
    for l in L:
        if not order or order[-1]["name"] != l["section"]:
            order.append({"name": l["section"], "lines": []})
        order[-1]["lines"].append(l)
    sung = [{"name": s["name"], "start": min(l["start"] for l in s["lines"]), "end": max(l["end"] for l in s["lines"]), "kind": "sung"} for s in order]
    secs, t = [], 0.0
    for k_, s in enumerate(sung):
        if s["start"] - t > 1.0:
            nm = "Instrumental intro" if k_ == 0 else f"Gap after {sung[k_ - 1]['name']}"
            secs.append({"name": nm, "start": round(t, 3), "end": round(s["start"], 3), "kind": "instrumental"})
        secs.append({**s, "start": round(s["start"], 3), "end": round(s["end"], 3)})
        t = s["end"]
    if dur - t > 0.3:
        secs.append({"name": "Instrumental tag", "start": round(t, 3), "end": round(dur, 3), "kind": "instrumental"})
    downs = [b for b in beat_rows if b["down"]]
    for s in secs:
        first = next((b for b in downs if b["t"] >= s["start"] - 0.3), downs[-1])
        last = [b for b in downs if b["t"] < s["end"] - 0.05]
        s["bars"] = [first["bar"], last[-1]["bar"] if last else first["bar"]]
        s["seconds"] = round(s["end"] - s["start"], 3)
        a_, b_ = int(s["start"] * FPS), max(int(s["end"] * FPS), int(s["start"] * FPS) + 1)
        s["db"] = {k: round(float(10 * np.log10(np.mean(10 ** (v[a_:b_] / 10)))), 1) for k, v in curves.items()}
        print(f"{s['name']:24s} {s['start']:7.2f}-{s['end']:7.2f} bars {s['bars']}  " + " ".join(f"{k} {v}" for k, v in s["db"].items()))

    beats_json = {
        "take": "Episode 4, piano take (.private/ep04-piano/take.m4a)", "duration": round(dur, 3),
        "meter": "2/4", "bpm": round(60 / beat_s, 2), "beat_seconds": round(beat_s, 4), "bar_seconds": round(2 * beat_s, 4),
        "beats": beat_rows, "bars": bars, "sections": secs,
        "measurement": {"tracker_bpm": round(float(np.atleast_1d(tempo)[0]), 2), "downbeat_parity": "even tracker beats" if phase == 0 else "odd tracker beats",
                        "bar_phase_scores": [round(float(v), 2) for v in total],
                        "accents": scores,
                        "local_bpm_16_beats": [[round(t_, 1), round(b_, 1)] for t_, b_ in loc],
                        "median_abs_raw_minus_smoothed_ms": round(1000 * float(np.median(np.abs(raw - sm))), 1),
                        "drift_from_straight_grid_ms": [round(1000 * float(drift.min())), round(1000 * float(drift.max()))],
                        "stem_lag_ms": round(1000 * lag, 1),
                        "note": "Beat times are on the mix's clock. Each beat's raw_t is the tracker's onset-refined time before smoothing."},
    }
    audio = {"fps": FPS, "duration": round(dur, 3), "frames": nfr,
             "db": {k: [round(float(x), 1) for x in v[:nfr]] for k, v in curves.items()},
             "piano_onset": [round(float(x), 3) for x in piano_on], "drum_onset": [round(float(x), 3) for x in drum_on],
             "voice": [int(v) for v in voice],
             "stabs": sorted(strong, key=lambda s: s["t"]), "stabs_all": stabs, "stops": stops,
             "measurement": {"curves": "RMS dBFS per frame (frame i covers i/30 s), htdemucs stems and the MDX karaoke lead/backing split of the vocal stem; stems include leakage",
                             "piano_onset": "spectral-flux onset strength of the piano ('other') stem, max per frame, 1 = its 99.5th percentile",
                             "stabs": "piano-stem onset peaks with w >= 0.35 (w 1 = the 99th percentile peak); beat_pos is the 1-based position in the 2/4 bar (1.5 = the "and" of beat 1); drum = a drum-stem onset coincides",
                             "voice": "vocal stem above -40 dBFS", "stops": "all instrument stems 18 dB or more below their level over the surrounding 4 s, for 0.25 s or more"}}
    def finite(o):
        if isinstance(o, float):
            assert np.isfinite(o), "non-finite value in output"
        elif isinstance(o, dict):
            [finite(v) for v in o.values()]
        elif isinstance(o, list):
            [finite(v) for v in o]
    finite(beats_json)
    finite(audio)
    json.dump(beats_json, open(f"{out}/beats.json", "w"), indent=None)
    json.dump(audio, open(f"{out}/audio.json", "w"))


if __name__ == "__main__":
    main(*sys.argv[1:])
