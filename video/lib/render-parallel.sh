#!/usr/bin/env bash
# Render a scene to a full-quality mp4 in parallel segments, then join them and add the audio.
#   video/lib/render-parallel.sh <scene.js> <song dir> <audio.mp3> <out.mp4> [jobs=8] [fps=30] [width=1080]
# Run from the repo root on a machine with Playwright and ffmpeg (set FFMPEG if it isn't on PATH).
set -euo pipefail
scene=$1 song=$2 audio=$3 out=$4 jobs=${5:-8} fps=${6:-30} w=${7:-1080}
ff=${FFMPEG:-ffmpeg}
dur=$("$ff" -i "$audio" 2>&1 | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | awk -F: '{print $1*3600+$2*60+$3}')
total=$(awk -v d="$dur" -v f="$fps" 'BEGIN{print int(d*f)}')
tmp=$(mktemp -d)
echo "rendering $total frames at ${w}px in $jobs segments"
for ((i = 0; i < jobs; i++)); do
  a=$(( total * i / jobs )); b=$(( total * (i + 1) / jobs ))
  node video/lib/render.mjs --scene "$scene" --song "$song" --w "$w" --fps "$fps" \
    --frames "$a:$b" --video "$tmp/seg$i.mp4" --crf 17 > "$tmp/log$i.txt" 2>&1 &
done
wait
for ((i = 0; i < jobs; i++)); do echo "file '$tmp/seg$i.mp4'"; done > "$tmp/list.txt"
"$ff" -y -loglevel error -f concat -safe 0 -i "$tmp/list.txt" -i "$audio" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$out"
grep -h -i "error" "$tmp"/log*.txt | head -5 || true
rm -rf "$tmp"
echo "$out"
