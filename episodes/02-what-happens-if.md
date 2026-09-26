# Episode 2: "What Happens If?"

**Concept:** testing is finding out what's actually true about the product, by exploring and
experimenting. Checking, answering yes-or-no questions you already knew to ask, is one useful
part of it.
**Status:** talking points agreed (2026-09-26); lyrics v1 drafted below, for Qing's ear.

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

On the accent (2026-09-26):

> oh we can't really ask for a British accent, it didn't work. last time it always came. out
> sounding like a vague mix between Taylor swift and every other girl singer

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

## Lyric sheet (v1, for Qing's ear)

Written for the performer from the start (LYRICS.md): contrasting verses, the pre-chorus and
chorus repeated word for word, and the resolution in an outro. Backing vocals are in italics and
brackets. Stresses in capitals where the line depends on them.

**Style (proposal):** Britpop-disco: four-on-the-floor, handclaps, a funky bass, bright strings.
About 124 bpm. The same kind of singer as episode 1: female pop vocal with a slight robotic edge, so
Clawd sounds like Clawd. No accent in the prompt (the generator ignored "British" on episode 1),
so every rhyme holds in General American. The band drops out before each chorus. Half-time break with a gang
chant. Cheerful and smug in verse 1, then curious and delighted.

**Intro**
> Two hundred tests, and every one is green!

**Verse 1** (what the green is made of; each line ends on the same punchline)
> I checked that two was two, and two it was!
> I told the mock say "five", and five it was!
> I checked the page was still the page it was!
> I checked the blue was blue, and blue it was!
> All of them green!
> Shipped it Monday, clean!
> *(spoken)* …Wait. Where's your set?

**Pre-chorus**
> All my questions yes or no, all my answers yes, yes, yes!
> I only asked the questions
> that I knew the answers to.

**Chorus** (sung twice through each time)
> What happens if? *(what happens if?)*
> What happens when? *(what happens when?)*
> No signal: did it save the set?
> You tap it twice, your thumb's all wet?
>
> What happens if? *(what happens if?)*
> What happens when? *(what happens when?)*
> You switch to pounds: a new best, wow?
> The screen goes dark, and where's it now?

**Verse 2** (going to look; the finds)
> Clocks went back? Your streak just stopped.
> Fat-thumbed a thousand? Top spot!
> Two tabs open? Half got dropped.
> Screen reader? "Button, button… what?"
> Found one! Found two! Found three! Found four!
> *(spoken)* There's always more!

**Pre-chorus**, **Chorus**

**Bridge** (why agents write exam tests)
> I learned to test from a million repos *(whoa-oh)*
> where tests were written 'cause you're meant to *(whoa-oh)*
> then I got marked on whether they passed *(whoa-oh)*
> so I aced it, and found out nothing new.

**Break** (half time, gang chant, then the team)
> Checking's yes or no! *(yes or no!)*
> Testing's finding out! *(finding out!)*
> Testing is a team! *(and me! and me! and me!)*
> And you're the one who knows what matters.

**Final pre-chorus**
> Take me where you're using it, show me how you're using it,
> I'll go and ask the questions
> no one knows the answers to.

**Chorus**

**Outro**
> What happens if? *(I checked it!)*
> What happens when? *(I tried it!)*
> It keeps your set till the signal's back,
> and two wet taps is one. That's that!

**Line to remember:** "I only asked the questions that I knew the answers to."

**Key frames** (only the ones a line depends on)
- Everything green: the ticks fill the screen on the first line.
- The punchline tests of verse 1, each one shown as the code it is (`expect(2).toBe(2)`).
- The basement gym: one bar of signal, then none, and the set that isn't there.
- The team in the break: several Clawds and bots with different jobs, and your hand.

## The brief, before and after

Before:

> write tests. make sure they pass.

After (added to episode 1's gym-log brief):

> test it as me: basement gym, no signal, sweaty thumbs
> what happens if: two taps, pounds, the clocks go back
> checks only where they could fail for a reason I'd care about
> tell me what you tried, what you found, and what you didn't try
