"""Write the rough file for the backing echoes, for align_multi.py on the backing stem.

    python3 music/ep04/piano/echoes.py <rough-backing.json out>

The sheet doesn't have them: in every chorus a backing group echoes "What did you try?" and "What
did you find?" under the lead's held "try" and "find". Whisper heard them on the mix, the vocal
stem and the karaoke backing stem, and the backing stem's spectrogram shows each as a burst of
four syllables (.private/ep04-piano/views/c*-end-backing.png). The windows below are read from
those spectrograms; align_multi.py pads them by 0.5 s before and 0.7 s after.
"""
import json
import sys

WINDOWS = [("Chorus 1", 51.55, 53.0, 53.75, 55.2), ("Chorus 2", 88.55, 90.0, 90.8, 92.3), ("Chorus 3", 158.95, 160.3, 161.2, 162.6)]


def line(sec, text, a, b):
    ws = text.split()
    step = (b - a) / len(ws)
    return {"text": text, "section": sec, "back": True, "start": a, "end": b,
            "words": [{"w": w, "s": round(a + i * step, 3), "e": round(a + (i + 1) * step, 3)} for i, w in enumerate(ws)]}


def main(out):
    L = []
    for sec, a1, b1, a2, b2 in WINDOWS:
        L.append(line(sec, "What did you try?", a1, b1))
        L.append(line(sec, "What did you find?", a2, b2))
    json.dump(L, open(out, "w"), indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:])
