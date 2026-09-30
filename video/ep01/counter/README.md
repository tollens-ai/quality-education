# "The Counter" — episode 1, an alternative video

**Status (2026-09-30): a cut exists and has been checked, but I would not hand it to Qing yet.**
One auteur, no committee, drawn from a blank page: episode 1's song ("Good for Who?", the locked
MiniMax take) with a world nobody else drew for it. It is deliberately *not* [the pier](../pier/),
and it borrows nothing from episodes 2 or 3's films.

This file is the film's own record: what it is, how it is drawn, what was measured, and what is
still short of the bar. Written from the built film, not from the plan.

## The idea

The song is an agent told "make it good" that hits it with every best practice it knows, without
anyone saying who the thing was for. Its bridge sings *to write code and throw it over the wall*,
and that phrase is the film.

So the film is a **depot counter**. Clawd works behind a wall, in an opening, and can only get
things out through it: every crate he builds has to go up and over the top of the wall and come down
in the street. That is what "throw it over the wall" has to mean before the song says it, and it is
also the lesson — work made to pass a checkpoint nobody at the other end is holding their hands out
for. On this side of the wall nothing has an address, because nobody on this side said who anything
was for.

The film's one object is a **blank customs form**: empty through verse 1, ruled during the bridge,
filled in with handwriting in the last pre-chorus, and the thing the outro answers.

And its one idea about quality: **a rubber stamp is a mark that says a thing without checking
whether it is true.** Every word in the film arrives as a mark on a thing — a stamp, a stencil
sprayed through a plate, a marker gone over by hand, a printed label — and the accumulation of those
marks with nothing behind them is what the song is about. That keeps the series' own distinction
sharp: quality done as ritual, out of ignorance, not deliberate degradation.

## The look

- **Style:** stencilled and stamped. Manila ground, one heavy warm-black ink for outlines and type,
  one oxblood for the stamps, one petrol for the far side of the counter. Where two inks cross they
  print a third.
- **Type:** the film cuts its own. Every letter is 2–5 polylines on a unit em ([type.js](type.js)),
  drawn by the same pen as everything else, so the words overshoot and miss like the rest of the
  drawing. A geometric skeleton, because a rubber stamp needs no serifs and one weight. A specimen
  at 1080 is `look/specimen.js`.
- **The hand:** one nib ([kit.js](kit.js)). A stroke overshoots its corner, tapers into the paper,
  misses its own endpoint now and then, and its shape is a function of a seed, not of the frame.
  Outlines boil on twos; fills hold still, or the film flashes. One dial, `HAND.clumsy`, decides how
  wrong the drawing is.
- **The cast:** Clawd is a crab, because Clawd is a crab, and he is the only warm thing in a
  manila-and-ink world, so the eye always knows which side of the wall he is on. The people in the
  street are drawn the way a print draws people — one flat tint, a strong contour, two or three
  interior cuts. That is a look, not a dodge: a fully modelled person drawn from shapes shows its
  construction, and a crowd of those is worse than no crowd.
- **No band.** Nothing in this film is only a stage. Clawd sings and the words are the picture.

## How it's built

```
palette.js  type.js  kit.js        the ink, the ground, the alphabet, the pen
marks.js                         the stamp, the stencil, the marker, the label, the form
cast.js    world.js  props.js     Clawd, the people, the wall, the crates, the things a line names
camera.js  words.js                the shots' framing, and the lyric engine
scenes/a.js  b.js  c.js           the shots, cut to the sung lines
tools/                             the checks below, and the render
```

- **The renderer** is episode 1's, unchanged: [video/lib/render.mjs](../../../lib/render.mjs) draws
  a scene as a pure function of song time in headless Chromium and muxes the audio. A scene is a
  function of `t`; the song's own `beats.json` and `lyrics.json` are loaded against it.
- **Every word's time comes from the voice** — `music/ep01/lyrics.json`, measured on the locked
  take's vocal, not the beat grid. Words finish arriving 85 ms before their measured onset.
- **Cuts are on line boundaries.** The shot table is the 65 sung lines' start times, so a cut never
  lands inside a word.
- **The words are part of the picture.** A sung line is a mark on the thing that line is about, with
  one choreography throughout: land ahead of the voice, keep moving while up, a rule wiping in under
  the word being sung, the whole line held until the line is done.
- **The frame's vertical order is a contract**, written down in `world.js`: the wall 148–1170, hands
  reaching over the counter at 1270, the sung line on the street at 1420, the queue cropped at 2130.
  Verse 2's props are placed on one side of the lyric band or the other, never in it.

## What was measured

- **The audio.** Per-frame mix, vocal, kick and snare for the take (`audio.json`). The beat grid was
  checked against the take's own kick onsets: 165 of 247 within 120 ms, median error 6.8 ms. Section
  dynamics put the band drop at the final pre-chorus and the outro, which is why the film goes
  quiet and close there.
- **The typography audit** (`tools/audit.mjs`, `tools/typo-report.py`): every sung word, every tenth
  of a second, recorded by the shot that drew it — its box, size, opacity, mark — and judged on four
  things: fully up before it is sung, up long enough to read, big enough for a phone, and clear of
  the platform UI's corners. **386 words, 26 flags** on the last full run, of which 8 are a line's
  last word (where holding longer would put two lines in one band). It went 453 → 158 → 72 → 30 → 26
  over five passes, and it is what found the layout fault where the words were landing on the street
  in front of the crates. Its honest limits: it samples at 0.1 s so it cannot resolve an arrival
  finer than that, and words a shot letters by hand (the hook stamps, the inscription, the form's
  answers) have to record themselves or the audit silently skips them — which it did for 74 words
  until that was fixed, and it was the fix that made the coverage number trustworthy.
- **The motion check** (`tools/motion.py`, the same measurement as `video/lib/motion.py` but straight
  out of the renderer). It found the film's worst fault: **median change 1.01, with 38 of the first
  64 seconds near-still.** The world was drawn correctly and nothing moved. Every shot now has its
  own camera move from a cycle of eight (push, pull, pan, drift, slide), Clawd and the queue move on
  the beat with the chorus beating harder, and **median is 2.26 with no near-still second inside the
  film**. The still seconds that remain are the end card, which is meant to be still.
- **The master.** 6270 frames at 1080×1920, 30 fps, 209.0 s, verified by counting decoded frames
  rather than trusting the header. Stills pulled back out of the master are what the checks above
  were re-checked on.
- **The credits.** Episode 1 owes them on screen and they are there: the definition the break
  paraphrases (Weinberg · Bach & Bolton, via Ed Pringle's catalogue), Clawd is Anthropic's, the
  other bots' marks belong to the people who made them, and the film is not affiliated with or
  endorsed by any company shown. A line that needed a glyph the alphabet had not cut — the
  typographic apostrophe and the middle dot — was cut rather than spelled with question marks.

## Where it falls short

Stated plainly, because this is why it is not for Qing yet:

- **The film's middle is still repetitive.** Verse 2 is eight variations on one person and one crate,
  which is clear but monotonous; it wants its own grammar rather than eight turns of the same shot.
  The chorus is now loud and the hook grows each time, but it is still one idea three times.
- **Several shots are the wall with one thing on it.** Legible and on-brand, and the compositions
  are consistent to a fault. The camera moves now, which saved them, but the pictures could be more
  various — the bar asks for no shot type twice in a row and this film repeats its own.
- **The chorus could be much louder still.** It is the record's biggest moment and it is legible
  rather than thrilling.
- **Verse 2's props and the people who want them are one idea each** — a demo, a subscription, a
  joke, a tick, a phone, a speaker, a leak, a log. They read. They do not yet sing.
- **The break's inscription earns itself only just.** It lands in the frame, but it is the film's
  thesis stated rather than discovered, and a viewer who has not been paying attention will not feel
  the weight of it.
- **The "hands out" shots are the weakest thing in the film.** They took three attempts — a grey
  pillar, then a scribble, then a scalloped palm that reads — and they are still the pictures I would
  redraw first.
- **The audit's coverage is not yet complete.** It sees 386 of 417 sung words; the remainder are
  drawn by paths that still do not record themselves.
- **Not watched by anyone but me.** I have looked at frames and at a contact sheet, and the film has
  been measured, but I have not watched it move end to end at full size. That is the honest reason it
  is not ready: the checks can tell me a word lands on time, and cannot tell me whether it is moving.

## What Qing should decide

The film is built to my own taste and the five decisions that shaped it are recorded, not hidden:

1. **The stamp as the film's idea.** "Quality as ritual — a mark that says a thing without checking
   it" is the reading I built an episode on, because it is the series' own distinction and a rubber
   stamp *is* that. If it is too clever for a music video, the fix is a different container for the
   same story, not a redraw.
2. **The depot's dryness.** A customs counter is bureaucratic and dry. It matches the song's wry
   precision and it buys me the bridge's wall for free, but it is not a warm place, and this series
   so far has been. I kept the dryness and put the film's whole emotional weight into the last fifteen
   seconds, where the light goes warm. That is a judgement, and it is arguable.
3. **"Throw it over the wall" read literally** — crates go up and over the counter — and I made the
   wall *be* the boundary the song means, so it reads both ways at once. It is the same shape with a
   flatter content than the song's git push, and I chose the flatness because it is filmable.
4. **The bots.** "I'm someone too (and me! and me! and me!)" uses a star, a sun and a moon for the
   three "and me"s, and never a corporate mark redrawn in this style — per
   [research/bot-marks.md](../../../research/bot-marks.md), real marks are reproduced exactly or not
   at all, and classic symbols are always available.
5. **The end card runs eight seconds past the song** (209 s to a 200.74 s take), because the credits
   cannot be read in the 0.7 s the outro left.

## The story, shot by shot

The full table — every sung line, its time, three frames and the claim under it — is
[`tools/shots.json`](tools/shots.json), and `tools/storyboard.mjs` turns it and the built film into
the phone-readable sheets (`video/out/the-counter-storyboard.pdf`, 65 shots on 33 pages). The
headlines:

| Time | Line | Picture | What it says |
|---|---|---|---|
| 0.00 | You said make it good, so I made it good! | A brief arrives as a slip; Clawd stamps it APPROVED without looking for anything else on the page. | He did exactly what he was told, and the telling was the problem. |
| 4.52 | Confetti cannons, every time you floss | A crate goes up and over the wall and lands on somebody in the street, and goes off. | A real feature, delivered to nobody. |
| 8.00 | 2FA to use your gym log | The gym log in a crate with two padlocks. The queue cannot get in. | A best practice that locks out the people it was for. |
| 10.76 | Kubernetes scaling up your blog | One tiny shed on a crane hook, then the same shed again, and again. | Scaling applied to a thing nobody reads. |
| 13.20 | twelve subagents round the clock | Twelve stamps going round a clock face, the hands spinning. | Effort as a ritual. |
| 15.64 | Did I do it wrong? | The stamp hangs in the air, half way down. | The only stillness in verse 1. |
| 17.04 | Oops, your quota's gone! | The meter pegs and empties; the last word lands on an empty stamp. | The cost of the ritual. |
| 18.66 | Guess I didn't ask! | The blank form, close, with nothing on it. | The turn. |
| 20.80 | You didn't tell me who it's for | A hand from the street writes FOR on the wall; Clawd's side has no faces in it. | The question, asked from outside. |
| 22.32 | what they want | Hands out over the counter, empty, and WANT? sprayed on the wall. | |
| 27.20 | Make it good for who? | The hook as a wall of stamps on the counter, one word at a time, never cleared. | |
| 32.72 | Fast, or sturdy, or cheap? | A real balance with three crates on it, actually tipping. | The trades, as a diagram you can watch move. |
| 35.44 | Wow for a week, or built to keep? | A crate of fireworks next to a crate of bricks. | |
| 46.46 | Does what they need, or steals the show? | A spotlight, two people, one need. | Needs are what the whole film has lacked. |
| 51.00–72.48 | verse 2, the list of eight | One person and one thing each: a demo, a subscription, a joke, a tick, a big-button phone, a speaker, a leaking pipe, a log tape. | The second half is the users'; the last two lines are for the agent that has to fix it. |
| 112.30 | throw it over the wall | The camera goes to the top of the wall and the crates go up and over it. | The film's central shot. |
| 117.32 | how do you know what to build or test | The form again, one line ruled on it, nothing written in it. | |
| 128.80 | value to someone who matters | The film's one great stamp, in one hit, on the wall, in three lines. | The line to remember. |
| 137.48 | I'm someone too (and me! ×3) | Three marks land on the wall: a star, a sun, a moon. | The bots are users too. |
| 147.56 | please just tell me who it's for | Somebody's hand writes on the form, in handwriting, as it is sung. | |
| 160.50 | the last chorus | The hook again, and the stamps carry names: MUM, THE SHOP, MY TEAM, THE AGENT, NOBODY. | The question answered by being specific. |
| 184.84 | Make it good for you? | The only warm light in the film: a toy going over the counter into somebody's hands. | A toy is good for who asked for it. |
| 193.26 | Fine if it's gone when summer's done | Evening on the kerb, the toy gone, an empty crate, then the credits. | Permission, not a rule. |

## The files

- Master: `video/out/the-counter-master.mp4` — 185 MB, 1080×1920, 30 fps, 209.0 s, 6270 frames.
- Upload copy: `video/out/the-counter-upload-crf27.mp4` — 46 MB at CRF 27 (episode 3's 3:39 master was
  156 MB at that rate and looked the same on a phone; this film is flatter, so try 30 for 35 MB).
- Thumbnail: `video/out/the-counter-thumb.jpg`, taken at 133.6 s — the film's thesis stamp.
- Storyboard: `video/out/the-counter-storyboard.pdf`.
- Renders live in `video/out/`, which git ignores.

The audio this film is cut to is `.private/ep01-minimax/make-it-good-chosen.mp3`, the locked take,
200.74 s at 172.3 bpm, padded with silence to the film's 209 s. Local and not in git, as the repo's
convention has it.