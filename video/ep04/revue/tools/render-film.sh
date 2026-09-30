#!/usr/bin/env bash
# From the repo root, with Playwright Chromium and ffmpeg installed:
# bash video/ep04/revue/tools/render-film.sh <selected take.mp3> <out.mp4> [jobs=3] [width=1080]
set -euo pipefail
take=$1
out=$2
jobs=${3:-3}
width=${4:-1080}
pad=$(mktemp --suffix=.wav)
trap 'rm -f "$pad"' EXIT
ffmpeg -y -loglevel error -i "$take" -map 0:a:0 -vn -af 'apad=pad_dur=8' -c:a pcm_s24le "$pad"
bash video/lib/render-parallel.sh video/ep04/revue/main.js music/ep04 "$pad" "$out" "$jobs" 30 "$width"
