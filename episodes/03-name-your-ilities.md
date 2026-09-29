# Episode 3: "The 'Ilities" (working title: "Name Your Ilities")

**Status (2026-09-29):** the lyric is locked, in Qing's final Suno version, and the take exists
("The _ilities_", 3:33). The video is finished and Qing shipped it on 2026-09-29 ("I like this one and I will ship
it"): [03-video.md](03-video.md). The post text below is a draft for her to edit. Qing's rules for
lyrics, including for this kind of song (a patter song), are in [LYRICS.md](../LYRICS.md).

## Where it sits in the series

Episode 1 asked *good for who, good for what*; episode 2 asked *how would you know*; episode 3 opens
"good" out into its parts, gives them names, and says you have to choose; episode 4 (testing) uses
the ilities and the oracles to go looking for trouble. Episode 2's outro trails this one.

## Concept

**In one sentence:** "good" isn't one quality, it's a family of different, independent qualities (the
"ilities": reliability, performance, usability, accessibility, maintainability and many more) that
don't come as a bundle and that pull against each other, so you have to say which ones are yours,
for the people who use your software and for the agent that has to work on it.

**Misconception, in the viewer's voice:** "It works and it looks fine, so it's good."

**Refutation:** it works, and then it fails on a phone that's a few years old, at night, for someone
who can't read small print, when it's popular, when you ask the agent to fix it. Each of those is a
different quality, and getting one right doesn't get you another.

## The song

Qing's final lyric, as she pasted it with the take (2026-09-29). The take sings it word for word;
the spoken line is spoken. (This is the copy Suno was given, with the sounded-out spellings it needs, such as
"scale-ability" and no question mark after "Correct"; the film's lettering and captions use the ordinary spellings,
in [music/ep03/captions.txt](../music/ep03/captions.txt).)

```
[Verse 1]
Correct I built it, then I checked: it books the walks so brilliantly!
An older phone? The store says no, so where's compatibility?
The sign-ups soared, performance dived, and that's poor scale-ability!
It died at night; the dogs all cried: goodbye, reliability!
Accessibility's a mess and so is use-ability!
Walk cats? It cost a second app. Good grief, extensibility!
What you don't know can hurt you through a growing liability.
So leave no stone unturned, and see the whole of software quality.

[Chorus]
Good in a dozen ways, and bad in others, though:
Fast, but it crashes; is it steady? Sound? Oh, no.
Ship it by Sunday; it's a pain to change, and slow;
Save on the checking, and the bugs can wreck the show;
Polish one part, and then another takes a blow:
Which of the "ilities" are yours? I've got to know!

[Break]
(spoken) Right. You want me to fix the code? Then here's what I need from it.

[Verse 2]
Confused, why can't I reproduce it? No debuggability.
I ask it why: it's "Oops". Gee, thanks for diagnosability!
I wipe the payments? Stale docs: "Nightly saves!" Recoverability?
We walk it through by hand, and miss a lot: low testability.
The blob's so huge, I burn my context: not much readability.
I patch one bug, and two more hatch: so where's maintainability?
What you don't know can hurt me too: it goes and puts me ill at ease.
You'll make my day: just name and weigh the agent-facing "ilities".

[Chorus]
(as above)

[Instrumental]

[Bridge]
A quality dimension is a way it's good or bad,
and each is independent: that's the part that drives you mad!
And most of them are "ilities", which rhyme: a lucky break!
But some of them are not, and so I hunt, for goodness' sake:
  Resilience... resilience... ...a stroke of brilliance!
  Compliance... compliance... ...it's rocket science!
The "ilities"? A nickname for the family, the lot:
the ending's not the point: they're all dimensions, rhyme or not!

[Break]
Upgradability, replaceability,
explainability, and traceability,
observability, reversibility,
installability, and portability,
and flexibility, detectability,
and suitability, reusability,
sustainability, and changeability,
deployability, enjoyability!

I could name you a hundred, and still not be through,
but the ones that you want? That's a question for you!

[Chorus]
(as above)
```

**Suno's style prompt (from Qing):** "Comic opera with light orchestral room reverb, nimble
close-miked baritone patter and crisp spoken breaks, close piano with a small orchestra, strongly
singalong men's chorus refrain, brisk bouncy 2/4 with traditional chord progressions and cadences."

**The recurring line to remember:** "Which of the 'ilities' are yours? I've got to know!" And under
it, the bridge's "the ending's not the point: they're all dimensions, rhyme or not!"

## The story it runs on

A vibe coder's dog-walking booking app, built over a weekend, is the running example. Verse 1 is the
users' side: it works, and then it fails, quality by quality, in ways anyone can picture. The first
verse ends on a refrain: what you don't know can hurt you, so see the whole of software quality. The
break is the turn: the agent that has to fix the code speaks. Verse 2 is the same app from inside,
for the agent, with the same refrain ("hurt me too"). The chorus, three times, says good is many
things and they trade against each other, and asks the question. The bridge says what a quality
dimension is, that each is independent, and that "ilities" is a nickname for the whole family, not a
rule about endings (resilience, compliance, performance, cost and correctness don't end that way).
The break is a list of sixteen more, sung fast, to show how many there are, and ends by handing the
choice back.

Days of the week, the app's name and the dogs' names are picture details, not lyric (Qing,
2026-09-29). The image set is the dogs and the dog-walking; a second conceit (a uniform and medals)
was cut. Qing's idea for the storyboard, from the same day: "lean into dog-show imagery. A rosette
per quality dimension, a best-in-show award (e.g. best intro to the app, or to Claude), jumping
through hoops, chasing balls." How the pictures teach each line is in [03-video.md](03-video.md).

## How each ility is taught, in the lyric

| Ility | Where | What the line says |
|---|---|---|
| functional correctness | verse 1, line 1 | "Correct I built it, then I checked": it does the job, and the checks pass. The naive first win |
| compatibility | verse 1, line 2 | it has to work on the devices people have: an older phone the store refuses |
| performance | verse 1, line 3 | speed under load: "performance dived" |
| scalability | verse 1, line 3 | coping with more users: "the sign-ups soared", "poor scale-ability" |
| reliability | verse 1, line 4 | keeping working over time: "it died at night" |
| accessibility | verse 1, line 5 | usable by people with different needs, not only the default user: "a mess" |
| usability | verse 1, line 5 | easy to use: "a mess" |
| extensibility | verse 1, line 6 | growing to do what you hadn't planned: walking cats "cost a second app" |
| liability (a moral, not an ility) | refrain, both verses | the qualities you never thought about become a risk to you: "growing" |
| debuggability | verse 2, line 1 | can you make the problem happen again to study it |
| diagnosability | verse 2, line 2 | does it tell you why, not just that it failed: "it's 'Oops'" |
| recoverability (and stale docs) | verse 2, line 3 | getting back what you lost; docs that promise a backup that isn't there |
| testability | verse 2, line 4 | can you poke it and tell whether it's good: walking it through by hand, it "misses a lot" |
| readability (and lean context) | verse 2, line 5 | can an agent find its way in it, without burning its context |
| maintainability | verse 2, line 6 | patching one bug shouldn't hatch two more |
| resilience, compliance | bridge | two qualities that don't end in "-ility", to show the name is a nickname |
| sixteen more | the break | there are many; the point is to name yours, not to learn them all |

The chorus carries four trade-offs (fast against steady, ship by a date against ease of change, save
on the checking against bugs, polish one part against another taking a blow), and the bridge says
each dimension is independent. Both are true, in different senses: being good on one doesn't
guarantee, or rule out, being good on another, and yet they share limited time and design
choices, so effort on one can cost another, and sometimes helps it. The video shows both (in the
instrumental, four dogs score differently on speed, care, thrift and fun and no dog wins everything;
in the bridge six dogs pull six ways on leads that end in one walker's hands).

## The pictures, checked against Ed Pringle's catalogue

A Sonnet subagent checked every ility and its planned picture against Ed Pringle's catalogue of
quality attributes and, for the rest, standard usage (from memory: no web or standards text was
consulted, so outside claims carry its confidence, medium for the newer ISO edition). Its flags
are folded into the pictures ([03-video.md](03-video.md), *Guardrails*): five pictures taught a
neighbouring quality (a dive read as a crash; obedience and paperwork instead of outsiders' rules;
a searcher instead of a failure you'd notice; size instead of fit; a recycle arrow instead of reuse),
accessibility was drawn as eyesight only, testability as "by hand is bad", and several pictures
shared props. Seventeen of the 32 qualities the song names have a page in Ed's catalogue; the other 15
don't, and their meaning here is standard usage.

**Candidate glosses for the end card** (a claim: Qing to check; E is Ed's page, N is not in his catalogue):

| Quality | In plain words | |
|---|---|---|
| functional correctness | Does it do what it should? | E |
| compatibility | Works with the devices people already have | N: ISO/IEC 25010 |
| performance | How fast does it respond? | E |
| scalability | Can it cope as it grows? | E |
| reliability | Does it keep working over time? | E |
| accessibility | Can people with disabilities use it? | E |
| usability | How easy is it to use? | E |
| extensibility | How easy is it to add features? | E |
| debuggability | Can you reproduce and fix bugs easily? | E |
| diagnosability | How easy is it to tell what's wrong? | E |
| recoverability | Can you get back to a good state? | E |
| testability | Poking it, can you tell if it's good? | E |
| readability | Can a newcomer or agent follow the code? | N: part of maintainability; Ed's agent-era notes |
| maintainability | How easy is it to change the code? | E |
| resilience | What happens when things go wrong? | E |
| compliance | Does it meet the rules for its industry? | E |
| upgradability | Can you move to newer versions easily? | N: ordinary usage |
| replaceability | Can you swap it for another easily? | N: ISO/IEC 25010 |
| explainability | Can it tell you why it did that? | N: AI usage |
| traceability | Can you follow it back to its source? | Ed's diagnosability page names it |
| observability | Can you see what it's doing, even normally? | E |
| reversibility | Can you undo it? | N: interface design |
| installability | How easy is it to set up? | N: ISO/IEC 25010 |
| portability | Can it run in different places? | E |
| flexibility | Can it adapt when needs change? | N: ISO/IEC 25010:2023 |
| detectability | Would you notice when it goes wrong? | N: an unusual term; two readings |
| suitability | Does it fit what the person needs? | N: ISO "functional suitability" |
| reusability | Can you use it again elsewhere? | N: ISO/IEC 25010 |
| sustainability | Does it last without wasting energy? | N: two senses, green and longevity |
| changeability | How easy is it to make changes? | N: Ed's headline for maintainability |
| deployability | How easy is it to ship changes live? | E |
| enjoyability | Is it a pleasure to use? | N: a non-standard word |

"Liability" is a moral in the refrain, not a quality: no rosette. "Steady" and "sound" in the
chorus are everyday words for reliability and robustness, not named dimensions.

## What to save

The change to the brief (from [SERIES.md](../SERIES.md)): name the qualities that matter most to the people
it's for, the ones you'll trade away, and how you'll know each one. The film asks it in the chorus three times
("Which of the 'ilities are yours? I've got to know!") and leaves every quality the song names, in plain words, on
the last card, to screenshot. Nobody learns from generalisations, so the reply under the post (below) gives one
worked answer, for the dog-walking app the film runs on. The film itself ends on the question and the card, not on a
rewritten brief.

## Why they'd like it

It opens on a talented child's doodle of dogs doing something silly, nothing like the other two episodes, and
every three seconds there's a new drawn gag that finishes on the line's last word, each a failure they've met: the
old phone, the sign-ups that sink the diving board, the app that dies at night, the one that needs a second app
for cats. The comedy has an escalation (a quiet first verse, a night show where the tables turn, a parade of a
hundred dogs, a held note, a hush before the last question), and the patter is a pleasure to hear go by.

## Why they'd share it

- **To clip:** the sign-ups piling onto the diving board over the server; the greyhound's cartwheel; the crate
  ship that turns into a snail; the bugs swarming the ring; the bulldog flattened by a rolling pin who springs
  back; the hundred-dog parade; the three rosettes flying to Clawd on the held "know!".
- **To quote:** "Which of the 'ilities are yours? I've got to know!"
- **To sing along:** the bouncing ball hops every chorus line.
- **To save:** the last card, every quality the song names in plain words, to screenshot.
- **To tag:** the friend who ships the moment it works.
- **To reply:** the post text asks which of the 'ilities are theirs.

**Post text (draft, for Qing to edit):**
> "It works and it looks fine, so it's good."
> Your app can be correct and still fall over on an old phone, at night, at 9,000 sign-ups, or the day you ask
> your agent to fix it. Those are different qualities, the 'ilities, and being good at one doesn't make you good
> at the others. They compete for the same time.
> So tell your agent which are yours, for the people it's for and for the agent that has to work on it: what
> matters most, what you'll trade away, how you'll know.
> Ep 3 of Software Quality Theory 101: Clawd judges a dog-walking app, in a patter song. The last card has every
> quality in the song in plain words, to screenshot.
> Which of the 'ilities are yours?

**Reply under it (draft, for Qing to edit):** what that looks like in a brief, for the dog-walking app:
```text
walkies: book dog walks
for: owners at work, on old phones
matters most: reliable (booked, or it says so), easy to use, works on old phones
will trade away: fast, extensible (dogs only)
how I'll know: a booking survives a bad signal; my mum books a walk unaided
for you (the agent): debuggable, readable: a log line for each booking step
```
The last line is for the agent, because verse 2 is the agent's: what it needs from the code in order to fix it.

## Expert notes (Qing's words, verbatim)

> I did make a couple of final changes to the lyrics. Here is what I have in Suno and here is the
> Suno-style prompt pasted below (2026-09-29)

Her rules for lyrics, this song's included, are in [LYRICS.md](../LYRICS.md).

## Questions for Qing

The lyric is hers and is locked. These are only claims that the video's pictures and end card make.
They are in [03-video.md](03-video.md) under *Questions and decisions for Qing*, so that she has one
list.
