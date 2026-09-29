"""Put episode 3's measurements together for the renderer.

    python3 music/ep03/finish.py <measure dir> <lyrics voted.json> <out dir>

Writes lyrics.json (the voted word times), beats.json (the beat grid, with the sections added:
where each begins and ends, whether it is sung, spoken or instrumental, and its bars) and
audio.json (unchanged). A sung section runs from its first word's onset to the moment the voice
stops after its last word, read off the vocal stem's loudness, so a held final note counts.
"""
import json
import sys


def main(measure, lyr_path, out):
    B = json.load(open(f"{measure}/beats.json"))
    A = json.load(open(f"{measure}/audio.json"))
    L = json.load(open(lyr_path))
    dur = B["duration"]
    fps = A["fps"]
    vdb = A["db"]["vocals"]

    def voice_end(t_last_start):
        """When the voice next falls 22 dB below its own level here and stays down for 0.3 s."""
        i = int(t_last_start * fps)
        peak = max(vdb[i:i + 6])
        j = i + 2
        while j < len(vdb) - 6:
            if all(v < peak - 22 for v in vdb[j:j + 6]):
                return j / fps
            j += 1
        return dur

    order, seen = [], {}
    for l in L:
        if l["section"] not in seen:
            seen[l["section"]] = {"name": l["section"], "lines": []}
            order.append(seen[l["section"]])
        seen[l["section"]]["lines"].append(l)
    sung = []
    for s in order:
        a = s["lines"][0]["words"][0]["s"]
        b = voice_end(s["lines"][-1]["words"][-1]["s"])
        kind = "spoken" if s["name"].startswith("Break 1") else "sung"
        sung.append({"name": s["name"], "start": round(a, 3), "end": round(b, 3), "kind": kind})
    secs = []
    t = 0.0
    named = {"Chorus 2": "Instrumental", "Break 2": "Lead-in"}
    for i, s in enumerate(sung):
        if s["start"] - t > 1.0:
            gap = ("Intro" if i == 0 else "Instrumental" if sung[i - 1]["name"] == "Chorus 2" else "Lead-in" if sung[i - 1]["name"] == "Break 2" else "Pause")
            secs.append({"name": gap, "start": round(t, 3), "end": s["start"], "kind": "instrumental"})
        secs.append(s)
        t = s["end"]
    if dur - t > 0.5:
        secs.append({"name": "Outro", "start": round(t, 3), "end": round(dur, 3), "kind": "instrumental"})
    downs = [b for b in B["beats"] if b["down"]]
    for s in secs:
        first = next((d for d in downs if d["t"] >= s["start"] - 0.2), downs[-1])
        last = [d for d in downs if d["t"] < s["end"] - 0.05]
        s["bars"] = [first["bar"], last[-1]["bar"] if last else first["bar"]]
        s["seconds"] = round(s["end"] - s["start"], 3)
    B["sections"] = secs
    B["take"] = "take"
    json.dump(B, open(f"{out}/beats.json", "w"))
    json.dump(A, open(f"{out}/audio.json", "w"))
    json.dump(L, open(f"{out}/lyrics.json", "w"), indent=1)
    for s in secs:
        print(f"{s['name']:14s} {s['start']:7.2f} - {s['end']:7.2f}  {s['seconds']:6.2f} s  bars {s['bars'][0]:3d}-{s['bars'][1]:3d}  {s['kind']}")


if __name__ == "__main__":
    main(*sys.argv[1:])
