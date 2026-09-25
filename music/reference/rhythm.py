"""Beat grid from the drum stem, then vocal onsets and pitches snapped to sixteenths.

Usage: python music/reference/rhythm.py <demucs_stem_dir> <offset_s>
Writes beats.npy, vocal_onsets.npy and f0.npy into the stem folder. start_bpm below is 180 for
episode 1; change it to the take's tempo.
"""
import sys

import librosa
import numpy as np

d = sys.argv[1]
OFF = float(sys.argv[2])
sr = 22050
drums, _ = librosa.load(f"{d}/drums.wav", sr=sr)
voc, _ = librosa.load(f"{d}/vocals.wav", sr=sr)
hop = 128

# Beats at ~180 bpm from the drum stem.
oenv = librosa.onset.onset_strength(y=drums, sr=sr, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, start_bpm=180, tightness=400, units="time")
beats = beats + OFF
bp = float(np.median(np.diff(beats)))
print(f"tempo {60 / bp:.1f} bpm, beat {bp:.4f}s, {len(beats)} beats")

# Downbeat phase: kick energy (low band) per beat, pick the phase mod 4 with most kick.
S = np.abs(librosa.stft(drums, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr)
low = S[freqs < 150].sum(axis=0)
lt = librosa.frames_to_time(np.arange(len(low)), sr=sr, hop_length=hop) + OFF
kick = np.array([low[(lt > b - 0.03) & (lt < b + 0.05)].max(initial=0) for b in beats])
snare_band = S[(freqs > 180) & (freqs < 2500)].sum(axis=0)
snare = np.array([snare_band[(lt > b - 0.03) & (lt < b + 0.05)].max(initial=0) for b in beats])
for ph in range(4):
    print(f"phase {ph}: kick {kick[ph::4].mean():.0f} snare {snare[ph::4].mean():.0f}")
print("per-beat kick/snare:", " ".join(f"{b:.2f}:{k / kick.max():.1f}/{s / snare.max():.1f}" for b, k, s in zip(beats, kick, snare)))
np.save(f"{d}/beats.npy", beats)

# Vocal onsets and pitch.
f0, vf, _ = librosa.pyin(voc, fmin=110, fmax=1000, sr=sr, frame_length=2048, hop_length=hop)
ft = librosa.times_like(f0, sr=sr, hop_length=hop) + OFF
on = librosa.onset.onset_detect(y=voc, sr=sr, hop_length=hop, units="time", backtrack=False, delta=0.05) + OFF
rms = librosa.feature.rms(y=voc, hop_length=hop)[0]
np.save(f"{d}/vocal_onsets.npy", on)
np.save(f"{d}/f0.npy", np.stack([ft, f0]))


def grid(x):
    i = np.searchsorted(beats, x) - 1
    i = min(max(i, 0), len(beats) - 2)
    frac = (x - beats[i]) / (beats[i + 1] - beats[i])
    return i, frac


print("\nvocal onsets: time  beat#+sixteenth  pitch-after  rms")
for x in on:
    i, frac = grid(x)
    q = round(frac * 4) / 4
    sel = (ft > x + 0.03) & (ft < x + 0.12)
    p = np.nanmedian(f0[sel]) if np.any(~np.isnan(f0[sel])) else np.nan
    r = rms[min(int((x - OFF) * sr / hop), len(rms) - 1)]
    note = librosa.hz_to_note(p) if not np.isnan(p) else "-"
    print(f"{x:6.2f}  beat{i:3d}+{q:.2f} (raw {frac:.2f})  {note:>4}  {r:.3f}")
