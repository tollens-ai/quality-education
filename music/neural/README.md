# A neural singing voice from the score (trial)

This folder tries a local, open-source neural singer on episode 1's lead: a
[DiffSinger](https://github.com/openvpi/DiffSinger) voicebank, run headless from a script on the CPU.
It is the alternative to the all-code voice in [music/voice](../voice/README.md). The score keeps
control of timing and pitch. `score2ds.mjs` writes every phoneme duration and the whole f0 curve,
and the network only supplies the voice.

No voicebank or model weights are kept in this repo. The scripts download or read them from
`music/out/neural/`, which git ignores.

## Files

| File | Job |
|---|---|
| `score2ds.mjs` | Converts lead events from `music/ep01/score.mjs` into DiffSinger `.ds` phrase files. The syllable lexicon uses non-rhotic, British-leaning ARPABET. Onset consonants go before the beat, and consonants are squeezed to at most half of each note. The f0 curve includes the score's glides (D5>Eb5), portamento and late vibrato. |
| `render.py` | Runs an OpenUtau-format DiffSinger voicebank's acoustic model with onnxruntime, then a vocoder (see Licences). It writes one WAV per phrase and a `manifest.json` that `music/voice/check.py` can read. |
| `mix.py` | Places a whole-lead render roughly over `music/out/ep01-band.wav` so you can hear it in context. |

## Setup (in the dev container, CPU only)

```sh
python3 -m venv ~/.venvs/neural-svs
~/.venvs/neural-svs/bin/pip install --index-url https://download.pytorch.org/whl/cpu torch
~/.venvs/neural-svs/bin/pip install onnxruntime numpy soundfile pyyaml librosa scipy matplotlib lameenc huggingface_hub faster-whisper

# Voicebank: Hoshino Hanami ~AI❤dol~ v1.0 by Lotte V. Download it from the link on
# https://diffsinger.miraheze.org/wiki/Hanami_Hoshino, unzip it, and rename the folder
# to music/out/neural/banks/hanami (so that banks/hanami/dsconfig.yaml exists).

# Vocoder code (MIT). render.py fetches the weights from Hugging Face on first use.
git clone --depth 1 https://github.com/NVIDIA/BigVGAN music/out/neural/vendor/BigVGAN
```

## Use

```sh
node music/neural/score2ds.mjs                 # test phrases -> music/out/neural/ds/test
node music/neural/score2ds.mjs --set=lead      # whole lead, split at rests -> ds/lead
PY=~/.venvs/neural-svs/bin/python
$PY music/neural/render.py --bank=music/out/neural/banks/hanami --ds=music/out/neural/ds/test \
    --out=music/out/neural/hanami-bigvgan --vocoder=bigvgan --mp3
$PY music/voice/check.py --dir=music/out/neural/hanami-bigvgan   # Whisper, pitch, NaN/clipping

# Whole lead in context (the song is about 3 minutes long):
$PY music/neural/render.py --bank=music/out/neural/banks/hanami --ds=music/out/neural/ds/lead \
    --out=music/out/neural/lead --vocoder=bigvgan --song=200
$PY music/neural/mix.py --vocal=music/out/neural/lead/song.wav --band=music/out/ep01-band.wav \
    --out=music/out/neural/ep01-band+neural
```

Diagnostics: `score2ds.mjs --bpm=90` re-times the score, `--cons=1.4` lengthens consonants,
`--maxc=0.65` lets consonants take more of each note, and `--bath=ae` sings "fast" and "last"
with the American vowel. `render.py --speaker=Fragrance` selects the voicebank's power mode, and
`--vocoder=bank` uses the voicebank's own vocoder, which is only for comparison (see Licences).

Speed on 16 shared CPU threads: about 5–10 s of compute per second of audio with the voicebank's
vocoder, and about 35 s per second with BigVGAN. A whole-lead render with BigVGAN is a job of
an hour or more.

## Licences (checked 2026-09-25)

- **Voicebank:** the Team L❤VE Voicebank License reads: "Use this voicebank for any creative
  purpose, even commercially. Prior permission is not necessary". The conditions are attribution
  and no redistribution. The Terms of Use say "Please credit me (Lotte V)". The bank's readme says
  "No external data has been used for training". Source:
  [LotteV-Voicebank-Update-Repo](https://github.com/lottev1991/LotteV-Voicebank-Update-Repo).
  Credit on screen: *Vocals: Hoshino Hanami ~AI❤dol~ by Lotte V (DiffSinger)*.
- **Vocoder:** the voicebank's own vocoder (AI❤dolGAN) is **CC BY-NC-SA 4.0**, as is openvpi's
  NSF-HiFiGAN, which most DiffSinger voicebanks use or fine-tune
  ([release notes](https://github.com/openvpi/vocoders/releases)). It is not usable for a
  commercial publication. `--vocoder=bigvgan` uses NVIDIA BigVGAN v2 instead, which has MIT code
  and MIT weights ([model card](https://huggingface.co/nvidia/bigvgan_v2_44khz_128band_512x)).
- **Code:** the DiffSinger code is Apache 2.0 but is not used here. onnxruntime is MIT. This
  folder is MIT, like the rest of the repo's code.

## Results (2026-09-25)

These are the test phrases from `music/voice/test.mjs`, at 180 bpm. The word figures are
`check.py`'s faster-whisper word accuracy. Pitch is the median error of the per-note medians.

| Phrase | Bank vocoder, 3 takes | BigVGAN, 1 take | 90 bpm (bank vocoder) |
|---|---|---|---|
| Pre-chorus | 100, 100, 100% | 100% | 90% |
| Hook | 83, 100, 83% | 83% | 67% |
| "Product demo? Wow them fast" | 40, 20, 40% | 40% | 40% |
| "2FA on your gym log" | 0, 50, 0% | 33% | 100% |
| "Kubernetes for your blog" | 100, 100, 75% | 100% | 100% |
| "Twelve subagents round the clock" | 33, 33, 33% | 0% | 67% |

- **Pitch:** the median error is 2–8 cents, with no note over 30 cents. The voice follows the
  written f0 exactly.
- **Signal checks:** no NaN, no clipping, peak 0.15–0.5.
- **Takes differ.** The diffusion sampler is unseeded, so the same input gives different words
  on different takes.
- **Tempo matters most.** At 90 bpm, "2FA" and "Kubernetes" pass. "Wow them fast" fails at
  every tempo: Whisper hears "all the boss", "all of us". So that failure comes from the voicebank
  or the lexicon, not from the timing.
- **Accent:** the lexicon leans British, but the voicebank was recorded by a non-native English
  singer with no British data. Expect a general accent; nobody has listened for it yet.
