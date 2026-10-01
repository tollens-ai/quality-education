#!/usr/bin/env python3
"""storyboard.py <film.mp4> <episode-video.md> <outdir> [--tile 270] [--lines 5] [--pdf out.pdf]

Phone-sized storyboard sheets from a finished film and the tables in its episode's video file. The video file
has, for each part of the song, a heading like

    ### Chorus 1 (31.8-52.1 s): the ring by day

and under it a table whose columns are Seconds | The line | The picture | What it says, one row per sung line (or
per wordless stretch), for example

    | 35.0-38.2 | *Fast, but it crashes; ...* | A greyhound races in and ... | Fast is not the same as reliable. |

Each sheet has up to `--lines` rows. A row is the time span and the line, the picture, "Says:" what it claims,
and three frames from the film (near the start, the middle, and the end of the span; a wordless stretch is sampled
at a quarter, a half and three quarters so that its frames aren't the ones at a cut). The claim is what the expert
judges, so she can read the teaching against the pictures on her phone. Writes <outdir>/sb-NN-<part>.jpg, and with
--pdf a PDF of the sheets in order. Needs ffmpeg and Pillow. Run from anywhere; paths are as given."""
import os
import re
import subprocess
import sys
import textwrap

from PIL import Image, ImageDraw, ImageFont


def parse(md_path):
    """[(title, subtitle, [(a, z, line, picture, claim), ...])] from the '### Part (a-b s): subtitle' tables."""
    parts, cur = [], None
    for raw in open(md_path, encoding='utf-8'):
        ln = raw.rstrip('\n')
        if ln.startswith('## '):
            cur = None
        m = re.match(r'^### (.+?) \(([\d.]+)-([\d.]+) s\)(?:: (.*))?$', ln)
        if m:
            cur = (m.group(1), m.group(4) or '', [])
            parts.append(cur)
            continue
        if cur is None or not ln.startswith('|'):
            continue
        cells = [c.strip() for c in ln.strip().strip('|').split('|')]
        m = re.match(r'^([\d.]+)-([\d.]+)$', cells[0]) if len(cells) >= 4 else None
        if not m:
            continue
        line = re.sub(r'^\*(.*)\*$', r'\1', cells[1])
        cur[2].append((float(m.group(1)), float(m.group(2)), line, cells[2], cells[3]))
    return [(t, s, sorted(rows, key=lambda r: r[0])) for t, s, rows in parts if rows]


def main():
    args = sys.argv[1:]
    if len(args) < 3:
        sys.exit(__doc__)
    film, md, out = args[:3]
    rest = args[3:]

    def opt(name, default, cast=int):
        return cast(rest[rest.index(name) + 1]) if name in rest else default

    tw, per_sheet, pdf = opt('--tile', 270), opt('--lines', 5), opt('--pdf', None, str)
    # frames keep the film's shape, portrait or landscape (read from ffmpeg's own report: the dev
    # boxes have ffmpeg but no ffprobe)
    probe = subprocess.run(['ffmpeg', '-hide_banner', '-i', film], capture_output=True, text=True).stderr
    fw, fh = map(int, re.search(r'Video:.*?(\d{2,5})x(\d{2,5})', probe).groups())
    th = int(tw * fh / fw)
    frames = os.path.join(out, 'frames')
    os.makedirs(frames, exist_ok=True)

    def font(name, size):
        try:
            return ImageFont.truetype(f'/usr/share/fonts/truetype/dejavu/{name}.ttf', size)
        except OSError:
            return ImageFont.load_default()

    body, bold, small, bold2 = font('DejaVuSans', 15), font('DejaVuSans-Bold', 17), font('DejaVuSans', 13), font('DejaVuSans-Bold', 14)

    st = os.stat(film)
    tag = f'{int(st.st_mtime)}-{st.st_size}'     # so a re-rendered film never reuses an older film's frames

    def frame(t):
        f = os.path.join(frames, f'f{tag}-{t:08.3f}.jpg')
        if not os.path.exists(f):
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{t:.3f}', '-i', film, '-frames:v', '1',
                            '-vf', f'scale={tw}:-1', '-q:v', '3', f], check=True)
        return Image.open(f).convert('RGB')

    def times(a, z, line):
        if line.startswith('(no words)') or z - a > 5:
            return [a + (z - a) * k for k in (.25, .5, .75)]
        return [a + .12, (a + z) / 2, z - .05]

    sheets, n = [], 0
    for title, sub, rows in parse(md):
        for c in range(0, len(rows), per_sheet):
            chunk = rows[c:c + per_sheet]
            n += 1
            head, text_h = 56, 128
            row_h = th + text_h + 12
            sheet = Image.new('RGB', (3 * (tw + 6) + 12, head + len(chunk) * row_h + 6), 'white')
            d = ImageDraw.Draw(sheet)
            d.text((8, 6), f'{title}: {sub}' if sub else title, fill=(0, 0, 0), font=bold)
            d.text((8, 30), f'part {c // per_sheet + 1} of {(len(rows) + per_sheet - 1) // per_sheet}', fill=(90, 90, 90), font=small)
            for k, (a, z, line, pic, claim) in enumerate(chunk):
                y = head + k * row_h
                yy = y
                for ln in textwrap.wrap(f'{a:.1f}-{z:.1f} s   {line}', 84)[:2]:
                    d.text((8, yy), ln, fill=(0, 0, 0), font=bold2)
                    yy += 19
                for ln in textwrap.wrap(pic, 104)[:4]:
                    d.text((8, yy), ln, fill=(40, 40, 40), font=small)
                    yy += 15
                for ln in textwrap.wrap('Says: ' + claim, 104)[:3]:
                    d.text((8, yy), ln, fill=(20, 70, 140), font=small)
                    yy += 15
                for j, t in enumerate(times(a, z, line)):
                    sheet.paste(frame(t), (8 + j * (tw + 6), y + text_h))
            name = os.path.join(out, f'sb-{n:02d}-' + re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-') + '.jpg')
            sheet.save(name, quality=87)
            sheets.append(name)
            print(name, sheet.size)
    if pdf and sheets:
        ims = [Image.open(f).convert('RGB') for f in sheets]
        ims[0].save(pdf, save_all=True, append_images=ims[1:], resolution=110.0, quality=88)
        print(pdf, len(ims), 'pages')


if __name__ == '__main__':
    main()
