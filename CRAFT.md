# Video craft brief

Research pass 2026-09-24. Learning-science findings are the strongest evidence; X-specific numbers
come from marketers and are weak.

## Principles
1. **Misconception first, then refute it.** Muller (Veritasium PhD): clear explanations raised
   confidence but not learning; stating then refuting the wrong belief produced learning.
2. **Concrete before abstract, and lots of concrete** (Sanderson/3B1B; Qing 2026-09-24: "every
   concept illustrated with lots of concrete examples so that people can ground on recognisable
   reality"). Use several everyday cases per concept, taken from what vibecoders actually build,
   not a single tidy example.
3. **Sound-off first.** X autoplays muted; captions are the primary track. Captions = narration;
   other on-screen text limited to highlighted keywords (resolves Mayer's redundancy principle).
4. **First frame is the hook and the thumbnail.** Tension, not a title card.
5. **Retention is the constraint, not idea count** (Qing 2026-09-24: more than one idea is fine if
   people keep watching for both). Short is still the default — Guo/Kim/Rubin 2014 (edX): shorter,
   faster, more enthusiastic held better; Fireship "100 seconds" is the dev-audience benchmark. A
   second idea needs its own hook: a new open loop before the first one closes.
6. **Fixed internal structure** per episode: misconception → concrete failure → concept named →
   what you'd say to your agent.
7. **Fixed visual vocabulary:** one glyph/colour per concept, stable across the series.
8. **Standalone episodes, continuity via running app + recurring characters.**
9. **In-group texture:** real-looking agent screens ("✅ All tests pass", "I've fixed the issue!").
10. **Design for replies:** close on a debatable question; author replies (X ranking weighted replies
    far above watch time in the 2023 release; current weights are learned and unpublished).
11. **Format:** master 9:16, responsive layouts so 16:9 and 1:1 render from the same source; keep
    bottom ~400px and right ~140px clear of UI. Clean per-platform exports, no platform watermarks; the only mark is a tiny static Tollens logo (Qing, 2026-09-24).

12. **Music as a hook** (Qing 2026-09-24: Opus-made animated music videos, songs and raps are
    trending on X). This fits the sound-off rule: in a music video the lyrics are the captions,
    so the video still works on mute and works better with sound. A chorus can also carry the
    episode's one line, like "tests pass, bug ships", so viewers remember it.

    How the current trend works (examples from the Opus 5.5 launch, 2026-09-22):
    - Opus writes the storyboard, the lyrics and a JS renderer (p5.js + p5.brush, WebGL2 or
      Canvas2D). Each frame is drawn from the song's playback time.
    - Headless Chrome captures the frames and ffmpeg muxes in the audio.
    - Suno sings the vocals. Demucs separates the vocals and Whisper aligns the lyrics word by word
      for karaoke captions.
    - Look: painterly or pixel art, with cute recurring characters. The songs are 75–160s and
      almost always about AI.
    - Engagement seems to come from forkable open-source repos and "no assets, all code" framing.
    - Examples: [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo),
      [functional-emotions-video](https://github.com/rrostt/functional-emotions-video).
    - All-code audio has been done, vocals included (example Qing shared 2026-09-24): a pop-punk
      band synthesised sample by sample in the browser. Guitars are Karplus–Strong strings through
      tube-amp and cabinet models; drums are modelled drum heads and partials; the singer is a
      formant synthesiser reading a phonetic lyric sheet. Checks: per-instrument loudness against
      genre norms, spectrograms, and Whisper transcribing the vocal. Its own verdict: "robot with a
      cold". Its liner notes say how it was checked and where it falls short.
    - External synthesis (Suno, voice models) is also an option.
    - No software-quality or rap examples found. Educational ones (history films) were not fact-checked.

## Build techniques to learn from

From 16 open-source repos released around the Opus 5.5 launch. The inventory is local and not
committed. Several of the repos state no licence, which means all rights reserved: we learn from
them and don't copy them. We design our own style.

- **Timing by "reads".** List what the viewer must understand in each shot, give each item its own
  time, and don't overlap them. Then render contact sheets and actually look at the frames.
  ([ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase), MIT)
- **One event list drives sound and picture.** Because we synthesise the song, the drum hits and
  syllables *are* the cue list for visuals and captions, so word timing is exact without an
  alignment step. Whisper then checks that the vocal is intelligible.
  ([claude-paper-animation](https://github.com/eeselapp/claude-paper-animation),
  [clawd-7-8](https://github.com/tanuu5/clawd-7-8))
- **Captions as a designed layer.** A word-by-word wipe in a band kept clear of the action,
  inside the 9:16 safe zone. ([claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill), MIT)
- **A rig and emotion library for the recurring character.** Drawn key views, acted transitions
  (anticipation, take, overshoot), and a style guide written for the subagents that each own one
  chapter file. (ClaudeAnimationBase)
- **Verified on-screen citations.** QR-code footnotes, tested so they scan.
  ([curtcox/PDoomVideo](https://github.com/curtcox/PDoomVideo))
- **Pure-code music.** Karplus–Strong strings and formant voices.
  ([sonora](https://github.com/aaronprater146-max/sonora), MIT)
- **Compose for 9:16 from the start.** Every repo found renders at 1920×1080, so vertical is new
  ground and can't be done by cropping.

## Pre-production

Research pass 2026-09-25 on how animation, music-video and creator studios catch problems early;
the full report, with which quotes were checked, is [research/studio-pre-production.md](research/studio-pre-production.md).
The process built from it (archived as not working) is in [archive/ep01-video-v1/](archive/ep01-video-v1/process-storyboard-guide.md).
- **A full-length rough cut on the real track, rebuilt many times, is the cheap test.** Disney
  story artists redo reels "over and over so other departments won't have to" and screen about
  seven times ([Kennedy](http://storystruggles.blogspot.com/2021/01/mark-kennedy-disney-story-process.html)).
  At The Simpsons, "once it's in color, the cost of changing too much is prohibitive"
  ([Fox](https://www.foxnews.com/story/simpsons-gets-ready-for-16th-season.amp)).
- **Package first.** MrBeast's production guide: know the title and thumbnail before making the
  video ([Willison](https://simonwillison.net/2024/Sep/15/how-to-succeed-in-mrbeast-production/)).
  Paddy Galloway: a great idea "has to be easy to convey in a title thumbnail"
  ([Creator Science](https://podcast.creatorscience.com/paddy-galloway-2/)).
- **Many cheap concepts, few treatments.** Music-video pitching asks for a one-page concept, then
  narrows to a few ideas before anyone writes a full treatment
  ([guidelines PDF](https://static1.squarespace.com/static/5b9170e2c258b4ff66f30981/t/5d38e18684eee2000124c481/1564008838776/Pitching+Process+-+GUIDELINES+AND+BEST+PRACTICES+FOR+MUSIC+VIDEO+PROJECTS+(2019.07.24).pdf)).
- **Fresh eyes, notes without authority.** Pixar's Braintrust: "early on, all of our movies
  suck" ([Pixar Post](https://pixarpost.com/2014/03/the-pixar-braintrust-excerpt-from-ed.html)).
- **One-shot videos turn the song's structure into the world:** one dancer group per instrument
  ([Around the World](https://en.wikipedia.org/wiki/Around_the_World_(Daft_Punk_song))), the
  landscape as the score, plotted on graph paper first
  ([Star Guitar](https://en.wikipedia.org/wiki/Star_Guitar)), a loop that gains a copy each time
  ([Come Into My World](https://beforesandafters.com/2026/03/24/olivier-gondry-on-the-making-of-kylie-minogues-come-into-my-world/)),
  one power of ten per 10 seconds ([Powers of Ten](https://en.wikipedia.org/wiki/Powers_of_Ten_(film_series))).
  "This Too Shall Pass" was built in gated sections, and takes failed most often at the start of a
  chorus ([Wikipedia](https://en.wikipedia.org/wiki/This_Too_Shall_Pass_(OK_Go_song))).
- **Model viewers are unvalidated.** Gemini samples video at 1 fps by default and loses detail in
  fast action ([docs](https://ai.google.dev/gemini-api/docs/video-understanding)); no source
  shows model audiences predict human retention. Use them as a smoke test.
- **Shorts can't be A/B tested** ([YouTube](https://support.google.com/youtube/answer/13861714)),
  so the post-release loop is a log of hypotheses, not experiments.

## Sources
Muller thesis notes: https://www.bobvanvliet.com/notes/designing-effective-multimedia-for-physics-education/
Guo, Kim & Rubin 2014: https://dl.acm.org/doi/10.1145/2556325.2566239
Mayer 2021: https://www.sciencedirect.com/science/article/abs/pii/S2211368121000231
X 2023 ranking weights: https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md
X vertical player: https://wersm.com/x-goes-all-in-on-vertical-video-with-a-new-immersive-player/
Fireship format: https://read.engineerscodex.com/p/how-fireship-became-youtubes-favorite

## Decided
- Audio: all code, including vocals (Qing 2026-09-24). An external voice is the fallback.
- Every episode ships liner notes: how it was checked, where it falls short.
- ~~Episode 1 is one shot~~ (Qing, 2026-09-25). Withdrawn with the v1 build on 2026-09-26: the
  continuous camera made that video dizzying. See
  [archive/ep01-video-v1/](archive/ep01-video-v1/README.md).
- The singer is Claude (Qing, 2026-09-25: "also I want the singer to be claude!"), as the Claude
  Code crab ("because it's coding we could go for the claude code crab. but using the symbol is
  fine").
- The ambition brief is for its level of ambition, not its style (Qing, 2026-09-25: "I didn't want
  the style specifics from the prompt, more the level of ambition").
- Corner marks: "@yanqingcheng" in one corner and "∴ tollens" (the Tollens logo is the therefore
  sign) in the other, very small, in the video's own font (Qing, 2026-09-25). They replace the
  single Tollens mark in principle 11.
- Real bots appear as themselves: "for the bot characters you incorporate their actual, like
  classic symbols or logos or mascots" (Qing, 2026-09-25).

## The bar for craft
Qing shared a public example (2026-09-24) of the ambition and care we're aiming for: a creator's
brief for an AI-made music video (Donald Jewkes on X). We don't copy its style. What carries over:
- **Do the thinking first.** Plan composition and timing rigorously before generating anything,
  because pieces made without that planning clash when they're put together.
- **Build verification loops,** run them as often as needed, and check sync by measurement.
- **Watch the whole thing several times.** Take stills at individual moments and ask whether each
  one meets the bar; be willing to go back and redo.
- **Treat on-screen text as the main tool for holding attention.** Lyrics are sometimes subtitles
  and sometimes huge, and the shot is composed to leave room for them. The opening needs a strong
  visual hook, with the words at their most present.
- **Aim past "good enough".** The target is a banger for the audience it's made for, and the
  stretch goal is something better than anyone has seen. Study the best work in the form (music
  videos, motion design) before settling on an approach, and avoid generic "AI slop" styling.
- **Spend effort aggressively but economically.** Budget is there to be used on quality; choose
  where it goes.
- **Know your real capabilities and design to them.** Pick a style and a toolchain that play to
  what the tools do well, rather than fighting their weak spots.

## Open decisions
Aspect ratio master · voice (human / synthetic / text-only) · length cap · characters and running
app · visual vocabulary · how much episodes reference each other · episode order (foundation vs
strongest hook first) · takeaway format · success metric · toolchain (multi-aspect + burned captions).
