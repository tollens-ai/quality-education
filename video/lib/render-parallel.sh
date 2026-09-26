#!/usr/bin/env bash
# Render a scene to a full-quality mp4 in parallel segments, then join them and add the audio.
#   video/lib/render-parallel.sh <scene.js> <song dir> <audio.mp3> <out.mp4> [jobs=4] [fps=30] [width=1080]
# Each job is a Chromium plus a 4-thread x264; mind the container's thread cap
# (cat /sys/fs/cgroup/pids.max) when raising jobs.
# Run from the repo root on a machine with Playwright and ffmpeg (set FFMPEG if it isn't on PATH).
# Segments start a few seconds apart, and any segment that fails or comes up short is re-rendered
# (up to three tries), so one crashed browser can't leave a hole in the video.
set -euo pipefail
scene=$1 song=$2 audio=$3 out=$4 jobs=${5:-4} fps=${6:-30} w=${7:-1080}
ff=${FFMPEG:-ffmpeg}
# `ffmpeg -i` with no output exits 1 by design, so don't let pipefail treat that as an error.
dur=$( ("$ff" -i "$audio" 2>&1 || true) | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | awk -F: '{print $1*3600+$2*60+$3}')
total=$(awk -v d="$dur" -v f="$fps" 'BEGIN{print int(d*f)}')
tmp=$(mktemp -d)
echo "rendering $total frames at ${w}px in $jobs segments"

# Count by decoding (with -c copy ffmpeg prints no frame count); it writes progress with carriage
# returns, so split on those before reading the last count.
frames_in() { ("$ff" -i "$1" -map 0:v:0 -f null - 2>&1 || true) | tr '\r' '\n' | sed -n 's/.*frame= *\([0-9]*\).*/\1/p' | tail -1; }
render_seg() {
  local i=$1 a=$(( total * $1 / jobs )) b=$(( total * ($1 + 1) / jobs ))
  for try in 1 2 3; do
    node video/lib/render.mjs --scene "$scene" --song "$song" --w "$w" --fps "$fps" \
      --frames "$a:$b" --video "$tmp/seg$i.mp4" --crf 17 > "$tmp/log$i.txt" 2>&1 || true
    [ -s "$tmp/seg$i.mp4" ] && [ "$(frames_in "$tmp/seg$i.mp4")" = "$(( b - a ))" ] && return 0
    echo "segment $i (frames $a-$b) failed on try $try; retrying" >&2
    sleep 3
  done
  echo "segment $i failed three times; see $tmp/log$i.txt" >&2
  return 1
}

pids=()
for ((i = 0; i < jobs; i++)); do render_seg "$i" & pids+=($!); sleep 3; done
ok=1
for p in "${pids[@]}"; do wait "$p" || ok=0; done
[ "$ok" = 1 ] || { echo "some segments failed; keeping $tmp for inspection" >&2; exit 1; }
for ((i = 0; i < jobs; i++)); do echo "file '$tmp/seg$i.mp4'"; done > "$tmp/list.txt"
"$ff" -y -loglevel error -f concat -safe 0 -i "$tmp/list.txt" -i "$audio" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$out"
rm -rf "$tmp"
echo "$out"
