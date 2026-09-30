# The Green Room

Episode 4 of *Software Quality Theory 101*: **“Did You Actually Test It?”** An original
Art Deco swing revue drawn and animated in JavaScript by Sol (Codex). The protagonist is an
original little GPT in an ivory face, teal waistcoat and top hat. Clawd joins the testing crew;
Tess supplies the human reason to care about a disappearing workout record.

The [liner notes](../../../episodes/04-video.md) describe the pictures, teaching claims,
checks and limitations. The [episode sheet](../../../episodes/04-did-you-actually-test-it.md)
contains the lyrics and expert notes. The selected recording's [timing notes](../../../music/ep04/listening-notes.md)
distinguish measurements from listening judgments.

## Render

Requires Node.js, Playwright's Chromium and ffmpeg. From the repo root:

```sh
npm install --no-save playwright
npx playwright install chromium
node video/lib/render.mjs --scene video/ep04/revue/main.js --song music/ep04 \
  --stills 14.2,78.0,145.8,161.6 --w 1080 --out video/out/ep04/stills
```

The recording is local and is excluded from git. With your own copy of the selected take:

```sh
bash video/ep04/revue/tools/render-film.sh take.mp3 video/out/ep04/master.mp4 3 1080
```

This renders 5,796 frames at 30 fps, 1080×1920, in three segments, checks their decoded frame
counts, joins them and adds the original recording with eight seconds of silence for the end
card. The frame-floor duration is 193.200 seconds. A width of 540 makes a smaller preview.
The take's measured pulse is about 98.936 BPM; the nominal 132 BPM was its generation prompt.
The animation uses explicit beat positions to follow the recording's tempo drift.

Inspect the actual browser lettering and the 31 couplets:

```sh
node video/ep04/revue/tools/inspect.mjs --audit 1 --sheet 1 --out video/out/ep04/audit
node video/lib/render.mjs --scene video/ep04/revue/thumbnail.js --song music/ep04 \
  --stills 0 --w 1080 --out video/out/ep04/poster
```

For interactive playback, serve the repository and open
`video/lib/player.html?scene=/video/ep04/revue/main.js&song=/music/ep04&audio=/take.mp3&w=540`.
Space plays/pauses; arrow keys step; the bar seeks. `render=1` disables the playback loop for
deterministic frame capture. The recording path should point to your local copy.

## How the drawing works

| File | Responsibility |
|---|---|
| `paint.js` | Matte palette, original contour primitives, held grain, drift-aware musical clock |
| `cast.js` | Sol, the Clawds and people; eyes, mouths, articulated limbs, clothes and held tools |
| `world.js` | Theatre, gym, painted flats, calculators, browsers, phones and paper props |
| `lyrics.js` | Measured word arrivals, paired phrases, short finishing rows at rapid joins, audit records |
| `boast.js` | The perfect score, copied calculations, changed screenshot expectation and schoolroom reward |
| `gym.js` | The full offline-save investigation and the check it produces |
| `ensemble.js` | Three different chorus stagings; briefing, chat, order and evidence-sharing scenes |
| `lesson.js` | The definitions, specific finding, remaining question and practical end card |
| `main.js` | Font/image loading, vocal mouth envelope, scene selection, framing and corner marks |
| `thumbnail.js` | The composed poster |
| `tools/` | Browser inspection and film rendering |

Frames are functions of song time. Actors draw on twos; lettering and framing use continuous
time. The same frame can be sought directly without replaying any earlier action. Stationary
paper grain stays stationary; colours do not flash between drawings.

Lyrics arrive from the vocal alignment, not the beat grid. The words are arranged in couplets
so a rhyme and its explanation can stay together. When a quick transition would erase a final
word too soon, that phrase's last words move into a finishing row and stay through 700 ms after
their onsets. `window.__wordRecords` exposes each visible word's position, size, opacity and
source interval to the inspection tool.

## Assets and credit

Characters, scenery, props and movement are original JavaScript drawings. There is no generated
raster artwork or generated video. The exceptions to drawing are typography and Sol's lapel
pin: the official OpenAI Blossom SVG, supplied unaltered, is a small badge on an original
character. Clawd is Anthropic's Claude Code mascot, adapted to this film's drawing style.
Appearance does not imply endorsement by either company.

Fraunces, Josefin Sans and Limelight are from the Google Fonts repository. Their SIL Open Font
License notices are beside the fonts. Code is MIT; content is CC BY 4.0, as in the repository's
licences. [SOURCES.md](../../../SOURCES.md) credits the lesson's ideas.
