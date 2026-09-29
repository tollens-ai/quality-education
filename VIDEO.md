# Video craft

How to make an episode's music video, whatever its style. Episode 1 took four attempts. The
third met the bar to share, and the fourth fixed the style notes Qing gave on it; she called the
result "so good! I think it's good to go" (2026-09-26). This file records the brief, the bar and
the pitfalls behind those two, so the next episode can start from them. Make the song first:
[MUSIC.md](MUSIC.md) and [LYRICS.md](LYRICS.md) cover it, and the video starts only once it's
locked.

- **To make a video,** use the [music-video skill](.claude/skills/music-video/SKILL.md): the
  steps in order, and what to read at each.
- **Each episode has its own style** and its own reference. Episode 1's is
  [ink and gouache, with the lyrics lettered in](.claude/skills/music-video/references/style-ink-and-gouache.md);
  episode 2 v1's and v2's, both since retired, are [cut paper and marker](.claude/skills/music-video/references/style-cut-paper-and-marker.md)
  and [Mirror Kei, G-pen ink and title-card type](.claude/skills/music-video/references/style-mirror-kei.md);
  episode 2 v3's is [Cut Light, ink and neon](.claude/skills/music-video/references/style-cut-light.md);
  episode 3's is [Pencil Polka, coloured pencil and paper](.claude/skills/music-video/references/style-pencil-polka.md).
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

Round 3's brief, plus what Qing asked of v3 and v4 (2026-09-26) and of episode 2 v1 and v2
(2026-09-28). Run it at maximum effort, with the
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
> - Clear at every moment: if I can't tell what's going on, I scroll away.
> - Clawd sings. The bots appear with their real marks, unaltered. Tollens's ∴ is three dots
>   at the corners of an equilateral triangle.
> - The typography is a graphic design element in its own right, not rows running across the
>   screen, in fonts that suit the genre. Every label and layout is clear.
> - The characters are told apart at a glance: give each their own colour, not one shared palette.
> - No lettering in a language that's there as decoration (episode 2 v2's Japanese: "super
>   cringe and I can't post that").
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
- **Hold the bar to the end.** v3 slipped from verse 2; give the second half the same time as
  the opening.
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
- **Don't hand back until it's good by your own bar.** If you'd list something as a shortfall,
  fix it first. Qing (2026-09-28), after v3's people were delivered as "the weakest part": "you
  need to apply a high quality bar for your own artistry before handing back to me. don't hand
  back until you think it's good".
- **Where code can't draw it well enough, generate it and animate it as paper.** People drawn
  from shapes in code show their construction, however careful (Qing, 2026-09-28: "I can still
  see the circles? it's not really good art if I can see the circles"). Generated artwork, cut out
  and animated as paper cut-outs, is allowed (Qing: "if we need to incorporate more generated
  images and like, paper cut animate them we can"). Episode 2 v3's people and the places behind
  them are made this way; how is in [its style reference](.claude/skills/music-video/references/style-cut-light.md).

- **The content leads.** Every sung line shows what it says, animated: a person, a place, the
  thing going wrong or right on the words. Listeners could only parse the lyrics with context
  animation, and a minute of the band alone lost Qing ("a whole minute through and all I've seen
  is the band which can't be right"). The band frames the story; it isn't the story.
- **Repeats progress.** A chorus that comes back shows the same things further on, and no shot
  type plays twice in a row. The band jumping on every beat was "VERY repetitive by the end".

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

## The bar, as checks

- **Beauty:** any frame could be printed. There's one coherent world and style, and no default
  "AI slop" gloss.
- **Clarity:** each shot has one main read, and the viewer can always tell what's happening. Each
  line's story is shown big, not only glimpsed through the letters.
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
  order (in the ep01 renderer, `tools/typo-audit.mjs` and `typo-report.py`). Then look at the
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

## Pitfalls met on episode 1

For any style. The pitfalls of drawing in ink and gouache are in
[its reference](.claude/skills/music-video/references/style-ink-and-gouache.md).

- A line sung just before a cut is gone before it's read. The key line of episode 1 ("I can't
  read your mind") was on screen for under 0.2 s in three places. Finish writing each word about
  0.45 s before its cut, move the cut to the next beat, or hold the key line as one block.
- Words scattered over a frame at different sizes are hard to read, however pretty. v4's first
  Kubernetes frame climbed SCALING UP a letter at a time and put YOUR BLOG on a tiny tag, and
  Qing found it hard to read. Stack a line's words in the order they're sung, at sizes a phone
  can read.
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

## Word timing comes from the voice

In a lyric video every word lands on its sung onset, so every word needs its own measured time.
Qing (2026-09-28), on the tempo: "138 sounds about right but you shouldn't rely on that for a
lyric video that aligns perfectly word to word".

- **The beat grid times the picture, not the words.** Cuts, camera and grooves go on the beat.
  Singers push and pull against the beat, so a word snapped to the grid lands early or late.
- **Align the known lyrics to the isolated voice.** Force-align the lyrics as sung to the vocal
  stem with a phoneme-level aligner. Transcription timestamps (episode 2 v1 used Whisper's) drift
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
- Small subjects at the bottom of the frame under an empty field read as unfinished. Fill the
  middle of the frame, between the words and the floor. Episode 2 v3's first cut did it again in
  every verse and bridge line; staging each member facing his reflection filled it with the story.
- **Make each turn of the story visible, not only sung.** If two verses look alike, the change
  between them is invisible. Episode 2 v3's verse 2 first looked like verse 1 though it sings the
  answer to it; an oracle became a window cut where the reflection was.
- **Anything scattered over the frame keeps clear of the lyrics.** Particles, icons and flying
  things placed at random land on words: episode 2's chorus ticks and moths covered THE and FIND
  until each was kept outside every word's box and the moths flew away from the rows.
- **Several stories in one song blur together.** A test listener liked episode 2's song but
  couldn't tell it was about four separate apps (Qing, 2026-09-28). Give each story an owner who
  keeps it (on episode 2, one band member per app, named with it in the intro), a number and a
  label ("1/4 ROSA'S BAKERY · CHECKOUT"), and visit them in the same order every time.
- Lettering drawn over the shots (episode 2's backing pop-ups) needs its own writing clock, or a
  word written before a cut un-writes itself after it.
- A texture laid over the whole frame, like episode 1's paper, wasn't liked by everyone (Qing,
  2026-09-28). Put the hand in the line.
- **v1 looked like episode 1, and nobody would click it.** Its renderer was copied from episode
  1's and restyled: the alphabet was the same file, byte for byte, and the people, crowds and
  props were copied too. Only the surface treatment changed (flat colour and a felt-tip line
  instead of texture). At thumbnail size, what people see is the lettering, the characters and
  the palette, and all three were episode 1's. Qing (2026-09-28): "it just looks WAY too much
  like episode 1 - so if people see that thumbnail they won't click it"; "my number 1 problem is
  that the font looks the samr"; "i don't think the plan to reuse any assets works at all".
  The rule is in [Every episode draws its own](#every-episode-draws-its-own).
