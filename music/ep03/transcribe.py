"""Whisper word timestamps for episode 3's take, from the vocal stem and from the full mix.

    python music/ep03/transcribe.py <audio> <out.json> [model]

No prompt is given: a word list in the prompt makes Whisper invent words. Each earlier segment is
kept out of the next one's context (condition_on_previous_text off), because the three choruses
are near-identical and it would otherwise copy one into the next.
"""
import json
import sys

from faster_whisper import WhisperModel


def main(path, out_path, model="large-v3"):
    m = WhisperModel(model, device="cpu", compute_type="int8", cpu_threads=4)
    segs, info = m.transcribe(path, word_timestamps=True, language="en", vad_filter=False,
                              condition_on_previous_text=False, beam_size=5, temperature=0.0)
    out = []
    for s in segs:
        print(f"{s.start:7.2f}-{s.end:7.2f} {s.text}", flush=True)
        out.append({"start": s.start, "end": s.end, "text": s.text,
                    "words": [{"w": w.word, "s": w.start, "e": w.end, "p": w.probability} for w in s.words]})
    json.dump(out, open(out_path, "w"), indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:])
