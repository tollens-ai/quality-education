# Episode 2: "How Do I Know?" (working title)

**Concept:** tell your agent how it will know whether its work is good, and it can check its own
work. The thing that tells you is an oracle, and there always is one: if it's good, somebody can
tell.
**Status:** talking points v1 for Qing (2026-09-27). Back at episode 2: oracles come before the
ilities (episode 3) and testing (episode 4). Oracles stay at the highest level here, for what the
viewer said they care about in episode 1. Working title changed from "How Would You Know?" after
Qing's note that "how do I know" is a classic song refrain.

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
2. **What agents do when they can tell for themselves.** Sixteen Claudes wrote a C compiler, about
   100,000 lines of Rust. Then they stalled on the Linux kernel, all hitting the same bug and
   overwriting each other, until they were given GCC, a compiler known to be right, to compare
   against. Agents are much better when they can tell for themselves what's correct (Qing).
3. **The fair objection.** "Cool, but my app hasn't got a GCC." That's right in a way, and it's
   an "under-ambitious" way to think about it (Qing).
4. **The turn: somebody can always tell.** "Because it's good, somebody knows that it's good. If
   it's bad, somebody knows that it's bad" (Qing). You already have oracles; you just don't call
   them that:
   - **the mum test:** could someone who isn't a developer log a set without asking you?
   - **the midnight panic:** what breaking would make you sweat? For the gym log, losing your
     personal bests.
   - **the front-page test:** what would be embarrassing in public? Your weight showing on a
     public leaderboard.
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

## Line to remember and hook (early options, before the sketch)

Clawd sings as your agent again: it wants to do a good job and can't tell whether it has. The
hook is Clawd's own question, **"How do I know?"**, a classic song refrain (Qing), which the
viewer ends up answering. Its sibling "How would you know?" can be the turn, when Clawd asks it
back. Its rhyme family is big: know, show, go,
though, so, slow, no, below, owe, grow, flow, hello, yo-yo, and one step further, "go-to", "logo",
"solo".

Options for the line to remember (Clawd, plain and fair):
- **A (recommended):** "I don't need you watching. I need to know how you'd know."
- B: "If it's good, somebody can tell. So tell me who, and tell me how."
- C: "I'd check my own work, if you'd tell me how you'd check it."

## Claims to check with Qing

1. **The front-page test** comes from security work, and a newspaper feels dated to a vibecoder.
   Can it become the screenshot test ("what would be mortifying in a screenshot?"), or should it
   keep your name for it?
2. **Point 8 draws the line with the testing episode.** "Make sure a check can go red"
   (calibrating an oracle) stays in episode 4, so this episode only says a test is as good as its oracle. Is that
   the right split?
3. **The compiler story** is from Anthropic's blog, via your article. I'll check every figure and
   quote on the live page before any of it goes on screen. Is it still the example you'd pick, or
   is there a fresher one?

## The brief, before and after

Before (episode 1's gym-log brief):

> a gym log. just for me.
> for: me, mid-set, sweaty hands
> good = log a set in one tap
> …

After (added to it):

> how you'll know it's good:
> a stranger logs a set one-thumbed, phone-sized
> my bests never vanish, even offline
> kg ↔ lb matches a real converter
> nothing public: my weight stays mine
> check all that yourself before you say done
> ask me only what those can't answer
