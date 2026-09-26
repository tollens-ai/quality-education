#!/usr/bin/env bash
# Tile consecutive frames of a video into one image: a frame strip at 30 fps across a cut, or a
# contact sheet at 1 fps across a stretch of the film.
#
#   bash video/lib/strip.sh <video> <start s> <seconds> <fps> <out.jpg> [cols=10] [tile width=160]
set -euo pipefail
v=$1 s=$2 d=$3 fps=$4 out=$5 cols=${6:-10} tw=${7:-160}
n=$(awk -v d="$d" -v f="$fps" 'BEGIN{print int(d*f)}')
rows=$(( (n + cols - 1) / cols ))
ffmpeg -loglevel error -y -ss "$s" -t "$d" -i "$v" -vf "fps=$fps,scale=$tw:-1,tile=${cols}x${rows}:padding=4:color=white" -frames:v 1 -q:v 3 "$out"
echo "$out"
