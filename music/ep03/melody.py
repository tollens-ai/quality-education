"""What the orchestra plays over a stretch: the top line, its register, and where it stabs.

    python music/ep03/melody.py <other.wav> <beats.json> <t0> <t1>

Runs a pitch tracker on the stem that holds the piano and the orchestra and prints, bar by bar, the
notes of the top line (the loudest pitch above middle C), the stem's spectral centroid (a bright top
line is high, a warm one low), and how many onsets it plays: enough to tell a tune from an
accompaniment, and a run from a chord, without hearing either.
"""
import json
import sys

import librosa
import numpy as np

SR = 22050


def main(path, beats_path, t0, t1):
    t0, t1 = float(t0), float(t1)
    B = json.load(open(beats_path))
    downs = [b for b in B["beats"] if b["down"]]
    y, _ = librosa.load(path, sr=SR, mono=True, offset=max(0, t0 - 0.5), duration=t1 - t0 + 1.0)
    off = max(0, t0 - 0.5)
    hop = 256
    C = np.abs(librosa.cqt(y, sr=SR, hop_length=hop, fmin=librosa.note_to_hz("C3"), n_bins=48, bins_per_octave=12))
    ts = off + librosa.frames_to_time(np.arange(C.shape[1]), sr=SR, hop_length=hop)
    cen = librosa.feature.spectral_centroid(y=y, sr=SR, hop_length=hop)[0]
    env = librosa.onset.onset_strength(y=y, sr=SR, hop_length=hop)
    names = librosa.midi_to_note(np.arange(48, 96))
    for d in downs:
        a, b = d["t"], d["t"] + B["bar_seconds"]
        if b < t0 or a > t1:
            continue
        m = (ts >= a) & (ts < b)
        if not m.any():
            continue
        # The top line: the strongest bin above C4 in each eighth of the bar.
        notes = []
        for k in range(8):
            mk = (ts >= a + k * (b - a) / 8) & (ts < a + (k + 1) * (b - a) / 8)
            if not mk.any():
                continue
            prof = C[:, mk].mean(axis=1)
            hi = prof[12:]
            j = int(np.argmax(hi)) + 12
            notes.append(names[j] if hi.max() > 0.02 else "-")
        on = env[m]
        print(f"bar {d['bar']:3d} {a:7.2f}s  centroid {cen[m].mean():5.0f} Hz  onset energy {on.mean():5.2f}  top line " + " ".join(f"{n:>3s}" for n in notes))


if __name__ == "__main__":
    main(*sys.argv[1:])
