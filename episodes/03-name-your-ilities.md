# Episode 3: "The 'Ilities" (working title: "Name Your Ilities")

**Status (2026-09-29):** the lyric is locked, in Qing's final Suno version, and the take exists
("The _ilities_", 3:33). The video is in pre-production: [03-video.md](03-video.md). Qing's rules for
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
the spoken line is spoken.

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
| reliability | verse 1, line 4 | working when you need it: "it died at night" |
| accessibility | verse 1, line 5 | usable by people with different needs, not only the default user: "a mess" |
| usability | verse 1, line 5 | easy to use: "a mess" |
| extensibility | verse 1, line 6 | growing to do what you hadn't planned: walking cats "cost a second app" |
| liability (a moral, not an ility) | refrain, both verses | the qualities you never thought about become a risk to you: "growing" |
| debuggability | verse 2, line 1 | can you make the problem happen again to study it |
| diagnosability | verse 2, line 2 | does it tell you why, not just that it failed: "it's 'Oops'" |
| recoverability (and stale docs) | verse 2, line 3 | getting back what you lost; docs that promise a backup that isn't there |
| testability | verse 2, line 4 | can it be checked without walking it through by hand |
| readability (and lean context) | verse 2, line 5 | can an agent find its way in it, without burning its context |
| maintainability | verse 2, line 6 | patching one bug shouldn't hatch two more |
| resilience, compliance | bridge | two qualities that don't end in "-ility", to show the name is a nickname |
| sixteen more | the break | there are many; the point is to name yours, not to learn them all |

The chorus carries four trade-offs (fast against steady, ship by a date against ease of change, save
on the checking against bugs, polish one part against another taking a blow), and the bridge says the
dimensions are independent: knowing how good one is tells you nothing about another. Both are true
and the video shows both (in the instrumental, four dogs score differently on speed, care, cost and
fun; no dog wins everything).

## Expert notes (Qing's words, verbatim)

> I did make a couple of final changes to the lyrics. Here is what I have in Suno and here is the
> Suno-style prompt pasted below (2026-09-29)

Her rules for lyrics, this song's included, are in [LYRICS.md](../LYRICS.md).

## Questions for Qing

The lyric is hers and is locked. These are only claims that the video's pictures and end card make.
They are in [03-video.md](03-video.md) under *Questions and decisions for Qing*, so that she has one
list.
