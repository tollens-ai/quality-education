#!/usr/bin/env bash
# Render "The Counter" to a master at 1080x1920 and 30fps, in parallel segments, then join and mux.
#   tools/render-film.sh [jobs]
#
# The film runs to CARD_END (209s), past the take's 200.74s, so the end card can be read. The audio
# is padded with silence to match, so the two do not drift.
set -euo pipefail
jobs=${1:-6}
scene=video/ep01/counter/main.js
song=music/ep01
root=$(cd "$(dirname "$0")/../../../.." && pwd)
cd "$root"
take=${TAKE:-.private/ep01-minimax/make-it-good-chosen.mp3}
end=209.0
audio=video/out/counter-audio.wav
out=video/out/the-counter-master.mp4

ffmpeg -v error -y -i "$take" -af "apad=pad_dur=$end" -t "$end" -ar 44100 -ac 2 "$audio"
# video/lib/render.mjs finds Playwright on NODE_GLOBAL, or in /usr/lib/node_modules. If it is
# somewhere else, set NODE_GLOBAL in the environment before running this.
NODE_GLOBAL=${NODE_GLOBAL:-/usr/lib/node_modules} \
  video/lib/render-parallel.sh "$scene" "$song" "$audio" "$out" "$jobs" 30 1080
echo "master: $out"
