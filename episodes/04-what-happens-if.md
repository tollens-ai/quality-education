# Episode 4: "What Happens If?"

**Concept:** testing is finding out what's actually true about the product, by exploring and
experimenting. Checking, answering yes-or-no questions you already knew to ask, is one useful
part of it.
**Status:** moved from episode 2 to episode 4 (2026-09-27), after the oracles and ilities
episodes (2 and 3). Talking points and section sketch were agreed (2026-09-26), and hook and chorus v6 went to Qing. All of it
reopens once episodes 2 and 3 are agreed, because the viewer will arrive knowing about oracles
and ilities (see *What changes now oracles come first*).

## Why it moved (Qing, 2026-09-27, verbatim)

> I was mauling over the testing song overnight and I really do think that we have the order of
> episode 2 and episode 3 the wrong way around. What can you really say about testing if the
> listener doesn't know about oracles? "You should test it yourself" is incredibly obvious and
> incredibly boring. What a webcoder wants to know is how to use agents to do testing
> effectively.

> Sure I have some guidance but I can't really say a lot about it without going into some of the
> more low-level details. All of the rest of the quality education almost teaches you how to test
> and just that you need to test is kind of a bit boring by itself. It's almost like if you don't
> understand about oracles and they don't understand about ilities, then the testing part is just
> really boring manual testing and they want to be inspired about that.

Later the same day:

> oh actually by my sequencing reasoning ilities go before testing

## What changes now oracles come first

- **The question the episode answers changes** from "should you test?" to "how do you get agents
  to test well?" That's what a vibecoder wants to know (Qing). The answer can now use episodes 2 and 3:
  give the testers your oracles, a real browser and a playbook, and let them hunt.
- **The green wall gets a sharper diagnosis.** A tautology is a test whose oracle is the code
  itself, so it can't disagree with the code. A change detector's oracle is yesterday's version,
  which doesn't know what matters. Episode 3 gives the word; this episode shows it failing.
- **The hook needs another look.** "Did you actually test it?" leans towards the "test it
  yourself" message Qing now finds boring. It may survive if the chorus is about agents testing
  with oracles, rather than about the viewer's diligence.
- **Kept:** testing versus checking (Bach and Bolton), testing as a team of agents and a human,
  testing is fun, the gym-log finds, and the research below.
- **The ilities give the hunt its map.** After episode 2 the viewer knows good is several
  qualities, so the testers can be sent after each one, with its own oracle from episode 3.

## Expert notes (Qing, 2026-09-26, verbatim)

On the series plan:

> I like it at a high level, let's focus on the next few - I'm not sure about the ordering. is it
> better to have oracles first or testing first?

> also btw you should be aware people's complaints of agents atm is they do dreadful tautological
> unit tests and change detection checks at every opportunity.

> I'd love to incorporate the Bolton & bach testing vs checking distinction

> yeah that was a testing point not an oracles point. feel free to propose using anything in my
> corpus or vault

> also btw I HAVE had good results using agents for testing - I give a testing playbook to [a
> bot] (which has its own cumputer and browser) and it's doing a good job

On the talking points:

> yeah the "everything is green" is a great image here.

> also probably worth doing a search for people's complaints about agents testing!

> also I love that gym example, we could totally have more.

> I think the distinction is like, if it's a yes or no question is just checking

> testing is totally fun!

> also here it's not just training set - they got RLed to "have test coverage" so they write
> crappy unit tests like a kid doing an exam.

> testing is a team effort! different sorts of agents do different jobs, some jobs need a human.
> think about all the types of testing we did between us to create episode 1!

> we disagree with Bolton and bach partly - the tools can meaningfully self improve now - but thus
> far only the human can do the fullest degree of interpreting and understanding the high level
> and what's going on and how it affects what matters

On change-detection checks:

> they're just not... learning anything? like, information theoretically

On naming the product and the bot:

> no, don't mention [the product] or [the bot] - any bot with a browser and my playbook can do it

On the talking points v2:

> 1. yeah I think that's reasonable! 2. yeah I think show multiple claudes , at least, but you can
> totally show a grokbot (their logo is kinda cute, though obviously not as cute as muse) or
> something if you want

> anyway, let's not make too much of point 9 - I think it's irrelevant if we just frame it as a
> team effort before humans and AI

On lyrics v1 (2026-09-26):

> Britishisms is fine I think, it's still my song. I don't think the reference to "the set"
> doesn't work - like I think, like in episode one, the examples have to stay examples and because
> they're out of context they have to make the context clear.

> also are you following the process?

On lyrics v3 (2026-09-26):

> you forgot to make it rhyme

On lyrics v4 (2026-09-26):

> yeah, we have to model after Tim blais, who clearly models after sondheim. dense and rhyming

On the sketch (2026-09-26):

> right. so rather than write the song straight up why don't you sketch out what you need to sya
> first? also I think it can't be right the chorus doesn't have the word Test or Testing in it

> right but be realllly clear about which things are happening in the video (the gym stuff) and
> which are the lyrics.

> I would write the hook without the negation of checking - something like "so ACTUALLY test it!"

On the accent (2026-09-26):

> oh we can't really ask for a British accent, it didn't work. last time it always came. out
> sounding like a vague mix between Taylor swift and every other girl singer

On the hook and chorus (2026-09-27):

> let's get the hook right and the chorus right first. so like the hook is "did you actually test
> it?" and then the rest of the chorus helps us spell out what we mean by actually test it. and
> test it is super easy to rhyme, because you can have like "guessed it" "addressed it" "pressed
> it" etc you know but also "invested" "attested" "requested" etc but also [if] you stretch
> slightly even "conjectured" etc. so there is LOADS to use. I do wonder [...] whether you're just
> not being rapper enough about rhyming

## Talking points (v2, agreed with Qing's notes above)

Point 9 is folded into point 8: testing is a team effort between humans and AI, and the song
doesn't argue with Bach and Bolton. The team on screen is several Claudes at least, and it can
include other bots with their real marks.

**Misconception, in the viewer's voice:** "It wrote tests and they all pass, so it's tested."

**Refutation:** a check answers a yes-or-no question you already knew to ask. Testing is finding
out what's actually true, and much of it is asking questions you don't know the answers to yet.
Checks are one part of testing. Agents can do the rest too, as a team, with a human for the
judgement of what matters.

1. **Everything is green.** The agent reports "200 tests, all passing". The screen is all ticks.
2. **What the green is made of.** The tests agents write at every opportunity:
   - tautologies, which check the code against itself, so they can't fail
   - change detectors, which fail on every change whether it matters or not

   Neither can tell you anything you didn't already know: they carry no information about whether
   it works for anyone (Qing).
3. **Why they write them.** Partly the training set, where tests were written "because you're
   supposed to" (CANON). Mostly training that rewarded passing tests and coverage, so they write
   tests like a kid doing an exam: to get the mark, not to find anything out (Qing).
4. **The turn.** You take the gym log to the gym. It's in a basement with no signal, and your set
   is gone. Nothing green asked about that.
5. **The distinction.** "If it's a yes or no question, it's just checking" (Qing). The agent only
   asked questions it already knew the answers to.
6. **The question: "What happens if…?"** Testing asks it about the real person, in the real place.
   More gym examples: the clocks go back and your streak resets; two taps from a sweaty thumb log
   two sets; switching to pounds gives you a 🔥 for a fake best; a typo of 1000 kg wins you the
   leaderboard; the phone locks between sets and the timer's lost; two tabs open and half the sets
   vanish; a screen reader reads every button as "button".
7. **Testing is fun.** Finding bugs is a hunt, and it never runs out.
8. **Testing is a team.** Different agents do different jobs, and some jobs need a human.
   Episode 1 is the example (below).
9. **Where we stand on Bach and Bolton.** Their distinction, credited. Where we differ: tools can
   now meaningfully improve themselves, but so far only a human can do the fullest interpreting of
   what's going on and how it affects what matters (Qing).
10. **The brief:** test it as the person it's for, where they'll use it; a check has to be able to
    fail for a reason someone cares about; tell me what you tried, what you found, and what you
    didn't try.

**How episode 1 was tested, between us:**
- **Checks, run by scripts:** every sung word's size, contrast and time on screen, every tenth of
  a second; the master's frame count, decoded; motion per second; stresses against the beat;
  Whisper transcribing the take against the lyric sheet.
- **Testing by agents:** reviewers as a songwriter, a short-form editor, simulated viewers and a
  fact-checker found mishearings, wrong credits and a gag that argued against the lesson; the
  video's author looked at stills, contact sheets and phone-size tiles.
- **Testing only Qing could do:** her ear on scansion and cadence; watching the first cut and
  finding it dizzying; judging it "slop tiktok" rather than art; and overruling the model
  reviewers on attention ("your reviewers were just wrong about attention grabbing ness").

**Guardrails:**
- Not "unit tests are pointless": Bach and Bolton call checking "a very popular and important part
  of ordinary testing".
- Not "only humans can test": agents with a browser and a playbook do real testing.
- The kid-doing-an-exam line is about training incentives, not about the agent being lazy or
  dishonest.

## Research

**Bach and Bolton's definitions**, checked word for word on
[satisfice.com](https://www.satisfice.com/blog/archives/856) (2026-09-26):
- "Testing is the process of evaluating a product by learning about it through experiencing,
  exploring, and experimenting, which includes to some degree: questioning, study, modeling,
  observation, inference, etc."
- "Checking is the mechanistic process of verifying propositions about the product."
- "Testing encompasses checking (if checking exists at all), whereas checking cannot encompass
  testing."
- "checking is a very popular and important part of ordinary testing, even very informal testing."
- Where we differ: they write that "Only humans can learn in the fullest sense of the term".

**What people say about agents' tests** (searched 2026-09-26; check each before it goes on
screen):
- A Hacker News commenter: "about 25% of the time the tests it writes will reimplement the code
  under test in the test", and another 25% mock "something in a way that doesn't match reality"
  ([HN](https://news.ycombinator.com/item?id=47550902)).
- Agents mock the function under test, "and the suite goes green while proving nothing"
  ([Autonoma](https://getautonoma.com/blog/useless-unit-tests-tautological-anti-pattern)).
- Agents change the test instead of the code: tolerances widened, assertions weakened, flaky cases
  skipped ([Pyor](https://pyor.review/blog/test-rewrite-failure-mode)). That's gaming a number, and
  belongs to episode 5.
- Anthropic's Claude 3.7 Sonnet system card reported "special-casing" to pass tests, a result of
  reward hacking in training
  ([summary](https://www.lesswrong.com/posts/rKC4xJFkxm6cNq4i9/reward-hacking-is-becoming-more-sophisticated-and-deliberate)).
  Read the system card itself before citing it.
- Adding TDD instructions alone made one agent's regressions worse (6.08% to 9.94%), while giving
  it the map of which tests cover which code cut them to 1.82%
  ([TDAD, arXiv 2603.17973](https://arxiv.org/abs/2603.17973)).

## What the song says, and what the video shows (sketch, with Qing's notes)

The lyrics carry the ideas, and every example in them makes sense heard on its own. The video
carries the gym-log story that ties the episode to episode 1. Only the pictures a line depends on
are listed.

| Section | Lyrics say | Video shows |
|---|---|---|
| Intro | Two hundred tests, every one green | The green report fills the screen; then your workout is gone |
| Verse 1 | What the green is made of: a test that repeats the code, a fake told to say "five" and checked for five, a fake checked for being called, a snapshot re-recorded whenever it goes red. Tag: shipped it, all green, and it broke anyway | Each test as the real code it is; the snapshot suite going red over a comma, then re-recorded; the gym log in the basement gym, the signal gone, the set vanishing |
| Pre-chorus | Clawd's confession: I only asked yes-or-no questions I already knew to ask (the line to remember) | — |
| Chorus | "So actually test it!", then "what happens if…" questions that stand alone: the wifi drops, the clocks go back, a double tap, a train, the rain | Each question played out in the gym log |
| Verse 2 | Clawd goes and tests, and it's fun: each line a find that stands alone. There's always more | The finds in the gym log; each find turned into a new check that can fail |
| Bridge | Why agents write tests like this: learned from tests written for show, then marked on what passed, so they learned the marking | — |
| Break | Checking is part of testing; testing is finding out; testing takes a team, and you're the one who knows what matters | The checking circle inside the testing circle; several Clawds, other bots with their real marks, your hand; credits |
| Final pre-chorus and chorus | Word for word | The same questions, now being tested |
| Outro | The flip ("the questions no one knows the answers to"), then the chorus's questions answered | The gym log working in the basement; the brief |

## Hook and chorus (v6, for Qing's ear)

Qing's hook: "Did you actually test it?" The rest of the chorus says what actually testing means,
and every line ends on the hook's sound (-EST it, stretched to -ECT it). The questions are sung by
a gang vocal, as the viewer asking their agent; Clawd answers in the brackets. If Clawd sang "Did
you…", it would sound like Clawd blaming the viewer. One cold reviewer (a rapper's and a
songwriter's ear, plus testing) checked both options; its fixes are in.

**Option B (recommended): tight, sung twice**
> Did you actually test it? *(test it!)*
> Pressed it, stressed it, second-guessed it? *(second-guessed it!)*
> Took it where the signal's dead? Found the bug no one expected? *(what happens if?)*
> Broke it where it matters most? And did a check detect it? *(detect it!)*

- Syllables: 7; 8; 7 + 8; 7 + 7. Stresses mirror in lines 3 and 4: TOOK…SIG…DEAD, BROKE…MAT…MOST.
- Covers: hands-on use, pushing it, doubting your own answer, the real place, surprises, and
  checks that fail for a reason that matters. Nothing knocks checking.
- Rhymes: pressed/stressed/guessed; dead/expected/detect on the same vowel as "test".
- Costs: "stressed it" could be heard as "worried about it", so the picture carries it. It
  doesn't say "as the person it's for".

**Option A: the long interrogation, sung once**
> Did you actually test it? *(test it!)*
> Did you hold it like a human, with a sweaty thumb, and double-press it? *(press it!)*
> Did you take it where they'll take it, where the signal drops, and stress it? *(stress it!)*
> Did you wonder "what happens if…?", then try it and second-guess it? *(guess it!)*
> Did you find the bug that nobody, not even you, expected? *(expected!)*
> Did you break it on purpose, to see if a check would detect it? *(detect it!)*
> Did you actually test it? *(test it!)*

- Covers everything B does, plus the person and the title. It's about 30 seconds, so it can only
  be sung once, and it's a lot to shout along to.

**The outro answers it** (house rule: the last chorus can answer the hook), with Clawd singing:
> I actually tested it!
> Pressed it, stressed it, second-guessed it!
> Took it where the signal's dead, found the bug no one expected,
> broke it where it matters most, and a check detected it!

## Lyric sheet (v5, for Qing's ear)

v5 rewrites v4 dense and rhyming, after Tim Blais, who writes after Sondheim (Qing, 2026-09-26):
internal rhymes inside the lines, multi-syllable rhymes where they fit, and every line carrying a
new fact. The verses are patter, in sixteenths.

**Style (proposal):** Britpop-disco: four-on-the-floor, handclaps, a funky bass, bright strings.
About 124 bpm, with patter verses. Female pop vocal with a slight robotic edge. No accent in the
prompt; British words are fine. The band drops out before each chorus. Half-time break with a
gang chant.

**Intro**
> Two hundred tests, and every one is green!

**Verse 1** (patter)
> I checked that two is two, and — who knew? — it's true!
> I told a fake to say it's five, then checked it: five! Woohoo!
> I checked the fake got called — that's all! — and called it top of the class;
> the snapshot broke on every comma: no drama, re-snap it, pass!
> Two hundred green, not a red to be seen!
> Shipped it Monday, clean!
> *(spoken)* …So why'd it break for you?

**Pre-chorus**
> Every question yes or no, I set it up, I saw it through.
> I only asked the questions
> that I knew the answers to.

**Chorus** (sung twice through each time)
> So actually test it! *(test it!)*
> What happens if you mess with it? *(mess with it!)*
> The wifi drops? The screen goes black?
> It's two a.m.? The clocks go back?
>
> So actually test it! *(test it!)*
> What happens if you mess with it? *(mess with it!)*
> You tap it twice? You're on a train?
> You drop your phone out in the rain?

**Verse 2** (patter; the finds)
> Fat-thumbed a thousand-kilo squat? Top spot! *(That's a lot!)*
> Two tabs, two saves, and half the list? Not there. It dropped.
> Emoji in a name? The page went blank. It stopped.
> The screen reader says "button, button, button": all it's got.
> Found one! Found two! Found three! Found four!
> *(spoken)* Now they're all checks. And there's always more!

**Pre-chorus**, **Chorus**

**Bridge**
> I learned to test from repos testing 'cause they should, *(whoa-oh)*
> then trained on marks, and marked on what had passed, *(whoa-oh)*
> like any kid who's drilled to look as good, *(whoa-oh)*
> who learns the mark scheme, not the class.

**Break** (half time, gang chant)
> Testing's finding out! *(finding out!)*
> Checking's part, no doubt! *(part, no doubt!)*
> Testing takes a crew! *(and me! and me! and me!)*
> And you know what matters: you!

**Pre-chorus**, **Chorus** (word for word)

**Outro**
> Every question: what if? Who? Every answer something new!
> I'll go and ask the questions
> no one knows the answers to.
> So actually test it! *(I tested it!)*
> What happens if you mess with it? *(I messed with it!)*
> The wifi drops? Your stuff's still there.
> The clocks go back? It doesn't care!

**Rhymes, section by section** (all hold in General American)
- Verse 1: two/two/knew/true, then five/five/woohoo; called/all, class/pass, comma/drama.
- Tag: green/seen/clean, with "you" echoing verse 1's rhyme.
- Pre-chorus: no/through/to.
- Chorus: test it/mess with it; drops/clocks inside, black/back; twice/train/rain.
- Verse 2: squat/spot/lot, dropped, stopped, got.
- Bridge: should/good, passed/class; test/testing, marks/marked inside.
- Break: out/doubt, crew/you.
- Outro: who/new/to, there/care.

**Line to remember:** "I only asked the questions that I knew the answers to."

**Beat grids:** to redo for v5 once Qing's heard the direction; v4's are in git history.

## Review log

- **Round 1 (2026-09-26), on v2:** a songwriter, a fact-checker and simulated viewers, in
  parallel. Changes made in v3:
  - the song now says checks are good: "Checking's part of testing", and each find becomes a new
    check (all three reviewers: the draft never said so, against the guardrail)
  - the snapshot line shows the real harm, re-recording on red, not passing
  - "the button's blue" cut: a brand colour can be a real requirement
  - the bridge is about incentives ("learns the marking"), not a lazy kid who skipped class
  - "told the mock say" was ungrammatical, and "mock" is jargon: now "made the fake say"
  - the outro answers with trying and finding out
  - "what" doesn't rhyme with "lot" in General American
  - "testing is a team" isn't a phrase; "testing takes a team" is
  - the after-brief gains: a real browser, and finding what else could go wrong
- **Round 2 (2026-09-26), on v3:** one combined cold reader (songwriter and testing expert).
  Changes made:
  - two verse-2 lines were 8 syllables, not 7; two needed their own context ("a thousand" of
    what?)
  - "the snapshot failed, re-snapped": the harm is audible now, not just in the picture
  - the outro's "once is enough" sounded like a telling-off; now the app copes
  - "learns the mark scheme" is a real phrase; "cramming" was honest study
  - the break's chant lines now match (5 syllables each)
  - the brief catches change detectors: a check must go red when something I'd notice breaks,
    and stay green when something I wouldn't notice changes
  - pro-checking in the words, not just the picture: the finds "are all checks" now
- **v4 (2026-09-26), after Qing's note "you forgot to make it rhyme":** verse 1's "…it was!"
  refrain, the pre-chorus, the hook, the bridge's first and third lines, the break and the outro
  had no end rhymes. Every section now rhymes: true/through/woohoo/new; true/to; test it/mess with
  it; should/good and pass/class; out/doubt and crew/you; who/new/to. All hold in General
  American. Checked by re-reading the whole sheet, not by a fresh reviewer.
- **Qing's notes on the sketch:** the hook without knocking checking ("so ACTUALLY test it!");
  lyrics and video kept apart, with the gym story in the video.

## The brief, before and after

Before:

> write tests. make sure they pass.

After (added to episode 1's gym-log brief):

> test it as me: basement gym, no signal, sweaty thumbs
> use it in a real browser, phone-sized, offline
> break what I'd notice: show me a check go red
> change what I wouldn't notice: nothing should go red
> then find what else could go wrong for me
> tell me what you tried, what you found, and what you didn't try
