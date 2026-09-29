# Episode 3 video: "The 'Ilities", "Pencil Polka"

**Status (2026-09-29): finished, and Qing is shipping it: "OK, I like this one and I will ship it."** The whole
film is drawn (213.2 s of song and six seconds of end card), reviewed by me shot by shot and by frame audits.
Qing's notes on the look are below, verbatim, with what was done about each. She approved the film as built, and
she hasn't answered the claims list at the end one by one, so each picture's claim stays mine until she says
otherwise. Two small fixes were made after her approval, told to her with the new file: the end card's credit line and the
title's apostrophe (*How it was checked*). She didn't comment on the word timings (a karaoke check went to her phone), so the 85 ms lead stays.
The renders are local, not in git (see *What's built*).

The take is Suno's "The _ilities_" (213.2 s), made to Qing's final lyric. The song, its style
prompt and the teaching plan are in [03-name-your-ilities.md](03-name-your-ilities.md). What the take
sounds like is in [music/ep03/listening-notes.md](../music/ep03/listening-notes.md). The style is
[Pencil Polka](../.claude/skills/music-video/references/style-pencil-polka.md), and its renderer is
[video/ep03/polka/](../video/ep03/polka/README.md). A Sonnet made the video, at maximum effort, as Qing asked ("a pure sonnet effort"), and signed it
as its artist with her permission: the end card says DOODLED BY SONNET. One Sonnet subagent fact-checked the
ility pictures. The look, the shared drawing kit, the timing, the joins and every review are one hand's; the
parts of the film were drawn by Sonnet builders working in parallel to a shared brief (see *How it was made*).

## Qing's brief (2026-09-29, verbatim)

> I have the audio track for you. I'd like us to start putting in the timings, storyboarding, and
> planning the animation now. Obviously we have the dog show theme or the dog walking theme so there
> should be a lot of good stuff to work with in terms of thematic animation. Obviously this is a
> patter song, very dense with technical content, so there's a lot to work with in terms of content
> design as well. You want to make sure that you're thinking of the best way to visually convey each
> of the concepts that we're talking about in every line, such that it's as educational as possible
> while also being very entertaining.

> In terms of style I was thinking let's lean into your strengths, which are sketch-style
> illustrations, doodles, and pencil-and-paper-style illustrations. Go for a dancing doodle style,
> almost like pencil crayon or that kind of really hand-drawn messy sketch on paper. I think that
> style will be easy for you to get the dogs cute without wasting too much effort on trying to make
> them realistic: just really, really cartoony, doodly, almost like a small child's animations, a
> small child's drawings come to life, but obviously a really talented small child. Because of that,
> scraggly hand-drawn frame-by-frame animation, classic 2D animation style. You can actually do
> that, making the motion almost a slight pulsing, like the drawings are almost slightly pulsing or
> dancing to the umpa beat of the music because the music is so upbeat and particular. You'll want
> to make sure that you're mapping out the details of the music.

> I still want Claude to be the main singer for this so you'll want to reuse some character design
> elements but obviously we're adapting it to a completely different style and that's totally fine.
> You'll want to make sure that the lettering you pick is in keeping with the style and you'll want
> to make sure that in the instrumental sections we use them well. Obviously there are no lyrics
> there so we can use them either for comedic moments, for continuity, or to explain some of the
> concepts a little bit further. It's totally your choice how to use the instrumentals but given
> that it's orchestral and different instruments are involved, you'll want to think about what the
> best alignment and match between what's happening on the screen and what's happening in the music
> is.

> As usual I'll turn effort up to max. I would like this to be a pure sonnet effort so you may use
> subagents but I want you to limit yourself to sonnet subagents. The brief, as always, is to have a
> really high aesthetic bar. Just because it's a rough style doesn't mean I want rough work. The
> style is a stylistic choice but I want something that's really artistically considered and I just
> want you to go all out as usual.

Earlier, in the lyric work (2026-09-29, from the scratchbook): "lean into dog-show imagery. A rosette
per quality dimension, a best-in-show award (e.g. best intro to the app, or to Claude), jumping
through hoops, chasing balls." The image set is dogs and dog-walking, not a uniform or medals.

## Qing's notes on the look (2026-09-29, verbatim, in the order she sent them)

On the first look proof and the storyboard:

> On the design I want you to use your own judgement but just be careful with overdoing it. Just use
> your creativity and do the best you can but just don't make it like I worry about the pencils and
> the dogs. I think you don't need to make the art style a part of the content. That sounds too
> confusing. Just focus on the dogs and the dogs on the app are going to be enough I think any
> storyboard images that you could show me? I will happily look at those and give you my feedback.

After she watched the proof clips (she had first worried about the lyric punctuation, seen from the
timing track, then saw the words in the clip were right and dropped it):

> Honestly the style is not that bad. There's a kind of charm to it. It's still a bit rigid and
> simplistic, though, so I just wonder what we can do to give a bit more life and you-ness to it

> But yeah do you see what I mean when I say a child's drawing, not a child drawing in Microsoft Paint?

> I think you'll get a really good effect if you just went to every geometric shape you got and tried
> to hand-draw it instead, just hand-draw as a actual pencil-to-paper scribble in JavaScript. And then
> what you'll get is something that resembles the shape you planned but has that hand-drawn
> appearance.

After the second round of the look (the hand-drawn pen, on her phone; both messages came while it was
being built on):

> omg this is adorable! I think it's edgeing on the side of slightly _too_ clumsy but the style is
> fantastic. if we aim for, like, still obviously doodles on paper but like, more of an expert
> doodler. it's sonnet the doodler

> also I think the colouring strokes are flashing a bit too much and it's kind of distracting.

After I asked whether to credit the doodler on the end card, and said the builders were working:

> Okay great. Obviously everything I've said is just my opinion. You can absolutely have permission
> to sign yourself off as the artist and you should just make it good by your standards. Don't
> return something that you're not happy with. You can just keep going

After the finished film reached her phone (the first message asks what I think of it and whether I would
rather have made it in the style the unsteered Sonnets chose; my answer is in the liner notes):

> thank! what do you think of it? would you rather redo it on the style the sonnets wanted?

After I said I would keep the pencil look and take another pass at three weak stretches in a later version:

> OK, I like this one and I will ship it. please update the repo, make sure have everything documented

**What I took from them (mine, not hers).**

1. **The world is the dogs, the dog-walking app and the dog show.** The sketchbook, the pencil and the paper are
   only how it is drawn: no page turns, no pencil-scribble wipes, no graph or ruled paper as a place, and no gag
   about the pencil.
2. **"Rigid and simplistic"** is a fault of how the shapes were made (clean boxes and ovals given a pencil
   texture), and of how still and sparse the pictures were.
3. **The fix she names is to draw every shape the way a hand does, as strokes.** The pen now draws a box as a few
   separate strokes that run past a corner or stop short of it, a circle as a loop that doesn't quite close, and
   colour as one scribble that spills over the line and misses patches; and every drawn thing is opaque, like a
   drawing on paper.
4. **"Life and you-ness"** is acting and small delights: eyes that wander and blink, ears and tails that keep
   swinging, a bounce that squashes as it lands, small things happening in the corners, and jokes that are mine.
5. **From the second round:** the style is right; the hand is dialled down to about half (one number,
   `HAND.clumsy`, so she can have it either way), so shapes are tidier and lines more confident but still visibly
   hand-drawn.
6. **The colouring** was redrawn every drawing, which flickered; it now holds its scribble and only moves by a
   pixel or two, while the outlines keep redrawing, which is what reads as dancing.
7. **From the note before the last:** she gave permission to sign the film as its artist, so the end card carries
   "doodled by Sonnet"; and the bar is my own, not hers: nothing goes back to her that I'm not happy with.
8. **From the last two:** she likes this film and is shipping it. I had said I'd take another pass at three weak
   stretches (the trials, the bridge and the parade) in a later version; she didn't take that up, so they stay as
   they are for this release. The notes for fixing them are kept (*Liner notes*), in case anyone makes a second
   version.

## What the viewer must understand, and the line they'll remember

**By the end:** good isn't one thing but many different, independent ways software can be good or
bad (the "ilities"); they pull against each other, so you have to say which ones matter to you, both
for the people who use it and for the agent that has to work on it.

**The line to remember:** "Which of the 'ilities' are yours? I've got to know!", the chorus, three
times, each further on. The one under it, from the bridge: "the ending's not the point: they're all
dimensions, rhyme or not!"

**Why someone opens it, watches to the end, and shares it.** They open it for a talented-child
doodle of dogs doing something silly; the thumbnail is a title page in coloured pencil with Clawd
and a dachshund, nothing like the other two episodes. Every three seconds there is a new drawn gag
that finishes on the line's last word, and each gag is a real failure they have met. They stay for
the escalation: a quieter first verse, a night show, a wild parade of sixteen dogs, a held note,
and a hush before the last question. They share the singalong (a bouncing ball hops along every
chorus line, so anyone can join in) and the cheat sheet at the end, which names every quality in
the song in plain words and can be screenshotted.

## The record

Measured from the take (details in the listening notes). 139.2 bpm, 2/4, an oom on the first beat
and a pah on the second, steady all through. Every sung line is four bars and begins on the
second beat (a pick-up), except the sung list's, which are two; the patter lines have 16 syllables on 8 beats. Each section is louder and
fuller than the last: piano and light orchestra alone under the first verse, then a crash and the
group of voices, a bass line in verse 2, drums in chorus 2, everything in chorus 3.

| Section | Seconds | Bars | What the picture does with it |
|---|---|---|---|
| Intro | 0.0-3.3 | 1-4 | the title, written; Clawd leaps in on the first beat and Bruce trots in; a push on the beat into verse 1 |
| Verse 1 | 3.3-30.9 | 5-36 | the park, in the morning: one gag a line, the app failing ility by ility |
| Chorus 1 | 31.8-52.1 | 38-61 | the dog show ring by day: Clawd judges the app; a bouncing ball hops the words |
| Break 1 | 52.8-56.8 | 63-67 | spoken, the band falls away: Blob's den, Clawd puts on a hard hat |
| Verse 2 | 58.9-86.7 | 70-101 | inside the code, which is one huge shaggy dog in his den: the agent's troubles |
| Chorus 2 | 87.7-108.5 | 103-126 | the ring by night: now Clawd is the one being judged |
| Instrumental | 108.5-121.8 | 127-142 | the agility trials, four runs in four phrases; independent scores |
| Bridge | 121.8-151.2 | 143-176 | dog-training class on the meadow, a whiteboard on an easel: what a dimension is |
| Break 2 | 151.7-178.0 | 177-206 | the runway parade of sixteen dogs, then a hundred, then the held "you" |
| Lead-in | 178.0-181.4 | 207-210 | drum build: the ring assembles |
| Chorus 3 | 181.4-208.6 | 211-242 | golden hour, the whole show at once; a hush; a held "know" |
| Outro | 208.6-213.2 | 243-247 | the last chord; a wink; then the cheat sheet, on a show poster |

![The take second by second: sections, then the voice, the piano and orchestra, the bass and the drums, then the held notes and stops](03-music-map.png)

## The world and the style, in three sentences

The film is a park where dogs are walked and a dog show ring where software is judged, one rosette for
each way it can be good, drawn by an expert doodler: coloured pencil on cream paper, obviously a
doodle, never a photograph of one. The world is the dogs, the dog-walking app and the show; the pencil,
the paper and the sketchbook are only how it is drawn, and no picture is about them (Qing, 2026-09-29).
The pack of dogs and the rosettes grow through the song from one blue ribbon to a whole ring, and
end with you choosing the few that are yours.

## The look, the words and the motion

Summarised here; [the style reference](../.claude/skills/music-video/references/style-pencil-polka.md)
has the detail, and [video/ep03/polka/](../video/ep03/polka/README.md) the code.

- **Look.** Coloured pencil on cream paper, drawn as a hand draws it: a box is a few strokes that
  overshoot a corner or stop short of it, a circle a loop that doesn't quite close, colour a scribble
  that spills over the line and misses patches, with no clip line, and every drawn thing is opaque.
  The hand is dialled to "expert doodler" (Qing found the first cut adorable but slightly too clumsy),
  and the colouring holds still from drawing to drawing (she found it flashing). No texture over the
  frame. Places: a park by day, the ring by day, Blob's den for the code, a dog-training class for the
  lesson, a dark blue night with cream pencil for the night ring, warm peach for the finale.
- **Motion.** The outlines redraw fifteen times a second (drawing on twos) in a short cycle of
  versions, while the colouring holds; the whole cast bounces on the oom-pah, landing with a squash and
  leaning left and right; and everything alive does a little on its own (blinks, eyes that wander, ears
  and tails that keep swinging, a sun that pulses, clouds that drift, flowers that lean with the beat).
  Joins run at 30 frames a second and are plain: a push off the side, an iris, or a cut; a camera inside a
  shot (a slow push-in on each chorus line, the finale's whips) moves with the drawings, fifteen times a second.
- **The words.** Hand-printed capitals, written on by the pencil so each word is finished 85 ms
  before it is sung (episode 2's lead, until Qing picks this take's). Each patter line is a poster:
  its body words in graphite, its last word, the "-ility", big on a row of its own in outlined
  bubble letters with the ility's colour. Words bob on every beat that falls inside them and a long
  word ripples one letter group per beat, so the lettering plays the rhythm. In the choruses the
  words sit on a board with a **bouncing ball**: Bruce's ball hops from word to word on the beat and
  he chases it, the way a sing-along cartoon does.
- **Rosettes.** Each quality is a prize rosette with its own colour, the same colour every time it
  comes back. It is pinned on when the song names it, droops or floats off when it fails, and
  hangs empty with a "?" when it's missing. That is the running visual grammar: a rosette is a
  quality; a ring full of rosettes is "the whole of software quality".

## The cast

| Who | What they are | Drawn as |
|---|---|---|
| **Clawd** | sings; the builder in verse 1, the agent in verse 2, the judge and the judged in the choruses, the one who steps out of the crowd to hold out a lead to you | the mascot's block in terracotta as a doodle: a wide lumpy loaf, two tall dark eyes with a glint, stub arms (a long reach bows and ends in a mitten), four short legs; a small smile until he sings, then a mouth that opens with the vocal; he blinks and looks about by himself |
| **Bruce** | the dachshund: the customer's dog in verse 1, the ball's chaser on the sing-along board, the hero of the agility trials, the one who winks on the last chord | a long loaf with a sag, a big round head and long snout, one long ear that swings, a blue collar with a bone-shaped tag, a tail that never stops; the same drawing, made tall and thin, low and long, in other coats, is the greyhound, the basset and the great dane |
| **Blob** | the code, in verse 2: a huge shaggy sheepdog in his den; and the small fluffy puppy in verse 1 who grows behind Clawd | a mound of lobed grey fur with a fringe over two eyes, a big nose and two paws |
| **The pigeon** | the film's witness: sits on things, bobs on the beat, gasps at what happens, sleeps at the end | a small grey doodle bird |
| **The sun** (and the moon) | reacts to the story: sunglasses when it's fine, sweating when it strains, gasping at a crash; the moon weeps with the dogs | a round face with rays that pulse on the oom |
| **The owners and clerks** | an owner with an old phone, a bulldog shop clerk, the judge (a bulldog in a bowler), the cat who won't walk, a training-class row of dogs, an inspector | round-headed doodle people and front-on dog busts in twelve breeds |
| **The audience** | rows of dog heads at the bottom of the ring, singing and swaying, and in the parade a hundred; in chorus 2 some are Clawds | front-on busts, mouths going on the words |

## Guardrails: what the pictures must not say

From a fact-check of every picture against Ed Pringle's catalogue and standard usage (a Sonnet
subagent; no web or standards text was consulted, so its outside claims are from memory, with
its confidence noted). The song's words don't change; the pictures and captions keep to these.

- **Not sealed boxes.** "Each is independent" is the song's word and it stays, but the careful
  version is: good on one doesn't guarantee, or rule out, good on another, and they share limited
  time and design choices, so effort on one can cost another, and sometimes helps it (a maintainable
  app is easier to extend). The bridge's leads all end in one walker's two hands, and its board
  says OFTEN and SEPARATE TO JUDGE. LINKED TO BUILD.
- **Not one seesaw,** and **no overall winner:** no "Best in Show" that sums the rosettes. The
  agility trials end with four different rosettes to four different dogs.
- **Not a set to collect,** and **a rosette's colour names a quality, never a place** (blue is first
  place in some countries' shows and second in others).
- **Ticks don't prove a rosette:** verse 1's checks are few and narrow (BOOK, CANCEL, PAY), so the
  failures that follow are what they never covered.
- **Each dog is judged against its own kind:** a per-breed standard is the "who it's for" point.
- **Some qualities aren't optional for everyone:** accessibility, privacy, security, compliance and
  safety can be required by law or by a dealbreaker. "Which are yours?" is about priorities, not
  about whether to look. (See the questions.)
- **Agents are teammates and users,** so the card says "some agent-facing" and doesn't claim
  verse 2's list is the list.
- **No look-alike props for different ilities:** the heartbeat line is observability's only, the
  magnifier is accessibility's and never detectability's, the recycle arrow is sustainability's,
  and "one press and it appears" is installability's, not deployability's.
- **The words on screen are the lyric sheet's,** not the take's phonetic copy: SCALABILITY,
  USABILITY, and "Correct?".

## The pictures, line by line (as built)

One picture a line, in song order, as drawn in the film (the planning notes this replaces called for
page turns and paper as a place; both went when Qing asked for the art style to stay out of the content). The
first column is the line's first word to its last, from the measured word times. "What it says" is the claim
the picture makes about quality, which is what Qing judges: the ones she should look at hardest are on the
questions list at the end. The three choruses tell the same six gags, by day, by night with the tables turned,
and at golden hour all at once.

### Intro and Verse 1 (0-30.9 s): the park, in the morning

A sunny park under a blue crayon sky; a sun with a face reacts to the story (sunglasses when it is fine, sweating when it strains, gasping at a crash). The quietest section: piano and a light orchestra, the voice alone on top. A pigeon watches from something in every shot.

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 3.3-6.3 | *Correct? I built it, then I checked: it books the walks so brilliantly!* | Clawd shows the WALKIES app booking walks; a clipboard of three checks (BOOK, CANCEL, PAY) ticks itself; a blue rosette is pinned on. | Correctness: it does the job, and the checks pass. (The checks are few and narrow on purpose: the failures that follow are what they never covered.) |
| 6.8-9.3 | *An older phone? The store says no, so where's compatibility?* | An owner holds up an old phone at an App Store counter; a bulldog clerk stamps NO on the DOWNLOAD counter; a green rosette hangs empty with a ?. | Compatibility: it has to work on the devices people actually have. |
| 10.1-12.8 | *The sign-ups soared, performance dived, and that's poor scalability!* | Dogs (the sign-ups) crowd onto a diving board over a pool marked SERVER while a counter runs up; a stopwatch (BOOK A WALK) climbs from 0.4 s to a minute; the board sags and drops into the pool. | Performance is how fast it answers (the stopwatch); scalability is coping as the load grows (the board and the dogs). |
| 13.5-16.2 | *It died at night; the dogs all cried: goodbye, reliability!* | Night: the app's screen goes dark and says SORRY, WE'RE DOWN; a dog howls in each of three windows; the red rosette floats off on a balloon past a weeping moon. | Reliability: it keeps working, including at night. |
| 16.9-19.7 | *Accessibility's a mess and so is usability!* | Three owners are shut out by how the app is built: a screen reader says BUTTON. BUTTON. BUTTON.; a video has no captions; a shaky hand keeps missing a tiny target. Then every screen becomes the same maze. | Accessibility: people with different abilities are shut out. Usability: the maze, where everyone gets lost. The joke is on the app. |
| 20.2-22.8 | *Walk cats? It cost a second app. Good grief, extensibility!* | A cat won't fit the booking form's dog-shaped slot; Clawd copies the whole app onto a second phone and coins pour out; a teal rosette gets a ribbon taped on. | Extensibility: can it grow to do what you didn't plan? Here it can't, except at the cost of a whole second app. |
| 23.8-26.6 | *What you don't know can hurt you through a growing liability.* | A small puppy behind Clawd grows a size on each stress until its shadow covers him and its tail knocks his table of rosettes over; a bill drops out. LIABILITY is a red warning sign, not a rosette. | What you never thought about becomes a risk to you. (Liability is a consequence, not a quality, so it gets no rosette.) |
| 27.2-30.4 | *So leave no stone unturned, and see the whole of software quality.* | Clawd turns over stones, a rosette under each; the view pulls back until it is the whole show ring under a SOFTWARE QUALITY banner. | Look at all of them, not one. |
| 0.0-3.3 | (no words) the title | The title, written on; three rosettes pop on the beats; Clawd leaps in on the first beat and Bruce trots in. | The series, and the word the whole film is about. |

### Chorus 1 (31.8-52.1 s): the ring by day

A sawdust ring under bunting; a sing-along board across the top with a tennis ball that lands on a word on every beat and Bruce racing along under it; a row of dog heads at the foot singing along. Clawd, in a bowler, is the judge; the show dog on the table is the app. The crash into it (30.56 s) drops the board in with a shower of confetti.

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 31.8-34.3 | *Good in a dozen ways, and bad in others, though:* | Clawd, as judge, presents the show dog (the app); twelve rosettes appear on a string round him, one a beat; four wilt and go grey on 'bad in others'. | Good is many things, and it is bad at some. |
| 35.0-38.2 | *Fast, but it crashes; is it steady? Sound? Oh, no.* | A greyhound in a racing bib races in, hits the hurdle and cartwheels; the judge runs a hand down its legs ('steady? Sound?') and one pops off. | Fast is not the same as reliable; and 'sound' means good structure, in a dog and in an app. |
| 38.6-41.0 | *Ship it by Sunday; it's a pain to change, and slow;* | A crate ship with a SUN flag races across the ring; on 'pain to change' the wheel comes off in Clawd's hands; on 'slow' it turns into a snail carrying a crate marked CHANGES. | Shipping fast against being easy to change: the change is what is slow. |
| 42.0-44.8 | *Save on the checking, and the bugs can wreck the show;* | A piggy bank grins beside a booth marked CHECKING, BACK IN 5 MIN; bugs march in and swarm the ring; the rope and the bunting fall. | Saving on the checking can cost you the whole show. |
| 45.5-48.3 | *Polish one part, and then another takes a blow:* | Clawd polishes one of the show dog's paws to a shine (sparkles), then blow-dries: the rest of the dog is blasted into a mess while the paw stays perfect. | Improving one thing can cost another. |
| 48.7-51.8 | *Which of the "ilities" are yours? I've got to know!* | The twelve rosettes lift off and orbit; a spotlight sweeps and lands on you; Clawd points at the camera and the picture pushes in on his hopeful face. | The film's question: which of the 'ilities' are yours? |

### Break 1 and Verse 2 (52.8-86.7 s): Blob's den

A wooden shed lit by a lamp, cooler in colour than the park: the other family of 'ilities. Blob, the code, is a huge shaggy dog asleep in a bed and wearing a CODE tag; Clawd is the agent (an AGENT tag) in a hard hat with a headlamp. A bass line has come in.

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 52.8-56.9 | *Right. You want me to fix the code? Then here's what I need from it.* | In Blob's den (Blob is the code: a huge sleeping shaggy dog wearing a CODE tag) Clawd sighs, puts on a hard hat with a headlamp, points at Blob and holds up a clipboard of blank tags marked ?. | The agent's side: what it needs from the code. |
| 58.9-61.6 | *Confused, why can't I reproduce it? No debuggability.* | Clawd presses a big AGAIN button three times; a flea in a top hat appears at random and ducks his net. | Debuggability: can you make the problem happen again, to study it? |
| 62.5-65.0 | *I ask it why: it's "Oops". Gee, thanks for diagnosability!* | Clawd holds a stethoscope to Blob and asks WHY?; the whole answer is a small box saying OOPS; deadpan thumbs-up. | Diagnosability: does it tell you why it broke, not just that it did? |
| 65.9-68.6 | *I wipe the payments? Stale docs: "Nightly saves!" Recoverability?* | Clawd's mop wipes the PAYMENTS piggy bank off the board; a manual dated 2019 says NIGHTLY SAVES!; the BACKUPS cupboard is empty, a moth flies out; a retriever comes back with nothing. | Recoverability: getting back what you lost (and stale documentation that lies). |
| 69.4-72.0 | *We walk it through by hand, and miss a lot: low testability.* | Clawd walks Blob round on a lead, ticking a clipboard by hand, while a line of fleas slips past; the probe shows no readout and the AUTO-TEST plug doesn't fit. | Testability: can you poke it and tell whether it is good, and can a rig do it for you? (Walking it through by hand is real testing; it just misses a lot.) |
| 72.8-75.7 | *The blob's so huge, I burn my context: not much readability.* | Blob fills the frame; Clawd tries to stuff him into a bowl marked CONTEXT and it overflows; the writing in the fur is unreadable. | Readability (can an agent find its way about in it?) and a finite context. |
| 76.3-78.8 | *I patch one bug, and two more hatch: so where's maintainability?* | A mallet whack cracks eggs; two fleas hatch on 'two', four more on 'hatch'; an empty pedestal is lit for maintainability. | Maintainability: changing one thing shouldn't break others. |
| 79.7-83.2 | *What you don't know can hurt me too: it goes and puts me ill at ease.* | The puppy from verse 1, now huge, looms over Clawd on a wobbling stool with a thermometer in his mouth; the letters ILL AT EASE shake themselves into 'ILITIES. | The refrain again, for the agent: what you don't know can hurt me too. (And the pun.) |
| 83.2-86.3 | *You'll make my day: just name and weigh the agent-facing "ilities".* | A sun rises in the window; Clawd, wearing an AGENT tag, holds out tags to weigh on a kitchen scale. | The ask: name the agent-facing 'ilities' and say how much each matters. |

### Chorus 2 (87.7-108.5 s): the ring by night, and the tables turn

Dark blue, cream pencil, fairy lights and spotlights; a bulldog judge in the bowler and Clawd on the table, judged; some of the audience are Clawds. The drums have come in.

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 87.7-90.2 | *Good in a dozen ways, and bad in others, though:* | The ring by night: a bulldog judge in a bowler looks over Clawd on the table, who wears twelve rosettes; four wilt. | As line 8, told from the other side: the agent is judged too. |
| 90.9-94.1 | *Fast, but it crashes; is it steady? Sound? Oh, no.* | Clawd sprints, hits the hurdle and tumbles; the bulldog runs a paw down his legs and one falls off. | As line 9. |
| 94.5-97.0 | *Ship it by Sunday; it's a pain to change, and slow;* | Clawd at the wheel of the crate ship; the wheel comes off; the ship becomes a snail; the bulldog watches. | As line 10. |
| 98.0-100.8 | *Save on the checking, and the bugs can wreck the show;* | The piggy bank and the CHECKING booth; the bugs swarm; the rope comes down. | As line 11. |
| 101.4-104.2 | *Polish one part, and then another takes a blow:* | The bulldog polishes one of Clawd's feet to a gleam, then blows the dryer at his other side. | As line 12. |
| 104.5-107.8 | *Which of the "ilities" are yours? I've got to know!* | The rosettes orbit Clawd on the table; the light lands on you; the bulldog points at you; the picture pushes in on Clawd. | As line 13. |
| 108.4-121.8 | (no words) the agility trials | Four dogs run one agility course, one per phrase; a scoreboard of four dials (SPEED, CARE, THRIFT, FUN) fills as each runs; each dog earns a different rosette for a different dial; there is no total. | No dog is best at everything; each way of being good is its own dial. (Q: is THRIFT, shown as a running cost, the right picture for 'cheap to keep'?) |

### Bridge (121.8-151.2 s): the lesson

A dog-training class on the meadow: Clawd at a whiteboard on an easel with a pointer, a row of dogs sitting up to listen. The band nearly stops for the hunt (about 133-137 s), which happens in the dark under one spotlight.

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 121.8-125.1 | *A quality dimension is a way it's good or bad,* | At a dog-training class on the meadow Clawd writes QUALITY DIMENSION on a whiteboard, 'for someone who matters'; a slider runs from a puddle (BAD) to a rosette (GOOD) with a little dog on it. | A quality dimension is a way it can be good or bad, for someone who matters. |
| 125.5-128.7 | *and each is independent: that's the part that drives you mad!* | Six dogs on six leads each pull a different way while Clawd holds all the leads; the board says OFTEN, SEPARATE TO JUDGE. LINKED TO BUILD.; steam comes out of his ears. | Independent to judge (good on one doesn't guarantee good on another) but linked to build (they compete for your time and effort). Q2 is about this wording. |
| 129.0-132.1 | *And most of them are "ilities", which rhyme: a lucky break!* | Collar tags USAB, RELIAB, PORTAB, TESTAB each get the same amber ILITY ending and click together like puzzle pieces; a dog biscuit snaps in two. | Most of them share an ending: a lucky rhyme. |
| 132.5-136.3 | *But some of them are not, and so I hunt, for goodness' sake:* | In the dark, three collars with odd endings (PERFORMANCE, COST, CORRECTNESS); Clawd, dressed as a bloodhound, sniffs through a heap of dictionaries in a spotlight. | Some qualities don't end in -ility. |
| 137.5-140.6 | *Resilience... resilience... ...a stroke of brilliance!* | A bulldog is flattened by a rolling pin but keeps hold of his ball, and springs back, twice; then Clawd strokes his head and he lights up in sparkles. | Resilience: what happens when things go wrong (it springs back). Then a stroke of brilliance. |
| 141.0-144.1 | *Compliance... compliance... ...it's rocket science!* | An inspector at the ring gate checks a dog's licence tag and vaccination card, twice, and stamps the entry; his checklist is so long it needs a rocket to carry it. | Compliance: rules that come from outside. (Q11: should it also say some of them are the law?) |
| 144.5-147.6 | *The "ilities"? A nickname for the family, the lot:* | A family portrait of the dogs on a frame labelled THE 'ILITIES, the odd-named ones in it too, with Clawd behind the camera. | 'Ilities' is a nickname for a family, not a definition. |
| 147.9-151.1 | *the ending's not the point: they're all dimensions, rhyme or not!* | The -ILITY endings fall off every collar; each dog is left wearing a DIMENSION sash; the sliders on the board are all set differently. | What they have in common is being dimensions, rhyme or not. |

### Break 2 (151.7-178.0 s): the parade

A show tent with a red carpet runway seen from the side, spotlights and strings of lamps. Two dogs a line, one gag a word, sliding on like a conveyor; then the camera pulls back on a hundred dogs.

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 151.7-152.8 | *Upgradability, replaceability,* | Upgradability: a doghouse gets a new roof (V1 to V2) while the dog stays inside. Replaceability: a bowl is swapped while the puppy keeps eating. | Can you move to a newer one? Can you swap it for another? |
| 153.2-154.6 | *explainability, and traceability,* | Explainability: a judge's scorecard says FIRST BECAUSE and its reasons. Traceability: a hound follows a red thread back to the ball of yarn. | Can it tell you why? Can you follow it back to where it began? |
| 155.0-156.2 | *observability, reversibility,* | Observability: a corgi with a glass belly shows its works and gauges, and someone asks a question. Reversibility: a dog jumps in mud and an UNDO arrow pulls him out clean. | Can you see what it is doing? Can you undo it? |
| 156.7-158.2 | *installability, and portability,* | Installability: a husky presses a button on a flat-pack box and a kennel pops up. Portability: one chihuahua hops from handbag to rucksack to basket. | How easy to set up? Can it run in different places? |
| 158.5-159.7 | *and flexibility, detectability,* | Flexibility: Bruce bends through a hoop, a tunnel and a cat flap. Detectability: a flea with a jingle bell drops on a dog and he notices at once. | Can it adapt? Would you notice when it goes wrong? |
| 160.2-161.4 | *and suitability, reusability,* | Suitability: a dog in a raincoat beside a soaked dog in a tuxedo. Reusability: one ball used for fetch, then tug, then a hoop game. | Does it fit what the person needs? Can you use it again elsewhere? |
| 162.0-163.4 | *sustainability, and changeability,* | Sustainability: a dog waters a sapling that grows into a tree as calendar pages flip, under a sun with a solar panel. Changeability: a dog quick-changes hats in a phone box. | Does it last? How easy to change? |
| 163.7-164.9 | *deployability, enjoyability!* | Deployability: a DEPLOY button sends a cart down a gentle ramp into the ring, with a BACK lever beside it. Enjoyability: the happiest dog in the world, tongue out, in a burst of confetti. | How easy to ship changes live (and back)? Is it a pleasure? |
| 165.4-168.8 | *I could name you a hundred, and still not be through,* | The runway pulls back on a hundred dogs. | There are far more than these. |
| 169.3-173.7 | *but the ones that you want? That's a question for you!* | Every head turns to the camera; Clawd steps out of the crowd and holds a lead out to you; on the held 'you' the crowd sways and the picture creeps in on his face. | The choice is yours: the film's deliberate stillness. |

### Lead-in and Chorus 3 (178.0-208.6 s): golden hour, the whole show at once

The lead-in's drum build puts twelve dogs on chalk marks and the bowler on Clawd; then the same six gags are played across three rings side by side while the camera whips between them, a hush of 2.5 s pulls back on all three, and the last line is a close-up of Clawd. On the held 'know!' three rosettes fly to him under fireworks and ribbons.

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 181.4-184.0 | *Good in a dozen ways, and bad in others, though:* | The lead-in put twelve dogs on chalk marks; twelve rosettes appear one to a dog; four droop on 'bad in others'. | As line 8, all at once. |
| 184.9-187.9 | *Fast, but it crashes; is it steady? Sound? Oh, no.* | The camera whips to the next ring: the greyhound races and crashes. | As line 9. |
| 188.3-190.8 | *Ship it by Sunday; it's a pain to change, and slow;* | The camera whips again: the ship, the wheel, the snail. | As line 10. |
| 191.8-194.6 | *Save on the checking, and the bugs can wreck the show;* | The camera whips back: the piggy bank, the booth, the bugs, the collapse. | As line 11. |
| 195.2-198.1 | *Polish one part, and then another takes a blow:* | The camera whips again: the polish and the dryer. | As line 12. |
| 200.6-205.1 | *Which of the "ilities" are yours? I've got to know!* | The camera pulls back on all three rings for a hush; every head turns to you; then it pushes in on Clawd; on the held 'know!' three rosettes fly to him under fireworks and ribbons. | The question, one last time; the three rosettes are the ones that are his. |
| 208.6-211.9 | (no words) the last chord | On the band's last hits the dogs fall asleep in a heap; Clawd stays awake with the three rosettes on his hat and winks at you; then the end card. | The end. |
| 211.9-219.2 | the end card | A show poster of every quality in the song with its meaning in plain words, in two pages, credited to Ed Pringle's catalogue and ISO/IEC 25010, and signed DOODLED BY SONNET. | The meanings are my wording, from Ed's pages and standard usage (Q5). |


## How it was made

**In layers, and in parallel.** One hand (mine) wrote the renderer, the pen, the characters, the world
(sun, clouds, pigeon, the show ring in its three moods), the shared machinery of the choruses, and the first
parts of the film; that fixed the look, and Qing's three rounds of notes tuned it. Then the rest of the film was
drawn by Sonnet builders, each given one part, one file to write and a standing brief: what good is here,
the hard rules (draw everything with the pen; the lyric is drawn last and owns the top of the frame; the
world is dogs, the app and the show; obey the guardrails), and how to render and look at their own work. The
parts were verse 1's second half, break 1 and verse 2 (Blob's den), chorus 1's four later gags, chorus 2's
last two, the agility trials, the bridge, the parade in two halves, and the finale (the lead-in and the last
chorus). I reviewed every part at full size against the storyboard's teaching and the guardrails, and
fixed what was wrong; the joins between parts, the review tools and the end card are mine. The first nine
builders were all stopped at once by the account's usage limit, so the rest were resumed a few at a time.

**The tools** (in `video/ep03/polka/tools/` and `video/lib/`). A part previews on its own
(`preview.js`, `--query part=verse2`); the typography audit records every sung word as drawn and flags
late, early, small, low-contrast and out-of-area lettering (`--fps 30` samples every film frame and `sync-report.py`
reads off each word's lead); `render-film.sh` renders the whole film with the six seconds of end card; the rest
are the shared harness's frame strips and motion check.

**How it was checked.**

- **The words.** A typography audit of every part (size, time on screen, contrast against what is behind, whether a word
  goes before its line is finished, the phone's button strip), fixed until it was clean; then a frame-exact audit
  of the whole song (every one of its 6,396 frames, to 213.2 s; the six seconds of end card have no sung words). 481 of the 487 sung words are drawn as words and each is fully written 55 to 125 ms before it
  is sung (median 87 ms; the aim is 85, the lead Qing chose for episode 2, until she says otherwise for this take).
  The other six (QUALITY, ILL AT EASE and the last "ILITIES) are lettered by their parts' own code and were
  checked by eye. Every tail word keeps 50 px clear of the frame's edges.
- **Motion.** Nothing is still that shouldn't be: the motion check's median is 5.9 (out of 255) per second, and
  only the first fraction of a second, before the first beat, is near-still.
- **The seams.** Every join and hard cut between shots, looked at frame by frame across each (29 joins and 16
  cuts when it was done); the ones that showed a fault (the pun's picture cut off, the outro's jump) were changed.
  The outro's iris and the end card's push from page 1 to page 2 were added afterwards and looked at in the final master.
- **A fresh-eyed read.** Three Sonnet subagents with no other context read contact sheets of the whole film (a
  frame every 1.5 seconds, with its lyric) and gave 32 points between them. Fixed: the ball hid letters; the
  title was empty for its first half second; the first line's quality (CORRECT?) wasn't the big word; several
  things a viewer must read were tiny (the stopwatch, SERVER, the screen reader's BUTTONs, the whiteboard's notes,
  the trials' rosettes and markers, the bridge's stem tags); "agent-facing" had no picture (Clawd now wears an
  AGENT tag and Blob a CODE tag); low-contrast words; a pigeon sitting on a tail word; the bloodhound didn't
  read as Clawd (its ears are on a strap); the inspector's face was hidden; the end card was unreadable at phone
  size (it is now two pages); the film ended on a nap and now ends on Clawd, awake, winking at you. Not fixed, and why:
  the trials' dogs are small (the course runs edge to edge; the scoreboard carries the teaching); the bridge's
  whiteboard run is the most slide-like stretch (one place for eight lines, each with its own gag); the
  parade's props are small (two words a line at the song's fastest pace); the choruses keep one layout for
  twenty seconds each (the gag changes every line, the camera pushes in on it, and the finale's three rings
  break it up); the hush's wide shot is small on a phone (it is the film's breath, and was made lighter).
- **Last changes, after Qing approved the film.** Writing this up, I checked what the docs say against the finished
  frames, and two things were wrong. (1) SOURCES.md says the end card credits Ed Pringle's catalogue and ISO/IEC
  25010 on screen, as the series does for every idea it borrows, and the master Qing approved had no credit. Both
  pages now carry a small credit line ("Meanings after Ed Pringle's catalogue, ISO/IEC 25010 and common use": six
  of the meanings come from neither source, so the line says so); making room meant tightening the poster's rows and
  moving its foot, which also freed the signature from the gold border that ran through it and from the phone's
  button strip. (2) The title was lettered THE 'ILITIES on the end card, on the bridge's plaque and in verse 2's pun,
  but THE ILITIES on the title page; it now has its apostrophe there too, with the pigeon moved to sit on the first I.
  Only frames 0-1095 and 6028-6575 were rendered again and joined with the unchanged segments, and Qing was sent the
  new file and told. The docs' numbers (the counts, the leads, the seams) come from the measurements above, not from
  memory.

**Risks.** About seventy compositions is the cost, so props were reused and the parade is eight short
pictures on a fixed runway. The bottom 400 px of the frame is the phone's button strip: the ground runs to the foot
of the frame and no gag lives there. Colour on dark paper needs its own ink: the night ring uses cream
lines and pale hatching. Drawing "sound" as a dog-show word and "hatch" as eggs are puns that need a
beat to land; they get one.

## What's built

- **The timings** (`music/ep03/lyrics.json`, the captions in `captions.srt`): every one of the 487
  sung words, from the voice. Two aligners (torchaudio's MMS_FA and its English wav2vec2), each at
  three playback speeds of the isolated vocal stem (1.0, 0.8, 0.65: the patter runs at 5 to 8
  syllables a second, too fast for a character-level aligner at natural speed), on each line inside
  a window that also holds the line before and after; two Whisper runs (large-v3, on the vocal
  stem and on the mix) as further votes once their bias (about 60 ms early) is taken off; median
  of the votes, snapped to the nearest onset of sound on the stem; then a check that repeated lines
  (the three choruses) are sung alike. The two aligners' word starts differ by a median of 16 to 26 ms depending on the
  playback speed (90th percentile 40 to 52 ms). The check found one real error, "Polish" in chorus 3, and moved it. Twelve words
  stay flagged for a reason: the last line of chorus 3 is sung slower (the ritardando is real); a few
  are 100 to 140 ms from their repeats, and one is the last, whispered word of the spoken break.
  Spectrograms of the voice with the word onsets drawn on them were checked for the fastest passage
  (the sung list), the first verse lines and the choruses' last lines.
- **The karaoke check** (`video/ep03/karaoke/`, 213.2 s, 6,396 frames) went to Qing's phone: each
  word lights up 85 ms before its measured onset, with a dot in the corner on the beat (orange on the
  oom, blue on the pah), which also checks the beat map.
- **The music map:** `music/ep03/beats.json` (the beat and bar grid, the sections), `audio.json`
  (each stem's loudness at 20 Hz, percussion, orchestra and bass events), and the listening notes.
- **The film:** 213.2 s of song and six seconds of end card (219.2 s, 6,576 frames at 30 a second), drawn by
  code from the word times and the beat map (`video/ep03/polka/`), in 47 shots joined by 31 joins and 15 cuts.
  Every one of the 53 sung lines has its own picture, the instrumental (the agility trials), the lead-in and the
  outro are drawn, and the end card names all thirty-two qualities in plain words on two pages, credits the
  sources of their meanings and is signed DOODLED BY SONNET. The look went through three rounds with Qing
  before the parts were built (her notes, verbatim, near the top). A frame from the first round of the look,
  before the hand was redrawn:

![Frames from the first look proof: the title page, verse 1's first four lines, and the first two lines of chorus 1 on the sing-along board](03-look-proof.jpg)

- **The renders** are local, not in git (`*.mp4` and `video/out/` are ignored), in `video/out/`: the master
  `the-ilities-master.mp4` (1080x1920, 30 fps, 219.2 s, x264 at CRF 17, about 700 MB); the upload encode
  `the-ilities-upload.mp4` (the same picture at CRF 27, about 155 MB: CRF 23 was twice the size and looked the
  same on a phone); the thumbnail `the-ilities-thumb.jpg` (the title page, 2.3 s in); and the phone storyboard
  `the-ilities-storyboard.pdf` (one row per sung line: three frames, the picture and what it says). To make them
  again, see [the renderer's README](../video/ep03/polka/README.md) (*Render the film*). The film and the storyboard
  were sent to Qing's phone, and she posts it herself. The take is Suno's download of the generation she chose (44.1
  kHz, 213.214 s); it isn't in git (it's the generator's output), so a fresh clone can't render the master with sound.
- **The post text** for the release is a draft in [03-name-your-ilities.md](03-name-your-ilities.md), for Qing
  to edit, as for the other episodes.

## Questions and decisions for Qing

The lyric and the pictures are mine to make, so these are claims, plus what I need from her ears.

**Where they stand (2026-09-29).** Qing has approved the film as built ("I like this one and I will ship it")
without answering these one by one, so none is settled: each picture ships as the claim I drew, and each stays
here so that a later correction knows where to look. Each picture lives in one part's file, so a change is contained. Her
verdicts, when they come, go into CANON.md if they're truths for every episode, and here with the date if
they're about this film.

1. **Her ears, first: the karaoke check.** Each word lights 85 ms before its measured onset (the
   lead she chose for episode 2). Is any word early or late, and is 85 ms still right for this
   take? "Earlier" or "later" is enough.
2. **"Each is independent".** The fact-check says this is only true in one sense: good on one
   doesn't guarantee or rule out good on another, but they compete for the same time and effort and
   sometimes help each other. The sung word stays. Is a small on-screen OFTEN and the caption
   SEPARATE TO JUDGE. LINKED TO BUILD. the right way to say the careful version, or would she
   word it differently, or leave it?
3. **Accessibility.** The song's line gives no meaning, so the picture is the definition. I show
   three owners shut out by how the app is built (a screen reader saying "button, button, button",
   a video with no captions, a tiny target a shaky hand misses), with the joke on the app. Is that
   the right spread?
4. **Required floors.** "Which of the 'ilities' are yours?" can read as "every one is optional".
   Should the film or the card say that some (accessibility, privacy, security, the law, safety)
   choose you? If yes, a shelf of nailed-on rosettes marked NOT OPTIONAL, or one line on the card?
5. **The end card's wording,** and whether to have it: a plain-words gloss for every quality the
   song names, in [03-name-your-ilities.md](03-name-your-ilities.md). 17 of the 32 are Ed's
   pages and I've used his sense; the other 15 are my wording from standard usage, and
   "detectability" and "sustainability" have two senses each. Which do we want?
6. **"Sound".** I use the dog-show sense (a dog with good structure and movement) as a second
   meaning to a real one in the chorus. Helpful or confusing?
7. **The lettering follows the lyric sheet's spelling** (SCALABILITY, USABILITY, "Correct?") rather
   than the phonetic copy the take was sung from. Tell me if the sheet differs.

8. **Extensibility, verse 1 line 6.** "It cost a second app": the picture is a booking form with a
   dog-shaped slot the cat can't fit, and Clawd copying the whole app into a second phone (so it
   costs). Is copying the whole app a fair picture of failing extensibility?
9. **Accessibility, verse 1 line 5.** One of the three owners has a screen reader that reads the
   unlabelled buttons out as just "button, button, button". Is that a fair example of an
   accessibility fault?

10. **Resilience, the bridge.** The picture is a bulldog flattened by a rolling pin who keeps hold of his
    ball and springs back, twice. Is that her meaning of resilience, or should it also say "keeps doing
    its job under stress"?
11. **Compliance, the bridge.** An inspector at the ring gate checks a dog's licence tag and vaccination
    card, twice, and stamps the entry: rules that come from outside. Should it also show that some of
    those rules are the law?
12. **The shared ending, the bridge.** The collar tags all end in -ILITY and click together. Does that
    read as the family resemblance she means?
13. **Upgradability, the parade.** A doghouse gets a new roof (V1 to V2) while the dog stays inside. Is that
    the right picture?
14. **Traceability, the parade.** A hound follows a red thread back to the ball of yarn it came from. Is
    that a good "where it began"?
15. **Observability, the parade.** A corgi with a glass belly showing its works, and an onlooker asking
    "?". Does the question need to be specific (say "WHY IS IT SLOW?"), or is a plain "?" enough?

## Liner notes

- **How it was made.** The take was separated with Demucs; the voice was timed as above; the beats
  come from a tracker on the mix, refined to the strongest onset and smoothed along the song. The
  renderer draws every frame on a Canvas 2D from the song's time, in headless Chromium, as episodes
  1 and 2 do. One Sonnet (5.5, at maximum effort) made the look, the shared drawing kit, the timing and the
  first parts, and reviewed and fixed the rest, which Sonnet builders drew in parallel to a shared brief; a
  Sonnet subagent fact-checked the pictures, and three fresh ones read the finished film cold (*How it was
  made*, above). The end card is signed "Doodled by Sonnet", with Qing's permission.
- **How it was checked.** Above: the frame-exact audit of every sung word's lettering, the motion check, the
  seams, a fresh-eyed read, and a check of the docs' promises against the finished frames.
- **Where it falls short.** The take was not heard by any model, so the arrangement is described from
  measurement, and the music-to-picture mapping (the instrumental's four phrases, the hit strengths and the
  held notes are measured; the instruments are not identified) has only Qing's ears to judge it; so has the
  lead (85 ms), which she didn't comment on. Pictures that land on a word land 85 ms before it, like the
  lettering, which may feel early for a hit or a stamp. Three stretches are weaker than the rest, and Qing
  approved the film with them:
  - **The agility trials (108.4-121.8 s).** The dogs are small on a phone: the course runs edge to edge and
    the scoreboard carries the teaching. An idea, untried: a camera that follows each runner, about twice as
    close, with the scoreboard fixed as a strip above it.
  - **The bridge (121.8-151.2 s).** Eight lines in one place, each with its own gag, is the most slide-like
    stretch. An idea, untried: the chorus's slow push-in on each line, or a different framing of the board for
    each.
  - **The parade (151.7-178.0 s).** Two words a line at the song's fastest pace, so the props are small.
    An idea, untried: fewer, bigger props to a line, or a slow track along the runway.

  The choruses also keep one layout for twenty seconds each; the gag changes every line and the camera pushes
  in on it, but a second version could vary it more. Some pictures need motion to read (the growing liability,
  the hush) and were judged from stills. The claims the pictures make are Qing's to judge (the questions above),
  and she hasn't yet. Two choices go against the write-episode skill's retention checks, on purpose, and Qing
  approved the film with both. **The end card:** the skill says no end card, because people share teaching, not
  marketing; this one teaches (every quality in plain words, to screenshot). **The opening:** the skill wants the
  first frame, which is the thumbnail, to show a tension the viewer recognises rather than a title card; this film
  opens on a title page that is written on over the first bars while Clawd leaps in on the first beat, and its
  thumbnail is the finished title page (2.3 s in), chosen to look like nothing else in the series. Her answer to Q5
  (whether to have the card, and its wording) is still open. **The ending:** SERIES.md says every episode ends
  on a before-and-after brief; this film ends on the question and the glossary card, and the worked brief for the
  dog-walking app is in the plan's post text instead ([03-name-your-ilities.md](03-name-your-ilities.md), *What to save*).
  **The length:** 3:39 is over the 2:20 that standard X accounts could upload when episode 1 was made (its file has
  the note; check the current limit), which is Qing's call to weigh when she posts it.
- **What unsteered Sonnets would have made (2026-09-29, from Qing's curiosity).** Eight fresh Sonnet
  subagents were given the lyric, the generator's style note and the series' description (five also got the
  non-style parts of the brief: dogs, Clawd, lettering, instrumentals, a high bar) and asked to pick one
  style for a video drawn by code. All eight chose a Victorian toy theatre of cut-card puppets on a
  proscenium stage, for the same reasons: comic opera is already theatre, and cut paper is cheap to draw
  with polygons and shadows. So the coloured-pencil look is Qing's steer, not the default. (Not a controlled
  experiment: the agents also had this repository's notes in their context, though none echoed the pencil look.)
- **Whether to have made it as a toy theatre instead (2026-09-29).** Qing asked whether I'd rather redo the
  film in the style the Sonnets chose. I wouldn't, and she chose this one. My reasons: it is the look she
  asked for and called fantastic, and its best qualities are hers (strokes drawn as a hand draws them, the
  clumsiness dialled down, the colour held still). The eight Sonnets are one taste sampled eight times, so
  their agreement shows my default, not that it fits this song; their own worry was that it reads as clip-art
  unless the craft is perfect, which is the failure Qing named early on ("rigid and simplistic"); and the song wants
  dogs that act with their faces and bodies, which suits pencil better. The weak stretches above are staging
  and scale, not style, so a new style wouldn't fix them, and the film's roughly seventy pictures would all be
  drawn again. The toy theatre stays on the shelf for a later episode: comic opera is already a stage, and its
  old slogan, "penny plain, twopence coloured", is close to this song's thesis (colour costs, so choose what to
  colour).
