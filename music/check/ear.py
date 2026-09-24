"""Ask an audio-capable model (via OpenRouter) to listen to an excerpt and answer a question.

Usage: python music/check/ear.py <audio> <start_s> <end_s> "<question>" [--model ID]
The model hears only the excerpt. Treat its answer as a second opinion: calibrate it on
questions with known answers before trusting it, and never in place of a human ear.
"""
import base64
import io
import json
import os
import sys
import urllib.request

import librosa
import soundfile as sf

path, start, end, question = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
model = sys.argv[sys.argv.index("--model") + 1] if "--model" in sys.argv else "~google/gemini-pro-latest"
y, sr = librosa.load(path, sr=44100, mono=False, offset=start, duration=end - start)
buf = io.BytesIO()
sf.write(buf, y.T if y.ndim > 1 else y, sr, format="MP3")
b64 = base64.b64encode(buf.getvalue()).decode()
body = {
    "model": model,
    "messages": [{"role": "user", "content": [
        {"type": "text", "text": question},
        {"type": "input_audio", "input_audio": {"data": b64, "format": "mp3"}},
    ]}],
}
req = urllib.request.Request(
    "https://openrouter.ai/api/v1/chat/completions",
    data=json.dumps(body).encode(),
    headers={"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}", "Content-Type": "application/json"},
)
with urllib.request.urlopen(req, timeout=300) as r:
    out = json.load(r)
print(out["choices"][0]["message"]["content"])
print(f"\n[{out.get('model')}, {out.get('usage', {}).get('total_tokens')} tokens]", file=sys.stderr)
