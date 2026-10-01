# Sources

The ideas in this series come from three places.

## Ed Pringle's quality-brain
Ed's working notes on quality strategy, used with permission. They're public, in
[quality-brain](https://github.com/tollens-ai/quality-assistant-prototype-03/tree/main/quality-brain).
Where an episode uses one of his ideas, the video credits him on screen. From Ed:

- Quality is value to someone (or something) who matters. This builds on Jerry Weinberg ("value to
  some person") and James Bach and Michael Bolton ("who matters")
- Testing is investigation to find out what's actually true; checking is only part of it
- "Test phase" is a terrible idea and should not exist
- Risk is danger to quality; unknown risk costs money to find, known risk costs money to fix
- The risk map: confidence on both what's required and what's actually there
- The economics of testing: the most valuable skill is deciding what to test
- Proxies are not quality; agents game metrics faster than humans
- Unpack, don't collapse: the "trenchcoat" problem
- Four levels of learning from a bug

## Yanqing Cheng's writing
Published articles on X:

- *What even is a bug anyway* (2026-08-25)
- *There is no mainline user* (2026-04-16)
- *Agentic coding and the problem of oracles* (2026-02-06), first written as a guest post for Ed Pringle's blog
- *Catching the wave I almost missed* (2026-02-09)

## Martin Davidson's writing
[0x4d44.substack.com](https://0x4d44.substack.com)

- [No comments allowed](https://0x4d44.substack.com/p/no-comments-allowed) (2026-03-31): "what"
  comments go stale and mislead agents; "why" comments matter more than ever; intent belongs in
  README, CLAUDE.md or AGENTS.md

Other people's views on agentic engineering are welcome when they make a relevant point about
quality. Credit them here and on screen.

## The Tollens quality-strategy skill pack
[tollens-ai/quality-strategy-skills](https://github.com/tollens-ai/quality-strategy-skills)

- The four questions: what does good look like? How would we know? How good is it now? What do we
  do about it?
- Oracles and instruments as the vocabulary for "how would we know?"
- Bars: delight, good enough, ugh, dealbreaker

## Background
- Gerald Weinberg, *Quality Software Management* (1992)
- [Examples of real software quality failures](research/software-quality-failures.md)
- James Bach and Michael Bolton on testing vs checking, and on ritual testing ([notes](research/bach-bolton-ritual-testing.md))
- Research on teaching with video is in [CRAFT.md](CRAFT.md)
- Test oracles: William Howden, "Theoretical and empirical studies of program testing" (1978),
  for the term; Elaine Weyuker, "On testing non-testable programs" (1982), for the oracle
  problem; Bach and Bolton for oracles as fallible heuristics for spotting problems (Bolton,
  [Oracles are about problems, not correctness](https://developsense.com/blog/2015/03/oracles-are-about-problems-not-correctness), 2015)

## Episode 1: what went into the video
- **Song:** lyrics by Qing with Claude; performed by a MiniMax generation Qing chose (we own
  the rights to our MiniMax generations).
- **Ideas:** quality as value to someone who matters (Weinberg; "who matters", Bach & Bolton;
  "someone or something", Ed Pringle); agents as people who matter (Qing); "a non-goal is a
  decision" (Ed Pringle). Credited on screen during the break.
- **Clawd,** the Claude Code crab, is Anthropic's mascot. Its proportions were learned from John
  Heibel's MIT-licensed [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)
  model sheet; the drawing code is our own.
- **The look** is a British seaside pier at night, drawn in ink and gouache on paper: its
  bandstand, Ferris wheel, beach huts, lighthouse and fairground marquee lettering. These are our
  own drawings of familiar forms, drawn by our code; no artwork is reproduced. The sung words are
  lettered in the video's own brush alphabet, drawn stroke by stroke in code. (The archived
  second video was an homage to Henri Matisse's *Jazz* and Alexander Calder's mobiles.)
- **Other agents appear as characters of our own that wear their owners' official marks as
  badges,** exactly as provided:
  - Grok's mark (xAI) on Grok's bot and on the kick drum
  - the OpenAI Blossom on the OpenAI bot
  - the Muse logo (Meta) on the headphones of Jolly, Muse's mascot, who is redrawn in the video's
    style
  - OpenClaw's Molty (OpenClaw Foundation), drawn from its open-source SVG

  No affiliation or endorsement is implied. Details and usage terms:
  [research/bot-marks.md](research/bot-marks.md).
- **The helm on the container tower** nods to the Kubernetes logo (Kubernetes is a trademark of
  The Linux Foundation). It's our own drawing, not the logo artwork.
- **Fonts** (SIL Open Font License, copies in `video/fonts/`): Bricolage Grotesque and JetBrains
  Mono, for the app screens, code and terminals. The lyrics aren't set in a font. The archived
  videos also used Caveat and Pixelify Sans.
- **How it was made:** the first video's storyboard process (archived as not working, see
  [archive/ep01-video-v1/](archive/ep01-video-v1/README.md)) came from research on animation, music-video and
  creator studios ([notes](research/studio-pre-production.md)) and on Tim Blais's A Capella Science
  ([notes](research/tim-blais-craft.md)).

## Episode 2: what went into the video (v3, "Cut Light")
- **Song:** lyrics by Qing with Claude; performed by the Suno generation Qing chose, "How Will I
  Know".
- **Ideas:** test oracles (Howden; Weyuker; Bach & Bolton, as above), and oracles for agentic
  coding (Yanqing Cheng, *Agentic coding and the problem of oracles*). Credited on screen on the
  teaching card. The chorus's moths are for the first computer "bug", a moth taped into the
  Harvard Mark II's logbook in 1947.
- **Clawd,** as for episode 1: Anthropic's mascot, its proportions learned from John Heibel's
  MIT-licensed [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) model
  sheet; the band's costumes and the drawing code are our own.
- **The look** is our own: a box of one-way mirrors, inked like a manga page, with the words cut
  out of the glass. Hatching, scratchboard blacks and focus lines are the manga's and the
  engraver's familiar techniques, drawn by our code; no artwork is reproduced.
- **The people and the places outside the box** (the bakery, the clinic, the school, the wedding
  marquee, the town square) and Gran's costume were drawn by OpenAI's image generation, used
  through Codex, from our own briefs and frames of the film; we cut them out and animate them as
  paper cut-outs. What's on their screens, cards and signs is drawn by our code.
- **Fonts,** with their licences in `video/ep02/cutlight/fonts/`: Big Shoulders Stencil Display
  (The Big Shoulders Project Authors, SIL Open Font License) for the sung words; JetBrains Mono
  (The JetBrains Mono Project Authors, SIL Open Font License) for labels, the machine's readouts
  and the teaching card;
  Rock Salt (Font Diner, Apache License 2.0) for the people's handwriting.

## Episode 3: what went into the video ("Pencil Polka")
- **Song:** lyrics by Qing with Claude; performed by the Suno generation Qing chose, "The
  _ilities_". The form is the Gilbert and Sullivan patter song (public domain); no line or tune is
  reused.
- **Ideas:** the "ilities", or quality attributes: Ed Pringle's
  [catalogue](https://github.com/tollens-ai/quality-assistant-prototype-03/tree/main/quality-brain/quality-attributes)
  of what stakeholders care about, and the quality model in ISO/IEC 25010 for the names it shares; independence and trade-offs
  between them, as Qing teaches them (see CANON.md). Credited on screen on the end card.
- **Clawd,** as before: Anthropic's mascot, its proportions learned from John Heibel's MIT-licensed
  [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) model sheet; the drawing
  is our own, in coloured pencil.
- **The look** is our own: coloured-pencil doodles on paper, drawn by our code. The line boil (a
  drawing redrawn fifteen times a second so it seems alive) is a hand-drawn animation staple; the
  bouncing ball hopping along the words follows the sing-along cartoons of the 1920s and 30s (the
  Fleischer Studios' "Follow the Bouncing Ball"), an idea and not artwork; the dog show's rosettes
  and agility course are the familiar ones. No artwork is reproduced.
- **Fonts:** none. The lettering is the film's own hand-printed alphabet, drawn stroke by stroke in
  code.
- **Small borrowed ideas,** all common property and none of them artwork: bunting and rosettes at a dog
  show, an agility course (hurdle, tunnel, weave poles, seesaw), a glass-bellied "see how it works" cutaway,
  a stamp on a counter, a phone box for a quick change, confetti, spotlights and a curtain for a finale.
- **How it was made:** the look and the shared code are by one Sonnet; the film's parts were drawn by
  Sonnet subagents to a shared brief and reviewed by the same one (the video file's *How it was made*).
  Its end card is signed "doodled by Sonnet", with Qing's permission.

## Episode 4: what went into the video ("The Green Room")

- **Song:** lyrics by gpt-6.1-sol, with review and feedback from Qing; performed by the Suno take Qing selected on 2026-09-30,
  “Did You Actually Test It?”. The supplied genre is a 1930s Broadway comic swing song.
- **Ideas:** testing and checking after James Bach and Michael Bolton; oracles after William
  Howden, Elaine Weyuker, Bach and Bolton; the agent-team interpretation and briefing lesson
  from Yanqing Cheng. Credited on the end card. The [episode sheet](episodes/04-did-you-actually-test-it.md)
  and [earlier expert notes](episodes/04-what-happens-if.md) record the teaching decisions.
- **Sol** is an original ivory GPT showman, drawn in JavaScript, wearing the official OpenAI
  Blossom as an unaltered lapel badge. **Clawd** is Anthropic’s Claude Code mascot, adapted to
  this film’s illustration style. **Tess, Pat and Sam** are original characters. The marks and
  mascots imply no affiliation or endorsement; [bot-mark research](research/bot-marks.md)
  records their source and usage terms.
- **The look** is an original Art Deco theatre: velvet, brass, painted scenic flats and
  front-facing comic performers. The top hat, spats, footlights and articulated limbs use
  familiar theatrical and animation forms; no artwork is reproduced. The art and movement
  were drawn entirely in JavaScript, without generated raster artwork or generated video.
- **Fonts:** Fraunces (The Fraunces Project Authors), Josefin Sans (The Josefin Sans Project
  Authors), and Limelight (Sorkin Type Co),
  from the Google Fonts repository, under the SIL Open Font License. The licence notices ship
  in `video/ep04/revue/fonts/`.
- **How it was made:** Sol (Codex) chose the world, storyboarded the song and wrote every visual.
  Native Codex workers measured and aligned the recording and gave a fresh audience reading.
  The [liner notes](episodes/04-video.md) record the built storyboard, checks and limitations.

## Episode 4, piano take: what went into the video ("Press, Stress & Guess")

- **Song:** lyrics by gpt-6.1-sol, with review and feedback from Qing; performed by the Suno piano take Qing chose on
  2026-10-01 ("brisk pattering pace, light male baritenor ... upright piano with jaunty chord stabs").
- **Ideas:** testing and checking after James Bach and Michael Bolton; agent-led testing and the
  briefing lesson from Yanqing Cheng. Both are credited on the end card.
- **The look** follows the rubber-hose cartoons of about 1930 (white gloves, pie-cut eyes, hose
  limbs, inked cels over painted backgrounds, iris joins and iris close-ups), a shared idiom of the
  era; no artwork is reproduced. Qing asked for the character design to take inspiration from the
  game *Cuphead* (Studio MDHR), which revived that idiom with a modern finish; nothing from it is
  copied, and it is credited on the end card. The **bouncing ball** over the lyric follows the Fleischer studio's sing-along cartoons of
  the 1920s and '30s, credited on the end card; it is an idea, not their artwork. The overhead
  formations (a giant tick, a magnifying glass) follow the kaleidoscope numbers Busby Berkeley staged
  for the musicals of the 1930s, also credited on the end card. Everything is drawn in JavaScript, with no generated images; Codex's
  image model made a few private style studies of the places, which only guided the painting.
- **The layout rule** (one subject in the centre, the lyric just below it, no words on screen that
  aren't sung) comes from an expert who watched episode 3, relayed by Qing; see
  [VIDEO.md](VIDEO.md#one-place-to-look).
- **Clawd** is Anthropic's Claude Code mascot, drawn in this film's style. Press, Stress, Guess,
  Mabel, Pat, Sam, the goose and the fresh bots are original. No affiliation or endorsement is implied.
- **Fonts:** Corben (Vernon Adams) and Lilita One (Juan Montoreano), from the Google Fonts
  repository under the SIL Open Font License; the notices ship in `video/ep04/ball/fonts/`.
- **How it was made:** Claude (Opus) storyboarded the song, built the look, the kits and the lyric
  system, and drew the title, intro, verse 1, chorus 1 and the outro; three Claude (Opus) builders drew
  verse 2 with chorus 2, the bridge, and the breakdown with chorus 3 to the same kit and brief; a
  helper measured the recording and aligned the words, and an independent viewer read the frames.
  The [liner notes](episodes/04-video-piano.md) record the storyboard, the checks and the shortfalls.
