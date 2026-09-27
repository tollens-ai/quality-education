# Episode 2: "How Do I Know?" (working title)

**Concept:** tell your agent how it will know whether its work is good, and it can check its own
work. The thing that tells you is an oracle, and there always is one: if it's good, somebody can
tell.
**Status:** v4 (2026-09-27): Qing's boy-band concept, drafted in full on the approved claims.
In review before she hears it. Oracles come before the ilities (episode 3) and testing (episode 4), and stay at the
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

## Shape (v4: the boy band)

- **Concept, in one sentence:** tell your agent how it will know its work is good, and it can
  check its own work; there's always a way, because if it's good, somebody can tell.
- **Misconception:** "My app has no right answer, so I have to check everything myself." What it
  looks like: the "Fixed it! ✅" / "still broken" loop.
- **Refutation:** somebody can always tell. Say who, and how they'd tell, and the agents check the
  work at agent speed, show you how they checked, and you keep the last word.
- **Singers (Qing's concept, 2026-09-27):** a boy band of Clawds singing to you, in the mould of
  "how do I make you love me?", except it's "how do I make you love this app?" They'd do anything
  for you, if they only had a clue. Being a band also carries a point for free: the Claude who
  built it isn't the one who plays you. The band plays you; nobody has to say why. The user is
  heard only in call-and-response ("Still broken!", "No answer key for me!").
- **Genre (proposal):** late-90s boy-band pop: finger snaps, an R&B groove, five-part harmonies,
  lead lines traded between members, a stool-ballad feel that stands up for the key change into
  the last chorus. About 104 bpm (a bar is about 2.3 s). Qing's sample lines show the rhyme
  density she wants, not a structure to copy; the rhythm has to be obvious enough for the
  generator to deduce, and no particular line shape guarantees that.
- **Form and length:** spoken intro, verse 1, pre-chorus, chorus, verse 2, pre-chorus, chorus,
  bridge, break, final pre-chorus, chorus with the key change, outro. About 2:40.
- **Line to remember:** "I can't make you love it if I can't tell when you do." It closes every
  chorus. It's plain and fair, it's a love-song line, and it's the whole oracle problem.

## What the song says, and what the video shows (sketch)

The lyrics carry the ideas and stand alone; the video carries the gym log. Only the pictures a
line depends on are listed.

| Section | Lyrics say | Video shows |
|---|---|---|
| Intro | Spoken dedication, "this one's for the one who keeps saying…", answered by you: "Still broken!" | Frame 1: five Clawds in matching white suits on stools, under one huge chat bubble: "still broken". 2:47 AM in small type |
| Verse 1 | We rebuilt your gym log, ran our tests a hundred times, all green; you sent "still broken" like a text from an ex; now we're guessing. Tag: we'd do anything for you, if we only had a clue | The gym log redone screen by screen; a wall of green ticks; your "still broken" arriving like a breakup text |
| Pre-chorus | You tell us when it's wrong, never how to tell it's right; you know it when you see it, but you keep it out of sight; and baby, baby, I just wanna make you love it | — |
| Chorus | How do I know if my code is the app of your dreams, the one you won't leave; how do I check my test is worth believing; give me a sign: is it bugs, or the bee's knees? The line to remember | Each question on the gym log: your dream screen, the app you'd keep, a test, a flame |
| Verse 2 | Give us a mockup or a spreadsheet and we match it; with something to check against, watch us go; with only "still broken", all we get is "no". Tag: "No answer key for me!" "Oh, but you've got three!" | Clawd matching a mockup, the two screens converging; a column of totals ticking into agreement; back to "still broken" |
| Bridge | If it's good, someone can tell. Could your dad use your shop without getting stressed? If your gym bests disappeared, would you sweat? If your weight hit the group chat, would you fret? | Three pictures, each captioned with its name: *the dad test* (your dad on your shop), *the sweat test* (you bolt upright at night), *the group-chat test* (your weight in a group chat) |
| Break | An oracle is anything that helps you spot what's wrong. We can't be your dad, but we can play him; I'll check each fear you name, show you what I checked, and the last word's yours | One Clawd in a dad cardigan, squinting at your shop; a checklist ticking, evidence beside each tick; your hand on the final tick. Credit below |
| Final pre-chorus | The same complaint, then the ask: put it in the brief, and I can make you love it | The brief opening |
| Chorus (key change) | Word for word | The band stands up off the stools; each question now answered, evidence beside each tick |
| Outro | Now I know what you need: we played you mid-set, one thumb, and your bests never leave; here's what we checked, and how, and the gaps we see. Spoken: "So… do you love it?" You try it yourself: "I love it." | Under the sung lines, the band's check report: ✅ mid-set test (a Clawd playing you, one thumb, phone-sized, screen recording), ✅ bests survive offline, ❓ app updates: couldn't try a real one. Your thumb logs one set. Then the brief's added lines alone, captions off, for at least 8 seconds over the instrumental. Last frame: frame 1's layout, the bubble now "I love it.", over the intro snaps, so the loop lands on "still broken" again |

**On-screen credit (break):** *Oracles: an old idea in testing (Howden; Weyuker; Bach & Bolton) ·
human oracles for agents: Yanqing Cheng*

## Lyric sheet (v4)

Backing vocals in italics and brackets. Lines marked *(you)* are the user, as a gang vocal.
Syllable counts in brackets; stresses in capitals for the pre-chorus and chorus.

**Intro** (spoken, over finger snaps)
> Yeah… this one's for the one who keeps on saying…
> *(you)* Still broken!

**Verse 1**
> I rebuilt your gym log, every button, every screen, [13]
> ran my tests a hundred times, and every one was green, [13]
> then you sent me "still broken", like a text from an ex, [13]
> now I'm guessing what you meant, and getting more perplexed. [13]
> *(all)* I'd do anything for you *(for you)* [7]
> if I only had a clue! [7]

**Pre-chorus**
> you TELL me WHEN it's WRONG, but NEV-er HOW to TELL it's RIGHT; [14]
> you KNOW it WHEN you SEE it, but you KEEP it OUT of SIGHT, [14]
> and BA-by, BA-by, I just WAN-na make you LOVE it… [13]

**Chorus**
> HOW do i KNOW, if my CODE, is the APP of your DREAMS? [4 + 3 + 6]
> HOW do i SEE, gua-ran-TEE, it's the ONE you won't LEAVE? [4 + 3 + 6]
> HOW do i CHECK, if my TEST, is a TEST to be-LIEVE? [4 + 3 + 6]
> GIM-me a SIGN, draw the LINE: is it BUGS, or the BEE'S KNEES? [4 + 3 + 7]
> *(all)* I can't MAKE you LOVE it *(love it)*, if I CAN'T tell WHEN you DO! [13]

**Verse 2**
> Give me a mockup, I'll match every pixel and shade; [13]
> give me your spreadsheet, I'll match every sum that it made; [13]
> with something to check against, just watch me go, go, go! [13]
> But with just "still broken", all I ever get's a "no". [13]
> *(you)* No answer key for me! [6]
> *(all)* Oh, but you've got three! [5]

**Pre-chorus**, **Chorus**

**Bridge** (stripped back)
> If it's GOOD, someone CAN TELL. Here's a TEST: *(ooh)* [10]
> could your DAD use your SHOP, and not get STRESSED? *(ooh)* [10]
> if your GYM bests dis-ap-PEARED, would you SWEAT? *(ooh)* [10]
> if your WEIGHT hit the group CHAT, would you FRET? [10]

**Break** (half time)
> An oracle's anything that helps you spot what's wrong! *(spot what's wrong!)* [13]
> We can't be your dad, but we can play him all day long! *(all day long!)* [13]
> I can't feel your panic, but I'll check each fear you name! *(fear you name!)* [13]
> I'll SHOW you WHAT i've CHECKED, but the LAST word's YOURS to CLAIM. [13]

**Final pre-chorus** (lines 1 and 2 word for word; line 3 is the ask)
> you TELL me WHEN it's WRONG, but NEV-er HOW to TELL it's RIGHT; [14]
> you KNOW it WHEN you SEE it, but you KEEP it OUT of SIGHT, [14]
> so PUT it IN the BRIEF, and I can MAKE you LOVE it… [13]

**Chorus** (key change up; the band stands)

**Outro** (the chorus's grid)
> OH, now i KNOW, what you NEED, from the APP of your DREAMS: [4 + 3 + 6]
> PLAYED you mid-SET, with one THUMB, and your BESTS never LEAVE; [4 + 3 + 6]
> HERE'S what we CHECKED, here's the HOW, and the GAPS that we SEE! [4 + 3 + 6]
> *(spoken)* So… do you love it?
> *(you, after trying it)* …I love it.

**Rhymes, section by section** (all hold in General American)
- Verse 1: screen/green; ex/perplexed; tag you/clue, with rebuilt/button and hundred/one inside.
- Pre-chorus: right/sight; baby/baby into the hook.
- Chorus: know/code, see/guarantee, check/test, sign/line inside each line; dreams/leave/believe/
  knees at the ends; love it/do in the tag.
- Verse 2: shade/made; go/no, the hook's sound; mockup/match, pixel/spreadsheet inside; me/three.
- Bridge: test/stressed/sweat/fret; dad/shop, bests/sweat inside.
- Break: wrong/long; name/claim.
- Final pre-chorus: right/sight; brief/love it.
- Outro: know/need, set/thumb inside; dreams/leave/see.

**For Qing's ear:** the chorus's fourth line runs a syllable long (the "the" in "the bee's knees");
"guarantee" in chorus line 2 is the looser grammar; the pre-chorus's third line changes in the
final pre-chorus, so watch it in the takes.

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
or one the sweat and group-chat tests turned up, written so the agent can actually run it. The
gym log is just for me, so its dad test is me, mid-set:

> how you'll know it's good:
> dad test, but it's for me: a subagent plays me mid-set, one thumb, phone-sized
> fast? a second from tap to open, on slow data
> 🔥? only for more weight than my best on that lift
> sweat test: my bests survive no signal and app updates
> group-chat test: my weight never leaves my phone
> check each one yourself; show me how you checked
> ask me when these don't settle it

## Why they'd like it

The opening is a loop every vibecoder has lived, sung by a boy band as a breakup. The agents are
sympathetic and own their part: they ran their tests, all green, and still can't tell whether
you'll love it. Boy-band cheese (the stools, the key change, "baby, baby") is funny on crabs, and
the love-song frame makes a dry word, "oracle", feel obvious: of course you'd want a sign. The
ending gives the lonely "still broken" its answer: "I love it."

## Why they'd share it

- **To clip:** the stools, the key change, the band standing up; "like a text from an ex".
- **To quote:** "I can't make you love it if I can't tell when you do."
- **To save:** the brief, held full screen.
- **To tag:** the friend who replies "still broken" and nothing else.
- **To reply:** the post text lists the three tests and asks for theirs.

**Post text (draft):**
> "Fixed it!" "still broken." "Fixed it now!" "still broken."
> Your agent's usually not lying. It's guessing, because nobody told it how to tell.
> Three ways you already have: could your dad use it? What would make you sweat? What would you
> hate to see in the group chat?
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
