# The series

The plan for the first season of *Software Quality Theory 101*: thirteen episodes, one idea each.
It's a draft. Qing, the expert, approved an earlier shape at a high level (2026-09-26). She is
checking the order and the claims episode by episode, starting with the next few.

## How the season fits together

**The spine is four questions.** All quality work answers one of them: *What does good look
like? How would we know? Is it good? How do we make it good?* (from the Tollens
[quality-strategy skills](https://github.com/tollens-ai/quality-strategy-skills), built on Ed
Pringle's foundations).

**The first three questions each have a basic answer; the fourth doesn't.** "How do we make it
good?" isn't one thing, it's a million things (Qing, 2026-09-27). So Part 1 teaches the basics of
the first three questions, then the first practice you'll need from the fourth: what to
do with the bugs that testing finds. Part 2 goes deeper on the first three, and adds a few more of
the million ways of making it good. Each Part 2 episode deepens a Part 1 episode: the Trenchcoat
is the 102 to episode 3's 101 on the ilities.

**Oracles come before the ilities** (Qing, 2026-09-27: "it feels boring otherwise"). Episode 2
asks how you'd know, at the highest level, for what you said you care about in episode 1.
Episode 3 then adds the other qualities, each with its own way to know.

**You can use the lessons in order.** Each episode's change to the brief is the next thing
your agent needs, and it builds on the ones before. Qing (2026-09-27): "it would be nice if they
could apply them almost in order", and testing needs what comes before it: "if you don't
understand about oracles and they don't understand about ilities, then the testing part is just
really boring manual testing".

**Each episode gives you one question to ask your agent,** and that question is the chorus.
Episode 1's is "Good for who? Good for what?". The finale sings all of them.

**What carries over:** Clawd, the Claude Code crab, sings, with the other bots as the band. The
gym log from episode 1's brief is the running app where it fits; an episode switches app when its
idea needs one (episode 2's oracles need a wedding seating plan, because the gym log was "too
simplistic", Qing, 2026-09-27). Every episode ends with a before-and-after
brief, and each episode can be watched on its own.

## Part 1: the basics, in the order you'd use them

| # | Question | Song | The one idea | What the viewer believes first | What changes in the brief | Where it comes from |
|---|---|---|---|---|---|---|
| 1 | What does good look like? | **Good for Who?** (out) | Software quality is value to someone who matters | "The agent should know what I meant by good" | Say who it's for and what good means for them | Weinberg; Bach & Bolton; Ed Pringle |
| 2 | How would we know? | **How Do I Know?** (out 2026-09-28) | Somebody can always tell whether it's good. Say how they'd tell, for what you said matters in episode 1, and the agent can check its own work | "There's no right answer for my app, so only I can judge it" | "Here's how you'll know it's good: …" | Qing, *Agentic coding and the problem of oracles* |
| 3 | What does good look like? | **The 'Ilities** (out 2026-09-29) | "Good" is many different qualities, the "ilities": does it work, is it easy, does it keep your stuff, is it fast, is it safe, can everyone use it, can it be fixed and changed, what does it cost. Agents build the few everyone mentions and skip the rest unless asked | "If it works and it looks nice, it's good" | Name the qualities that matter most to the people it's for, the ones you'll trade away, and how you'll know each one | Quality characteristics, as in ISO/IEC 25010; Ed Pringle, quality dimensions |
| 4 | Is it good? | **What Happens If?** (reopening) | Testing is finding out what's actually true. Checking is one part of it. Agents can do much of it, as a team, when they have the qualities and the oracles to test against | "All tests pass, so it works" | Test it as the person it's for, where they'll use it, against the oracles; say what you tried, what you found and what you didn't try | Bach & Bolton, testing vs checking; Ed Pringle |
| 5 | How do we make it good? (one practice) | **Four Findings** | Every bug is four findings: how it got in and how it got past, this time and as a pattern. Fixing what let it in improves the brief; fixing what let it past improves the oracles and tests | "Fixed the bug, so we're done" | Fix the bug, then what let it in and what let it through | Qing's bug postmortem; Ed Pringle, four levels of learning from a bug |

## Part 2: deeper, and more ways to make it good

| # | Question | Song | The one idea | What the viewer believes first | What changes in the brief | Deepens | Where it comes from |
|---|---|---|---|---|---|---|---|
| 6 | What does good look like? | **Nobody's Average** | There's no mainline user: every edge case is somebody's everyday | "Build it for the typical user and handle edge cases later" | Name the real situations, build it to adjust, watch real people use it | 1 | Qing, *There is no mainline user*; Gilbert S. Daniels's pilot study |
| 7 | What does good look like? | **The Trenchcoat** | "Fast", "reliable" and "secure" are each several things in a trenchcoat. Unpack them | "Make it fast" is a clear enough ask | Not "make it fast" but "opens in under a second; the export can take a minute" | 3 | Ed Pringle, unpack don't collapse |
| 8 | What does good look like? | **Dealbreaker** | For each person: what would delight them, what's good enough, what's a dealbreaker. What you won't do is a decision too | "Aim for the best at everything" | Dealbreakers, the honest bar, and what's deliberately left out | 1, 3 | Ed Pringle, the lenses and non-goals |
| 9 | How would we know? | **Number Go Up** | A number that stands in for quality isn't quality, and an agent asked to raise a number will raise the number | "100% coverage and all green means it's good" | Say the goal behind the number; if the number can go up while the app gets worse, don't | 2 | Ed Pringle, proxies and the malicious compliance check; Goodhart |
| 10 | Is it good? | **If It Bugs Them, It's a Bug** | A bug is a gap between the software and what people reasonably expect or want, and the world keeps moving | "It works as intended, so it's user error" | If it confuses or loses the person it's for, it's a bug, even when it matches the spec | 4 | Bach & Bolton's definition, via Qing, *What even is a bug anyway?* |
| 11 | Is it good? | **Where Would It Hurt?** | You can't test everything. Look where it would hurt most and where you know least, and say how sure you are | "Test everything the same amount" | "For each area: checked, glanced or guessing" | 4 | Ed Pringle, risk, economics and confidence |
| 12 | How do we make it good? (one practice) | **Debugging This With You** | The agent is on the team, so build for it too: diagnostics it can read, a way back, instructions that stay current, comments that say why | "The code's for me; the agent will cope" | "Build it so you can debug it without me" | 5 | Qing; Ed Pringle; Martin Davidson |
| 13 | All four | **Make It Good** | Quality is the four questions, round and round. Making it good is a million things, and the loop is how you pick the next one | — | The whole loop | all | The four questions |

## On the shelf

Ideas held for later: hope engineering; software going wrong because the world moves; actual
versus perceived quality; testing in production; agents not having "smells"; why "99.9% uptime"
means three different things.
