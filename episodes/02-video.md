# Episode 2 video, v3: "Cut Light"

The third video for episode 2, made to the take Qing chose on Suno, "How Will I Know". One
auteur made it from a blank page after Qing's notes on v2, with no reviewer committee, at maximum
effort. The only condition at every stage was her question: do I stand behind this artistically?
The renderer is [video/ep02/cutlight/](../video/ep02/cutlight/README.md), and the style's reference
is [Cut Light, ink and neon](../.claude/skills/music-video/references/style-cut-light.md). v2,
"The Mirror", and v1, "The Garage", are kept below.

## Qing's notes on v2 (2026-09-28, verbatim)

> hey, I don't love it yet but I see the angle you're going for.
>
> 1) the text animation is still super simplistic and just, like, going horizontally across the
> screen rather than as a graphic design element in it's own right. the font design is also kinda
> antithetical to the alternative ness
>
> 2) some of the fonts and text layouts are not clear (for example the way the band members intros
> hang off the blocks)
>
> 3) the visual design has gone back to the simplistic and cartoony that I complained about back in
> v1. and the colour scheme is too repetitive - with just the red and black I can't tell the band
> mates apart easily. and the human character designs are very clumsy as well
>
> please don't put random Japanese in its super cringe and I can't post that
>
> hmm, I feel like you've anchored way too hard on the suggestions I gave as guidance again and
> it's distracted you from your own artistry!
>
> can we start over and just...... forget trying to satisfy all my conditions, just have all your
> conditions at every stage be "do I stand behind this artistically"? in character, set, design,
> colour, lineart, creativity, dynamicism, story clarity... I can forgive most things if it's
> beautiful enough.
>
> I like the concept it just doesn't wow me. the execution looks lazy.
>
> I've taildropped you the steins gate intro as inspiration.
>
> if you need a model with access to image gen as an oracle please feel free to ask gpt!

Then, as v3 started:

> no no no no no. not the api I mean codex

> just ask Codex to use it's built in image gen call

> anyway, don't copy steins gate, it's there just to remind you what detailed artistry looks like

> I want you to go all out

## Qing's notes on v3's first cut (2026-09-28, verbatim)

On the people, from the thumbnails and a frame of chorus 3:

> I'extremely sceptical of the people based on your thumbnails

> you need to apply a high quality bar for your own artistry before handing back to me. don't hand
> back until you think it's good

The people were redrawn from scratch in the film's own pen. Then:

> it's better, but, like, I can still see the circles? it's not really good art if I can see the
> circles

> if we need to incorporate more generated images and like, paper cut animate them we can

So the people and the places behind them became generated artwork, cut out and animated as
paper (see *The people, and the places they stand in*, below).

## The world

The band plays inside a box of mirrors. Every check they run shows them only themselves. Every
word they sing is laser-cut out of the mirror, and through the letters comes the daylight of the
world outside, where the people they built for are. The film goes from mirror to window:

- **Verse 1, the mirror.** Each member faces the glass and plays to his own reflection, clear and
  lit, while what went wrong with his app is cut through the mirror above it. Through the
  letters, only glimpses of the place: the bakery's queue, the clinic's error page, the school
  gate, the wedding.
- **Pre-choruses.** CLAWD alone at the glass, his hand on it. BROKEN cracks out from his hand;
  his reflection sings the echo, "(for myself?)".
- **Choruses.** The whole band, all four lasers. PERFECT is cut round a perfect circle; CHECKS
  and TESTS are ticks cut all over the glass round the words, and then the bugs you'd find come
  in through them as moths.
- **Verse 2, the windows.** Each oracle cuts a window where the member's reflection was, and he
  sees out: the load test's customers, the clinic's booking site as the bot playing Gran books,
  each family's messages sealed in a cell of its own, and Jess holding up her note.
- **The bridge** sets ORACLE as a dictionary headword over four windows, one for each oracle
  so far. RUN AND RUN turns round a disc of mirror like a clock. For HEURISTICS, NULL shines a
  torch at the glass, and it clears only where the beam falls: a partial view, better than
  none. NONE is struck through and DONE stamped.
- **Pre-chorus 3 and chorus 3.** The people have come to the glass. One-way glass turns clear
  when the far side is the brighter, and it does: the four they built for, and others, stand
  outside watching. On the last PROVE! the box shatters.
- **The outro, in the square at golden hour.** The pieces of mirror hang in the air with the
  outro's lines cut in them, and four more carry the evidence, a brief's number and a tick
  each. A question mark comes down for what they can't know. CLAWD asks "SO, DO YOU LOVE IT?",
  and the four answer in their own hands. Then Jess, about Dave.

## Four briefs, one per band member

Each app belongs to one member, is introduced with him, and comes back in the same order, in his
colour, with a numbered label.

| Brief | Built by | Verse 1: through the letters | Verse 2: the window |
|---|---|---|---|
| 1/4 Rosa's bakery, the checkout | REGEX, guitar (cyan) | the shop at eight, the queue | the queue doubled in cyan: a load test on every merge |
| 2/4 the clinic, the booking site | CRON, drums (lime) | the cute site, spinning, "please try again later" | the booking site, tried by NULL playing Gran, and BOOKED |
| 3/4 Parkside School, the feedback app | NULL, bass (violet) | parents reading each other's private messages | four cells, a family in each, their messages theirs alone |
| 4/4 Jess's wedding, the seating plan | CLAWD, vocals (orange) | Dave next to his angry ex | Jess at the glass: "Dave + Sue: NOT the same table!!" |

## The band

| Member | Mark | Plays |
|---|---|---|
| CLAWD | the plain mascot, the only one without a costume | the mic |
| REGEX | a visor with his colour scrolling across it | a white offset guitar; he plays the intro riff |
| CRON | headphones with lime rings | a kit with a lime ring on the kick and brass cymbals |
| NULL | a black hooded cloak, two violet eyes in the hood | a black long-horned bass; he plays Gran in verse 2 |

Each is the mascot's own block, posed in 3D so the camera can go anywhere and drawn over the
pose by hand. Their colours are the only colours inside the box, so you can tell them apart in
any shot, even from the back.

## The people, and the places they stand in

The people, and the four places behind them, are paper cut-outs. Codex's image generation drew
them from our briefs, in one hand-inked illustration style: character sheets of the six named
people first, then each of them in the poses the film needs, crowds for the queue and the square,
and backdrops of the bakery, the clinic's waiting room, the school, the wedding marquee and the
town square at golden hour. The signs and the tables were left blank, so the words on them are
ours. Each figure is cut out of its sheet (`tools/cutout.py`) and animated the way paper
cut-outs are: a card that sways on its feet, breathes, bobs on the beat and is swapped for
another pose with a pop, moving on twos while the camera moves on every frame, with a thin paper
edge and a soft shadow. Dave's waving forearm is a separate piece, pinned at the elbow.

| Person | Brief | Seen as |
|---|---|---|
| Rosa | the bakery | a baker in her apron, flour on her arms |
| Gran | the clinic | curly white hair, glasses, a plum coat over a plaid skirt, her handbag; squinting at her phone held up at arm's length |
| A parent | the school | a green parka, jeans, a tote bag |
| Jess | the wedding | a white gown and a veil; her note held up, then arms folded, deadpan |
| Dave | the wedding | round, bald, in a three-piece suit, beaming and waving |
| Sue | the wedding | a red dress, long black hair, heels, arms crossed, glaring at him |

Inside the box the lighting is the band's; outside it's the day, so each person comes in two
lights: lit from the front, for the views through the cuts, and against the golden-hour sun,
rimmed in gold, for the square.

## The look

A manga page that moves, inked in black and paper white. Every surface is hatched from its light,
dark materials are drawn white on black like scratchboard, and the line boils on twos. Inside the
box the only colour is light: the four members' colours and the daylight through the cuts. Stage
beams are bundles of fine lines, smoke has an inked edge, the floor is wet black glass, and
focus lines close in on the crashes. Outside is the same pen on a page in daylight: the square
inked in warm ink with its shade sides hatched, lit by a low sun behind it, the people rimmed in
gold.

The intro plays the riff as a storm of laser cuts: every note of the guitar stem is a cut across
the mirror, and the cuts open into shards of sky. Each member is introduced with his name cut a
letter a note, his instrument and his brief under it. Then the title, one letter on each of the
bar's twelve notes.

Borrowed ideas, drawn fresh: one-way glass, which turns see-through when the far side is the
brighter; manga's hatching, scratchboard blacks and focus lines; and stencil lettering, whose
letters are already separate pieces, as a cutter needs.

## The lettering

- **The band's words are cut out of the mirror,** in Big Shoulders Stencil Display at its
  heaviest weight. A laser runs round each piece of each letter in the member's colour, the
  piece drops out, and the day comes in. The cut finishes 85 ms before the word is sung.
- **Every line is a poster:** its rows are sized to fill a box on screen, so the lettering is the
  frame's composition, not a caption over it. What's seen through the letters is the place the
  line is about.
- **Words act out what they say:** BROKEN cracks, THROUGH stays stuck in the glass, PERFECT is
  cut round a circle, MERGE has two branches running into it, each word of the isolation check
  gets a cell of its own, RUN AND RUN turns like a clock, NONE is struck through, DONE is
  stamped.
- **Echoes are etched, not cut:** the backing vocals are glowing lines drawn on the glass,
  in the colour of whoever sings them, beside the reflection that sings them.
- **The machine's voice** (the labels, the brief tickets, the teaching card) is JetBrains Mono.
- **The people's hand** (Jess's note, the four "I love it!"s, "Dave's still coming, though.") is
  Rock Salt, written outside the glass, never cut into it.
- **A sung line holds across cuts.** A line cut before a shot starts is carried into it already
  open.

## The timing and the captions

As v2: every word timed from the voice, landing 85 ms ahead of it, and captions that follow the
take (see v2's sections below). The words and the captions are unchanged.

## The teaching card

Unchanged from v2 (below): HOW YOUR AGENT CAN KNOW, four common kinds of oracle (there are
more), over the band's last jam.

## How it was made

- **Looks first, from a blank page.** Codex's built-in image generation drew style studies for
  the world (a band in a box of mirrors, words cut out of the glass) as an oracle for the look;
  none of them is in the film. The look was then built in `look.js` as hero frames before any
  shots.
- **Canvas 2D over a small 3D kit.** A camera and solids in centimetres place everything; the
  band, the box and the lettering are drawn in 2D and inked.
- **The people and places are generated,** then cut out and animated here as paper (above). The
  sheets and briefs are kept out of the repo; the cut-outs and backdrops are in
  `video/ep02/cutlight/cast/`.
- **The first full cut was reviewed at full size and redrawn where it was weak.** Verse 1 had the
  words at the top, the member small at the bottom and an empty middle, and verse 2 looked like
  verse 1. So each member now faces his reflection in verse 1, and the oracles cut windows where
  it was in verse 2. The last third got the one-way glass clearing. The outro square was redrawn
  in ink at golden hour, and its small cards became pieces of mirror.

## How it was checked

- **Words:** the typography audit (`video/ep02/cutlight/tools/typo-audit.mjs`, `typo-report.py`,
  run by `typo-run.sh`) rendered the film every 0.1 s and judged all 487 sung words for size, time
  fully on screen, contrast at the letters' edges, cover, tilt, reading order and the phone apps'
  UI zone. Each cut-out piece is recorded as its own polygon, so contrast is measured round the
  letters themselves. The first run flagged 123 words and missed 21. Carrying lines across cuts,
  starting rows below the brief labels, keeping low rows out of the button strip, keeping the
  chorus's ticks and moths off the words, and thinning the glow round the stuck words brought it
  to 24 flags, all there on purpose. The whispered dedication and the stuck words (GET THROUGH,
  BROKEN) are etched with a glow the check reads as their edges blending (13); they read clearly
  by eye. RUN AND RUN turns round its disc, so it's tilted (7). And the two PROVE!s are hit by
  the flash of the crash (4). Every word is lettered while it's sung, and every line reads in
  sung order.
- **Motion:** `video/lib/motion.py` on the master: five near-still seconds, all on the teaching
  card and the end card, which are there to be read.
- **Shots:** `video/ep02/cutlight/tools/shots.mjs`: 60 shots and no gaps. Where two overlap, the
  next starts a fraction early on purpose, to cut its first word, and wins.
- **Craft:** eight full previews at 540 wide, each as a contact sheet at one frame a second; stills
  of every shot that changed; each view behind the wall rendered whole, to check what the letters
  show; 30 fps strips of the cut-outs moving and of Dave's wave; and the lyric frames tiled at
  phone size, 390 px wide, and read as a viewer would. At that size, two backing echoes sat on
  other words and were moved.
- **The master:** 1080×1920 at 30 fps, 174.83 s and 5,245 frames, counted by decoding it; stills
  pulled from it at every fix.

## Where it falls short

- **The people move as cards,** not as drawn animation: they sway, bob, swap poses and (Dave)
  wave a pinned forearm, but they can't turn or walk. That's the paper cut-out style, and its
  limit.
- **Two hands in one film:** the band and the box are drawn in code, the people and the places
  outside are generated illustrations. The box is ink and neon, and the day is a painted world;
  the film is about crossing from one to the other, but it's a seam you may see.
- **The timings rest on measurement and one listen.** Qing checked the karaoke version and chose
  the lead; nobody has checked this film's sync by ear yet.
- **The storm's cuts follow the riff's rhythm, and its pitches only roughly:** the notes come
  from a distorted guitar stem, where octaves are often wrong.
- **Choruses 1 and 2 share their shots,** mirrored, with chorus 2's echoes added. Chorus 3 is
  different: the people are at the glass, and it ends by breaking the box.
- **The teaching card is teaching the song doesn't sing.** Its wording is a claim for Qing to
  check.

---

# Episode 2 video, v2: "The Mirror" (retired)

The second video for episode 2, made to the take Qing chose on Suno, "How Will I Know", and
retired after her notes on it (above). One auteur made it from a blank page, with no reviewer
committee, following the
[music-video skill](../.claude/skills/music-video/SKILL.md) at maximum effort. The renderer is
[video/ep02/mirror/](../video/ep02/mirror/README.md), and the style's reference is
[Mirror Kei, G-pen ink and title-card type](../.claude/skills/music-video/references/style-mirror-kei.md).
v1, "The Garage", is kept at the end of this file and in [video/ep02/garage/](../video/ep02/garage/README.md).

## Qing's brief for v2 (2026-09-28, verbatim)

> hey, let's take another attempt at music video number 2.
> As the genre is more alternative rock, you got to think like an alternative rock music video of
> the '80s and you can also take a heavy dose of inspiration from Visual Kei, from J-rock in the
> '90s.
>
> We've got our rock band made up of four clods and they're rocking their instruments. It doesn't
> have to be exactly a rock band made up of clods. They're rocking their instruments. You need to
> think about what visual illustration style would suit this. I would take inspiration,
> potentially, from the more experimental and alternative anime genres
>
> And you also got to think about visual design and motion design for the lyrics, where I want
> them overlaid in a way that matches beautifully and rhythmically with the song (such that the
> lyric animation is almost a musical instrument in itself). You're choreographing the lyrics and
> making them express the angst behind the music and the lyrics. It's your classic alternative
> rock "Tell Me How to Love You Right, I Keep Doing It Wrong" song, just through the software
> lens.
>
> As usual you can follow a process you want but when it comes to the artistry, no design by
> committee. You, as solo author, use review for mechanical details like: Does it look right? Are
> the layers layering right? Do the lyrics read well and things like that? Anything else that you
> want to have reviewed for how the audience will see it, but don't design by committee

> And yeah as always, just be really ambitious about the level of artistry that you could
> possibly achieve here and the level of creativity and stylishness that could be done. We want
> to wow people with Opus's art

> sorry, meant to say alternative rock video of the 00s.
>
> One thing that you might not have transcribed anywhere is this intro, this guitar intro. It is
> this really bold, wow, and astonishing virtuosic guitar riff that is so almost atonal. It's
> almost math rock in how it comes across and it really sets this driving tone for the rest of
> the song so you want the intro to be really visually astonishing as well

> also content wise, if you want to include a teaching card on the outro, we can teach our 4
> types of agentic oracles - programmatic mechanical tests (like linters or load test tools),
> deterministic comparisons (e.g. a screenshot or other software to match), heuristics to be
> agentically applied (e.g. via skill files or reviewer prompts), or LLM-as-Judge user
> simulations. I'm obviously being very succinct here but you can write how you see fit as long
> as it is accurate and useful. and don't imply it's the only 4, they're just 4 typical examples

## Qing's notes while v2 was made (2026-09-28, verbatim)

On v1's lyric timing:

> By the way I've watched your previous video now and one technical note about lyrics is that if
> the lyric is animated, you want it to ideally finish or be almost finished appearing by the time
> it's sung in the music. This is because the lyrics are animated and I think what's happening is
> it starts to appear at the point where the word is sung. It just gives the impression of being
> ever so slightly behind the entire song and that seems very fixable and is very general

On the karaoke check of the new timings, and then on three versions of it with the words leading
by 50, 100 and 150 ms:

> hey, I saw file you taildropped me - all the yellow underlines just feeeeel a tiny fraction
> late. it's so subtle but it matters at this tempo

> I think between a and b of what you just sent - maybe 80-90

On clarity:

> btw, hopefully the character design will help but a test listener said they like the song but
> it's quite hard to work out that it's talking about 4 separate independent scenarios. but
> hopefully the scene design in the animation will make it super clear. you could even have it so
> that it's a separate band mate working each brief though you've probably thought of that
> already

## The world

Four visual-kei Clawds, the band Looking Glass, play a black-lacquered stage that faces a wall
of one-way mirror. From their side it's a mirror: every check they run shows them only
themselves, and their reflections always look perfect. The people they built apps for stand in
the dark on the other side. One-way glass turns see-through when the far side is lit, so in this
film an oracle is a light switched on over there.

The film goes from mirror to window. In verse 1 a pane flickers on for each disaster and goes
dark again. In the pre-choruses you knock on the glass from the dark, and CLAWD can't see who;
his reflection, not he, sings the echo "(for myself?)" back. The choruses' strobes give glimpses
of your side: moths all over the glass (the first computer "bug" was a moth, taped into the
Harvard Mark II's logbook in 1947). In verse 2 each oracle is a lamp switched on for good. The
bridge says what an oracle is, by lamp, clock and torch. By the third chorus the house lights are
up, and on the last "prove!" the glass shatters. Then the band shows its checks, hands you what
it can't know, and asks if you love it.

## Four briefs, one per band member

A test listener couldn't tell the song was about four separate apps, so each belongs to one
member. The intro names the member with what he built, a numbered plate on each pane says whose
brief it is, and verse 2, the bridge, the choruses and the outro come back to them in the same
order.

| Brief | Built by | Verse 1: what went wrong | Verse 2: the oracle |
|---|---|---|---|
| 1/4 Rosa's bakery, checkout | Gt. REGEX | down at eight, fifty in the queue | a load test on every merge: simulated customers, twice as many |
| 2/4 the clinic, booking site | Dr. CRON | cute, but Gran couldn't book | a bot prompted to act as Gran: NULL, who didn't build it, in her cardigan |
| 3/4 Parkside Primary, feedback app | Ba. NULL | parents could read each other's texts | an isolation check: each family's messages sealed, a light sweeping them |
| 4/4 Jess's wedding, seating plan | Vo. CLAWD | Dave next to his angry ex | only you knew: your note, pressed to the glass, "Dave + Sue: NOT the same table!!" |

## The band

| Member | Look | Plays |
|---|---|---|
| Vo. CLAWD | black hair swept over one eye, one red lock, a tall black collar, a chain | the mic |
| Gt. REGEX | six crimson spikes, a sticking plaster | a pointed white guitar; he plays the intro riff |
| Ba. NULL | a bone-white curtain of hair to the floor, black lips | a long black bass; he plays Gran in verse 2 |
| Dr. CRON | a black star of a mane with red tips | a clear acrylic kit with the band's name on the kick |

Each is drawn from the mascot's own proportions, with eyeliner wings and four platform boots.

## The look

90s cel anime inked with a G-pen, in the red, black and bone of 2000s alternative rock. Every
outline is a run of tapered pen strokes that boil on twos; fills are flat, with one hard shadow
tone and a rim of the scene's light. There's no texture over anything. Light is shape: flat cones,
strobes on the snare, and impact frames on the crashes (a frame or two inverted to a negative,
as anime does on a hit). The camera is hand-held, as a 2000s rock video's is: it drifts and rolls
a little on every shot, and breathes with the kick.

The intro plays the riff note by note. Each note of the guitar stem (97 of them, found by
constant-Q spectral flux) is a point on a circle of the twelve notes, and each run of three notes
is a pane of stained glass. Laid round six mirrors, the riff is a gothic rose window that
re-leads itself on every note and doubles to twelve mirrors on the strong ones, with each member
in its centre, introduced J-rock style ("Gt. REGEX, built Rosa's checkout"). The note pitches come
from a noisy guitar stem, so the window's shape follows the riff roughly; its rhythm follows it
exactly.

Borrowed ideas, drawn fresh: the mirrored tunnels of The White Stripes' "Seven Nation Army" and
Battles' "Atlas", the red-black-white of 2000s alt-rock sleeves, Evangelion's title cards,
visual kei's hair and eyeliner, and anime impact frames.

## The lettering

- **Every sung word** is set in Noto Serif Display Black, cut extra-condensed, in capitals: the
  title-card voice. Stressed words are red. Every word has an ink outline scaled to its size.
- **Echoes** are hollow glass-blue italics, sung by the reflections.
- **"perfect"** is written in red lipstick on the glass as it's sung (Mr Dafoe).
- **By section:** verse words are stamped in and shiver with the palm-muted chug; chorus words
  slam in from 190% and kick with the drums; spoken words fog in.
- **A sung line holds across cuts.** The pictures cut on the phrases; each line builds word by
  word above them as one block and stays until it's done.
- **Other lettering** is part of the picture: the band's name in Grenze Gotisch, tests and tags
  in Courier Prime, your note in Covered By Your Grace, and 第二話 ("episode two") and 合格
  ("passed", on a red exam seal) in Shippori Mincho.

## The timing: every word from the voice

v1's word times came from Whisper and ran about 130 ms early on average. v2 times each word
afresh (`music/ep02/align_words.py`):

- **Four estimates, one vote.** Two forced aligners (torchaudio's MMS_FA, and its English
  wav2vec2) and two Whisper runs (on the vocal stem and on the full mix), matched a section at a
  time. Each word takes the median, then moves to the nearest onset of sound on the stem.
- **The whole vocal stem, not the karaoke split,** because the karaoke model put chorus 2's
  first line in the backing stem.
- **Checks:** repeated lines (the three choruses) come out sung alike, within about 50 ms. One
  word is set by hand: the fourth "(I love it)" is sung "I love iiit", and every estimate put
  "it" at the end of the held note; the stem's voiced onset is at 157.64 s.
- **Then Qing's ears.** She watched a karaoke check of every word, heard the words land a
  fraction late, and chose from three versions how far ahead they should land: 85 ms. Every
  word's entrance now finishes 85 ms before its measured onset.

## The captions: what the take sings

The captions follow the take, not only the sheet
([music/ep02/captions.txt](../music/ep02/captions.txt); the timed file is
[music/ep02/captions.srt](../music/ep02/captions.srt), rewritten from the new timings):

- **After chorus 1, the hook is sung again:** "So give me something I can prove!"
- **"(something else)" is echoed twice** in the first two pre-choruses, once in the third.
- **Four "I love it"s,** not three.
- **A wordless "ooh"** over the last instrumental.
- **No backing is audible** after verse 1's fourth line, verse 2's third line or chorus 2's third
  line, where the sheet has "(oooh)", "(ohhh)" and "(ooh-ooh)". Those captions are left out.
- **The heuristics line** is captioned as written ("And even only heuristics I'd be"), as Qing
  asked, though the take slurs it.

## The teaching card

Over the band's last jam, one kind a bar:

> HOW YOUR AGENT CAN KNOW
> four common kinds of oracle (there are more)
> 1 MECHANICAL CHECKS: Tools that test it: a linter, a load test on every merge.
> 2 COMPARISONS: Something to match: a mockup, a screenshot, other software.
> 3 HEURISTICS: Rules of thumb an agent applies: a skill file, a reviewer prompt.
> 4 SIMULATED USERS: Another agent plays your user and judges it as they would.
> Give it these before it says "done".
> Oracles: an old idea in testing (Howden; Weyuker; Bach & Bolton). For agentic coding: Yanqing
> Cheng.

## How it was checked

- **Motion:** `video/lib/motion.py` on the preview; three near-still seconds left, at the start
  of the whispered dedication and in the pre-chorus 3 duet, where stillness is the moment.
- **Words:** the typography audit (`video/ep02/mirror/tools/typo-audit.mjs`, `typo-report.py`)
  rendered the film every 0.1 s and judged all 487 sung words for size, time fully on screen,
  contrast at the letters' edges, cover, tilt, reading order and the phone apps' UI zone. The
  first run flagged 65 words and missed one. The causes were a cut after every chorus phrase,
  long lines shrunk to fit, red on busy grounds, and rows in the lower-right button strip.
  Holding each line across its cuts, splitting long lines, an ink outline on every word and a
  rule that keeps low rows clear of the strip brought it to three flags, all "broken," splitting
  along its crack by design (the halves overlap, and it's up 0.5 s in two pre-choruses, at 170 px
  cap height). Every word is lettered while it's sung, and every line reads in sung order.
- **Faces:** no sung word covers a face; the close-ups were rebuilt with the type above them.
- **Shots:** `video/ep02/mirror/tools/shots.mjs` lists gaps and overlaps between shots; none.
- **Craft:** contact sheets of the whole film at one frame a second, 30 fps strips across the
  intro, and stills of every shot at full size.
- **The master:** see the report to Qing for its duration and frame count, decoded from the file.

## Where it falls short

- **The rose window follows the riff's rhythm exactly and its melody roughly:** the pitches come
  from a distorted guitar stem, where octaves are often wrong.
- **The timings rest on measurement and one listen.** Qing checked the karaoke version and chose
  the lead; nobody has checked the finished film's sync by ear yet.
- **The people are simple:** mitten hands, stiff legs, faces from a few strokes. They read, and
  they belong to the style, but a studio would draw them better.
- **The teaching card is teaching the song doesn't sing.** Its wording is a claim for Qing to
  check.
- **The choruses share their plan,** varied each time (who's in the close-ups, what's stamped,
  how lit the far side is), so the third chorus rhymes with the first on purpose.

---

# Episode 2 video, v1: "The Garage" (retired)

## Qing's brief for v1 (2026-09-28, verbatim)

> hey so I ended up paying for suno and, uh, the genre took a sharp left turn. it's now... kind of
> experimental post-paramour?

> I'll paste you the lyrics as they ended up at the end, but obviously the captions need to be spot
> on so you need to transcribe all the backing vocals as is. also I know the heuristics line is
> slightly mangled but the rest is so strong that well just let the lyrics cover that problem.

> do you remember the successful process from last time? lyric - text focused, strong, hand drawn
> artistic style, (doesn't have to be the same as last time), careful attention to artistry and
> detail, solo auteur no committee at least on the artistry.

> btw one minor nit on last time is the texture that ended up over everything, not everyone liked,
> so we should think hand drawn more for the line art style than as a uniform texture over the
> colouring

> I still want a boy band of claudes but now they have to be like, playing guitar and drumming and
> stuff in the instrumentals

> I would actively prefer a different art style of your choice - to go with the new genre!

## Qing's notes on v1 (2026-09-28, verbatim)

> I saw the thumbnail of the episode 2 attempt from last night [...] and it just looks WAY too
> much like episode 1 - so if people see that thumbnail they won't click it. what happened to
> doing something completely different?

> noooooooooo my number 1 problem is that the font looks the samr

> like i don't think the plan to reuse any assets works at all.

> it has to FEEL different. this video just doesn't match the genre.

> for me it's cool and kooky and alternative and slightly shocking, nothing like the cutesy and
> bubblegum and childish vibe of episode 1. I'd imagine, like, geometric and anime like the steins
> gate intro or something? and way more typography-focused with text appearing exactly word by
> word aligned with the timing and moving and animated animated in a proper animated lyric video
> way (though this is actually general feedback - episode 1 would have been better if it had this
> too)

> I think "motion design" is one of the key words I'm looking for btw.

> also i realise I forgot to whack effort up to max last night - you should refuse to do me the
> final video unless effort is set to max

Gemini's description of the take, with where it disagrees with the measurements, is in
[music/ep02/listening-notes.md](../music/ep02/listening-notes.md).

## What v1 was, and what went wrong

ASYNC, a boy band of five Clawds, practised in a garage with the door shut, told only "broken"
by notes pushed under it; the look was cut paper and marker, a pop-punk zine
([its reference](../.claude/skills/music-video/references/style-cut-paper-and-marker.md)). Its
renderer was episode 1's, copied and restyled: the alphabet was the same file, and the people,
crowds and props were copied unchanged. The feel stayed episode 1's too: a cosy picture book at a
boy band's pace, set to a 136 bpm pop-punk take. v2 was drawn from a blank page.
