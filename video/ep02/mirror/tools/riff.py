"""The guitar riff, note by note, for the intro and the break, which the picture plays.

    python riff.py <other.wav> <audio.json> [t0 t1]...

Onsets come from constant-Q spectral flux on the guitars-and-keys stem (a rise in any semitone
bin counts), and each note's pitch is the semitone bin that rose most; its strength is the
flux there. Adds events.riff = [[t, midi, strength]] to audio.json for each time range given
(default: the intro, 2.2-13.8 s, and the break, 53.5-60.7 s).
"""
import json
import sys

import librosa
import numpy as np
import soundfile as sf

path, out = sys.argv[1], sys.argv[2]
ranges = [(float(a), float(b)) for a, b in zip(sys.argv[3::2], sys.argv[4::2])] or [(2.2, 13.8), (53.5, 60.7)]
SR = 22050
HOP = 128
x, r = sf.read(path, dtype="float32", always_2d=True)
x = librosa.resample(x.mean(axis=1), orig_sr=r, target_sr=SR)
fmin = librosa.note_to_hz("E2")
data = json.load(open(out))
riff = []
for t0, t1 in ranges:
    seg = x[int(t0 * SR):int(t1 * SR)]
    Cq = np.abs(librosa.cqt(seg, sr=SR, hop_length=HOP, fmin=fmin, n_bins=60, bins_per_octave=12))
    D = librosa.amplitude_to_db(Cq, ref=np.max)
    rise = np.maximum(0, np.diff(D, axis=1, prepend=D[:, :1]))
    flux = rise[12:].sum(axis=0)  # above E3: the lead, not the chug
    flux = flux / (np.quantile(flux, .99) + 1e-9)
    on = librosa.onset.onset_detect(onset_envelope=flux, sr=SR, hop_length=HOP, units="frames",
                                    delta=.07, wait=int(.07 * SR / HOP), pre_max=3, post_max=3)
    for f in on:
        a, b = f, min(D.shape[1], f + 4)
        rs = rise[:, a:b].sum(axis=1)
        k = int(np.argmax(rs[12:]) + 12)
        t = t0 + f * HOP / SR
        riff.append([round(t, 3), int(librosa.hz_to_midi(fmin) + k), round(float(min(1.5, flux[f])), 2)])
riff.sort()
data["events"]["riff"] = riff
json.dump(data, open(out, "w"), separators=(",", ":"))
names = lambda m: librosa.midi_to_note(m)
for t0, t1 in ranges:
    sel = [n for n in riff if t0 <= n[0] < t1]
    print(f"{t0}-{t1}: {len(sel)} notes ({len(sel) / (t1 - t0):.1f}/s)")
    print("  " + " ".join(f"{n[0]:.2f}:{names(n[1])}" for n in sel[:60]))
