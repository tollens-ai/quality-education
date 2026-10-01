# Episode 4 video (piano take): "Press, Stress & Guess"

The renderer for the second film of episode 4, made for the piano take of "Did You Actually Test
It?". A 1930s rubber-hose sing-along cartoon, drawn entirely in JavaScript with Canvas 2D in headless
Chromium; every frame is a pure function of song time. The style is described in
[style-rubber-hose.md](../../../.claude/skills/music-video/references/style-rubber-hose.md), and the
film's liner notes, storyboard and checks are in
[episodes/04-video-piano.md](../../../episodes/04-video-piano.md). Only the render harness in
`video/lib/` and the measurements in `music/ep04/piano/` are shared with other films.

## Render

From the repo root, on a machine with Playwright's Chromium and ffmpeg:

```
node video/lib/render.mjs --scene video/ep04/ball/main.js --song music/ep04/piano --stills 10.6,63.6 --w 1080
node video/lib/render.mjs --scene video/ep04/ball/main.js --song music/ep04/piano --stills 64 --w 540 --query part=verse2
node video/lib/render.mjs --scene video/ep04/ball/look.js --song music/ep04/piano --stills 1 --w 1080 --query v=crew
```

`--query part=<names>` draws only those parts (comma-separated) and is much faster for checking one
stretch. `look.js` holds the character sheets (`v=clawd`, `crew`, `people`, `hero`).

The film is the take (182.6 s, not in git) plus eight seconds of end card in silence. Pad the take
(`ffmpeg -i take.m4a -af apad=pad_dur=8.2 take-padded.wav`), then render frames 0 to 5718 at 30 fps,
for example with `video/lib/render-parallel.sh video/ep04/ball/main.js music/ep04/piano take-padded.wav
out.mp4 3 30 1080`. The master Qing saw was rendered as six segments over three machines.

## Files

| File | What it holds |
|---|---|
| `main.js` | Loads the record, registers each part's shots, draws a frame: picture, joins, lyric, film finish, corner marks |
| `kit.js` | Maths, noise, colour; the drawing clock (on twos at 12 drawings a second); the record (beats, piano stabs, voice, the sung words and the backing echoes) |
| `palette.js` | The two-colour palette; `C()` drains colour to sepia in the breakdown, except colours marked to keep it |
| `ink.js` | The cel: outlines as points, the weighted boiling brush `line()`, flat `paint()`, `shape()` with its shade and gloss, hose limbs, gloves, pie-cut eyes, shoes |
| `rig.js` | Shared acting: blinks, the groove on the beat, arms and legs, mouths, sweat, hearts, stars |
| `clawd.js` | Clawd, his boater and his cane |
| `crew.js` | Guess, Press, Stress, and a check (the wind-up toy with a rule card and a flag) |
| `people.js` | Mabel and the small parts (Pat, Sam, me, the customer) |
| `props*.js` | Props, by part: `props.js` (the magnifying glass), `props-v1.js` (the app register, paste, camera, comma, bell...), `props-crew.js` (notebook, abacus, rosette, bulb, trails), `props-gym.js` (phone, socket and cable, barbell, the STORE drawer), `props-bridge.js` (fresh bots, browser windows, playbook, signposts, the scale, lever, newspapers, telephone) |
| `paint.js`, `places.js` | Watercolour washes and the baked places: town square, workshop, circus, schoolroom, factory, gym, office (day and night), stage |
| `type.js` | Lettering: cream title-card letters with brush outline and drop shadow, per-letter wobble |
| `lyrics.js` | Couplet blocks, balanced row breaks, the bouncing ball, the backing echoes |
| `film.js` | Gate weave, flicker, vignette, the iris |
| `shots.js`, `common.js` | Shots and joins; cameras framed by a floor line; small effects (confetti, bursts, sparkles, bubbles), crowds of checks as sprites |
| `scenes/` | One file per part: `title`, `intro`, `verse1`, `verse1b`, `chorus1`, `verse2`, `chorus2`, `bridge`, `bridge2`, `breakdown`, `chorus3`, `outro`, `endcard` |
| `tools/` | `typo-audit.mjs` records every lettered word every 0.1 s; `typo-report.py` judges arrival, hold, size and the safe area |
| `fonts/` | Corben, Lilita One and Oleo Script, with their OFL licences |
