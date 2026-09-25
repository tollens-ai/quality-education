"""Score a finished take for storyboarding: beats, bars, sections, lines, energy and 3-second windows.

Usage: python music/reference/beats.py take.mp3 captions.txt captions.srt out.json [bpm_hint]

Sections come from the `# Name` comments in captions.txt; each line's time comes from the SRT
made by captions.py. Energy is RMS loudness in dB per bar; a "dip" is a bar at least 4 dB below
the median of the 8 bars around it, which catches band stops and breakdowns.
"""
import json
import re
import sys

import librosa
import numpy as np


def srt_times(path):
    out = []
    for block in open(path).read().strip().split("\n\n"):
        rows = block.split("\n")
        a, b = rows[1].split(" --> ")
        f = lambda x: sum(float(p) * m for p, m in zip(x.replace(",", ".").split(":"), (3600, 60, 1)))
        out.append((f(a), f(b), "\n".join(rows[2:])))
    return out


def main(take, cap_path, srt_path, out_path, bpm_hint="170"):
    y, sr = librosa.load(take, sr=22050)
    dur = len(y) / sr
    tempo, frames = librosa.beat.beat_track(y=y, sr=sr, start_bpm=float(bpm_hint))
    beats = librosa.frames_to_time(frames, sr=sr)
    beat = float(np.median(np.diff(beats)))

    # Bars: group beats in fours, phased so the first sung line starts a bar.
    times = srt_times(srt_path)
    first = min(range(len(beats)), key=lambda i: abs(beats[i] - times[1][0]))
    bars = [float(beats[i]) for i in range(first % 4, len(beats), 4)]

    rms = librosa.feature.rms(y=y, hop_length=512)[0]
    rt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
    db = lambda a, b: float(20 * np.log10(rms[(rt >= a) & (rt < b)].mean() + 1e-9))
    bar_rows = []
    for i, t in enumerate(bars):
        end = bars[i + 1] if i + 1 < len(bars) else dur
        bar_rows.append({"bar": i + 1, "t": round(t, 3), "db": round(db(t, end), 1)})
    for i, r in enumerate(bar_rows):
        near = [x["db"] for x in bar_rows[max(0, i - 4): i + 5]]
        r["dip"] = bool(r["db"] < np.median(near) - 4)

    # Lines with sections, in caption order.
    section, lines, k = None, [], 0
    for raw in open(cap_path):
        raw = raw.rstrip("\n")
        if raw.startswith("# ") and not raw.startswith("# Captions") and not raw.startswith("# shown"):
            section = raw[2:]
        elif raw.strip() and not raw.startswith("#"):
            a, b, text = times[k]
            lines.append({"section": section, "start": round(a, 2), "end": round(b, 2), "text": text})
            k += 1
    sections = []
    for ln in lines:
        if not sections or sections[-1]["name"] != ln["section"] or ln["start"] - sections[-1]["end"] > 3:
            sections.append({"name": ln["section"], "start": ln["start"], "end": ln["end"]})
        sections[-1]["end"] = ln["end"]

    windows = []
    for w0 in np.arange(0, dur, 3.0):
        w1 = w0 + 3
        sung = [ln["text"] for ln in lines if ln["start"] < w1 and ln["end"] > w0]
        dips = [r["bar"] for r in bar_rows if w0 <= r["t"] < w1 and r["dip"]]
        windows.append({"t": round(float(w0), 1), "db": round(db(w0, min(w1, dur)), 1),
                        "lines": sung, "dip_bars": dips, "job": None})

    json.dump({"take": take.split("/")[-1], "duration": round(dur, 2), "bpm": round(60 / beat, 1),
               "bar_seconds": round(4 * beat, 3), "sections": sections, "bars": bar_rows,
               "lines": lines, "windows": windows}, open(out_path, "w"), indent=1)
    print(f"{dur:.1f}s, {60 / beat:.1f} bpm, {len(bars)} bars, {len(sections)} sections, "
          f"{len(windows)} windows, dips at bars {[r['bar'] for r in bar_rows if r['dip']]}")


if __name__ == "__main__":
    main(*sys.argv[1:])
