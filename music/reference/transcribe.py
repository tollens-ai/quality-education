"""Whisper word timestamps for reference takes. Writes <take>.words.json beside each file.

Usage: python music/reference/transcribe.py take1.mp3 [take2.wav ...]
"""
import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel

m = WhisperModel("medium.en", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    segs, info = m.transcribe(f, word_timestamps=True, language="en", vad_filter=False)
    out = []
    print("=====", f)
    for s in segs:
        print(f"{s.start:6.2f}-{s.end:6.2f} {s.text}")
        out.append({"start": s.start, "end": s.end, "text": s.text,
                    "words": [{"w": w.word, "s": w.start, "e": w.end} for w in s.words]})
    json.dump(out, open(Path(f).with_suffix(".words.json"), "w"), indent=1)
