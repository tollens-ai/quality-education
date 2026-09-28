"""Measure episode 2's record for the picture, from its four Demucs stems.

    python analyse.py <stems dir> <out.json>

<stems dir> holds drums.wav, bass.wav, other.wav (the guitars and keys) and vocals.wav from
`demucs -n htdemucs`. Writes, at 60 frames a second, each stem's loudness and onset strength,
and three drum bands (kick, snare, cymbals); then lists of events: kick, snare and crash hits,
and every guitar note with its pitch where one can be heard (MIDI number, or null for a chord or
noise). The picture plays the events; the envelopes let things breathe with the mix.
"""
import json
import sys

import librosa
import numpy as np
import soundfile as sf

SR = 44100
FPS = 60
HOP = SR // FPS


def load(path):
    x, r = sf.read(path, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    return librosa.resample(x, orig_sr=r, target_sr=SR) if r != SR else x


def norm(e, q=0.98):
    return np.clip(e / (np.quantile(e, q) + 1e-9), 0, 1.5)


def rms(x):
    return librosa.feature.rms(y=x, frame_length=2048, hop_length=HOP)[0]


def band(x, lo, hi):
    S = np.abs(librosa.stft(x, n_fft=2048, hop_length=HOP))
    f = librosa.fft_frequencies(sr=SR, n_fft=2048)
    return S[(f >= lo) & (f < hi)]


def flux(S):
    d = np.diff(np.log1p(S * 50), axis=1, prepend=np.log1p(S[:, :1] * 50))
    return np.maximum(d, 0).mean(axis=0)


def events(env, delta, wait=0.07):
    on = librosa.onset.onset_detect(onset_envelope=env, sr=SR, hop_length=HOP, units="time",
                                    delta=delta, wait=int(wait * FPS), backtrack=False)
    return [round(float(t), 3) for t in on]


def main(stems, out):
    drums, bass, other, voc = (load(f"{stems}/{n}.wav") for n in ("drums", "bass", "other", "vocals"))
    n = min(map(len, (drums, bass, other, voc)))
    drums, bass, other, voc = drums[:n], bass[:n], other[:n], voc[:n]
    mix = drums + bass + other + voc

    kick_S, snare_S, cym_S = band(drums, 30, 150), band(drums, 180, 2500), band(drums, 7000, 16000)
    kick_f, snare_f, cym_f = norm(flux(kick_S), .995), norm(flux(snare_S), .995), norm(flux(cym_S), .995)
    # A snare hit has body and crack together; kicks leak into the snare band, so ask for crack.
    crack = norm(flux(band(drums, 2500, 6000)), .995)
    snare_env = np.minimum(snare_f, crack * 1.2)

    kicks = events(kick_f, 0.12)
    snares = events(snare_env, 0.12)
    # A crash is a loud cymbal onset that keeps ringing: its band stays loud 0.3 s later.
    cym_e = norm(np.sqrt((cym_S ** 2).mean(axis=0)))
    crashes = []
    for t in events(cym_f, 0.25, wait=0.25):
        i = int(t * FPS)
        if i + 18 < len(cym_e) and cym_e[i + 18] > 0.45 * cym_e[i:i + 4].max() and cym_e[i:i + 4].max() > 0.5:
            crashes.append(t)

    # Guitar notes: onsets on the guitars-and-keys stem, each with its pitch where one is clear.
    g_on = librosa.onset.onset_detect(y=other, sr=SR, hop_length=256, units="time", backtrack=True,
                                      delta=0.06, wait=2)
    f0, vflag, vprob = librosa.pyin(other, fmin=70, fmax=1600, sr=SR, hop_length=256, frame_length=2048)
    ft = librosa.frames_to_time(np.arange(len(f0)), sr=SR, hop_length=256)
    g_env = norm(rms(other))
    notes = []
    for a, b in zip(g_on, list(g_on[1:]) + [a + 0.3 for a in g_on[-1:]]):
        m = (ft >= a + 0.015) & (ft < min(b, a + 0.12))
        good = m & vflag & (vprob > 0.5)
        pitch = float(np.median(librosa.hz_to_midi(f0[good]))) if good.sum() >= 2 else None
        notes.append([round(float(a), 3), round(pitch, 1) if pitch else None,
                      round(float(g_env[min(len(g_env) - 1, int(a * FPS))]), 2)])

    env = {k: np.round(norm(rms(x)), 3).tolist() for k, x in
           (("mix", mix), ("vocal", voc), ("drums", drums), ("bass", bass), ("guitar", other))}
    data = {
        "fps": FPS,
        "env": env,
        "kick": np.round(kick_f, 3).tolist(),
        "snare": np.round(snare_env, 3).tolist(),
        "cymbal": np.round(cym_e, 3).tolist(),
        "events": {"kick": kicks, "snare": snares, "crash": crashes, "guitar": notes},
    }
    with open(out, "w") as fh:
        json.dump(data, fh, separators=(",", ":"))
    print(f"{len(kicks)} kicks, {len(snares)} snares, {len(crashes)} crashes, {len(notes)} guitar notes "
          f"({sum(1 for x in notes if x[1])} pitched) -> {out}")
    intro = [x for x in notes if x[0] < 13.6]
    print(f"intro: {len(intro)} guitar notes; first 40:")
    for x in intro[:40]:
        print(f"  {x[0]:6.3f}  {librosa.midi_to_note(x[1]) if x[1] else '-':5s}  {x[2]:.2f}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
