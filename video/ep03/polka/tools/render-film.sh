#!/usr/bin/env bash
# Render episode 3's whole film: 1080x1920 at 30 fps, the take plus six seconds of end card (the film's one
# deliberate stillness, held after the music ends). It pads the take with silence, then renders in parallel
# segments with video/lib/render-parallel.sh.
#
#   bash video/ep03/polka/tools/render-film.sh <take.wav|mp3|m4a> <out.mp4> [jobs=3] [width=1080]
#
# Run from the repo root on a machine with Playwright's Chromium and ffmpeg (set FFMPEG if it isn't on PATH).
# A 540-wide preview (width 540) takes minutes; the 1080 master takes longer. Three jobs suits a box with
# 4 CPUs and 8 GB; more can crash a segment (the parallel script retries them).
set -euo pipefail
take=$1 out=$2 jobs=${3:-3} w=${4:-1080}
ff=${FFMPEG:-ffmpeg}
pad=$(mktemp --suffix=.wav)
trap 'rm -f "$pad"' EXIT
"$ff" -y -loglevel error -i "$take" -af "apad=pad_dur=6" "$pad"
bash video/lib/render-parallel.sh video/ep03/polka/main.js music/ep03 "$pad" "$out" "$jobs" 30 "$w"
