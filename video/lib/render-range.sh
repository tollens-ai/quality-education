#!/usr/bin/env bash
# Render one stretch of a scene to an mp4 with its audio, in parallel segments: a proof of a few
# seconds at full size, without rendering the whole song.
#   video/lib/render-range.sh <scene.js> <song dir> <audio.wav> <out.mp4> <from s> <to s> [jobs=3] [fps=30] [width=1080]
# Frame k of the song is at k/fps, so a range's frames match the same frames of a full render.
# Run from the repo root on a machine with Playwright and ffmpeg (set FFMPEG if it isn't on PATH).
set -euo pipefail
scene=$1 song=$2 audio=$3 out=$4 from=$5 to=$6 jobs=${7:-3} fps=${8:-30} w=${9:-1080}
ff=${FFMPEG:-ffmpeg}
f0=$(awk -v a="$from" -v f="$fps" 'BEGIN{printf "%d", a*f + 0.5}')
f1=$(awk -v a="$to" -v f="$fps" 'BEGIN{printf "%d", a*f}')
total=$(( f1 - f0 ))
tmp=$(mktemp -d)
echo "rendering frames $f0-$f1 ($total) at ${w}px in $jobs segments"
render_seg() {
  local i=$1 a=$(( f0 + total * $1 / jobs )) b=$(( f0 + total * ($1 + 1) / jobs ))
  for try in 1 2 3; do
    node video/lib/render.mjs --scene "$scene" --song "$song" --w "$w" --fps "$fps" \
      --frames "$a:$b" --video "$tmp/seg$i.mp4" --crf 17 --out "$tmp/o$i" > "$tmp/log$i.txt" 2>&1 || true
    [ -s "$tmp/seg$i.mp4" ] && return 0
    echo "segment $i failed on try $try; retrying" >&2
    sleep 3
  done
  echo "segment $i failed three times; see $tmp/log$i.txt" >&2
  return 1
}
pids=()
for ((i = 0; i < jobs; i++)); do render_seg "$i" & pids+=($!); sleep 2; done
ok=1
for p in "${pids[@]}"; do wait "$p" || ok=0; done
[ "$ok" = 1 ] || { echo "some segments failed; keeping $tmp" >&2; exit 1; }
for ((i = 0; i < jobs; i++)); do echo "file '$tmp/seg$i.mp4'"; done > "$tmp/list.txt"
"$ff" -y -loglevel error -f concat -safe 0 -i "$tmp/list.txt" -ss "$from" -t "$(awk -v n="$total" -v f="$fps" 'BEGIN{print n/f}')" -i "$audio" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$out"
echo "$out"
