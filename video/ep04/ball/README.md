# Episode 4 video (piano take): "Press, Stress & Guess"

The renderer for the piano take's film of "Did You Actually Test It?": a rubber-hose sing-along
cartoon of about 1930, polished with a modern eye for character design, drawn entirely in JavaScript
with Canvas 2D in headless Chromium. Every frame is a pure function of song time. The style is
described in [style-rubber-hose.md](../../../.claude/skills/music-video/references/style-rubber-hose.md),
and the film's liner notes, storyboard and checks are in
[episodes/04-video-piano.md](../../../episodes/04-video-piano.md). Only the render harness in
`video/lib/` and the measurements in `music/ep04/piano/` are shared with other films.

This draws the film Qing posted on 2026-10-01, its fifth version. The first (commit fff0345) was
drawn in one night; Qing liked its idea and characters and found its lettering and backgrounds
sloppy. The second (commit 73930a2) redrew the cast, repainted every place and storyboarded every
line again under one rule for the frame: one subject in the centre, the lyric just below it, and no
words on screen that aren't sung. The third filled the whole frame (each place paints its foreground
below the floor line, and close-ups fill the frame), told the story on one app (Mabel's gym app,
`gymapp.js`), and gave the testers a mark of their own, the "?!" sticker. The fourth redrew Guess as a
detective, brought the audience to life and found truer examples of an oracle and a judgement call.
The fifth made the crowd move together instead of waving gloves, and gave "they" a face: a cheerful
trainer in a lab coat.

## Render

From the repo root, on a machine with Playwright's Chromium and ffmpeg:

```
node video/lib/render.mjs --scene video/ep04/ball/main.js --song music/ep04/piano --stills 10.6,63.6 --w 1080
node video/lib/render.mjs --scene video/ep04/ball/main.js --song music/ep04/piano --stills 64 --w 540 --query part=verse2
node video/lib/render.mjs --scene video/ep04/ball/look.js --song music/ep04/piano --stills 1 --w 1080 --query v=cast
```

`--query part=<names>` draws only those parts (comma-separated) and is much faster for checking one
stretch. `look.js` holds the character sheets (`v=cast`, `people`, `things`, `hero`).

The film is the take (182.6 s, not in git) plus eight seconds of end card in silence. Pad the take
(`ffmpeg -i take.m4a -af apad=pad_dur=8.2 take-padded.wav`), then render frames 0 to 5718 at 30 fps,
for example with `video/lib/render-parallel.sh video/ep04/ball/main.js music/ep04/piano take-padded.wav
out.mp4 3 30 1080`, or a stretch with `video/lib/render-range.sh` (`QUERY=part=...` for one part).

## Checks

- `node video/ep04/ball/tools/text-audit.mjs --from 0 --to 191 --step .25` records every
  `fillText` and `strokeText` and reports any lettering that isn't the lyric, the corner marks, the
  title on the curtain, digits in the verse-1 sum or the end card's credits. It must print "no
  stray lettering".
- `node video/ep04/ball/tools/typo-audit.mjs --from A --to B --step .1 > audit.jsonl` records every
  sung word's box, size and opacity every tenth of a second; `tools/typo-report.py
  music/ep04/piano/lyrics.json audit*.jsonl` judges arrival, hold, size, the frame's margins and the
  phone apps' button zones.

## Files

| File | What it holds |
|---|---|
| `main.js` | Loads the record, registers each part's shots, draws a frame: picture, joins, lyric, film finish, corner marks |
| `kit.js` | Maths, noise, colour; the drawing clock (on twos, 12 drawings a second); the record (beats, piano stabs, voice, the sung words and the backing echoes) |
| `palette.js` | The palette; `C()` drains colour to sepia in the breakdown, except colours marked `'!'` to keep it |
| `ink.js` | The cel: outlines as points, the boiling brush `line()`, `shape()` with its soft rounded `form()` shading and hard highlight, hose limbs, gloves, pie-cut eyes, shoes |
| `rig.js` | Shared acting: blinks, the bounce on the beat, arms and legs, singing mouths, brows, cheeks, sweat, hearts, stars, drawn question and exclamation marks |
| `clawd.js`, `crew.js`, `people.js`, `cast.js` | The characters: Clawd (boater, beanie for the fresh bots, pith helmet; cane); Guess, Press, Stress and the wind-up check; Mabel and the animal townsfolk; the phones with faces, the router that is "the net", the comma, the bug, the magnifying glass |
| `gymapp.js` | The one app in the film: the pink phone (`gymPhone`), the app's header, its pages (`codeScreen`, `sumScreen`, `chatScreen`), and the testers' `sticker` ("?!") |
| `props*.js` | Props by part: `props.js` (code as coloured bars, the pasted decal, digits for the sum), `props-workshop.js` (calculator and greeting screens, the bellows camera and its flash, the photo, the crate), and each builder's own |
| `bg.js` | The painting kit for the places: washes with granulation and dried rims, glazes, light pools, gloom, cast shadows, brush streaks, dabs, the background's thin line, paper |
| `places*.js` | The painted places, each baked once, each with its foreground painted into the frame's lower band (dark under the lyric): `places.js` (the workshop, its door wall, the theatre and its curtain, and `audience()`, the silhouetted crowd the theatre and the circus share, with `audienceLive()` and `stallsAboveLive()` to draw it live, bopping on the beat as the show warms up), `places-cutaways.js` (circus, schoolroom, factory), and the gym, office and bare stage in their own files (the bare stage's stalls are drawn live, to follow its spotlight) |
| `type.js`, `lyrics.js` | Lettering; the lyric's one place (one sung line, two rows at most, just below the middle), the bouncing ball, speech bubbles for quoted lines, the backing echoes as a glow on the lead's words |
| `film.js`, `shots.js`, `common.js` | The print's finish; shots and joins; cameras framed by a floor line, irises for joins and for growing out of a lens, an offscreen layer for backlit silhouettes, confetti, bursts and sparkles |
| `scenes/` | One file per part: `intro`, `verse1`, `cutaways`, `chorus1`, `verse2`, `chorus2`, `bridge`, `breakdown`, `chorus3`, `outro`, `endcard` |
| `tools/` | `text-audit.mjs`, `typo-audit.mjs`, `typo-report.py`, and `coverage.mjs` (every shot in order, and any gap or overlap) |
| `fonts/` | Corben and Lilita One, with their OFL licences |
