"""Measure the band render: sanity, loudness, silence, onsets, spectra, reference comparison.

Usage: python music/check/band_check.py [--ref DIR]
Reads music/out/ep01-band*.wav and ep01-band-events.json; writes PNGs to music/out/check/.
--ref is a Demucs stem folder (drums/bass/other/vocals.wav) of the reference take; it is
local-only and nothing derived from it is committed.
"""
import json
import sys
from pathlib import Path

import librosa
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import butter, resample_poly, sosfilt, welch

OUT = Path("music/out")
PNG = OUT / "check"
PNG.mkdir(parents=True, exist_ok=True)
REF = Path(sys.argv[sys.argv.index("--ref") + 1]) if "--ref" in sys.argv else None
STEMS = ["drums", "bass", "gtrL", "gtrR", "lead"]


def load(p):
    y, sr = sf.read(p, dtype="float64", always_2d=True)
    return y, sr


def lufs(y, sr):
    m = pyln.Meter(sr)
    try:
        return m.integrated_loudness(y)
    except ValueError:
        return float("-inf")


def lra(y, sr):
    """Loudness range (EBU Tech 3342): 3 s short-term windows, gated, p95 - p10."""
    m = pyln.Meter(sr, block_size=3.0)  # one 3 s block per window = short-term loudness
    vals = []
    for s in range(0, len(y) - 3 * sr, sr):
        try:
            vals.append(m.integrated_loudness(y[s : s + 3 * sr]))
        except ValueError:
            pass
    v = np.array([x for x in vals if x > -70])
    if len(v) == 0:
        return 0.0
    v = v[v > 10 * np.log10(np.mean(10 ** (v / 10))) - 20]
    return float(np.percentile(v, 95) - np.percentile(v, 10))


def true_peak_db(y):
    up = resample_poly(y, 4, 1, axis=0)
    return 20 * np.log10(np.max(np.abs(up)) + 1e-12)


def db(x):
    return 20 * np.log10(x + 1e-12)


ev = json.load(open(OUT / "ep01-band-events.json"))
files = {s: OUT / f"ep01-band-{s}.wav" for s in STEMS}
files["mix"] = OUT / "ep01-band.wav"
files["band+guide"] = OUT / "ep01-band+guide.wav"
audio = {k: load(p) for k, p in files.items()}
sr = audio["mix"][1]

print("== Sanity and loudness (whole song)")
print(f"{'file':<11}{'NaN':>5}{'DC':>10}{'peak dBFS':>11}{'TP dBTP':>9}{'>0dBFS':>8}{'LUFS':>8}{'LRA':>6}")
for k, (y, _) in audio.items():
    nan = int(np.isnan(y).sum())
    y = np.nan_to_num(y)
    act = y[:, 0] if k != "gtrR" else y[:, 1]
    print(f"{k:<11}{nan:>5}{np.mean(act):>10.1e}{db(np.max(np.abs(y))):>11.1f}{true_peak_db(y):>9.1f}"
          f"{int((np.abs(y) > 1).sum()):>8}{lufs(y, sr):>8.1f}{lra(y, sr):>6.1f}")

c0, c1 = [int(x * sr) for x in ev["chorus"]]
print(f"\n== First chorus ({ev['chorus'][0]:.1f}-{ev['chorus'][1]:.1f} s): stem loudness relative to the band")
band = sum(audio[s][0] for s in STEMS)[c0:c1]
Lband = lufs(band, sr)
ours = {
    "drums": lufs(audio["drums"][0][c0:c1], sr) - Lband,
    "bass": lufs(audio["bass"][0][c0:c1], sr) - Lband,
    "guitars": lufs((audio["gtrL"][0] + audio["gtrR"][0])[c0:c1], sr) - Lband,
}
ref = {}
if REF:
    rs = {k: load(REF / f"{k}.wav") for k in ["drums", "bass", "other", "vocals"]}
    rsr = rs["drums"][1]
    rband = rs["drums"][0] + rs["bass"][0] + rs["other"][0]
    Lr = lufs(rband, rsr)
    ref = {"drums": lufs(rs["drums"][0], rsr) - Lr, "bass": lufs(rs["bass"][0], rsr) - Lr,
           "guitars": lufs(rs["other"][0], rsr) - Lr, "vocals": lufs(rs["vocals"][0], rsr) - Lr}
for k, v in ours.items():
    r = ref.get(k)
    print(f"  {k:<8} ours {v:+5.1f} LU" + (f"   ref {r:+5.1f} LU   diff {v - r:+4.1f}" if r is not None else ""))
if ref:
    print(f"  (reference vocal sits {ref['vocals']:+.1f} LU against its band)")

print("\n== Silence: stops and cuts (mix, from 15 ms after each stop begins)")
y = audio["mix"][0]
for a, b in ev["silent"]:
    i0, i1 = int((a + 0.015) * sr), min(int((b - 0.010) * sr), len(y))
    print(f"  {a:6.2f}-{b:6.2f} s  max {db(np.max(np.abs(y[i0:i1]))):7.1f} dBFS")

print("\n== Drum onsets against the event list")
d = audio["drums"][0].mean(axis=1)
hop = 48  # 1 ms
env = librosa.onset.onset_strength(y=d, sr=sr, hop_length=hop, n_fft=1024, lag=1, max_size=1)
det = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=hop, units="time", backtrack=False,
                                 pre_max=20, post_max=20, pre_avg=50, post_avg=50, delta=0.05, wait=30)
# Only well-separated, clearly audible hits can be matched one-to-one.
hits = sorted([e for e in ev["drums"] if e["vel"] > 0.45 and e["inst"] in ("kick", "snare", "tom")],
              key=lambda e: e["time"])
times = np.array([e["time"] for e in ev["drums"]])
iso = [e for e in hits if np.sum(np.abs(times - e["time"]) < 0.06) == np.sum(np.abs(times - e["time"]) < 0.004)]
errs, grid_dev = [], []
for e in iso:
    j = np.argmin(np.abs(det - e["time"]))
    if abs(det[j] - e["time"]) < 0.02:
        errs.append(det[j] - e["time"])
        grid_dev.append(det[j] - e["grid"])
errs, grid_dev = np.array(errs) * 1000, np.array(grid_dev) * 1000
bias = np.median(errs)
print(f"  {len(iso)} isolated kick/snare/tom hits, {len(errs)} matched within 20 ms ({len(det)} onsets detected)")
print(f"  detected - intended: median {bias:+.2f} ms (detector bias), spread about the bias: "
      f"median {np.median(np.abs(errs - bias)):.2f} ms, 95th pct {np.percentile(np.abs(errs - bias), 95):.2f} ms")
# The generic detector fires on whichever of a snare and its simultaneous hi-hat comes first, so
# also time kick and snare alone: band-limit to each drum's body, where the hats don't reach,
# and take the first crossing of 20% of the way from the pre-hit level to the hit's peak.
from scipy.signal import sosfiltfilt  # noqa: E402

bands = {"kick": butter(4, 110, "lp", fs=sr, output="sos"), "snare": butter(4, [160, 420], "bp", fs=sr, output="sos")}
others = {"kick": ("snare", "tom", "kick"), "snare": ("kick", "tom", "snare")}
for inst, sos in bands.items():
    envl = np.abs(sosfiltfilt(sos, d))  # zero-phase: no filter delay
    k = max(1, int(0.0005 * sr))
    envl = np.convolve(envl, np.ones(k) / k, mode="same")
    errs_i = []
    for e in ev["drums"]:
        if e["inst"] != inst or e["vel"] < 0.45:
            continue
        near = [o for o in ev["drums"] if o is not e and o["inst"] in others[inst] and abs(o["time"] - e["time"]) < 0.08]
        if near:
            continue
        base = envl[int((e["time"] - 0.012) * sr) : int((e["time"] - 0.003) * sr)].min()
        a, b = int((e["time"] - 0.005) * sr), int((e["time"] + 0.04) * sr)
        seg = envl[a:b]
        if base > 0.5 * seg.max():
            continue  # still ringing from the last hit: no clean onset to time
        on = a + np.argmax(seg > base + 0.2 * (seg.max() - base))
        errs_i.append((on / sr - e["time"]) * 1000)
    errs_i = np.array(errs_i)
    b0 = np.median(errs_i)
    print(f"  {inst} alone ({len(errs_i)} hits): bias {b0:+.2f} ms, spread about it median "
          f"{np.median(np.abs(errs_i - b0)):.2f} ms, 95th pct {np.percentile(np.abs(errs_i - b0), 95):.2f} ms, "
          f"max {np.max(np.abs(errs_i - b0)):.2f} ms")
intended = np.array([e["time"] - e["grid"] for e in ev["drums"]]) * 1000
print(f"  intended humanisation (all hits): sd {np.std(intended):.2f} ms, max |{np.max(np.abs(intended)):.1f}| ms")
print(f"  detected - grid (after bias): sd {np.std(grid_dev - bias):.2f} ms")

print("\n== Loudness and loudness range by section (the arrangement's shape), LUFS")
print(f"  {'section':<17}{'mix':>7}{'LRA':>6}{'drums':>7}{'bass':>7}{'gtrs':>7}{'lead':>7}")
sec_L = {}
for s in ev["sections"]:
    a, b = int(s["time"] * sr), int(s["end"] * sr)
    seg = audio["mix"][0][a:b]
    sec_L[s["name"]] = lufs(seg, sr)
    stems_L = [lufs(audio[k][0][a:b], sr) for k in ["drums", "bass"]]
    stems_L.append(lufs((audio["gtrL"][0] + audio["gtrR"][0])[a:b], sr))
    stems_L.append(lufs(audio["lead"][0][a:b], sr))
    print(f"  {s['name']:<17}{sec_L[s['name']]:7.1f}{lra(seg, sr):6.1f}"
          + "".join(f"{v:7.1f}" if np.isfinite(v) and v > -70 else f"{'-':>7}" for v in stems_L))
if {"Chorus 1", "Verse 1", "Final chorus"} <= sec_L.keys():
    cv = sec_L["Chorus 1"] - sec_L["Verse 1"]
    fc = sec_L["Final chorus"] - sec_L["Chorus 1"]
    print(f"  chorus 1 - verse 1 {cv:+.1f} LU (want >= +2); final chorus - chorus 1 {fc:+.1f} LU (want >= 0)")
bar_s = ev["barSeconds"]
for s in ev["sections"]:
    if s["name"].startswith(("Pre-chorus", "Final pre")):
        t, row = s["time"], []
        while t < s["end"] - 0.1:
            row.append(lufs(audio["mix"][0][max(0, int((t - 0.5) * sr)) : int(min(t + bar_s, s["end"]) * sr)], sr))
            t += bar_s
        rising = all(b >= a - 1.0 for a, b in zip(row[:-2], row[1:-1]))  # the last bar is the stop; 1 LU of slack for a flat vamp
        print(f"  {s['name']} per bar: " + " ".join(f"{v:.1f}" for v in row) + ("  (builds)" if rising else "  <-- not building"))

print("\n== Peaks and density")
yb = audio["band+guide"][0]
st = []
for s0 in range(0, len(yb) - 3 * sr, sr // 10):
    st.append(lufs(yb[s0 : s0 + 3 * sr], sr))
tp = true_peak_db(yb)
print(f"  band+guide: PSR (true peak - loudest 3 s) {tp - max(st):.1f} dB (want >= 8), "
      f"PLR (true peak - integrated) {tp - lufs(yb, sr):.1f} dB")
for k in STEMS + ["mix"]:
    y = audio[k][0]
    rms = np.sqrt(np.mean(y[np.abs(y).max(axis=1) > 1e-5] ** 2))
    print(f"  crest factor {k:<6} {db(np.max(np.abs(y))) - db(rms):5.1f} dB")

OCT = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]


def octave(y, fc):
    lo, hi = fc / np.sqrt(2), min(fc * np.sqrt(2), 0.49 * sr)
    return sosfilt(butter(4, [lo, hi], "bp", fs=sr, output="sos"), y, axis=0)


print("\n== Stereo width and mono compatibility by octave, band mix, first chorus")
print("   (S/M below 150 Hz should be under -20 dB; mono loss over 3 dB means cancellation)")
ym = audio["mix"][0][c0:c1]
for fc in OCT:
    b = octave(ym, fc)
    L, R = b[:, 0], b[:, 1]
    M, S = (L + R) / 2, (L - R) / 2
    sm = 10 * np.log10(np.sum(S**2) / np.sum(M**2) + 1e-20)
    corr = np.sum(L * R) / np.sqrt(np.sum(L**2) * np.sum(R**2) + 1e-20)
    loss = 10 * np.log10((np.sum(L**2) + np.sum(R**2)) / 2 / np.sum(M**2))
    print(f"  {fc:>6} Hz  S/M {sm:6.1f} dB  correlation {corr:5.2f}  mono loss {loss:4.1f} dB")

print("\n== Double-tracked guitars: L/R correlation, first chorus (a delayed copy would be near 1)")
gl, gr = audio["gtrL"][0][c0:c1, 0], audio["gtrR"][0][c0:c1, 1]
lags = range(-int(0.03 * sr), int(0.03 * sr) + 1, 24)
seg = slice(int(0.03 * sr), len(gl) - int(0.03 * sr))
norm = np.sqrt(np.sum(gl[seg] ** 2) * np.sum(gr[seg] ** 2))
xc = [np.sum(gl[seg] * np.roll(gr, L)[seg]) / norm for L in lags]
print(f"  max normalised cross-correlation within ±30 ms: {max(xc):.2f}")

print("\n== Lead guitar pitch (pYIN, median over each note after its bend) against the score")
yl = audio["lead"][0].mean(axis=1)
for n in ev["lead"]:
    a, b = n["time"] + 0.12, n["end"] - 0.02
    seg = yl[int(a * sr) : int(b * sr)]
    f0, _, _ = librosa.pyin(seg, fmin=250, fmax=1000, sr=sr, frame_length=4096, hop_length=256)
    f0 = f0[~np.isnan(f0)]
    if len(f0) < 3:
        print(f"  {n['time']:6.2f} s  no pitch found")
        continue
    cents = 100 * (12 * np.log2(np.median(f0) / 440) + 69 - n["to"])
    print(f"  {n['time']:6.2f} s  midi {n['to']}  error {cents:+5.1f} cents" + ("  <-- over 30" if abs(cents) > 30 else ""))

# ---- Spectra --------------------------------------------------------------------------------------


def ltas(y, sr, smooth=1 / 6):
    f, p = welch(y.mean(axis=1) if y.ndim > 1 else y, fs=sr, nperseg=8192)
    out = np.zeros_like(p)
    for i, fc in enumerate(f):
        sel = (f >= fc * 2 ** (-smooth / 2)) & (f <= fc * 2 ** (smooth / 2))
        out[i] = p[sel].mean() if sel.any() else p[i]
    return f, 10 * np.log10(out + 1e-20)


fig, axes = plt.subplots(2, 2, figsize=(13, 8), sharex=True)
our_st = {"drums": audio["drums"][0][c0:c1], "bass": audio["bass"][0][c0:c1],
          "guitars": (audio["gtrL"][0] + audio["gtrR"][0])[c0:c1], "band": band}
match = (Lr - Lband) if REF else 0.0  # our band scaled to the reference band's loudness
for ax, k in zip(axes.flat, ["drums", "bass", "guitars", "band"]):
    f, p = ltas(our_st[k] * 10 ** (match / 20), sr)
    ax.semilogx(f[1:], p[1:], label="ours", color="#1f5fa8")
    if REF:
        rk = {"drums": rs["drums"][0], "bass": rs["bass"][0], "guitars": rs["other"][0], "band": rband}[k]
        f2, p2 = ltas(rk, rsr)
        ax.semilogx(f2[1:], p2[1:], label="reference (Demucs)", color="#c0602a", alpha=0.8)
    ax.axvspan(1000, 4000, color="0.9", zorder=0)
    ax.set_title(k)
    ax.set_xlim(25, 22000)
    ax.set_ylim(-130, -40)
    ax.grid(True, which="both", alpha=0.3)
    ax.legend(loc="lower left", fontsize=8)
axes[1, 0].set_xlabel("Hz (grey: the lead vocal's 1-4 kHz slot)")
axes[1, 1].set_xlabel("Hz")
fig.suptitle("Long-term spectrum, first chorus, at matched band loudness")
fig.tight_layout()
fig.savefig(PNG / "band-ltas.png", dpi=90)


def spectrogram(y, name, title, fmax=sr / 2, log=True, seconds=None):
    y = y.mean(axis=1) if y.ndim > 1 else y
    if seconds:
        y = y[int(seconds[0] * sr) : int(seconds[1] * sr)]
    S = librosa.amplitude_to_db(np.abs(librosa.stft(y, n_fft=4096, hop_length=1024)), ref=np.max)
    fig, ax = plt.subplots(figsize=(14, 5))
    librosa.display.specshow(S, sr=sr, hop_length=1024, x_axis="time", y_axis="log" if log else "linear",
                             ax=ax, vmin=-90, vmax=0, cmap="magma")
    ax.set_ylim(30 if log else 0, fmax)
    ax.set_title(title)
    fig.tight_layout()
    fig.savefig(PNG / name, dpi=80)


import librosa.display  # noqa: E402

spectrogram(audio["mix"][0], "band-spectrogram.png", "Band mix, whole song (log frequency)")
spectrogram(audio["gtrL"][0], "gtrL-linear.png", "Guitar L, first chorus (linear, aliasing check)",
            log=False, seconds=ev["chorus"])
if ev["lead"]:
    spectrogram(audio["lead"][0], "lead-linear.png", "Lead guitar, intro (linear, aliasing check: look for lines falling as the bends rise)",
                log=False, seconds=(ev["lead"][0]["time"] - 0.1, ev["lead"][-1]["end"] + 0.4))
spectrogram(audio["bass"][0], "bass-linear.png", "Bass, first chorus (linear)", log=False, fmax=8000,
            seconds=ev["chorus"])

if REF:
    print("\n== Band mix vs reference band, 1/3-octave bands, first chorus at matched loudness (flag > 3 dB)")
    flagged = []
    ours_b = band * 10 ** (match / 20)
    for k in range(-13, 11):  # 50 Hz to 10 kHz
        fc = 1000 * 2 ** (k / 3)
        lo, hi = fc * 2 ** (-1 / 6), fc * 2 ** (1 / 6)
        e1 = np.mean(sosfilt(butter(4, [lo, hi], "bp", fs=sr, output="sos"), ours_b.mean(axis=1)) ** 2)
        e2 = np.mean(sosfilt(butter(4, [lo, hi], "bp", fs=rsr, output="sos"), rband.mean(axis=1)) ** 2)
        d = 10 * np.log10(e1 / e2)
        flagged.append(f"{fc:.0f} Hz {d:+.1f}" + (" *" if abs(d) > 3 else ""))
    for i in range(0, len(flagged), 6):
        print("  " + " | ".join(flagged[i : i + 6]))

print("\n== Phone-speaker proxy (mono, high-passed at 300 Hz), first chorus")
sos = butter(4, 300, "hp", fs=sr, output="sos")
ph = {k: sosfilt(sos, v.mean(axis=1)) for k, v in our_st.items()}
Lp = lufs(ph["band"], sr)
for k in ["drums", "bass", "guitars"]:
    print(f"  {k:<8} {lufs(ph[k], sr) - Lp:+5.1f} LU against the band")
# Does the bass line still read? pYIN on the phone-filtered bass, pitch class per note.
yb = sosfilt(sos, audio["bass"][0].mean(axis=1))
ok = tot = 0
for n in ev["bass"]:
    if not (ev["chorus"][0] <= n["time"] < ev["chorus"][1]) or n["end"] - n["time"] < 0.12:
        continue
    seg = yb[int((n["time"] + 0.02) * sr) : int((n["end"] - 0.01) * sr)]
    f0, _, _ = librosa.pyin(seg, fmin=40, fmax=400, sr=sr, frame_length=4096, hop_length=512)
    f0 = f0[~np.isnan(f0)]
    if len(f0) == 0:
        continue
    tot += 1
    ok += round(12 * np.log2(np.median(f0) / 440) + 69) % 12 == n["midi"] % 12
print(f"  bass pitch class still tracked through the phone filter: {ok}/{tot} notes")
print(f"\nPNGs in {PNG}/")
