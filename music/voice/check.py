"""Measure the voice renders, because the model can't hear them.

For each phrase in music/out/voice/manifest.json:
  - Whisper (faster-whisper medium.en) transcript and word accuracy against the lyric
  - pYIN pitch per sung syllable vs the score, in cents (skipping scoops at the onset)
  - NaN / clipping / DC check
  - a spectrogram PNG next to the WAV

Usage: python music/voice/check.py [phrase ...] [--no-whisper] [--json=out.json] [--dir=renders]
"""
import json, os, re, struct, sys, zlib
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "out" / "voice"


def words(s):
    s = s.lower().replace("-", " ")
    s = re.sub(r"[^a-z0-9' ]", " ", s)
    return [w.strip("'") for w in s.split() if w.strip("'")]


def align(ref, hyp):
    """Levenshtein alignment; returns (hits, subs, dels, ins)."""
    n, m = len(ref), len(hyp)
    d = np.zeros((n + 1, m + 1), int)
    d[:, 0] = range(n + 1)
    d[0, :] = range(m + 1)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (ref[i - 1] != hyp[j - 1]))
    i, j, h = n, m, 0
    s = de = ins = 0
    while i > 0 or j > 0:
        if i > 0 and j > 0 and d[i, j] == d[i - 1, j - 1] + (ref[i - 1] != hyp[j - 1]):
            if ref[i - 1] == hyp[j - 1]:
                h += 1
            else:
                s += 1
            i, j = i - 1, j - 1
        elif i > 0 and d[i, j] == d[i - 1, j] + 1:
            de += 1
            i -= 1
        else:
            ins += 1
            j -= 1
    return h, s, de, ins


# Equivalent spellings Whisper may use
NORM = {"subagents": ["sub", "agents"], "12": ["twelve"], "didnt": ["didn't"], "2fa": ["two", "fa"], "2": ["two"]}


def norm_words(ws):
    out = []
    for w in ws:
        out.extend(NORM.get(w, [w]))
    return out


def png(path, img):
    """img: HxW float 0..1 -> grayscale-ish 'inferno-lite' RGB PNG, no PIL needed."""
    h, w = img.shape
    r = np.clip(img * 1.6, 0, 1)
    g = np.clip(img * 1.6 - 0.6, 0, 1)
    b = np.clip(0.5 * np.sin(np.pi * img) + np.clip(img * 2 - 1.4, 0, 1), 0, 1)
    rgb = (np.stack([r, g, b], -1) * 255).astype(np.uint8)
    raw = b"".join(b"\x00" + rgb[y].tobytes() for y in range(h))
    chunk = lambda t, d: struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
    data += chunk(b"IDAT", zlib.compress(raw, 6)) + chunk(b"IEND", b"")
    Path(path).write_bytes(data)


def spectrogram(y, sr, path, fmax=10000, hop=120):
    import librosa
    S = np.abs(librosa.stft(y, n_fft=1024, hop_length=hop))
    S = librosa.amplitude_to_db(S, ref=np.max)
    S = S[: int(fmax / (sr / 1024))]  # up to fmax
    # trim leading/trailing near-silence columns
    act = np.where(S.max(0) > -60)[0]
    if len(act):
        S = S[:, max(0, act[0] - 20): act[-1] + 20]
    S = np.repeat(S, 2, axis=0)
    img = np.clip((S + 80) / 80, 0, 1)[::-1]
    png(path, img)


def pitch_report(y, sr, notes):
    import librosa
    f0, vf, _ = librosa.pyin(y, fmin=70, fmax=900, sr=sr, frame_length=2048, hop_length=240)
    t = librosa.times_like(f0, sr=sr, hop_length=240)
    rows = []
    for n in notes:
        if n.get("midi") is None:
            continue
        a, b = n["start"] + 0.07, n["vowelEnd"] - 0.03
        if b - a < 0.04:
            a, b = n["start"] + 0.02, max(n["vowelEnd"] - 0.01, n["start"] + 0.05)
        m = (t >= a) & (t <= b) & ~np.isnan(f0)
        if m.sum() < 2:
            rows.append((n, None, 0))
            continue
        cents = 1200 * np.log2(f0[m] / (440 * 2 ** ((n["midi"] - 69) / 12)))
        rows.append((n, float(np.median(cents)), int(m.sum())))
    return rows


def main():
    global OUT
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    for a in sys.argv:
        if a.startswith("--dir="):
            OUT = Path(a[6:]).resolve()
    manifest = json.loads((OUT / "manifest.json").read_text())
    model = None
    if "--no-whisper" not in sys.argv:
        from faster_whisper import WhisperModel
        model = WhisperModel("medium.en", device="cpu", compute_type="int8", cpu_threads=int(os.environ.get("WHISPER_THREADS", 16)))
    results = []
    for p in manifest:
        if args and p["name"] not in args:
            continue
        y, sr = sf.read(OUT / p["file"], dtype="float32")
        stats = dict(nan=bool(np.isnan(y).any()), peak=float(np.abs(y).max()), dc=float(y.mean()),
                     clipped=int((np.abs(y) >= 0.999).sum()))
        res = dict(name=p["name"], text=p["text"], stats=stats)
        if model:
            segs, _ = model.transcribe(str(OUT / p["file"]), language="en", beam_size=5,
                                       condition_on_previous_text=False, vad_filter=False)
            hyp = " ".join(s.text.strip() for s in segs)
            ref_w, hyp_w = norm_words(words(p["text"])), norm_words(words(hyp))
            h, s, d, i = align(ref_w, hyp_w)
            res.update(transcript=hyp, accuracy=h / len(ref_w), wer=(s + d + i) / len(ref_w))
        if p["notes"]:
            rows = pitch_report(y, sr, p["notes"])
            errs = [c for _, c, _ in rows if c is not None]
            res["pitch"] = dict(per_note=[None if c is None else round(c) for _, c, _ in rows],
                                median_abs=float(np.median(np.abs(errs))) if errs else None,
                                over30=sum(abs(c) > 30 for c in errs), missing=sum(c is None for _, c, _ in rows))
        spectrogram(y, sr, OUT / (p["name"] + ".png"))
        results.append(res)
        line = f"{p['name']:10s}"
        if model:
            line += f" acc {res['accuracy']:.0%}  WER {res['wer']:.0%}  heard: {res['transcript']!r}"
        if "pitch" in res:
            pr = res["pitch"]
            line += f"\n{'':10s} pitch cents {pr['per_note']}  median|err| {pr['median_abs']}  >30c: {pr['over30']}"
        line += f"\n{'':10s} peak {stats['peak']:.3f} nan {stats['nan']} dc {stats['dc']:.2e} clipped {stats['clipped']}"
        print(line, flush=True)
    for a in sys.argv:
        if a.startswith("--json="):
            Path(a[7:]).write_text(json.dumps(results, indent=1))


if __name__ == "__main__":
    main()
