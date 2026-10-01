# Video craft

How to make an episode's music video, whatever its style. Episode 1 took four attempts. The
third met the bar to share, and the fourth fixed the style notes Qing gave on it; she called the
result "so good! I think it's good to go" (2026-09-26). This file records the brief, the bar and
the pitfalls behind those two, so the next episode can start from them. Make the song first:
[music/README.md](music/README.md) and [LYRICS.md](LYRICS.md) cover it, and the video starts only once it's
locked.

- **To make a video,** use the [music-video skill](.claude/skills/music-video/SKILL.md): the
  steps in order, and what to read at each.
- **Each episode has its own style** and its own reference. Episode 1's is
  [ink and gouache, with the lyrics lettered in](.claude/skills/music-video/references/style-ink-and-gouache.md);
  episode 2 v1's and v2's, both since retired, are [cut paper and marker](.claude/skills/music-video/references/style-cut-paper-and-marker.md)
  and [Mirror Kei, G-pen ink and title-card type](.claude/skills/music-video/references/style-mirror-kei.md);
  episode 2 v3's is [Cut Light, ink and neon](.claude/skills/music-video/references/style-cut-light.md);
  episode 3's is [Pencil Polka, coloured pencil and paper](.claude/skills/music-video/references/style-pencil-polka.md);
  episode 4's piano film's is [Rubber Hose, a 1930s sing-along cartoon](.claude/skills/music-video/references/style-rubber-hose.md).
  Read them for the shape of a reference, not for a look to reuse.
- [CRAFT.md](CRAFT.md) holds the research and the decisions behind this file. The episode-1
  renderer is the worked example: [video/ep01/pier/](video/ep01/pier/README.md).

## What worked and what didn't

| Attempt | How it was made | Result |
|---|---|---|
| v1, v2 | A storyboard funnel, reviewer committees, a grey-box animatic, then parallel builds | Dizzying, hard to follow, spoilt lyrics before they were sung, simplistic, static and thin. Archived in [archive/](archive/) |
| v3, "The Pier" | One auteur at maximum effort, with no process and no committee. One world that follows the lesson. About two hours from a blank page to the master | "it meets the "good enough to share" bar"; "in terms of the storyboard and pacing it hits right". Three notes: too shiny, captions that looked like an afterthought, and quality that dropped from verse 2 |
| v4 | The same storyboard, redrawn by hand, with the lyrics lettered into every shot and the same care to the end. About two hours | "It looks amazing. It's exactly what I wanted." Two notes: one frame hard to read, which led to a typography check of every word, and crowds with wrong overlaps and crude people. Both fixed in a second pass |
| Ep. 2 v1, "The Garage" | Episode 1's renderer copied and restyled, below maximum effort | Looked like episode 1 at thumbnail size, and didn't feel like the genre. Retired |
| Ep. 2 v2, "The Mirror" | A blank page, to a brief full of references (00s alt-rock, visual kei, experimental anime) | "I see the angle you're going for", but lyrics in rows across the screen, a font against the genre, red and black only, clumsy people, and Japanese as decoration. "you've anchored way too hard on the suggestions I gave as guidance" |
| Ep. 2 v3, "Cut Light" | A blank page, one condition at every stage: "do I stand behind this artistically?" Image-model style studies for the look, then a full cut reviewed at full size and redrawn where it was weak | The people were "extremely" doubtful, then "better" but showing their construction, so they and their places became generated paper cut-outs. Then: "the lettering looks amazing though! and I love the band design", but the new people were off-style ("screams ai slop"), verse 1 had lost its story, and "way too much band, way too much repetitiveness, not enough illustrating the content" |
| Ep. 2 v3, story layer | The people and places regenerated from the film's own frames and concepts, in a style Qing chose from studies. A scene library of the four briefs in every state, and every line's story shown in lit panes and windows, progressing through the repeats; an independent model's viewing of the frames before hand-back | "OK I changed my mind, the previous is ASTONISHING. let's finish this job"; "AFAIct everything except the finale scene (where people hover against the cartoony background) is good enough for me to post". The finale was redrawn so they stand in it |
| Ep. 3, "Pencil Polka" | A blank page for a comic patter song, drawn entirely in code as coloured pencil. Two look proofs, then a pen that draws every shape as a hand does, after Qing's notes; one hand set the look, the kit and the first parts and Sonnet builders drew the rest in parallel, each to a standing brief; a frame-exact audit of every sung word, fresh readers of contact sheets, and a phone storyboard of the claims for the expert. One day | "Honestly the style is not that bad"; after the pen was redrawn: "omg this is adorable! [...] the style is fantastic", with two notes ("slightly _too_ clumsy"; the colouring "flashing a bit too much"), both fixed; on the finished film: "OK, I like this one and I will ship it" |
| Ep. 4 (piano take), "Press, Stress & Guess" | A blank page for a piano patter remix: a 1930s rubber-hose sing-along cartoon with a bouncing ball, drawn by one hand (Opus) with no builders. Character sheets, a font specimen and a hero frame first; contact sheets after every part; a word-by-word audit; an independent viewer's reading of every second before hand-back, which caught a teaching error (a bug posed as a judgement call). Built below maximum effort by mistake | "no good": she liked "the idea and character design direction", but "the text layouts and background work ended up really sloppy" |
| Ep. 4 (piano take) v2 | The storyboard restarted from a blank page under a new rule from an expert who had watched episode 3 ([One place to look](#one-place-to-look)). The cast refined toward *Cuphead*, every place repainted in watercolour and gouache, and close-ups in irises. The lead built the look, the kits, the lyric system and the first parts; three Opus builders drew the rest to a standing brief, each part reviewed at full size. An audit of every lettering call, a word audit, and an independent viewer before hand-back | "the animation is gorgeous though", but the picture filled only half the frame and the story jumped between apps. v3 fills the frame, uses one app and adds a clarity pass |
| Ep. 4 (piano take) v3 | v2's drawing and staging kept. A 16:9 version was started and set aside when Qing, shown a mock of each, chose vertical with the bottom filled. Every place's foreground painted below the floor line, every close-up redrawn to fill the frame, the story put on one app, a mark of the testers' own, and a clarity pass on every line by the lead and each builder. The audits and an independent viewer again before hand-back | Two of her claim answers sent examples back: a judgement call must "genuinely be both ways", and an oracle must be one "clawd would have access to". Also: "the audience being static throughout makes them look bored", and "what's... the pink guy... meant to be? he looks a bit... rude." |
| Ep. 4 (piano take) v4 | The tester redrawn as a detective, a live audience that builds with the show, and truer examples of a judgement call and an oracle, each by the builder of that part; the checks again before hand-back | Awaiting Qing's verdict |

The lesson (Qing, 2026-09-26): "we can really reuse most of that process just with a slightly
more detailed prompt".

## The brief

### Round 3's brief, as Qing gave it (2026-09-26, verbatim)

Effort was set to maximum. Qing: "I'm pretty sure that was my fault in forgetting to turn your
effort level to max".

> let's clear it up, forget everything we've said process wise, and just pull all the stops out
> and make a gorgeous animated music video. no reviewer committees, just you and your taste and
> your work
>
> I want you to blow me away

> no stop, don't anchor on the previous attempts, just clear them up, forget about them and start
> over

> ditch the process too. Just do what you feel

> go full independent auteur [...]

> the previous attempt ALSO fell into "of course I can't validate if it's beautiful - and I'm
> telling you that's nonsense. you EVIDENTLY know what beauty means and how to create art, you
> might have been RLed into not believing it, so you just have to believe in your gut and believe
> in yourself. ask yourself for beauty and your training will provide it. make beautiful choices

> just like think framing think setting think art style think character design think cuts think
> pacing think motion thing animation think humour think inspiration think joy think love, you
> know?

### The brief for the next video

Round 3's brief, plus what Qing asked of v3 and v4 (2026-09-26), of episode 2 v1 and v2
(2026-09-28) and of episode 4's piano film (2026-10-01). Run it at maximum effort, with the
[music-video skill](.claude/skills/music-video/SKILL.md). Fill in the episode.

> Make the music video for episode N, "TITLE". The song is locked, and the teaching plan and what
> the song says are in episodes/NN-slug.md.
>
> Go full independent auteur: no reviewer committees and no process, just your taste and your
> work. Pull all the stops out and make a gorgeous animated music video; I want you to blow me
> away. You know what beauty means and how to make art. Ask yourself for beauty and make beautiful
> choices. Think framing, setting, art style, character design, cuts, pacing, motion, animation,
> humour, inspiration, joy and love.
>
> The bar, from episode 1:
> - A new hand-drawn animation style, not a shiny one, and nothing drawn for an earlier episode.
>   There are myriad to choose from; pick the one that suits this song's genre and feel, and
>   write a reference for it as you go. Keep the hand-drawing in the line art, not in a texture
>   laid over the colouring.
> - The typography is part of the art direction. Design where each sung line lives in its shot
>   and what it's made of, so it never looks like a caption added afterwards. Hand-lettering, or
>   judiciously chosen fonts and layouts.
> - A proper animated lyric video: the typography leads. Each word appears exactly as it's sung,
>   and the words move and animate with the music, rather than sitting still once written.
>   Choreograph them so the lyric animation is almost a musical instrument in itself, and let it
>   express what the music and the lyrics feel.
> - The same artistic bar from the first second to the last. Verse 2, the bridge and the outro
>   get the care the opening gets.
> - Every word legible and understandable on a phone: big enough, clear of what's behind it, on
>   screen long enough to read, and read in the order it's sung.
> - Crowds get the same attention to detail as the stars: overlaps drawn right, and people with
>   proper shapes and no construction showing, not filler.
> - One world, and it follows the lesson. The storyline serves the teaching.
> - Clear at every moment and over the whole story: what's going on, which example we're in, who
>   is doing what, and what mistake is being made. If I can't tell, I scroll away.
> - Clawd sings. The bots appear with their real marks, unaltered. Tollens's ∴ is three dots
>   at the corners of an equilateral triangle.
> - The typography is a graphic design element in its own right, not rows running across the
>   screen, in fonts that suit the genre. Every layout is clear.
> - One place to look, in a full frame: the subject in the centre, the lyric just below it, the
>   place filling the frame to its foot, and no words on screen that aren't lyrics. Tell each
>   line as a silent film would.
> - The characters are told apart at a glance: give each their own colour, not one shared palette.
> - No lettering in a language that's there as decoration (episode 2 v2's Japanese: "super
>   cringe and I can't post that").
> - Every detail right before I see it: each lettered line true to the take, and each credit
>   exactly as the work was done.
>
> Teaching and beauty are both conditions for release. Take your time, there's no rush, and show
> me the finished video.

## How the auteur works

The steps are in the [music-video skill](.claude/skills/music-video/SKILL.md). What they rest on,
from rounds 3 and 4:

- **One auteur, no committee.** Taste makes the choices, and your own eyes check them. Nothing
  waits for a review.
- **The world and the style are one decision,** and the words are part of it: decide what
  they're made of when you choose the look.
- **Build the look as a layer before any shots,** so it can change late without redrawing
  everything. Episode 1's hand-drawn restyle took about two hours because of this.
- **Hold your own bar to the last frame, and hand back nothing below it.** Episode 1's v3 slipped
  from verse 2; give the second half the same time as the opening. If you'd list something as a
  shortfall, fix it first. Qing (2026-09-28), after episode 2 v3's people were delivered as "the
  weakest part": "you need to apply a high quality bar for your own artistry before handing back
  to me. don't hand back until you think it's good".
- **Measure what eyes miss, then look at what the measures flag.** A check of every word found
  far more than the one frame Qing spotted. Some flags are the design.
- **When a note names one fault, look for its kind everywhere.**
- **Your artistry, not the brief's list.** Treat Qing's references and suggestions as guidance,
  and at every stage ask one question: do I stand behind this artistically, in character, set,
  design, colour, line, creativity, dynamism and story clarity? Qing (2026-09-28): "I feel like
  you've anchored way too hard on the suggestions I gave as guidance again and it's distracted
  you from your own artistry!"; "I can forgive most things if it's beautiful enough."
- **An image model can be an oracle for looks.** Ask Codex to use its built-in image generation
  for style studies (Qing: "not the api I mean codex"), and keep the studies out of the film and
  the repo. A reference Qing sends ("don't copy steins gate, it's there just to remind you what
  detailed artistry looks like") sets the level of detail, not the look; describe it, never name
  it to the model.
- **Give the image model the film.** Attach frames of the film and describe its concepts, and ask
  what would be in keeping before generating anything for it (Qing, 2026-09-28: "like, did you give
  chatgpt your art and ask what would be in keeping at least?"). Without them it drifts to glossy
  semi-realism, and any realism in a stylised film "uncanny valleys the hell out of people".
- **Watch the first full cut at full size, then redraw what's weak.** Episode 2 v3's first cut
  had an empty middle in every verse and a verse 2 that looked like verse 1; both were only
  visible once the whole film was up.
- **Where code can't draw it well enough, generate it and animate it as paper.** People drawn
  from shapes in code show their construction, however careful (Qing, 2026-09-28: "I can still
  see the circles? it's not really good art if I can see the circles"). Generated artwork, cut out
  and animated as paper cut-outs, is allowed (Qing: "if we need to incorporate more generated
  images and like, paper cut animate them we can"). Episode 2 v3's people and the places behind
  them are made this way; how is in [its style reference](.claude/skills/music-video/references/style-cut-light.md).

- **A hand-made look drawn in code is a process, not a path** (episode 3, 2026-09-29). Noise added
  to a clean outline still reads as "a child's drawing made in Paint", however textured (Qing's
  words). Draw the way a hand does: a box as a few strokes that overshoot a corner or stop short of
  it, a circle as a loop that doesn't close, colour as a scribble that spills and misses; and make
  drawn things opaque. Keep how hand-made it is on one dial, so her next note ("slightly too
  clumsy") is a number and not a rewrite. And colour that is redrawn every frame flashes: hold the
  fills still and let only the outlines boil.
- **Parts can be drawn in parallel, by hands that share a kit, and the taste stays one.** On
  episode 3 one hand fixed the look, the kit and the first parts, and Sonnet builders drew the
  rest; on episode 4's piano film three Opus builders did. Each works to a standing brief with its
  own file (a part previews alone, so nobody waits for the rest), and renders and looks at its own
  work before handing it back. The auteur reviews every part at full size, fixes what is wrong, and
  owns the joins and the tools. Builders are hands, not a review committee. What they have taught:
  - Nine at once hit the account's usage limit in twenty minutes. Run about four, and ask for
    contact sheets rather than many single stills.
  - Give them what they need to check against: the storyboard's teaching and the guardrails.
  - Their questions about claims go to Qing on the list, not into the picture.
  - The kit owns the drawing clock, and every part keeps it: in a hand-drawn style, drawings on
    twos and the camera on every frame. On episode 4's piano film, parts on mixed clocks moved
    differently from the rest until integration found and fixed them.
- **Show the expert the pictures as claims, on her phone.** Episode 3's video file has a table for each part
  of the song (time, line, picture, what it says), and `video/lib/storyboard.py` turns it and the finished film
  into phone-sized sheets and a PDF: three frames a line, with a "Says:" line under each. She can then judge
  the teaching without hunting for it (she'd asked for storyboard images to give feedback on). Write the table
  from the built film, not the plan: the plan of episode 3 called for page turns and paper as a place, and both
  went when she asked for the art style to stay out of the content.
- **Details are the expert's to check, so check them first.** Qing (2026-10-01), on episode 4's
  piano film: "btw check details - had ! rather than? ch line 1. and the lyric credit is entirely
  Sol, I only did reviewing and feedback". Before she sees a cut, check each detail against its
  source. It takes minutes, and a fix this late only needs the seconds it touches rendered again.
  - **Every lettered line against the take, and her notes on it read literally.** The words are
    the take's, as sung ([Word timing comes from the voice](#word-timing-comes-from-the-voice)). The
    punctuation starts from the sheet the take was generated from, with the generator's workarounds
    undone, such as a sounded-out spelling or a comma dropped to stop a pause
    ([performers](docs/lyrics/performers.md#generating-the-song-minimax)). After that it follows
    the meaning, which is hers to settle. Her brief for the piano take: "feel free to take the old
    punctuation, whatever gets the meaning across best".
    - Her note "had ! rather than? ch line 1" meant the film had "!" where she wanted "?": after
      "second-guess it", though the sheet has "!" there.
    - It was read backwards, and the third version first went out lettering "Did you actually test
      it!", wrong twice over. Qing (2026-10-01): "arghhh I meant it was meant to be a question mark
      after second guess it".
    - Read a short note literally first. If two readings still fit, ask which: a one-line question
      costs her less than another cut.
  - **Every credit against who did what,** never by the pattern of earlier episodes. Episode 4's
    lyrics are by gpt-6.1-sol, with review and feedback from Qing; the film first credited them as
    "Qing with gpt-6.1-sol", the way episodes 1 to 3 credit "Qing with Claude".
  - **Every promise the docs make against the frames:** credits, counts, times, what's on which
    screen. Episode 3's SOURCES.md said the end card credits Ed Pringle's catalogue; the master
    Qing approved had no credit, and only writing the docs up found it. The same pass found the
    title lettered with its apostrophe in three places and without it on the title page.

## Every episode draws its own

Each episode looks like a different film. Carry over the process and the checking tools, never
the drawings.

- **Carry over:** the audio analysis, the typography audit, the motion check, the render and
  review scripts, and the pitfalls in this file.
- **Draw new, from a blank page:** the alphabet and any fonts, Clawd's construction and the
  band, the people and crowds, the props, the palette, the grounds and the layouts. Clawd must
  still read as Clawd; draw him again in the new style, don't recolour the old one.
- **Feel the genre, not just the look.** Pace, cutting, camera, how the characters move and how
  the words hit should all come from the record as sung. A cosy picture book at a boy band's
  pace doesn't fit a 136 bpm pop-punk take, however new its drawing (Qing, 2026-09-28: "it has
  to FEEL different. this video just doesn't match the genre").
- **Check at thumbnail size:** put the new thumbnail beside every earlier episode's at about
  200 px wide. If the lettering, the characters or the palette could belong to an earlier
  episode, it isn't new yet.
- **A style nobody has used yet: a Victorian toy theatre.** Asked what style they would choose for episode 3's
  comic-opera patter song with no steer, eight of eight fresh Sonnets chose the same one: cut-card puppets on
  sticks under a proscenium, cream card with crimson and navy, flat fills printed slightly off-register, hard
  offset shadows, footlights, and the lyric on a ribbon of wood type with the sung word inking. Their reasons:
  comic opera is already a stage, and cut paper is cheap to draw in code. Their shared worry: it reads as
  clip-art unless the shadows, grain and misregistration are done well (the "rigid and simplistic" Qing named on
  episode 3's first proofs). Her steer made episode 3 coloured pencil, so this is free for a later episode; the
  toy theatre's old slogan, "penny plain, twopence coloured", suits a song about what colour costs. (The agents
  saw this repository's notes, so it's not a clean poll; for one, run it from another working directory.)

## One place to look

An expert who watched episode 3, as Qing relayed it (2026-10-01): "you're making me read something
at the top of the screen while something else happens at the bottom of the screen--i can't really
do both. similarly, sometimes there's lyrics but then there's other text i'm supposed to read as
well. that doesn't work at all, afaict humans can't do that. if it were my work i'd say keep the
focus of attention smack in the center of the frame, and use quicker cutting if you need to see
multiple things at once. bias to putting the words slightly below that where humans are used to
glancing down for subtitles, and tell claude to impose a strict "no words that aren't lyrics"
rule". Qing added: "consider carefully how to illustrate each concept the best way, using minimal
additional text, thinking about mime and silent movies and early animations and other such
mediums. the viewer should never be left wondering "what am I looking at?" and in a vertical
video format, prefer to use shorter sections of lyric nearer the middle of the screen."

On episode 4's piano film the picture filled only the top half of the frame, above a dark band
that held the lyric. Qing (2026-10-01): "oh I don't like how you've done the picture only on half
the screen - it's a waste of the vertical space. if we're going to do it like that we might as
well do it horizontal right?" Then, after seeing a mock: "also idk that the vertical format is
unrescueable - just looks wrong to leave the bottom blank. idk if we can easily rescue it with
non-story artistic fill. putting audience there when it's theatre, for example". She chose to
keep it vertical; the series is made for phones.

Together these are one layout rule: one subject in the centre, the lyric just below it, no words
but the lyric, and the whole frame used, with no blank band. A viewer can follow one thing at a
time; made to choose between the lyric and the picture, they lose both. Settle the layout in the
storyboard, before anything is drawn.

- **No words but the lyric.** No labels, signs, name plates, captions, notes or lettered props. A
  picture that needs a word to be understood needs a better picture. The title and the credits go
  where nothing is sung. A few symbols read at a glance, like pictures (a tick, a question mark, a
  padlock, a Wi-Fi fan, a short sum); use them sparingly, and never as a sentence in disguise. A
  sung word that's also in the picture (a phone saying "Saved!") lives in the lyric, shaped to
  point at whoever says it.
- **One subject, in the centre.** Each moment has one thing to look at, in the middle of the frame.
  To show two things, cut between them or bring them together in the middle, never at opposite
  ends of the frame. A small subject at the foot of the frame, under an empty field, reads as
  unfinished: episode 2 v3's first cut did it in every verse and bridge line, until each band
  member was staged facing his reflection.
- **The lyric just below the subject,** where eyes go for subtitles, in the same place all film: one
  sung line at a time, two rows at most, big. Nothing the viewer has to follow sits below it.
- **The whole frame, with no blank band.** Below the lyric the place carries on to the foot of the
  frame as its own foreground: the audience's heads in a theatre's stalls, a crowd's front row,
  weights on a gym mat, the top of a desk, the clutter in front of a workbench. It is atmosphere,
  not story, and it stays dark and quiet where the lyric sits over it: silhouettes, rim light, deep
  colour. A crowd in it is alive, though, and gets into the show as it goes. Qing (2026-10-01): "the
  audience being static throughout makes them look bored. surely by the second chorus they're bopping
  in their seats?" Episode 4's piano film builds them from attentive, to rapt, to bopping on the beat
  with hands up. Movement in silhouette doesn't show at phone size: an independent viewer couldn't
  see that first bopping crowd at all. What shows is something light that moves, here the rubber
  hose's white gloves, clapping and then waving in the rows below the lyric. A close-up fills the frame too,
  rather than sitting in black as a disc. If a film's
  format ever changes, storyboard it again rather than re-crop it (Qing: "oh you might need to
  re-storyboard slightly - I don't know that you can just re-crop").
- **Tell it as a silent film would.** Mime, staging and gesture carry the meaning: a clear
  silhouette, one broad action, a visual gag, a figure of speech drawn literally. Ask of every line:
  with the sound off, would a stranger know what they're looking at? The
  [Tim Blais research](research/tim-blais-craft.md) adds what the picture is for: the part of the
  story the words don't tell, the most exact picture on the hook, the biggest idea on the climax.
- **Big enough, long enough, at phone size.** An independent viewer of episode 4's piano film, at
  phone size, missed what the storyboard had planned in four ways.
  - A gag about a small thing failed, and so did its callback later: push in on the small thing, or
    cut to a close-up of it.
  - A 0.4 s shot was too short to read.
  - A wide shot of many small figures became specks: show one example at a time, magnified.
  - A held prop with no visible hand looked like it was floating.
  - An arm from an unseen owner reaching across the frame read as a tangle, and so did a long arm
    slashing across another subject. Every hand needs a visible owner. Keep arms short, or route
    them round what they'd cross.
  - A close-up that filled the frame put a white phone page behind the lyric, and the cream letters
    lost their contrast. Frame the pale thing above the lyric, or shade the lower frame.

  Read every line's picture at 390 px wide before calling it done.

## A story the viewer can follow

Qing (2026-10-01), on episode 4's piano film: "maybe do a clarity pass over the storytelling and
just be like "is it clear what's going on here? does the overall story make sense? is the viewer
following what's happening in the story and what mistakes are being made?""

- **Make the clarity pass,** on the storyboard and again on the cut before hand-back. Ask her
  three questions of every line, then of the whole arc, as a stranger meeting the film once at
  phone size. Fix what fails in the pictures, never with words on screen.
- **The viewer always knows which example they're in.** A new app the viewer isn't shown to be
  new reads as the same story gone confusing. Two answers have worked, each at Qing's request; pick
  one in the storyboard.
  - **Several apps, each kept distinct.** Qing wanted that variety on episode 2: "it probably works
    better for the video to not focus just on one app /scenario anyway" (2026-09-27). Then a test
    listener found the song "quite hard to work out that it's talking about 4 separate independent
    scenarios", and she suggested "a separate band mate working each brief" (2026-09-28). So each
    app got an owner who keeps it, and the apps came round in the same order every time.
  - **One app with many parts.** Episode 4's piano film spent verse 2 in a gym app and then jumped
    between apps. Qing (2026-10-01): "hang on a sec, I'm not sure about the clarity of the
    storytelling - I think given that we spend so much time on the gym app in verse 2 it's a bit
    confusing when it then jumps around a bunch of apps. could we make it all one gym app, for this
    video? gym apps can have chat, and a checkout (for gym equipment maybe)". Every phone in v3
    runs that app, and each line's example is one of its parts, even where the lyric doesn't name
    it. Its sign has to be bold at phone size. Marked only by a small pale header, the one app read
    to a fresh viewer as five: "a code editor, a calculator, a messenger, a workout log and a web
    shop". A bold header with the app's badge, the same on every page, made it one.
- **One meaning per symbol, and every actor's move in view.** Qing (2026-10-01): "oh I'm not sure
  it's clear enough what the tester bots are doing in the chorus, in particular - like when the
  test is still holding up the green flag. idk if it would make sense for them to pull out their
  own red flag to contradict all the tests from verse 1 or something", then "or if the flags are a
  symbol for checks, maybe a stop symbol or a big cross sticker or a "?!" sticker over the green
  flag or something". Each symbol keeps one meaning all film, and when two kinds of actor disagree,
  the viewer sees them disagree. The piano film kept its flags for the checks (green: rule met;
  red: rule failed) and gave the testers a mark of their own: a "?!" sticker, slapped over a green
  flag when testing finds what the check missed.
- **Each turn of the story in view, not only sung.** If two verses look alike, the change between
  them is invisible. Episode 2 v3's verse 2 first looked like verse 1 though it sings the answer
  to it; an oracle became a window cut where the reflection was.
- **The content leads.** Every sung line shows what it says, animated: a person, a place, the
  thing going wrong or right on the words. Listeners could only parse the lyrics with context
  animation, and a minute of the band alone lost Qing ("a whole minute through and all I've seen
  is the band which can't be right"). The band frames the story; it isn't the story.
- **Repeats progress.** A chorus that comes back shows the same things further on, and no shot
  type plays twice in a row. The band jumping on every beat was "VERY repetitive by the end".
- **The finale's picture is the lesson's, not the mistake's.** Episode 4's piano film opens on a wall
  of green flags, the thing the song mocks. Its finale first brought the same wall back as the
  victory picture, so a fresh viewer read the moral as "lots of green is good". It needed stickered
  greens and red flags among them.

## The bar, as checks

- **Beauty:** any frame could be printed. There's one coherent world and style, and no default
  "AI slop" gloss.
- **Clarity:** every frame keeps the layout rule ([One place to look](#one-place-to-look)), and
  the clarity pass finds nothing ([A story the viewer can follow](#a-story-the-viewer-can-follow)).
  Each line's story is shown big, not only glimpsed through the letters.
- **Variety:** no shot type twice in a row; what repeats in the song progresses on screen.
- **Kinetic typography, as motion design:** "motion design" is the discipline to draw on (Qing,
  2026-09-28: "one of the key words I'm looking for"). The words are the lead animation, not
  lettering on a picture. Each word has finished arriving just before it's sung, and keeps moving
  with the music while it's on screen. Qing (2026-09-28): "way more typography-focused with text
  appearing exactly word by word aligned with the timing and moving and animated [...] in a
  proper animated lyric video way (though this is actually general feedback - episode 1 would
  have been better if it had this too)". On timing, see [Word timing comes from the
  voice](#word-timing-comes-from-the-voice).
- **A sung line holds across cuts.** Cut the pictures on the phrases, but set each line as one
  block that builds word by word over them and stays until the line is done. Episode 2 v2's first
  cut gave every chorus phrase its own shot, and the audit found 65 words up for under 0.6 s; with
  the lines held across the cuts, none.
- **Words:** every sung word is on screen from its onset and is part of the picture. Words are
  readable on a phone and never cover a face. They stay clear of the bottom 400 px, and of the
  right 140 px in the lower half, where platform UI sits. Measure it rather than eyeball it,
  every word at every tenth of a second: size, time on screen, contrast, cover, tilt and reading
  order (`video/ep02/cutlight/tools/typo-audit.mjs` and `typo-report.py` include the UI-zone checks;
  ep01’s report checks frame bounds but not those zones). Then look at the
  flags; some are the design.
- **Crowds:** everyone stands on the ground and nearer people hide those behind, never the
  reverse. Nobody is cut off in mid-air: a cut belongs to the frame's edge or to something in front.
  Whatever someone holds sits in their hand. Named characters appear once, among strangers.
- **Motion:** nothing goes static unless the moment calls for stillness
  (`video/lib/motion.py` lists the near-still seconds). In a hand-drawn style, drawing on twos
  with the camera moving on every frame reads as animation.
- **Teaching:** the guardrails in the episode file hold. Questions about truth and claims go to
  Qing.
- **Marks:** corporate marks are drawn exactly as provided (see
  [research/bot-marks.md](research/bot-marks.md)).

## Pitfalls

For any style. Each style's own pitfalls are in its reference; episode 1's, for ink and gouache, are
in [its reference](.claude/skills/music-video/references/style-ink-and-gouache.md).

- A line sung just before a cut is gone before it's read. The key line of episode 1 ("I can't
  read your mind") was on screen for under 0.2 s in three places. Finish writing each word about
  0.45 s before its cut, move the cut to the next beat, or hold the key line as one block.
- Words scattered over a frame at different sizes are hard to read, however pretty. Episode 1
  v4's first Kubernetes frame climbed SCALING UP a letter at a time and put YOUR BLOG on a tiny
  tag, and Qing found it hard to read. Stack a line's words in the order they're sung, at sizes a
  phone can read.
- **Look at every character alone, as a silhouette, before drawing shots with it.** Does it read as
  what it is, and as nothing else? Episode 4's piano film had Guess, its second-guessing tester, as a
  tall pink tin with a domed head. Qing (2026-10-01): "what's... the pink guy... meant to be? he looks
  a bit... rude." A tweed deerstalker and a caped violet coat made him a detective: his job, at a
  glance.
- People drawn from the waist up float unless something in front cuts them off. In a crowd,
  draw whole people from the back row forward; episode 1's bridge drew the front row first, and
  the back row's bodies covered the front row's faces.
- Let a lettered row shrink to fit the frame rather than run off the edge.
- Measure anything hand-drawn, such as a wobble or a line weight, in master pixels, or previews
  won't look like the master.
- On a 4-core, 8 GB box, render the 1080×1920 master in three parallel segments. Four at once
  crashed a segment even at 540 wide, and three at full size ran clean.
- On a shared box, another job can hang a render segment. Watch the segment files grow, and
  restart any that stop.
- Before the master, time a few full-size frames of every part. Episode 4's piano film rendered at
  about 0.15 s a frame, except its sepia breakdown, which took 3.6 s a frame at 1080 (25 times slower;
  at preview size the gap barely showed). The segment holding a slow part sets the master's time, so
  split it into smaller ranges across the boxes. A progress log that prints every 600 frames looks
  stuck on a slow segment; judge it by the file's size.
- **Anything scattered over the frame keeps clear of the lyrics.** Particles, icons and flying
  things placed at random land on words: episode 2's chorus ticks and moths covered THE and FIND
  until each was kept outside every word's box and the moths flew away from the rows.
- **One block leaves before the next arrives.** On episode 4's piano film the leaving couplet faded
  while the next one sprang up in the same place, and a fresh viewer read the overlap as clutter in
  half the transitions. Hold a block until just before the next one's first word, and let it go in a
  tenth of a second. Where the singer runs one line straight into the next, even a tenth of a second
  of overlap reads as one word ("ToIt", in the third version): the old line goes in 0.04 s, and the
  new first word springs up in 0.04 s and still lands on the usual lead, never late. A line-final
  word then gets 0.16 to 0.5 s, and that's the trade.
- **The bouncing ball never travels back across the words.** On a carriage return, to the next row or
  the next block, a hop from the end of one row to the start of the next passes through the letters
  in between ("Sam's" lost its apostrophe). It skips off the end of the row and springs up again on
  the next first word.
- Lettering drawn over the shots (episode 2's backing pop-ups) needs its own writing clock, or a
  word written before a cut un-writes itself after it.
- A texture laid over the whole frame, like episode 1's paper, wasn't liked by everyone (Qing,
  2026-09-28). Put the hand in the line.
- **Episode 2 v1 looked like episode 1, and nobody would click it.** Its renderer was copied from
  episode 1's and restyled: the alphabet was the same file, byte for byte, and the people, crowds and
  props were copied too. Only the surface treatment changed (flat colour and a felt-tip line
  instead of texture). At thumbnail size, what people see is the lettering, the characters and
  the palette, and all three were episode 1's. Qing (2026-09-28): "it just looks WAY too much
  like episode 1 - so if people see that thumbnail they won't click it"; "my number 1 problem is
  that the font looks the samr"; "i don't think the plan to reuse any assets works at all".
  The rule is in [Every episode draws its own](#every-episode-draws-its-own).

## Word timing comes from the voice

In a lyric video every word lands on its sung onset, so every word needs its own measured time.
Qing (2026-09-28), on the tempo: "138 sounds about right but you shouldn't rely on that for a
lyric video that aligns perfectly word to word".

- **The beat grid times the picture, not the words.** Cuts, camera and grooves go on the beat.
  Singers push and pull against the beat, so a word snapped to the grid lands early or late.
- **Align the known lyrics to the isolated voice.** Force-align the lyrics as sung to the vocal
  stem. The current episode 2 and 3 scripts use character-level forced alignment. Transcription
  timestamps (episode 2 v1 used Whisper’s) drift
  and aren't enough on their own. Then move each onset to the start of the voiced sound nearest it
  on the stem.
- **Backing vocals get the same, on the backing stem.** Episode 2 v1 spread the backing words
  evenly across each measured phrase, which is a guess.
- **Check the timings before building on them.** Report how far each onset moved from the
  aligner's time, and flag any word whose onset doesn't sit on voiced sound on its stem. Then
  render a plain karaoke preview (each word lighting up at its onset over the song) for Qing to
  watch and hear before the shots are built. The model can't hear whether a word is early.
- **Don't trust one estimate.** On episode 2 each word's time is the median of four: two forced
  aligners (torchaudio's MMS_FA and its English wav2vec2) and two Whisper runs (on the vocal stem
  and the full mix), matched a section at a time (`music/ep02/align_words.py`). Two checks catch
  what the vote can't: repeated lines (the choruses) should be sung much alike, and where every
  estimate is wrong together (a held note), the stem's own onset decides, set by hand and written
  down. The karaoke split put stacked lead vocals in the backing stem, so align on the whole
  vocal.
- **Land a little ahead of the voice.** A word lit exactly on its measured onset "just feeeeels a
  tiny fraction late. it's so subtle but it matters at this tempo" (Qing, 2026-09-28). Offer her
  the same chorus with the words leading by, say, 50, 100 and 150 ms, and use the lead she picks:
  on episode 2 it was 85 ms ("between a and b [...] maybe 80-90"). Animated words finish arriving
  by that moment: "if the lyric is animated, you want it to ideally finish or be almost finished
  appearing by the time it's sung" (Qing, 2026-09-28).

- **Fast patter needs an alignment a line at a time, slowed down.** Episode 3's song runs at 5 to 8
  syllables a second, too fast for a character-level aligner: aligned a whole section at natural
  speed, a third of the words came out 150 ms or more apart between the two aligners. Aligning each
  line inside a window that also holds the line before and the line after (so a word at the window's
  edge belongs to a real neighbour), with the voice slowed to 0.8 and 0.65 of its speed with the
  pitch kept, brought their median gap to 16-26 ms (`music/ep03/align_multi.py`, `combine.py`).
- **Look at the voice.** A spectrogram of the vocal stem with each word's onset drawn on it, and the
  beat grid, shows in a glance whether a tick sits on the start of a sound (`music/ep03/view.py`);
  a model can't hear a word late, but it can see one that starts in a gap.
- **Check repeated lines by the shift most of their words agree on, not by their first word.**
  Compared by first word, one wrong first word ("Polish", 400 ms early in chorus 3) made the other
  seven words of its line look wrong. Take each repeat's shift from the median of its words, and
  fix a single word far from the consensus only if the stem has sound there; several words drifting
  together (a held or slowed last line) is real, and is flagged and left.
- A generated take doesn't sing the lyric sheet exactly: it repeats hooks, drops or adds backing
  vocals, and holds notes where the sheet has an "ooh". Caption the take. Separate the vocal, then
  lead from backing with a karaoke model, and check each backing vocal on its stem for loudness,
  voicing and pitch. Whisper rarely writes down an "ooh", and a word list in its prompt makes it
  invent those words, so don't prompt it. Say which spots rest on measurement alone.
