"""Export a font's glyph outlines as SVG path data, for lettering that's cut along its outline.

    python glyphs.py <font.ttf> <out.json> [wght]

Instances a variable font at the given weight (default 900), then writes, for every printable
ASCII character and a few typographic ones, the glyph's advance and its outline as an SVG path
in font units (y up). The renderer lays words out with the canvas's own shaping (so kerning
matches fillText) and uses these outlines for the laser that cuts each letter.
"""
import json
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

path, out = sys.argv[1], sys.argv[2]
wght = float(sys.argv[3]) if len(sys.argv) > 3 else 900
font = TTFont(path)
if "fvar" in font:
    font = instancer.instantiateVariableFont(font, {"wght": wght})
cmap = font.getBestCmap()
gs = font.getGlyphSet()
chars = [chr(c) for c in range(32, 127)] + list("‘’“”–—…×✓✗")
glyphs = {}
for ch in chars:
    name = cmap.get(ord(ch))
    if not name:
        continue
    pen = SVGPathPen(gs)
    gs[name].draw(pen)
    glyphs[ch] = {"adv": gs[name].width, "d": pen.getCommands()}
os2 = font["OS/2"]
json.dump({
    "upm": font["head"].unitsPerEm,
    "ascender": os2.sTypoAscender,
    "descender": os2.sTypoDescender,
    "capHeight": getattr(os2, "sCapHeight", 0),
    "xHeight": getattr(os2, "sxHeight", 0),
    "glyphs": glyphs,
}, open(out, "w"), separators=(",", ":"))
print(f"{len(glyphs)} glyphs, upm {font['head'].unitsPerEm}, cap {getattr(os2, 'sCapHeight', 0)}")
