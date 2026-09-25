"""Basic Pitch notes on the vocal stem, quantised to the drum grid; bass roots and chord chroma per half bar.

Usage: python music/reference/notes_chords.py <demucs_stem_dir> <offset_s> <bar1_beat_index>
Run rhythm.py first (it writes beats.npy). bar1_beat_index is the beat number of the section's
first downbeat in that grid.
"""
import sys

import librosa
import numpy as np
from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.inference import predict

d, OFF, bar1 = sys.argv[1], float(sys.argv[2]), int(sys.argv[3])  # bar1 = beat index of chorus bar 1
beats = np.load(f"{d}/beats.npy")
bp = float(np.median(np.diff(beats)))
beats = np.concatenate([beats, beats[-1] + bp * np.arange(1, 9)])


def where(x):
    i = np.searchsorted(beats, x) - 1
    frac = (x - beats[i]) / (beats[i + 1] - beats[i])
    q = int(round(frac * 4))
    i, q = (i + 1, 0) if q == 4 else (i, q)
    rel = i - bar1
    return rel // 4 + 1, rel % 4 + 1, q, rel * 4 + q  # bar, beat, sixteenth, abs sixteenth


_, _, notes = predict(f"{d}/vocals.wav", ICASSP_2022_MODEL_PATH, onset_threshold=0.5, frame_threshold=0.3,
                      minimum_note_length=60, minimum_frequency=120, maximum_frequency=900)
notes = sorted(notes, key=lambda n: n[0])
print("VOCAL NOTES  bar.beat.16th  len(16ths)  pitch  amp")
for s, e, p, a, _ in notes:
    s += OFF
    e += OFF
    if a < 0.25:
        continue
    bar, beat, six, ab = where(s)
    _, _, _, abe = where(e)
    print(f"{s:6.2f}  {bar:2d}.{beat}.{six + 1}  {max(abe - ab, 1):3d}  {librosa.midi_to_note(p):>4}  {a:.2f}")

# Chords: bass root per half bar, and top chroma of bass+other.
sr = 22050
bass, _ = librosa.load(f"{d}/bass.wav", sr=sr)
other, _ = librosa.load(f"{d}/other.wav", sr=sr)
hop = 512
bf0, _, _ = librosa.pyin(bass, fmin=30, fmax=300, sr=sr, frame_length=4096, hop_length=hop)
bt = librosa.times_like(bf0, sr=sr, hop_length=hop) + OFF
ch = librosa.feature.chroma_cqt(y=other + bass, sr=sr, hop_length=hop)
names = "C C# D D# E F F# G G# A A# B".split()
print("\nHARMONY per half bar: bass root | strongest pitch classes")
for k in range(-4, 30):
    i0 = bar1 + k * 2
    if i0 < 0 or i0 + 2 >= len(beats):
        continue
    t0, t1 = beats[i0], beats[i0 + 2]
    sel = (bt >= t0) & (bt < t1)
    root = librosa.midi_to_note(np.round(np.nanmedian(librosa.hz_to_midi(bf0[sel])))) if np.any(~np.isnan(bf0[sel])) else "-"
    csel = sel[: ch.shape[1]]
    prof = ch[:, csel].mean(axis=1) if csel.any() else np.zeros(12)
    top = [names[j] for j in np.argsort(prof)[::-1][:4]]
    print(f"bar {k // 2 + 1:2d}{'ab'[k % 2]}  {t0:6.2f}  bass {root:>4} | {' '.join(top)}")
