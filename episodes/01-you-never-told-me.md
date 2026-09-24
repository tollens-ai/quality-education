# Episode 1: "You Never Told Me"

**Concept:** software quality is value to someone who matters.
**Line to remember:** "I can't read your mind, I'm only reading your prompt." **Locked**: Qing,
2026-09-24, "this is ace keep it! made me well up a little".
**Status:** script v2, after review round 1. Round 2 is in progress.

## Expert notes (Qing, 2026-09-24, verbatim)

> let's be clear that we're talking about software quality. and let's not talk necessarily about
> CTOs - this still applies for side projects! I think we include agents as people here.

> I think people really do ship stuff without thinking about whether anybody gets something out of
> it! or it's fine if it's only for you - it's fine to ship toys tool - but like "who is this for"
> should be clear in your head! and like, maybe performance is important and maintainability isn't,
> or maybe vice versa. the agent DOESN'T KNOW if you don't tell them. or sometimes they don't brief
> the agent and then they complain it's bad and, it's not the agent's fault? they don't know your
> tradeoffs unless you tell them? is it cost, is it wowfactor, is it longevity, is it usefulness
> you know

Answers to the claim questions (2026-09-24):

> 1. it's usually as a team member - so all the team-facing things. debuggability,
> maintainability. but also like if you want your grokbot to interface with it it needs to be good
> for them, so there's grokbot and muse and instinct and hermes and all those guys why are people
> who matter too.
> 2. yeah in the ASI future the agents will know this stuff - and part of me making these videos
> will helpfully help towards that. but the software devs of yesterday mostly didn't know this
> stuff so the agents of today mostly don't know this stuff.. unenshittifying the software of
> tomorrow is the Tollens mission
> 3. well the code still has to be easy to write all the features for and debug the first time
> round! but whether it's agent-friendly or human-friendly might be different coding styles - just
> agent-friendly doesn't need explanatory comments, for example. and COST-EFFECTIVENESS is big as
> well - I want this done without blowing my quota is part of the quality tradeoffs!

Further notes (2026-09-24):

> on the people were bad at this already point it needs a bit of nuance because it's not obvious -
> serious quality professionals tell me they've been shocked at the huge organisations who have not
> understood the basics of software quality like this stuff. so most people won't understand. but
> software enshittification started long before claude and we can probably find lts of examples

> it's really more... you learned to code from everyone on the internet and most of them didn't
> know how to do quality right.

> and yeah it's not enshittification in the deliberate sense but just, like people doing "unit
> tests because they're supposed to " or thinking testing is just checklists or... idk, bolton &
> bach will have a lot to say on the matter


## Shape

The coding agent sings a pop-punk complaint song about being blamed for a vague prompt. The robot
voice is part of the character. Tempo is about 170 bpm, so one bar is about 1.4s. The song is
about 74 seconds, in 9:16. The times below are approximate; the synthesised song sets the exact
cue times.

- **Misconception:** "good" is obvious, and the agent should know what I meant.
- **Refutation:** software quality is value to someone who matters. The agent can't know who that
  is, or what they value, unless you tell it. It should ask, and you should say.

**Cast**
- **The robot:** the coding agent, and the singer. It's eager, earnest and a little
  overwhelmed, and its face is a screen.
- **The user:** only ever seen through their posts and prompts, so every viewer can stand in their
  place.
- **The bots:** a Discord bot, a scraper and an assistant agent. They appear in the bridge.

**Running devices**
- **The quota meter**, top left. It drains during verse 1 and reads 8% at the end.
- **The missing prompt**: an empty prompt box with a blinking cursor. It sits centre screen for one
  bar at the chorus, flashes again during verse 2, fills in during the final chorus, and is then
  held full screen.
- **Captions**: a word-by-word wipe of the lead vocal only, inside the X safe zone.

## Script

| Time | Section | Picture | Lyric (lead vocal; *backing in italics*) | Why they keep watching |
|---|---|---|---|---|
| 0:00 | Cold open | **First frame, full width:** the post *"claude built me absolute garbage 😤"*, a real-looking **"Usage limit reached"** banner, and behind them a tiny habit tracker (habit: *drink water*) with a smoking tower bolted on. | **"You said make it GOOD—"** on the first beat, over a guitar crash | Their own grievance, in their own screens, with a mystery behind it |
| 0:03 | Rewind | A VHS rewind whoosh. A blank app. The robot beams at the prompt *build me a habit tracker. make it good.* The meter reads 3%. | "—so I made it good!" | The rewind promises to show how it went wrong |
| 0:06 | Verse 1 | A padlock slams onto the water-drop habit. | "Put a lock on your water log" | Gag 1 |
| 0:09 | | The app splits into eleven boxes joined by wires. The robot is in sunglasses. | "Eleven services, like a boss" | Gag 2, bigger. The meter drains |
| 0:12 | | A "floss" habit is ticked and a confetti cannon fires. | "Confetti every time you floss" | Gag 3, bigger still |
| 0:14 | | Files multiply across the screen: `IMPLEMENTATION_SUMMARY.md`, `README_FINAL.md`, `README_FINAL_v2.md`, `TESTING_GUIDE.md`… The meter hits 100%. | "Nine summary docs, and your quota's gone" | The in-joke they'll recognise, and the payoff of the meter |
| 0:17 | Turn | **Freeze frame, colour drained.** The post again. The robot's screen-face flickers. | *(spoken, small)* "…oh. / I should've asked." | A visible silence. The robot owns its part, so the next beat reads as fair rather than blaming |
| 0:20 | Pre-chorus | The drums build back in. Question marks pile up. | "Good for who? *(good for who?)* / Good for what? *(good for what?)*" | A sing-along, and rising tension |
| 0:23 | | Three dials flash up: **speed**, **cost**, **lifespan**. | "Fast to run? Or cheap? / Dead by the end of the week?" | The tradeoffs become concrete |
| 0:26 | **Chorus** | The full band, big type. **The missing prompt appears in the centre for one bar**, cursor blinking, then docks in the corner. | "You never told me who it's FOR— / or what you WANT!" | The release, plus a new open question: the empty box |
| 0:29 | | Close-up. The band stops dead on "prompt". | **"I can't read your mind / I'm only reading your prompt"** | The line to remember |
| 0:32 | Post-chorus | Three readable close-ups: a big green **"✅ All tests pass"** over a broken app, a checklist ticking itself, a **"100% coverage"** badge being polished. Then pull back to a vast crowd, the whole internet, busy with these rituals. A scattered handful hold up a sign: *who's it for?* | "Learned from everyone online *(whoa-oh)* / most never wondered who it's for *(whoa-oh)*" | The biggest shot in the video, and rituals they recognise. Not knowing is normal |
| 0:38 | Verse 2 | The robot holds up cards, one per line, and each card's dials snap into place. A launch video playing on a phone. | "Launch demo? Wow them fast" | New example |
| 0:41 | | A pricing page and a "your data" padlock. | "Paying users? Make it last" | *Which one am I?* |
| 0:44 | | A group chat, everyone laughing at the bot. | "Bot for the chat? Just make it fun" | |
| 0:47 | | The missing prompt flashes, still empty. The cards fan out, each with a different face on it. | "Every app, a different someone" | The pattern clicks, and it's about people rather than taste. The open question comes back |
| 0:50 | | The habit tracker, small and alone. | "Just for you? That's fine. Just say so." | Back to our story: permission, not scolding |
| 0:53 | **Breakdown** | Half-time. Gang vocals, one word per hit, in type that fills the screen. Credit shown only during the chant: *Weinberg · Bach & Bolton · via Ed Pringle* | "SOFT-WARE / QUAL-I-TY / IS VAL-UE / TO SOME-ONE / WHO MAT-TERS" | The musical peak, and the line people will quote |
| 0:59 | Bridge | Quiet. The robot looks at its own code. Small credit: *agents as stakeholders: Ed Pringle* | "I'm someone too / I'll debug it after you" | The emotional turn: the agent is on the team |
| 1:02 | | One by one, the bots step in beside it. | "Every bot that uses it? *(THEM TOO!)*" | A warm, new idea in one bar |
| 1:04 | **Final chorus** | The full band. **The missing prompt fills in, one line per bar.** | "Now you've told me who it's FOR! / Now you've told me what you WANT!" | Closes the open question from the chorus |
| 1:09 | | The robot builds a tiny, delightful tracker: one tap, a streak, a little flame. The meter reads 8%. | **"I can't read your mind / I'm only reading your prompt"** | The same locked line, now a happy ending, because the prompt says everything |
| 1:12 | Hold | **The finished prompt, full screen, for 3 seconds.** Small credit on the comments line: *Martin Davidson*. | — | The screenshot |
| 1:15 | End card | The ∴ Tollens mark. *Software Quality Theory for Beginners · 1*. The prompt stays visible. | *(text)* **Reply with your vaguest prompt. The robot will rewrite it. 👇** | Something they want to do, and something you can reply to |

## The prompt, before and after

Before:

> build me a habit tracker. make it good.

After, one line per bar:

> just for me.
> fun first: one tap, streaks, a little flame.
> don't burn my quota.
> easy to debug. comments say why, not what.
> put who it's for in CLAUDE.md.
> fine if it dies after summer.
> ask me if you're unsure.

## Why they'd like it
The gags escalate, and they're the gags the audience already jokes about (summary-file spam, the
usage limit). The robot is an underdog that owns its part. The line to remember is earnest. And the
craft is visible: a band made entirely of code.

## Why they'd share it
- **To clip:** the gag run, and the "…oh. / I should've asked." freeze.
- **To save:** the finished prompt, held full screen.
- **To reply:** the end card asks for their vaguest prompt, and the robot rewrites it in the replies.
- **For the novelty:** every note, frame and syllable is code.

## Post text (draft)

> POV: you're the coding agent and the whole spec is "make it good" 🎸
> (every note, frame and syllable in this is code)

## Review log
- **Round 1 (2026-09-24):** four reviewers: a songwriter, a short-form editor, simulated viewers,
  and a fact-checker. Changes made:
  - rhyme and scansion rebuilt
  - the grievance moved into the first frame
  - "I should've asked" added, so the responsibility is shared
  - verse 2 cut to vibecoder apps
  - the prompt box planted centrally, then held full screen
  - the comments line fixed, because it had moved the *why* out of the code
  - the "fast" ambiguity fixed
  - credits scoped so Bach & Bolton aren't read as endorsing the agent-as-someone section

## Open questions for the expert

1. **"I should've asked."** Is it right for the robot to own part of the blame? Bach & Bolton say
   the operator bears responsibility, and an agent that gold-plates rather than asking is still
   exercising poor judgement.
2. **End card.** "Reply with your vaguest prompt. The robot will rewrite it." commits the account to
   replying to the first few dozen replies. Is that OK?
3. **Series title.** Reviewers flagged "for Beginners" as talking down to people who ship. Keep it?

## Liner notes (to write when it's built)
How it was checked · where it falls short
