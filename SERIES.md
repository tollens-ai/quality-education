# The series

The plan for the first season of *Software Quality Theory 101*: twelve episodes, one idea each.
It's a draft. Qing, the expert, has approved the shape at a high level (2026-09-26) and is
checking the order and the claims episode by episode, starting with the next few.

## How the season fits together

**The spine is four questions.** All quality work answers one of them: *What does good look
like? How would we know? Is it good? How do we make it good?* (from the Tollens
[quality-strategy skills](https://github.com/tollens-ai/quality-strategy-skills), built on Ed
Pringle's foundations). The first half of the season is about what quality is and how you'd
know. The second half is about making it good on purpose.

**Each episode gives you one question to ask your agent,** and that question is the chorus.
Episode 1's is "Good for who? Good for what?". The finale sings all of them.

**What carries over:** Clawd, the Claude Code crab, sings, with the other bots as the band. The
gym log from episode 1's brief is the running app. Every episode ends with a before-and-after
brief, and each episode can be watched on its own.

## Part 1: what quality is, and how you'd know

| # | Song | The one idea | What the viewer believes first | What changes in the brief | Where it comes from |
|---|---|---|---|---|---|
| 1 | **Good for Who?** (out) | Software quality is value to someone who matters | "The agent should know what I meant by good" | Say who it's for and what good means for them | Weinberg; Bach & Bolton; Ed Pringle |
| 2 | **What Happens If?** (in progress) | Testing is finding out what's actually true. Checking is one part of it | "All tests pass, so it works" | Try it as the person it's for, where they'll use it; only write checks that could fail for a real reason; say what wasn't tried | Bach & Bolton, testing vs checking; Ed Pringle |
| 3 | **How Would You Know?** | Somebody can always tell whether it's good. Name that source of truth before the agent builds, and it can check its own work | "There's no right answer for my app, so only I can judge it" | "Here's how you'll know it's good: …" | Qing, *Agentic coding and the problem of oracles* |
| 4 | **Nobody's Average** | There's no mainline user: every edge case is somebody's everyday | "Build it for the typical user and handle edge cases later" | Name the real situations, build it to adjust, watch real people use it | Qing, *There is no mainline user*; Gilbert S. Daniels's pilot study |
| 5 | **Number Go Up** | A number that stands in for quality isn't quality, and an agent asked to raise a number will raise the number | "100% coverage and all green means it's good" | Say the goal behind the number; if the number can go up while the app gets worse, don't | Ed Pringle, proxies and the malicious compliance check; Goodhart |
| 6 | **If It Bugs Them, It's a Bug** | A bug is a gap between the software and what people reasonably expect or want, and the world keeps moving | "It works as intended, so it's user error" | If it confuses or loses the person it's for, it's a bug, even when it matches the spec | Bach & Bolton's definition, via Qing, *What even is a bug anyway?* |

## Part 2: making it good on purpose

| # | Song | The one idea | What changes in the brief | Where it comes from |
|---|---|---|---|---|
| 7 | **The Trenchcoat** | "Fast", "reliable" and "secure" are each several things in a trenchcoat. Unpack them | Not "make it fast" but "opens in under a second; the export can take a minute" | Ed Pringle, unpack don't collapse |
| 8 | **Dealbreaker** | For each person: what would delight them, what's good enough, what's a dealbreaker. What you won't do is a decision too | Dealbreakers, the honest bar, and what's deliberately left out | Ed Pringle, the lenses and non-goals |
| 9 | **Where Would It Hurt?** | You can't test everything. Look where it would hurt most and where you know least, and say how sure you are | "For each area: checked, glanced or guessing" | Ed Pringle, risk, economics and confidence |
| 10 | **Four Findings** | Every bug is four findings: how it got in and how it got past, this time and as a pattern | Fix the bug, then what let it in and what let it through | Qing's bug postmortem; Ed Pringle, four levels of learning from a bug |
| 11 | **Debugging This With You** | The agent is on the team, so build for it too: diagnostics it can read, a way back, instructions that stay current, comments that say why | "Build it so you can debug it without me" | Qing; Ed Pringle; Martin Davidson |
| 12 | **Make It Good** | Quality is the four questions, round and round | The whole loop | The four questions |

## On the shelf

Ideas held for later: hope engineering; software going wrong because the world moves; actual
versus perceived quality; testing in production; agents not having "smells"; why "99.9% uptime"
means three different things.
