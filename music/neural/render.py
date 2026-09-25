"""Render DiffSinger phrase files (.ds, from score2ds.mjs) with an OpenUtau-format DiffSinger
voicebank, headless, through onnxruntime on the CPU.

The score supplies every phoneme duration and the f0 curve, so only the voicebank's acoustic
model and a vocoder run. Two vocoders are supported:

  --vocoder=bank     the voicebank's own ONNX vocoder (dsvocoder/ or the one dsconfig names).
                     Most DiffSinger vocoders derive from openvpi's NSF-HiFiGAN, which is
                     CC BY-NC-SA 4.0, so use this for comparison only, not for publication.
  --vocoder=bigvgan  NVIDIA BigVGAN v2 (44 kHz, 128 bands, hop 512; MIT code and weights).
                     DiffSinger's 40-16000 Hz log-mel is re-mapped onto BigVGAN's 0-22050 Hz
                     mel bands by interpolating over band centre frequency.

Usage:
  python music/neural/render.py --bank=DIR --ds=DIR --out=DIR [--vocoder=bigvgan|bank]
         [--speaker=Root] [--gender=0] [--velocity=1] [--steps=20] [--depth=0.6] [--mix=SPK:W,...]
         [--song=SECONDS]   # also place every phrase at its offset in one song-length WAV
         [--only=a,b]       # render only these phrases
         [--mp3]            # also write an mp3 per phrase
         [--stretch=R]      # play the phrase R times faster, pitch kept, by resampling the mel
                            #   frames before vocoding (render slow, e.g. at 90 bpm, then R=2)
  python music/neural/render.py --bank=DIR --inspect   # print the ONNX inputs and outputs

Writes <out>/<phrase>.wav (44.1 kHz mono) and <out>/manifest.json in the format that
music/voice/check.py reads.
"""
import json, sys, time
from pathlib import Path

import numpy as np
import onnxruntime as ort
import soundfile as sf
import yaml


def arg(k, d=None):
    for a in sys.argv[1:]:
        if a.startswith(f"--{k}="):
            return a.split("=", 1)[1]
    return d


def session(path):
    o = ort.SessionOptions()
    o.intra_op_num_threads = int(arg("threads", 16))
    return ort.InferenceSession(str(path), o, providers=["CPUExecutionProvider"])


class Bank:
    def __init__(self, root):
        self.root = Path(root)
        self.cfg = yaml.safe_load(open(self.root / "dsconfig.yaml", encoding="utf-8"))
        self.phonemes = [l.strip() for l in open(self.root / self.cfg["phonemes"], encoding="utf-8") if l.strip()]
        self.index = {p: i for i, p in enumerate(self.phonemes)}
        self.acoustic = session(self.root / self.cfg["acoustic"])
        self.inputs = {i.name: i for i in self.acoustic.get_inputs()}
        self.sr, self.hop = self.cfg["sample_rate"], self.cfg["hop_size"]
        self.speakers = {Path(s).name: Path(s) for s in self.cfg.get("speakers", [])}

    def embed(self, mix, n):
        v = np.zeros(self.cfg.get("hidden_size", 256), np.float32)
        for name, w in mix.items():
            v += w * np.fromfile(self.root / f"{self.speakers[name]}.emb", dtype=np.float32)
        return np.tile(v, (1, n, 1)).astype(np.float32)

    def mel(self, ds, mix, gender=0.0, velocity=1.0, steps=20, depth=0.6):
        ph = ds["ph_seq"].split()
        missing = [p for p in ph if p not in self.index]
        if missing:
            raise ValueError(f"phonemes not in voicebank: {sorted(set(missing))}")
        # Durations to frames by rounding the cumulative time, so no drift accumulates.
        ends = np.round(np.cumsum([float(x) for x in ds["ph_dur"].split()]) * self.sr / self.hop).astype(np.int64)
        dur = np.diff(np.concatenate([[0], ends]))
        dur = np.maximum(dur, 1)
        n = int(dur.sum())
        f0 = np.array([float(x) for x in ds["f0_seq"].split()], np.float32)
        step = float(ds["f0_timestep"])
        t_src = np.arange(len(f0)) * step
        t_dst = np.arange(n) * self.hop / self.sr
        f0 = np.interp(t_dst, t_src, f0).astype(np.float32)
        feed = {
            "tokens": np.array([[self.index[p] for p in ph]], np.int64),
            "durations": dur[None].astype(np.int64),
            "f0": f0[None],
        }
        if "languages" in self.inputs:
            feed["languages"] = np.zeros_like(feed["tokens"])
        if "gender" in self.inputs:
            feed["gender"] = np.full((1, n), gender, np.float32)
        if "velocity" in self.inputs:
            feed["velocity"] = np.full((1, n), velocity, np.float32)
        if "spk_embed" in self.inputs:
            feed["spk_embed"] = self.embed(mix, n)
        if "depth" in self.inputs:
            feed["depth"] = np.array(depth, np.float32)
        if "steps" in self.inputs:
            feed["steps"] = np.array(steps, np.int64)
        if "speedup" in self.inputs:
            feed["speedup"] = np.array(max(1, 1000 // steps), np.int64)
        for k in self.inputs:
            if k not in feed:
                raise ValueError(f"acoustic model wants an input this script doesn't set: {k}")
        mel = self.acoustic.run(None, feed)[0]
        return mel, f0


class BankVocoder:
    def __init__(self, bank):
        vdir = bank.root / "dsvocoder"
        cfg = yaml.safe_load(open(vdir / "vocoder.yaml", encoding="utf-8"))
        self.sess = session(vdir / cfg["model"])

    def __call__(self, mel, f0):
        return self.sess.run(None, {"mel": mel.astype(np.float32), "f0": f0[None]})[0].reshape(-1)


class BigVGANVocoder:
    """BigVGAN v2 44 kHz / 128 bands / hop 512, loaded from the cloned NVIDIA repo."""

    def __init__(self, bank):
        import torch, librosa
        sys.path.insert(0, arg("bigvgan_repo", str(Path(__file__).resolve().parent.parent / "out" / "neural" / "vendor" / "BigVGAN")))
        import bigvgan
        self.torch = torch
        torch.set_num_threads(int(arg("threads", 16)))
        from huggingface_hub import hf_hub_download
        from env import AttrDict
        # Loaded by hand: BigVGAN's from_pretrained() breaks on current huggingface_hub releases.
        repo = arg("bigvgan_model", "nvidia/bigvgan_v2_44khz_128band_512x")
        h = AttrDict(json.loads(Path(hf_hub_download(repo, "config.json")).read_text()))
        self.model = bigvgan.BigVGAN(h, use_cuda_kernel=False)
        state = torch.load(hf_hub_download(repo, "bigvgan_generator.pt"), map_location="cpu")
        self.model.load_state_dict(state["generator"])
        self.model.remove_weight_norm()
        self.model.eval()
        h = self.model.h
        c = bank.cfg
        assert h.sampling_rate == c["sample_rate"] and h.hop_size == c["hop_size"], "BigVGAN and bank frame rates differ"
        # Band centre frequencies of both slaney mel filterbanks.
        src = librosa.mel_frequencies(c["num_mel_bins"] + 2, fmin=c["mel_fmin"], fmax=c["mel_fmax"], htk=False)[1:-1]
        dst = librosa.mel_frequencies(h.num_mels + 2, fmin=h.fmin, fmax=h.fmax or h.sampling_rate / 2, htk=False)[1:-1]
        self.src, self.dst, self.fmax = src, dst, c["mel_fmax"]

    def remap(self, mel):
        # Slaney-normalised bands measure mean magnitude density, so log values are comparable
        # between filterbanks; interpolate over log-frequency, and roll off above the bank's fmax.
        ls, ld = np.log(self.src), np.log(self.dst)
        out = np.stack([np.interp(ld, ls, frame) for frame in mel])
        above = self.dst > self.fmax
        out[:, above] -= 3.0 * np.log2(self.dst[above] / self.fmax)[None]  # ~ -26 dB per octave
        return np.maximum(out, np.log(1e-5))

    def __call__(self, mel, f0):
        m = self.remap(mel[0])  # (T, bins)
        with self.torch.inference_mode():
            y = self.model(self.torch.from_numpy(m.T[None].astype(np.float32)))
        return y.reshape(-1).numpy()


def stretch_mel(mel, f0, r):
    """Play the acoustic model's output r times faster, keeping the pitch: resample the log-mel
    frames (and f0) in time before vocoding, so the vocoder renders the final length directly."""
    n = mel.shape[1]
    m = max(1, int(round(n / r)))
    src = np.arange(m) * (n - 1) / max(1, m - 1)
    i0 = np.floor(src).astype(int); i1 = np.minimum(i0 + 1, n - 1); u = (src - i0)[:, None]
    out = mel[0, i0] * (1 - u) + mel[0, i1] * u
    return out[None].astype(np.float32), np.interp(src, np.arange(n), f0).astype(np.float32)


def write_mp3(path, y, sr, channels=1):
    import lameenc
    enc = lameenc.Encoder()
    enc.set_bit_rate(192)
    enc.set_in_sample_rate(sr)
    enc.set_channels(channels)
    enc.set_quality(2)
    pcm = (np.clip(y, -1, 1) * 32767).astype("<i2").tobytes()
    Path(path).write_bytes(enc.encode(pcm) + enc.flush())


def main():
    bank = Bank(arg("bank"))
    if "--inspect" in sys.argv:
        for i in bank.acoustic.get_inputs():
            print("in ", i.name, i.shape, i.type)
        for o in bank.acoustic.get_outputs():
            print("out", o.name, o.shape)
        print("speakers", list(bank.speakers))
        return
    ds_dir, out = Path(arg("ds")), Path(arg("out"))
    out.mkdir(parents=True, exist_ok=True)
    mix = {arg("speaker", next(iter(bank.speakers))): 1.0} if bank.speakers else {}
    if arg("mix"):
        mix = {k: float(w) for k, w in (p.split(":") for p in arg("mix").split(","))}
    voc = BigVGANVocoder(bank) if arg("vocoder", "bigvgan") == "bigvgan" else BankVocoder(bank)
    index = json.loads((ds_dir / "phrases.json").read_text())
    manifest, song = [], None
    if arg("song"):
        song = np.zeros(int(float(arg("song")) * bank.sr) + bank.sr, np.float32)
    only = set(arg("only", "").split(",")) - {""}
    for p in index["phrases"]:
        if only and p["name"] not in only:
            continue
        ds =json.loads((ds_dir / f"{p['name']}.ds").read_text())[0]
        t0 = time.time()
        mel, f0 = bank.mel(ds, mix, float(arg("gender", 0)), float(arg("velocity", 1)), int(arg("steps", 20)), float(arg("depth", 0.6)))
        stretch = float(arg("stretch", 1))
        if stretch != 1:
            mel, f0 = stretch_mel(mel, f0, stretch)
        y = voc(mel, f0).astype(np.float32)
        sf.write(out / f"{p['name']}.wav", y, bank.sr)
        if "--mp3" in sys.argv:
            write_mp3(out / f"{p['name']}.mp3", y, bank.sr)
        if song is not None:
            i0 = int(round((ds["offset"] - index["songStart"]) * bank.sr))
            seg = y[: max(0, len(song) - i0)]
            song[i0: i0 + len(seg)] += seg
        notes = p["notes"]
        if stretch != 1:
            notes = [{**n, **{k: round(n[k] / stretch, 4) for k in ("start", "vowelEnd", "end") if k in n}} for n in notes]
        manifest.append(dict(name=p["name"], text=p["text"], file=f"{p['name']}.wav", spoken=False, notes=notes))
        print(f"{p['name']}: {len(y) / bank.sr:.2f} s in {time.time() - t0:.1f} s, peak {np.abs(y).max():.3f}", flush=True)
    (out / "manifest.json").write_text(json.dumps(manifest, indent=1))
    if song is not None:
        sf.write(out / "song.wav", song, bank.sr)


if __name__ == "__main__":
    main()
