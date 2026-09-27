# Episode 2: "How Do I Know?" (working title)

**Concept:** tell your agent how it will know whether its work is good, and it can check its own
work. The thing that tells you is an oracle, and there always is one: if it's good, somebody can
tell.
**Status:** full draft v3 (shape, sketch, lyrics, brief), through three review rounds; claims
approved by Qing (2026-09-27). Next: her ear on the lyrics, then a MiniMax take. Oracles come before the ilities (episode 3) and testing (episode 4), and stay at the
highest level here, for what the viewer said they care about in episode 1. Working title changed
from "How Would You Know?" after Qing's note that "how do I know" is a classic song refrain.

## Expert notes (Qing, 2026-09-27, verbatim)

On the order of the series:

> The other thing is, if I'm thinking about the lessons from what people are taking away from
> these, it would be nice if they could apply them almost in order, right? In lesson 1 the
> actionable is "Tell your coding agent who matters and what they care about" and that can happen
> very early on. What's the next thing you need? It's "Tell the coding agent how they're supposed
> to know if it's any good, how to check its own work." In my four questions it goes in that order
> as well, right?
> - What does good look like?
> - How do we know if it's good?
> - How good is it?

Her notes on why testing moved later are in
[episode 4](04-what-happens-if.md#why-it-moved-qing-2026-09-27-verbatim). Later the same day:

> oh actually by my sequencing reasoning ilities go before testing

> No the trench coat is not the illaties. The trench coat is a further breakdown of the ilities.
> Did you not have an episode for the basic ilities because a vibe coder won't know them?
>
> Trench coat is 102-level ilities

> Please review the actual lesson plan carefully and don't just guess based on the sources we
> have. It has to make sense as a curriculum from first principles and be applicable in order

> ilities After oracles, actually I think. it feels boring otherwise. and you can have oracles at
> the highest level just for the stuff you said you care about in episode one. "how do I know" is
> a classic song refrain

On the draft (2026-09-27):

> oh we shouldn't include the compiler story, it's way too out of date and irrelwvant

> half a year is ancient history in agentic terms now

## Where it comes from

Qing's article *Agentic Coding and the Problem of Oracles* (2026-02-06; see
[SOURCES.md](../SOURCES.md)). The claims below are hers unless marked. The kinds of oracle come
from the Tollens quality-strategy work. The oracle problem itself is an old idea in testing.

## Talking points (v1)

**Misconception, in the viewer's voice:** "My app doesn't have a right answer, so I have to look
at everything myself."

What it looks like in practice is the loop every vibecoder knows: "Fixed it! ✅" "Still broken."
"Fixed it now! ✅" "Still broken." The viewer is the agent's only way of knowing, so every round
waits on them.

**Refutation:** if it's good, somebody can tell. Say who, and how they'd tell, and the agent can
check its own work at agent speed. You keep the final say.

1. **The loop.** Fifteen rounds of "Fixed it! ✅" and "still broken". The agent is fast; you
   aren't, and you're the bottleneck.
2. **What agents do when they can tell for themselves.** Give an agent something to check
   against, a mockup to match or totals a spreadsheet already worked out, and it iterates at agent
   speed until it matches. Agents are much better when they can tell for themselves what's correct
   (Qing).
3. **The fair objection.** "Cool, but my app hasn't got an answer key." That's right in a way,
   and it's an "under-ambitious" way to think about it (Qing).
4. **The turn: somebody can always tell.** "Because it's good, somebody knows that it's good. If
   it's bad, somebody knows that it's bad" (Qing). You already have oracles; you just don't call
   them that:
   - **the mum test:** could someone who isn't a developer log a set without asking you?
   - **the midnight panic:** what breaking would make you sweat? For the gym log, losing your
     personal bests.
   - **the screenshot test** (Qing's front-page test, made current): what would make you cringe
     in a screenshot? Your weight showing on a public leaderboard.
5. **The agent can play the people who'd judge it.** Language models are good at imagining
   specific people; predicting what people write is how they were made. It can't be your mum, but
   it can try the app as "someone who's never seen it, one thumb, mid-set", and tell you where it
   got stuck. It can't panic, but it can check everything on your panic list, and if it knows who
   you are (episode 1) it can help you write the list.
6. **Make fuzzy things precise where you can.** Some ways to know are exact, and some are a
   person's judgement. Gym-log examples, from exact to judgement:
   - **a right answer to compare with:** kilograms to pounds agrees with a real converter
   - **something that must always be true:** a set logged offline is still there when the signal
     comes back; your best never goes down unless you delete it
   - **a person the agent can play:** a stranger, mid-set, with sweaty thumbs
   - **you:** does it feel like a gym log you'd open?
7. **You move up the stack.** The agent only approximates your judgement, so you stay the final
   say on what good means. But you stop being the agent's only check and become the person who
   tells it how to check. Qing's closing line: "The job for humans isn't writing code any more -
   it's knowing what good means."
8. **The tease for the testing episode.** A test is only as good as its oracle. Episode 4 puts
   the oracles to work.
9. **The brief:** say how you'll know it's good, and have the agent check against that before it
   says "done".

**Guardrails:**
- Not "agents can replace your judgement": they approximate it, and you have the final say.
- Not "you need a test suite first": an oracle can be a person, a rule or a comparison. Writing
  tests is episode 4.
- Not "only apps with right answers can be automated": that's the misconception.

## Judgement calls on the open claims (2026-09-27)

Qing asked for my own judgement on these for now ("make your own judgements for now").

1. **The front-page test becomes the screenshot test:** "what would make you cringe in a
   screenshot?" It's the same reputational oracle, in the form a vibecoder meets it.
2. **Calibrating an oracle ("make sure the check can go red") stays in episode 4.** This episode
   only needs the idea that there's always a way to know, and that the agent can use it.
3. ~~The compiler story stays.~~ Qing cut it (2026-09-27): "way too out of date and
   irrelevant". Verse 2 now uses everyday things an agent can check against: a mockup and a
   spreadsheet's totals.
4. **The oracles stay at the highest level** (Qing): one for each thing episode 1's brief said
   matters, plus the panic and screenshot tests, which surface cares the brief forgot. Exact
   oracles (a converter to compare against, rules that must always hold) are only glimpsed; the
   ilities episode and the testing episode use them properly.

## Shape

- **Concept, in one sentence:** tell your agent how it will know its work is good, and it can
  check its own work; there's always a way, because if it's good, somebody can tell.
- **Misconception:** "My app has no right answer, so I have to check everything myself." What it
  looks like: the "Fixed it! ✅" / "still broken" loop.
- **Refutation:** somebody can always tell. Say who, and how they'd tell, and the agent checks its
  own work at agent speed, shows you how it checked, and you keep the last word.
- **Singer:** Clawd again, as your agent. This time it's a love song. The agent is the anxious
  partner who can never tell whether you're happy: its own checks all pass, and you still say no.
  "How do I know?" and "show me a sign" are love-song stock phrases, and here they mean exactly
  what the episode teaches. The agent owns its part, as in episode 1: "Fixed it!" was a guess.
  The user is heard only as a backing-vocal "(still broken)". Keep Clawd's staging comic (Mum's
  cardigan, the wandering button), never doe-eyed, so it doesn't read as an AI-girlfriend song.
- **Genre (proposal):** 1980s synth-pop, in the spirit of the big mid-80s "does he love me?"
  songs, with its own tune: gated-reverb drums, bright synth bass, a big glossy chorus, a key
  change into the last chorus. About 128 bpm, so a bar is about 1.9 s. Female pop vocal, earnest
  and yearning, slight robotic edge. Patter verses; a verse template such as the rap cadence of
  Blondie's "Rapture" is one option for Qing's ear.
- **Form and length:** intro, verse 1, pre-chorus, chorus once through, verse 2, bridge, break,
  final pre-chorus, chorus twice through with the key change, outro. About 2:50. The middle
  chorus and the second pre-chorus are cut so the teaching arrives before two minutes.
- **Line to remember:** "Don't just tell me when it's wrong, tell me how you'd know!" It closes
  the chorus. It's the agent's fair side of the relationship, and it is the instruction.

## What the song says, and what the video shows (sketch)

The lyrics carry the ideas and stand alone; the video carries the gym log. Only the pictures a
line depends on are listed.

| Section | Lyrics say | Video shows |
|---|---|---|
| Intro | "I fixed it!" answered by "(still broken)", four times, ending in heartbreak | Frame 1 is two huge bubbles and nothing else: "Fixed it! ✅" and "still broken", 2:47 AM in small type. Each new exchange stacks on top. From here on, the user's sung lines are captioned as grey right-aligned bubbles, Clawd's as its own, so muted viewers can tell who's singing |
| Verse 1 | The agent fixes the gym log fast, then waits all night: it can run and test the app, but it never knows what "right" means to you. So it guesses, and breaks what worked. Tag: I'm fast, you're slow, and I'm the last to know | The gym log getting worse with each guess: the button in the footer, the rest timer spinning |
| Pre-chorus | You only say when it's wrong, never how to tell it's right. You know it when you see it, but you never said what shows it | — |
| Chorus (once) | "How do I know?" All my tests came up green, and you still said no. The line to remember | Clawd's own test report, all green, under your "still broken" |
| Verse 2 | Give the agent something to check against and it's unstoppable: a mockup matched pixel for pixel, a spreadsheet's totals matched to the penny. With only "still broken", it guesses and gets a no. Tag: "No answer key for me!" "Oh, but you've got three!" | Clawd at full speed beside a mockup, the two screens converging; a column of totals ticking into agreement; then back to the gym log and the "still broken" bubble |
| Bridge | If it's good, somebody can tell. Your three: could your mum log a set, would you sweat if your bests disappeared, would you fret if your weight hit the group chat | Three pictures, each captioned with its name so the brief can use it: *the mum test* (Mum with the gym log), *the sweat test* (you bolt upright at night), *the group-chat test* (a screenshot of your weight in a group chat) |
| Break | An oracle is anything that helps you spot what's wrong. The agent can play your mum and check each fear you name; it shows you what it checked, and the last word is yours | Clawd in Mum's cardigan trying the gym log one-thumbed; a checklist ticking; your hand on the final tick. Credit below |
| Final pre-chorus | The same complaint, then the ask: put the answers in the brief, and I'll know it, and I'll show it | The brief opening |
| Chorus (twice, key change) | Word for word, with the second pass: while you sleep, who else knows if it's good to go? | The questions answered, one per oracle, each tick with its evidence beside it (a screenshot, a load time) |
| Outro | Now I know: as your mum I logged sets, and your bests won't go; here's how I checked it all, plus the gaps I know. Spoken: "Is it good?" You try it yourself: "It's good." | Under the sung lines, Clawd's check report: ✅ mum test: a stranger logged a set one-thumbed (screen recording), ✅ bests survive offline, ❓ app updates: couldn't try a real one. Your thumb logs one set. Then the brief's added lines alone on screen, captions off, for at least 8 seconds over the instrumental tail. Last frame: frame 1's layout, now "Fixed it! ✅" / "it's good.", over the intro riff, so the loop lands on "I fixed it!" again |

**On-screen credits:**
- Break: *Oracles: an old idea in testing (Howden; Weyuker; Bach & Bolton) · human oracles for
  agents: Yanqing Cheng*

## Lyric sheet (v3)

Backing vocals in italics and brackets. *(still broken)* is the user, as a gang vocal. Stresses
in capitals for the pre-chorus and chorus; syllable counts in brackets.

**Intro**
> I fixed it! *(still broken)* [3]
> Re-fixed it! *(still broken)* [3]
> I'm hoping! *(still broken)* [3]
> I'm broken! *(still broken)* [3]

**Verse 1** (patter)
> I can fix your gym log in a minute; then I wait all night, [15]
> I can run it, I can test it, but I never know what's right. [15]
> So I guessed which bit was broken, and I messed with bits that worked; [15]
> now the button's in the footer, and the rest timer's berserk! [15]
> I'm fast, you're slow, [4]
> and I'm the last to know. [6]
> *(spoken)* …Is it good now?

**Pre-chorus**
> you TELL me WHEN it's WRONG, but NEV-er HOW to TELL it's RIGHT; [14]
> you're ALL i've GOT to JUDGE it, and you JUDGE it LATE at NIGHT. [14]
> YOU just KNOW it when you SEE it, but you NEV-er SAID what SHOWS it! [16]

**Chorus** (once through the first time; twice through at the end)
> HOW do i KNOW? *(how do I know?)* [4]
> all my TESTS came up GREEN, and you STILL said NO! [11]
> SHOW me a SIGN! *(is it fine?)* [4]
> DON'T just TELL me WHEN it's WRONG, TELL me HOW you'd KNOW! [12]
>
> HOW do i KNOW? *(how do I know?)* [4]
> while you SLEEP, who else KNOWS if it's GOOD to GO? [11]
> SHOW me a SIGN! *(is it fine?)* [4]
> TELL me WHO would SEE it's WRONG, TELL me HOW they'd KNOW! [12]

**Verse 2** (patter)
> Give me a mockup, and I'll match it, every pixel, every shade, [16]
> and to the penny, I'll match all the totals that your spreadsheet made, [16]
> 'cause with something I can check against, I'm off, and just watch me go! [16]
> But with nothing but "still broken", I guess and guess and get a "no". [16]
> *(you, gang)* No answer key for me! [6]
> *(Clawd)* Oh, but you've got three! [5]

**Bridge**
> If it's GOOD, someone CAN TELL. Here's a TEST: *(whoa-oh)* [10]
> On your gym log, could your mum log a set? *(whoa-oh)* [10]
> If your bests all disappeared, would you sweat? *(whoa-oh)* [10]
> If your weight hit the group chat, would you fret? [10]

**Break** (half time)
> An oracle's anything that helps you spot what's wrong! *(spot what's wrong!)* [13]
> I can't be your mum, but I can play her all day long! *(all day long!)* [13]
> I can't feel your panic, but I'll check each fear you name! *(fear you name!)* [13]
> I'll SHOW you WHAT i've CHECKED, but the LAST word's YOURS to CLAIM. [13]

**Final pre-chorus** (lines 1 and 2 word for word; only line 3 changes)
> you TELL me WHEN it's WRONG, but NEV-er HOW to TELL it's RIGHT; [14]
> you're ALL i've GOT to JUDGE it, and you JUDGE it LATE at NIGHT. [14]
> PUT the AN-swers IN the BRIEF, and THEN i'll KNOW it, AND i'll SHOW it! [16]

**Chorus** (key change up, twice through)

**Outro** (the chorus's grid)
> OH, now i KNOW! *(now I know!)* [4]
> as your MUM i logged SETS, and your BESTS won't GO! [11]
> HERE is the SIGN! *(checked it twice!)* [4]
> HERE'S the WAY i CHECKED it ALL, PLUS the GAPS i KNOW! [12]
> *(spoken)* …Is it good?
> *(you, after trying it)* It's good.


**Rhymes, section by section** (all hold in General American)
- Intro: fixed it / re-fixed it, then hoping / broken, all on the same x-S-x shape, against the
  refrain; "broken" is the payoff.
- Verse 1: night/right; guessed/messed, and fix/minute inside; worked/berserk; slow/know.
- Pre-chorus: wrong/right; right/night; know it/shows it.
- Chorus: no/go/know, the hook's sound; tests/said and green/sleep inside; sign/fine.
- Verse 2: shade/made; go/no, the hook's sound; mockup/match and penny/pixel inside; me/three.
- Bridge: test/set/sweat/fret (test a slant); mum/gym inside.
- Break: wrong/long; name/claim.
- Final pre-chorus: as the first; know it/show it.
- Outro: know/go/know; sign/twice; mum/sets inside.

**For Qing's ear:** bridge line 1 stresses "CAN", and line 4 puts GROUP on syllable 6 against 7;
break line 4 matches its section's grid only in its back half; the final pre-chorus changes line 3,
so watch it in the takes.

## The brief, before and after

Before: episode 1's brief.

> a gym log. just for me.
> for: me, mid-set, sweaty hands
> good = log a set in one tap
> fast to open, cheap to run
> a 🔥 when I beat my best
> skip: 2FA, Kubernetes, confetti
> ship it by Monday
> for you: tidy diags, ask if unsure

After, with these lines added. Each is a way to check one thing the brief already cares about,
or one the sweat and group-chat tests turned up, written so the agent can actually run it:

> how you'll know it's good:
> mum test: someone who's never seen it logs a set, one thumb, phone-sized
> fast? a second from tap to open, on slow data
> 🔥? only for more weight than my best on that lift
> sweat test: my bests survive no signal and app updates
> group-chat test: my weight never leaves my phone
> check each one yourself; show me how you checked
> ask me when these don't settle it

## Why they'd like it

The opening is a loop every vibecoder has lived, played as heartbreak. The agent is sympathetic
and owns its part: it can run its own tests, and they all pass, and it still can't tell whether
you're happy. And the love-song frame makes a
dry word, "oracle", feel obvious: of course you'd want a sign.

## Why they'd share it

- **To clip:** the intro's "Fixed it! (still broken)" loop, ending on "I'm broken!"
- **To quote:** "I'm fast, you're slow, and I'm the last to know."
- **To save:** the brief, held full screen.
- **To tag:** the friend who replies "still broken" and nothing else.
- **To reply:** the post text lists the three tests and asks for theirs.

**Post text (draft):**
> "Fixed it!" "still broken." "Fixed it now!" "still broken."
> Your agent's usually not lying. It's guessing, because nobody told it how to tell.
> Three ways you already have: could your mum use it? What would make you sweat? What would you
> hate to see in the group chat?
> Ep 2 of Software Quality Theory 101, a synth-pop love song. How would you know yours is good?

## Review log

- **Round 1 (2026-09-27), on v1:** a songwriter, a short-form editor, simulated viewers and a
  fact-checker, in parallel. Changes made in v2:
  - the agent no longer claims you're its only way of knowing (the senior engineer's dunk): it can
    run and test the app, and its tests all pass, but it doesn't know what "right" means to you
  - the GCC tag answers "Oh, but you've got three!", not "you've got one": a mum, a panic list and
    a group chat aren't a GCC, and the article says so (fact-checker)
  - verse 2 now says the mechanism (check each file against a compiler that works, and the bad
    ones show), and the picture shows a human plugging GCC in: a person told the agents how to
    know, which is the lesson
  - the outro no longer rubber-stamps the agent's self-check: it says what it checked, how, and
    what it couldn't, and the user tries it before saying "It's good" (fact-checker: the
    circularity trap)
  - the oracle credit no longer implies Qing coined the word: it credits the testing lineage and
    her framing for agents
  - "An oracle tells you if it's right" became "whatever helps you tell right from wrong": oracles
    are fallible
  - the brief's lines are now checks an agent can run (it can't open your phone or judge "fake")
  - cut to about 2:50 by dropping the middle chorus and second pre-chorus, so the three tests
    arrive before two minutes (editor, viewers)
  - frame 1 is two huge bubbles; the brief gets six seconds alone; the last frame mirrors the
    first so the loop reads as before and after (editor)
  - the songwriter's rebuilds: every intro line on one vowel; verse 1 names the gym log; the
    pre-choruses share one grid; chorus line 2 carries a fact instead of "Is it right? Is it
    tight?"; "Show me a sign" gets a rhyming answer, "(is it fine?)"; the bridge is one gym-log
    test per line; the break rhymes wrong/long and wrote/vote
  - the post text no longer says the agent "has no way to tell"
- **Round 2 (2026-09-27), on v2:** one combined craft reviewer and a fresh fact-checker. Changes
  made in v3:
  - verse 2 had the GCC fix wrong: the harness didn't check file by file, it built most of the
    kernel with GCC so the bugs could be narrowed down, and every agent had been chasing the same
    bug. The lyric now says so, and credits "their human" with the harness (fact-checker, against
    the live post)
  - no more "all is fine" or "you can sleep at night": the outro's answer is "(here's the proof!)",
    the final ticks carry their evidence, the brief asks for proof, and the outro's picture is
    Clawd's check report, including what it couldn't tell (fact-checker: the circularity trap)
  - an oracle is now "anything that helps you spot what's wrong": a way to find problems, not a
    proof of rightness (Bach and Bolton)
  - the final pre-chorus keeps lines 1 and 2 word for word and changes only line 3, so the
    generator can repeat it and the instruction ("put the answers in the brief") survives
  - pre-chorus line 3 now says the new fact, tacit knowledge: "You just know it when you see it,
    but you never said what shows it"
  - "you said 'oh no'" contradicted the only thing the user ever says; now "you still said no"
  - the break no longer refers to a list that doesn't exist yet ("each fear you note")
  - the brief's usability line now plays Mum, as the song does; the 🔥 and speed lines say
    exactly what's measured
  - fixed off-grid lines: the intro (all x-S-x), verse 1 line 2, verse 2 line 1 and tag, the
    outro (now on the chorus grid), bridge line 1
  - muted viewers get caption styles that show who's singing; the brief is held 8 seconds with
    captions off
- **After Qing's note (2026-09-27):** the compiler story is cut as out of date and irrelevant.
  Verse 2 now shows what an agent does with something to check against (a mockup, a
  spreadsheet's totals), then what it does with only "still broken". The tag becomes "No answer
  key for me!" The GCC notes in rounds 1 and 2 are history.
- **Round 3 (2026-09-27), on v3:** one final cold read. Changes made:
  - "proof" contradicted the break (an oracle isn't proof): the outro answers "(checked it
    twice!)", which also rhymes with "sign", and the brief asks "show me how you checked"
  - the brief's "panic test" and "cringe test" were never taught: the bridge's pictures are now
    captioned *the mum test*, *the sweat test* and *the group-chat test*, and the brief and post
    text use those names
  - verse 2 still made GCC sound as if it exposed the bugs; now GCC let each agent take "their own
    road", a different bug each
  - the outro's last line now matches the chorus's stresses ("PLUS the GAPS i KNOW"), and its
    check report admits the one thing it couldn't try (a real app update)
  - the brief's usability line is one an agent can act on ("someone who's never seen it"), and the
    song's mum is that test's name
  - the sketch now matches the lyrics word for word
  - the post text says agents are "usually" not lying

## Claims checked with Qing (2026-09-27)

Her answers, verbatim, to the three claims:

1. **What an oracle is** (spotting what's wrong, or telling what's right?): "they're the same
   picture". The break's wording stands.
2. **"All my tests came up green, and you still said no":** "yeah it points to checking the wrong
   things". It stays: the agent's tests were checking the wrong things.
3. **The agent playing your mum as a check:** "yeah, it's not perfect but it's better than
   nothing!" It stays, with the evidence shown and the last word yours.
