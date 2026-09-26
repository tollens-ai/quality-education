"""How much each second of a video moves: the mean absolute change between frames, on a small
grey copy (15 fps, 90x160). Near-still seconds (under 1.2) are listed first, then a bar per second.

    python3 video/lib/motion.py <video>

Needs ffmpeg on the path, and numpy.
"""
import subprocess, sys
import numpy as np

v = sys.argv[1]
w, h, fps = 90, 160, 15
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', v, '-vf', f'fps={fps},scale={w}:{h},format=gray',
                      '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
secs = len(d) // fps
vals = [d[i * fps:(i + 1) * fps].mean() for i in range(secs)]
still = [i for i, x in enumerate(vals) if x < 1.2]
print('seconds:', secs, 'median change:', round(float(np.median(vals)), 2))
print('near-still seconds (<1.2):', len(still), still)
for i, x in enumerate(vals):
    print(f'{i:4d} {x:6.2f} ' + '#' * int(min(60, x * 4)))
