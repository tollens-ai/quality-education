# Episode 2: "How Do I Know?" (working title)

**Concept:** tell your agent how it will know whether its work is good, and it can check its own
work. The thing that tells you is an oracle, and there always is one: if it's good, somebody can
tell.
**Status:** v6 (2026-09-27): the boy band, now about a wedding seating plan, with oracles as
sources of judgement. Every stress match and rhyme machine-checked. For Qing's ear. Oracles come before the ilities (episode 3) and testing (episode 4), and stay at the
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

> also it's weird, why is mum using the gym log

> hmm, also on user simulation we need to make it clear you need to get a separate claude or a
> subagent to do it, can't just be the main coder claude

> oh you don't have to say frsh claude that's weird and defensive. just don't imply something
> wrong.

The boy-band concept (2026-09-27):

> anyway, I was thinking and I have a new concept, like if this was a boy band this time and it's
> more of a song, of, like "how do I make you love me" style but it's like actually baout how do I
> make you love this app, you know?
>
> like you don't have to do it like this it's not very good but like (also this illustrates the
> level of rhyme density that I think is good - doesn't have to be this structure obviously. the
> rhythmic structure isn't right because it won't be obvious enough for minimax)
>
> how do I know, if my code, will make the app of your dreams?
> and verify, the UI, won't be the reason you leave
> ... something something the bee's knees
> how do I check, if my test, something something believe?

On the mum test:

> also I like the mum thing! Just pick a different app

> oh actually mum is more alienating than dad internationally because of spelling

> or granny

On lyrics v4 (2026-09-27):

> noooooo overfitting againnnnnnn stopppppp there is no particular line structure that works!

> you can do any internal rhyme structure you like, cribbing from anywhere! sondheim! Miranda!
> gilbert and Sullivan!

> the key thing for minimax is that syllable stress matches need to be exact

> love it and leave it do NOT rhyme

> no see it absolutely rhymes with leave it

> mockup and lock it up don't rhyme either

On lyrics v5 (2026-09-27):

> OK the overt simile is cringe. "like an ex" is a waste of syllables we could be teaching with.
> it operates on an artistic allusion level!
>
> also I liked the "I fixed it" "still broken" refrain and maybe we could use it somewhere
>
> "I just fixed it" "it won't open"
> "yeah just fixed it" "where's the slogan?"
> "I refixed it" "missing token"
> "really fixed it" "it's still broken"

> also like weird wording like "shun it" is cringe. if one rhyme scheme is not working out try
> others

> but if you have an internal rhyme scheme one one line it should repeat elsewhere predictably.
> rhyming is about predictability. otherwise it sounds like an accident. you see how in my
> example it's the same on every line

> right. don't force the rhymes and lose track of what you're trying to say though. you'd always
> rather change the rhyme structure

> also why is it still playing you! Claus splaying granny or mum or anyone specific is way easier
> to illustrate.

> hey "if your gym log lost your best" is not an oracle it's just a requirement.
>
> also i really think the gym log example is just too simplistic for this song, you want
> something that will really be improved with non obvious oracles

## Where it comes from

Qing's article *Agentic Coding and the Problem of Oracles* (2026-02-06; see
[SOURCES.md](../SOURCES.md)). The claims below are hers unless marked. The kinds of oracle come
from the Tollens quality-strategy work. The oracle problem itself is an old idea in testing.

## Talking points (v1)

*The ideas still stand; the gym-log examples are superseded by the wedding seating plan (see
Shape), and the bridge's tests are now asked as sources of judgement, not requirements.*

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
   - **the mum test:** could someone who isn't a developer use it without asking you? That's
     Qing's general form. The gym log is just for you (episode 1), so here it becomes **the
     mid-set test:** could you log a set out of breath, one-thumbed, at the gym?
   - **the midnight panic:** what breaking would make you sweat? For the gym log, losing your
     personal bests.
   - **the screenshot test** (Qing's front-page test, made current): what would make you cringe
     in a screenshot? Your weight showing on a public leaderboard.
5. **The agent can play the people who'd judge it.** Language models are good at imagining
   specific people; predicting what people write is how they were made. It can't be you mid-set,
   but it can try the app as you, "one thumb, out of breath, phone-sized", and tell you where it
   got stuck. It has to be a separate Claude or a subagent, not the one that wrote the code
   (Qing): the builder knows where every button is, so it can't use the app like someone who
   doesn't. It can't panic, but it can check everything on your panic list, and if it knows who
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

## Shape (the boy band)

- **Concept, in one sentence:** tell your agent how it will know its work is good, and it can
  check its work; there's always a way, because if it's good, somebody can tell.
- **Misconception:** "My app has no right answer, so I have to check everything myself." What it
  looks like: the "Fixed it! ✅" / "still broken" loop.
- **Refutation:** somebody can always tell. Say who, and how they'd tell, and your agents check the
  work at agent speed, show you how they checked, and you keep the last word.
- **Singers (Qing's concept, 2026-09-27):** a boy band of Clawds singing to you, in the mould of
  "how do I make you love me?", except it's "how do I make you love this app?" They'd do anything
  for you, if they only had a clue. Being a band also carries a point for free: the Clawd who
  built it isn't the one who plays the people who'd judge it. The user is heard only in call-and-response ("still
  broken", "No answer key for me!").
- **Genre (proposal):** late-90s boy-band pop: finger snaps, an R&B groove, five-part harmonies,
  lead lines traded between members, a stool-ballad feel that stands up for the key change into
  the last chorus. About 104 bpm (a bar is about 2.3 s). Lines that answer each other match their
  stresses exactly, checked with `music/check/rhyme.py`; the rhythm is otherwise free.
- **Form and length:** spoken intro, verse 1, pre-chorus, chorus, verse 2, chorus, bridge, break,
  final pre-chorus, chorus with the key change, outro. About 2:40; the second pre-chorus is cut
  for length.
- **Line to remember:** "I can't make you love it if I can't tell when you do." It closes every
  chorus. It's plain and fair, it's a love-song line, and it's the whole oracle problem.
- **The app:** a seating plan and RSVP site for your sister's wedding, not the gym log. The gym
  log was too simple for this idea (Qing): almost everything about it has an obvious answer. A
  seating plan has no answer key, and plenty of non-obvious oracles: Gran, the RSVP sheet, the
  caterer's order, the relatives you'd dread seating together, the screenshot you'd hate to see
  in the family chat. And a wedding suits a love song.

## What the song says, and what the video shows (sketch)

The lyrics carry the ideas and stand alone; the video carries the wedding. Only the pictures a
line depends on are listed.

| Section | Lyrics say | Video shows |
|---|---|---|
| Intro | Qing's refrain: the band's "I just fixed it!", four times, and your replies, none of which the band can check: "it won't open", "where's the slogan?", "missing token", "it's still broken" | Frame 1: five Clawds in matching white suits on stools, under two huge chat bubbles, the band's "I just fixed it! ✅" and your "it won't open". 2:47 AM in small type. Each exchange stacks on top. The builder Clawd wears a hard hat throughout |
| Verse 1 | I rebuilt your seating plan; every test was green; but you never said what good looks like, so what's to check? Now I'm guessing. Tag: I'd do anything for you, if I only had a clue | The seating plan redone table by table; a wall of green ticks; an empty space where "good looks like…" should be |
| Pre-chorus | You tell me when it's broken, never how to tell it's right; you know it when you see it, but keep the answer out of sight; and baby, baby, I just wanna make you love it | — |
| Chorus | How do I know? All my checks and my tests say it's true; then you just say "not okay", and I'm blue. Give me a sign, or a line, or a clue. The line to remember | The green test report; your "not okay"; the band, blue; a sign held up, blank |
| Verse 2 | Give me a mockup or a spreadsheet and I match it; something to check against, and watch me go; only "still broken", and all I hear is no. Tag: "No answer key for me!" "Oh baby, wait and see!" | Clawd matching a mockup, the two screens converging; a column of totals ticking into agreement; back to "still broken". On "wait and see", three cards land face down |
| Bridge | If it's good, then there's someone who knows. Could your gran find her seat on her phone? What's the thing on the day that you'd dread? What's the screenshot you'd hate to see spread? Each line asks for a source of judgement, not a requirement | One card flips per line, each captioned with its name: *the Gran test* (Gran, squinting at her phone at the venue door), *the dread test* (two feuding uncles at one table), *the screenshot test* ("Table 13: Singles 💀" in the family chat) |
| Break | An oracle is anything that helps you spot what's wrong. We can't be your gran, but we can play her; I'll check each fear you name, show you receipts, and it's still your call | One Clawd in Gran's cardigan and reading glasses squints at an old phone, and finds Table 7. A checklist ticks, with evidence beside each tick; your hand on the last one. Credit in its own band, below the captions |
| Final pre-chorus | The same complaint; then: so write it down, and I can really make you love it | The brief opening |
| Chorus (key change) | Word for word | The band stands up off the stools. The brief's new lines tick in, one per sung line |
| Outro | Here are the checks and the tests that went through; what I don't know, I will show it to you. Spoken: "So… do you love it?" You try it yourself: "I love it." | The band's check report: ✅ Gran test (the cardigan Clawd found her seat on an old phone; screen recording), ✅ every guest seated exactly once, against the RSVP sheet, ✅ dietary counts match the caterer's order, ✅ nobody on your dread list shares a table, ❓ feuds you didn't list: can't know. Your sister opens it and finds her table. The brief held about 3 seconds. Last frame: frame 1's layout, the bubbles now "I just fixed it! ✅" and "I love it.", over the intro snaps, so the loop lands on "it won't open" again |

**On-screen credit (break):** *Oracles: an old idea in testing (Howden; Weyuker; Bach & Bolton) ·
oracles for agentic coding: Yanqing Cheng*

## Lyric sheet (v5)

Backing vocals in italics and brackets. Lines marked *(you)* are the user, as a gang vocal.
Stresses in capitals, syllables split with hyphens. Every set of lines that answer each other
was run through `music/check/rhyme.py lines` and matches exactly; every rhyme listed below was run
through `music/check/rhyme.py rhyme` and shares its stressed vowel.

**Intro** (Qing's refrain; the band, then you)
> i just FIXED it! *(you)* it won't O-pen! [4 + 4]
> yeah, just FIXED it! *(you)* where's the SLO-gan? [4 + 4]
> i re-FIXED it! *(you)* MISS-ing TO-ken! [4 + 4]
> REAL-ly FIXED it! *(you)* it's still BRO-ken! [4 + 4]

**Verse 1**
> i re-BUILT your SEAT-ing PLAN, the TA-bles, EV-ery SCREEN, [13]
> then i RAN my TESTS, and EV-ery SIN-gle ONE was GREEN, [13]
> but you NEV-er SAID what GOOD looks LIKE, so WHAT'S to CHECK? [13]
> now i'm GUESS-ing WHAT you MEANT, and GET-ting MORE per-PLEXED. [13]
> *(all)* I'd do anything for you *(for you)* [7]
> if I only had a clue! [7]

**Pre-chorus**
> you TELL me when it's BRO-ken, NEV-er HOW to TELL it's RIGHT; [14]
> you KNOW it when you SEE it, KEEP the AN-swer OUT of SIGHT, [14]
> and BA-by, BA-by, i just WAN-na make you LOVE it… [13]

**Chorus**
> HOW do i KNOW? *(how do I know?)*
> ALL of my CHECKS, and my TESTS, say it's TRUE, *(ooh, baby)* [10]
> THEN you just SAY "not o-KAY", and i'm BLUE. *(ooh, baby)* [10]
> GIVE me a SIGN, or a LINE, or a CLUE! [10]
> *(all)* i can't MAKE you LOVE it *(love it)*, if i can't TELL when you DO! [13]

**Verse 2**
> GIVE me a MOCK-up, i'll MATCH ev-ery PIX-el and SHADE; [13]
> GIVE me your SPREAD-sheet, i'll MATCH ev-ery SUM that you MADE; [13]
> SOME-thing to CHECK a-gainst? THAT'S all i NEED: watch me GO! [13]
> ON-ly "still BRO-ken"? Then ALL i can HEAR is a "NO". [13]
> *(you)* no AN-swer KEY for ME! [6]
> *(all)* oh BA-by, WAIT and SEE! [6]

**Chorus**

**Bridge** (stripped back)
> if it's GOOD, then there's SOME-one who KNOWS: *(ooh)* [9]
> could your GRAN find her SEAT on her PHONE? *(ooh)* [9]
> what's the THING on the DAY that you'd DREAD? *(ooh)* [9]
> what's the SCREEN-shot you'd HATE to see SPREAD? [9]

**Break** (half time)
> an OR-a-cle's AN-y-thing that HELPS you SPOT what's WRONG! *(spot what's wrong!)* [13]
> we CAN'T be your GRAN, but we can PLAY her ALL day LONG! *(all day long!)* [13]
> i CAN'T feel your PAN-ic, but i'll CHECK each FEAR you NAME! *(fear you name!)* [13]
> i'll SHOW you re-CEIPTS, and it's still YOUR call, ALL the SAME. [13]

**Final pre-chorus** (lines 1 and 2 word for word; line 3 matches the first pre-chorus's line 3
stress for stress)
> you TELL me when it's BRO-ken, NEV-er HOW to TELL it's RIGHT; [14]
> you KNOW it when you SEE it, KEEP the AN-swer OUT of SIGHT, [14]
> so WRITE it DOWN, and i can REAL-ly make you LOVE it… [13]

**Chorus** (key change up; the band stands)

**Outro** (the chorus's grid)
> HERE are the CHECKS, and the TESTS, that went THROUGH; *(ooh, baby)* [10]
> WHAT i don't KNOW, i will SHOW it to YOU. [10]
> *(spoken)* So… do you love it?
> *(you, after trying it)* …I love it.

**Rhymes, checked by stressed vowel** (General American)
- Intro: open / slogan / token / broken, all on OW.
- Verse 1: screen/green; check/perplexed; tag you/clue.
- Pre-chorus: right/sight.
- Chorus: every line has a rhyming pair in the same two slots, then its end rhyme:
  checks/tests, say/okay, sign/line; the ends true / blue / clue, and the tag's do.
- Verse 2: shade/made; go/no; tag me/see.
- Bridge: knows/phone; dread/spread.
- Break: wrong/long; name/same.
- Outro: the chorus's pattern: checks/tests, know/show; through / you.

**Cribbed, on purpose:** the hook line nods to "I Can't Make You Love Me"; "if I only had a clue"
to "If I Only Had a Brain"; "I'd do anything for you" to every boy band ever.

**For Qing's ear:** in the intro, "REAL-ly FIXED it" and "MISS-ing TO-ken" start on a stress
where their neighbours start with two light syllables; if the take trips, "it's so FIXED now" and
"there's no TO-ken" match exactly; "a-GAINST" goes unstressed
in "SOME-thing to CHECK a-gainst", as people say it; the final pre-chorus's third line is new
words on the old stresses, so watch it in the takes.

## The brief, before and after

Before: a brief that already knows who it's for (episode 1), and still says nothing about how
anyone would know it's good.

> seating plan + RSVP site for my sister's wedding
> for: 120 guests, mostly on phones, Gran included
> good = everyone finds their seat in seconds
> skip: logins, confetti
> ship it by the 14th

After, with these lines added. Each names a source of judgement the agents can check against:

> how you'll know it's good:
> Gran test: a subagent plays Gran on an old phone: can she find her seat?
> every guest seated exactly once, matching the RSVP sheet
> dietary counts match the caterer's order
> dread test: nobody on my feud list shares a table (list below)
> screenshot test: no table name anyone would hate to see in the family chat
> check each one before you tell me it's done; show me how you checked
> ask me when these don't settle it

## Why they'd like it

The opening is a loop every vibecoder has lived, sung by a boy band as a breakup. The agents are
sympathetic and own their part: they ran their tests, all green, and still can't tell whether
you'll love it. Boy-band cheese (the stools, the key change, "baby, baby") is funny on crabs, and
the love-song frame makes a dry word, "oracle", feel obvious: of course you'd want a sign. The
ending gives the lonely "still broken" its answer: "I love it."

## Why they'd share it

- **To clip:** the intro refrain; the stools, the key change, the band standing up; the Clawd in Gran's cardigan.
- **To quote:** "I can't make you love it if I can't tell when you do."
- **To save:** the brief, held full screen.
- **To tag:** the friend who replies "still broken" and nothing else; the sibling who's planning a wedding.
- **To reply:** the post text lists the three tests and asks for theirs.

**Post text (draft):**
> "Fixed it!" "still broken." "Fixed it now!" "still broken."
> Your agent's usually not lying. It's guessing, because nobody told it how to tell.
> Ways you already have: could your gran use it? What would you dread? What screenshot would you
> hate to see spread? And the lists you already trust, like the RSVP sheet.
> Put them in the brief, and have another Claude play the person it's for.
> Ep 2 of Software Quality Theory 101: a boy band of Clawds asks how to make you love your app.
> How would you know yours is good?

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
- **After Qing's note on Mum (2026-09-27):** the gym log is just for you (episode 1), so Mum has
  no reason to use it. The mum test becomes the mid-set test: you, out of breath, one-thumbed.
  The agent plays you, in your sweatband. The post text keeps the general form for other apps.
- **After Qing's note on user simulation (2026-09-27):** playing the user has to be a separate
  Claude or a subagent, not the one that wrote the code. The break now says why ("I know where
  the buttons are: send a fresh Claude along!"), the outro and the check report credit the fresh
  Claude, the picture hands the phone to a second Clawd, and the brief asks for a fresh subagent.
- **v4, the boy band (2026-09-27):** Qing's new concept, drafted in full. Its chorus filled in
  her sketch, which she'd given only to show rhyme density ("overfitting againnnnnnn").
- **Round 4 (2026-09-27), on v4:** a songwriter, and a combined editor, viewer and fact-checker.
  Changes made in v5, with a chorus of our own and `music/check/rhyme.py` checking every stress
  match and rhyme (it caught a pre-chorus mismatch v4 had called exact):
  - a new chorus, the green tests turned into the oracle question (its first rhyme scheme,
    love it / done it / shun it / judge it, forced "shun it" and was replaced after Qing's note:
    now each line has its internal pair in the same slots, as in Qing's sketch: checks/tests,
    say/okay, sign/line, ending true / blue / clue / do)
  - the builder no longer checks its own work in the words: it wears a hard hat and watches;
    another Clawd plays you, "one of the band tried to run it", and the brief says "a subagent"
  - the dad test's switch of app is shown: the cardigan comes off to show your gym hoodie, "…or
    you, mid-set"; the brief's line is the mid-set test, as the outro says
  - "Oh, but you've got three!" came before the three: now "Oh baby, wait and see!", with three
    cards face down that flip in the bridge
  - no 8-second end hold: the brief's lines tick in during the key-change chorus, then 3 seconds
  - frame 1 shows both bubbles, "Fixed it! ✅" and "still broken"
  - "your weight" read as bodyweight: now "your weigh-ins", in the lyric and the brief
  - the credit says "oracles for agentic coding: Yanqing Cheng", not "human oracles", which is
    an older term
  - verse 1, verse 2 and the bridge rebuilt so their lines match stress for stress; "played you"
    (heard as "tricked you") is gone; "receipts" replaces "the last word's yours to claim"
  - the second pre-chorus is cut for length
- **After Qing's notes on oracles and the app (2026-09-27):** "lost your bests" was a
  requirement, not an oracle; the bridge now asks for sources of judgement (someone who knows,
  Gran, what you'd dread, a screenshot you'd hate to see spread). The gym log was too simple for
  oracles, so the song moves to a wedding seating plan and RSVP site, whose oracles aren't
  obvious: Gran, the RSVP sheet, the caterer's order, the feud list, the family chat.
- **After Qing's note on playing you (2026-09-27):** the simulation plays someone specific, which
  is easier to draw: the dad on your shop, a lifter mid-set on the gym log. The cardigan-to-hoodie
  swap and "(or play you!)" are gone; the brief's line is the lifter test.
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
3. **The agent playing the judge as a check** (then Mum; now you, mid-set): "yeah, it's not perfect but it's better than
   nothing!" It stays, with the evidence shown and the last word yours.
