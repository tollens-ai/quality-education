#!/usr/bin/env bash
# Run the typography audit over the whole film in three parallel time ranges, join them, and
# write the report. Run from the repo root on a box with Playwright's Chromium.
#   bash video/ep02/mirror/tools/typo-run.sh <out dir>
set -euo pipefail
out=$1
mkdir -p "$out"
node video/ep02/mirror/tools/typo-audit.mjs --step 0.1 --w 540 --from 0 --to 59 > "$out/a.jsonl" 2> "$out/a.log" &
node video/ep02/mirror/tools/typo-audit.mjs --step 0.1 --w 540 --from 59 --to 118 > "$out/b.jsonl" 2> "$out/b.log" &
node video/ep02/mirror/tools/typo-audit.mjs --step 0.1 --w 540 --from 118 --to 175 > "$out/c.jsonl" 2> "$out/c.log" &
wait
cat "$out/a.jsonl" "$out/b.jsonl" "$out/c.jsonl" > "$out/audit.jsonl"
python3 video/ep02/mirror/tools/typo-report.py "$out/audit.jsonl" > "$out/report.md"
grep -ih "error" "$out"/*.log | head -5 || true
head -3 "$out/report.md"
