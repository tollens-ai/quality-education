"""Probe what is playing where in the piano take, at half-second resolution, from the stems.

    python music/ep04/piano/probe.py <take.wav> <stems dir> <lead.flac> <backing.flac> [t0 t1 step]

Per step: RMS dBFS of the mix, each htdemucs stem, and the karaoke lead and backing split of the
vocal stem; the drum stem's spectral centroid and its low (<150 Hz) and high (>5 kHz) share, to tell
kick-like, brush/hat-like, and leaked-consonant energy apart; and the correlation of the drum
stem's onset envelope with the vocal stem's and the piano stem's in that step (a drum stem made
of leaked consonants follows the voice).
"""
import sys

import librosa
import numpy as np

SR = 22050


def main(take, stems, lead, back, t0="0", t1="183", step="0.5"):
    t0, t1, step = float(t0), float(t1), float(step)
    y, _ = librosa.load(take, sr=SR, mono=True)
    st = {k: librosa.load(f"{stems}/{k}.wav", sr=SR, mono=True)[0] for k in ("vocals", "drums", "bass", "other")}
    st["lead"] = librosa.load(lead, sr=SR, mono=True)[0]
    st["back"] = librosa.load(back, sr=SR, mono=True)[0]
    hop = 256
    env = {k: librosa.onset.onset_strength(y=st[k], sr=SR, hop_length=hop) for k in ("drums", "vocals", "other")}
    S = np.abs(librosa.stft(st["drums"], n_fft=2048, hop_length=hop))
    fr = librosa.fft_frequencies(sr=SR, n_fft=2048)
    print("   t    mix   voc  lead  back  drum  bass piano | drum: cent  low  high  r(voc) r(pno)")
    t = t0
    while t < t1:
        a, b = int(t * SR), int((t + step) * SR)
        db = lambda x: 20 * np.log10(np.sqrt(np.mean(x[a:b] ** 2)) + 1e-9)
        fa, fb = a // hop, b // hop
        seg = S[:, fa:fb].sum(axis=1) + 1e-9
        cen = (fr * seg).sum() / seg.sum()
        low = seg[fr < 150].sum() / seg.sum()
        high = seg[fr > 5000].sum() / seg.sum()
        c = lambda u, v: float(np.corrcoef(u[fa:fb], v[fa:fb])[0, 1]) if np.std(u[fa:fb]) > 0 and np.std(v[fa:fb]) > 0 else 0.0
        print(f"{t:6.1f} {db(y):5.1f} {db(st['vocals']):5.1f} {db(st['lead']):5.1f} {db(st['back']):5.1f} {db(st['drums']):5.1f} "
              f"{db(st['bass']):5.1f} {db(st['other']):5.1f} | {cen:6.0f} {low:4.2f} {high:4.2f} {c(env['drums'], env['vocals']):6.2f} {c(env['drums'], env['other']):6.2f}")
        t += step


if __name__ == "__main__":
    main(*sys.argv[1:])
