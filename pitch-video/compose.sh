#!/usr/bin/env bash
# Composites title cards + captioned demo steps into the final pitch video.
# Usage: ./compose.sh <outDir>   (after render-cards.js and record-demo.js wrote into <outDir>)
set -euo pipefail
O="$1"; X=0.5
enc=(-c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -r 30)
parts=()
for s in login feed projetos eventos portfolio; do
  ffmpeg -y -loglevel error -loop 1 -framerate 30 -i "$O/bg_$s.png" -i "$O/raw_$s.mp4" \
    -filter_complex "[0][1]overlay=240:82:shortest=1" "${enc[@]}" "$O/step_$s.mp4"
  parts+=("file '$O/step_$s.mp4'")
done
printf '%s\n' "${parts[@]}" > "$O/demo.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$O/demo.txt" -c copy "$O/demo.mp4"

d() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
I=$(d "$O/intro.mp4"); P=$(d "$O/problem.mp4"); D=$(d "$O/demo.mp4")
o1=$(echo "$I-$X" | bc); o2=$(echo "$o1+$P-$X" | bc); o3=$(echo "$o2+$D-$X" | bc)
ffmpeg -y -loglevel error -i "$O/intro.mp4" -i "$O/problem.mp4" -i "$O/demo.mp4" -i "$O/outro.mp4" -filter_complex \
  "[0][1]xfade=transition=fade:duration=$X:offset=$o1[a];[a][2]xfade=transition=fade:duration=$X:offset=$o2[b];[b][3]xfade=transition=fade:duration=$X:offset=$o3,format=yuv420p[v]" \
  -map "[v]" "${enc[@]}" -movflags +faststart "$O/capyfolio-pitch.mp4"
echo "final: $(d "$O/capyfolio-pitch.mp4")s"
