"""Score constest.mjs renders: which target words Whisper hears in "The word is X."
Scores the exact word and, more robustly, the heard word's onset consonant.

Usage: python music/voice/constest.py [dir ...] [-v]   (default music/out/voice/cons)
Prints per-config accuracy and each miss as target->heard.
"""
import json, re, sys
from pathlib import Path
from faster_whisper import WhisperModel

HERE = Path(__file__).resolve().parent

# spelling -> onset consonant class (first matching prefix wins)
ONSETS = [("sch", "sk"), ("sh", "ʃ"), ("ch", "tʃ"), ("th", "θð"), ("ph", "f"), ("wh", "w"), ("qu", "k"),
          ("kn", "n"), ("wr", "r"), ("ge", "dʒg"), ("gi", "dʒg"), ("gy", "dʒ"), ("ce", "s"), ("ci", "s"),
          ("c", "k"), ("k", "k"), ("q", "k"), ("x", "z"), ("j", "dʒ"), ("y", "j"), ("g", "g")]


def onset(word):
    for pre, ph in ONSETS:
        if word.startswith(pre):
            return ph
    return word[0] if word and word[0] not in "aeiou" else ""
dirs = [Path(a) for a in sys.argv[1:] if not a.startswith("-")] or [HERE.parent / "out" / "voice" / "cons"]
model = WhisperModel("medium.en", device="cpu", compute_type="int8", cpu_threads=16)
for d in dirs:
    man = json.loads((d / "manifest.json").read_text())
    hits, ons, misses, n = 0, 0, [], 0
    for clip in man:
        segs, _ = model.transcribe(str(d / clip["file"]), language="en", beam_size=5,
                                   condition_on_previous_text=False)
        text = " ".join(s.text for s in segs).lower()
        if "-v" in sys.argv:
            print("   ", text.strip())
        heard = re.findall(r"word is,? ([a-z']+)", text)
        toks = set(re.findall(r"[a-z']+", text))
        for i, w in enumerate(clip["words"]):
            n += 1
            h = heard[i] if i < len(heard) else ""
            ons += bool(h) and onset(w) in onset(h) or onset(h) in onset(w) and bool(onset(h))
            if w in toks:
                hits += 1
            else:
                misses.append(f"{w}->{heard[i] if i < len(heard) else '?'}")
    print(f"{d.name}: words {hits}/{n} = {hits / n:.0%}  onsets {ons}/{n} = {ons / n:.0%}   misses: {' '.join(misses)}", flush=True)
