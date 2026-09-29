"""Draw episode 3's take as one picture: sections, then each stem's loudness, then the events.

    python music/ep03/map.py <music/ep03 dir> <out.png>

Needs pillow only. The sections and stems are from beats.json and audio.json; the sung words'
first and last onsets come from lyrics.json. Everything is on one time axis, so a stretch where
the band drops out or the voice holds a note can be read straight down the page.
"""
import json
import sys

from PIL import Image, ImageDraw, ImageFont

COL = {"Intro": "#f7d774", "Verse 1": "#9fd3a1", "Chorus 1": "#f4a261", "Break 1": "#c9c6d6", "Pause": "#e8e4d8",
       "Verse 2": "#8fb6e6", "Chorus 2": "#e07a5f", "Instrumental": "#f2cc8f", "Bridge": "#b9a6e0", "Break 2": "#e9a8c8",
       "Lead-in": "#e8e4d8", "Chorus 3": "#e76f51", "Outro": "#f7d774"}


def font(n):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"):
        try:
            return ImageFont.truetype(p, n)
        except OSError:
            pass
    return ImageFont.load_default()


def main(d, out):
    B = json.load(open(f"{d}/beats.json"))
    A = json.load(open(f"{d}/audio.json"))
    L = json.load(open(f"{d}/lyrics.json"))
    dur = B["duration"]
    W, H = 2600, 1180
    L0, R0 = 150, 40
    px = (W - L0 - R0) / dur
    X = lambda t: L0 + t * px
    im = Image.new("RGB", (W, H), "#f5eedd")
    g = ImageDraw.Draw(im)
    f12, f15, f19 = font(15), font(18), font(24)
    g.text((L0, 14), "The 'ilities: what the take does, second by second", fill="#2c2b36", font=f19)
    g.text((L0, 46), f"{dur:.1f} s, {B['bpm']:.1f} bpm, 2/4, {len(B['bars'])} bars. Bars are the thin ticks; every sung line is four bars, starting on the second beat.", fill="#5b5a66", font=f12)
    # Sections.
    y0 = 84
    for s in B["sections"]:
        x0, x1 = X(s["start"]), X(s["end"])
        g.rectangle([x0, y0, x1, y0 + 64], fill=COL.get(s["name"], "#ddd"), outline="#2c2b36")
        label = s["name"]
        g.text((x0 + 5, y0 + 4), label, fill="#2c2b36", font=f12)
        g.text((x0 + 5, y0 + 24), f"{s['start']:.1f}-{s['end']:.1f}s", fill="#2c2b36", font=font(13))
        g.text((x0 + 5, y0 + 42), f"bars {s['bars'][0]}-{s['bars'][1]}", fill="#2c2b36", font=font(13))
    # Stems.
    rows = [("voice", "vocals", "#3f6fd6"), ("piano + orchestra", "other", "#d4643a"), ("bass", "bass", "#4fae5c"), ("drums + percussion", "drums", "#8b5fc9")]
    top = 180
    rh = 150
    fps = A["fps"]
    for i, (name, key, colr) in enumerate(rows):
        yb = top + i * (rh + 14)
        g.rectangle([L0, yb, W - R0, yb + rh], outline="#bbb")
        g.text((8, yb + rh / 2 - 10), name, fill="#2c2b36", font=f15)
        v = A["db"][key]
        pts = []
        for k, dbv in enumerate(v):
            t = k / fps
            h = max(0, min(1, (dbv + 70) / 50)) * rh
            pts.append((X(t), yb + rh - h))
        poly = [(X(0), yb + rh)] + pts + [(X(dur), yb + rh)]
        g.polygon(poly, fill=colr)
        g.text((L0 + 4, yb + 2), "-20 dB", fill="#777", font=font(11))
    # Bars.
    for b in B["bars"]:
        x = X(b["t"])
        g.line([x, top - 6, x, top - 1], fill="#999")
    # Events row: drum hits, the held notes, the pauses.
    ey = top + 4 * (rh + 14) + 6
    g.text((8, ey + 12), "events", fill="#2c2b36", font=f15)
    g.rectangle([L0, ey, W - R0, ey + 60], outline="#bbb")
    for e in A["hits"]["drums"]:
        if e["w"] >= .5:
            x = X(e["t"])
            g.ellipse([x - 3, ey + 40, x + 3, ey + 46], fill="#8b5fc9")
    # First and last sung word of each line: a tick per line.
    for l in L:
        g.line([X(l["words"][0]["s"]), ey + 6, X(l["words"][0]["s"]), ey + 26], fill="#3f6fd6", width=2)
    notes = [(173.3, 177.9, "held 'you' 4.6 s"), (204.7, 208.2, "held 'know' 3.5 s"), (198.1, 200.6, "hush 2.5 s"), (133.6, 137.4, "the hunt"), (52.8, 56.8, "spoken")]
    for a, b, txt in notes:
        g.rectangle([X(a), ey + 30, X(b), ey + 38], fill="#e04a3d")
        g.text((X(a), ey + 46), txt, fill="#a2452a", font=font(12))
    # Axis.
    ay = ey + 80
    g.line([L0, ay, W - R0, ay], fill="#2c2b36")
    for s in range(0, int(dur) + 1, 10):
        x = X(s)
        g.line([x, ay, x, ay + 8], fill="#2c2b36")
        g.text((x - 10, ay + 10), f"{s}s", fill="#2c2b36", font=f12)
    g.text((L0, ay + 40), "blue ticks: the first word of each sung line. Purple dots: strong percussion hits. Red bars: held notes and stops.", fill="#5b5a66", font=f12)
    im.crop((0, 0, W, ay + 66)).save(out)
    print(out, im.size)


if __name__ == "__main__":
    main(*sys.argv[1:])
