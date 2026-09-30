"""How much each second of the film moves, without rendering the film first.

    python3 tools/motion.py

Renders a small grey frame every 1/15s straight out of the renderer (90x160, like video/lib/motion.py
does on an encoded file) and prints the mean absolute change between frames, so a near-still second
can be found before spending an hour on a master. Same numbers as motion.py, so the two agree.
"""

import http.server
import json
import os
import pathlib
import subprocess
import sys

import numpy as np
from playwright.sync_api import sync_playwright

PW, PH, FPS = 90, 160, 15
STEP = 1 / FPS
STILL = 1.2

root = pathlib.Path.cwd()
types = {".js": "text/javascript", ".mjs": "text/javascript", ".html": "text/html",
         ".json": "application/json"}


def main(from_s, to_s):
    import socketserver

    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(root), **kw)

        def guess_type(self, path):
            ext = os.path.splitext(path)[1]
            return types.get(ext) or super().guess_type(path)

        def log_message(self, *a):
            pass

    srv = socketserver.TCPServer(("127.0.0.1", 0), H)
    port = srv.server_address[1]
    import threading
    threading.Thread(target=srv.serve_forever, daemon=True).start()

    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=["--disable-dev-shm-usage"])
        page = browser.new_page(viewport={"width": PW + 40, "height": PH + 80})
        page.on("pageerror", lambda e: print("page error:", e.message, file=sys.stderr))
        page.goto(f"http://localhost:{port}/video/lib/player.html"
                  f"?scene=/video/ep01/counter/main.js&song=/music/ep01&w={PW}&render=1")
        page.wait_for_function("window.ready === true", timeout=60000)
        frames = []
        t = from_s
        while t < to_s:
            data = page.evaluate(
                "tt => { window.renderAt(tt); const c = document.getElementById('c');"
                " const k = document.createElement('canvas'); k.width = c.width; k.height = c.height;"
                " const g2 = k.getContext('2d'); g2.drawImage(c, 0, 0);"
                " return k.getContext('2d').getImageData(0, 0, c.width, c.height).data; }",
                +round(t, 3))
            # downsample to PWxPH grey, the same reduction motion.py's scale filter does on a file
            a = np.frombuffer(bytes(data), np.uint8).reshape(-1, 4).astype(np.float32)
            fh, fw = PH // 2, PW // 2
            a = a[:fh * 2 * fw * 2 * 4].reshape(fh, 2, fw, 2, 4).mean(axis=(1, 3))
            frames.append(a.reshape(fh, fw, 4)[:, :, :3].mean(axis=2))
            frames.append(a.reshape(fh, fw, 4)[:, :, :3].mean(axis=2))
            t += STEP
        browser.close()
    srv.shutdown()

    f = np.stack(frames)
    d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
    secs = len(d) // FPS          # d holds FPS pairs per second, so this is the right count
    vals = [float(d[i * FPS:(i + 1) * FPS].mean()) for i in range(secs)]
    still = [i for i, v in enumerate(vals) if v < STILL]
    print(f"seconds: {secs}  median change: {np.median(vals):.2f}")
    print(f"near-still seconds (<{STILL}): {len(still)}  {still}")
    for i, v in enumerate(vals):
        bar = "#" * int(min(70, v * 4))
        mark = "  <-- still" if v < STILL else ""
        print(f"{from_s + i:6.1f} {v:6.2f} {bar}{mark}")


if __name__ == "__main__":
    main(float(sys.argv[1]) if len(sys.argv) > 1 else 0.0,
         float(sys.argv[2]) if len(sys.argv) > 2 else 209.0)