#!/usr/bin/env bash
# Tile a folder of stills, in time order, into <dir>/sheet.jpg, each labelled with its time. The
# stills are named as render.mjs writes them (<scene>-<seconds>.png). At a tile width of 390 the
# sheet shows the frames at phone size.
#
#   bash video/lib/sheet.sh <dir> [cols=3] [tile width=360]
set -euo pipefail
d=$1 cols=${2:-3} tw=${3:-360}
cd "$d"
mapfile -t files < <(ls *.png | grep -v sheet | sort -t- -k2 -g)
n=${#files[@]}
th=$(( tw * 16 / 9 ))
ins=(); f=""; s=""; lay=()
for i in "${!files[@]}"; do
  ins+=(-i "${files[$i]}")
  label=$(echo "${files[$i]}" | sed -E 's/.*-([0-9.]+)\.png/\1/')
  f+="[$i]scale=$tw:$th,drawtext=text='$label':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6[v$i];"
  s+="[v$i]"
  lay+=("$(( (i % cols) * (tw + 6) ))_$(( (i / cols) * (th + 6) ))")
done
IFS='|'
if [ "$n" -gt 1 ]; then
  ffmpeg -loglevel error -y "${ins[@]}" -filter_complex "${f}${s}xstack=inputs=$n:layout=${lay[*]}:fill=white" -q:v 3 sheet.jpg
else
  ffmpeg -loglevel error -y "${ins[@]}" -vf "scale=$tw:$th" sheet.jpg
fi
echo "$d/sheet.jpg"
