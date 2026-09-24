# Episode 1: "You Never Told Me"

**Concept:** software quality is value to someone who matters.
**Line to remember:** "I can't read your mind, I'm only reading your prompt." **Locked**: Qing,
2026-09-24, "this is ace keep it! made me well up a little".
**Status:** script v1, ready for expert review.

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

The coding agent sings a pop-punk complaint song about being blamed for a vague prompt. The
synthetic voice fits, because the singer is a robot. Tempo is about 170 bpm, so 3 seconds is
roughly two bars; the whole song is about 72 seconds, in 9:16.

- **Misconception:** "good" is obvious, and the agent should know what I meant.
- **Refutation:** software quality means value to someone who matters. The agent can't know who
  that is, or what they value, unless you tell it.

**Cast**
- **The robot:** the coding agent, and the singer. It's eager, earnest and a little overwhelmed,
  and its face is a screen.
- **The user:** only ever seen as their posts and prompts, so every viewer can stand in their place.
- **The bots:** a Discord bot, a scraper and an assistant agent. They appear in the breakdown.

**Running devices**
- **Quota meter,** top left. It drains during verse 1 and resets at the end.
- **Prompt box,** bottom right, placed above the X UI safe zone. It appears empty at the first
  chorus and fills in during the last one.
- **Captions:** a word-by-word wipe inside the safe zone. Every word that's sung is also on screen.

## Script

| Time | Section | Picture | Lyric (sung unless marked) | Why they keep watching |
|---|---|---|---|---|
| 0:00 | Cold open | **First frame:** a tiny habit-tracker app with a smoking tower bolted on: a server rack, a confetti cannon, a padlock. The caption reads *make it good.* The quota meter is full red: **100% used**. | **"You said make it GOOD—"** on the first beat, with a guitar crash | Something absurd they recognise. *What happened here?* |
| 0:03 | Rewind | A VHS rewind whoosh. A blank app, and the robot beams at a fresh prompt: *build me a habit tracker. make it good.* The meter is at 3%. | "—so I made it good!" | The rewind promises to show how it went so wrong |
| 0:06 | Verse 1 | The robot bolts on 2FA; a lock appears on a water-drop icon. | "Added login, two-factor too / in case a hacker wants your water log" | Gag 1 |
| 0:09 | | The app splits into eleven little boxes joined by wires. | "Split it into eleven services" | Gag 2, bigger. The meter drains |
| 0:12 | | A tooth icon is ticked and a confetti cannon fires. | "Confetti every time you floss!" | Gag 3, bigger still |
| 0:15 | | A scroll unrolls off the bottom of the screen. The meter hits 100%. | "Wrote a README forty pages long / burned your whole quota on the README" | The payoff for the meter, which cost has been draining all along |
| 0:18 | Turn | The music cuts out. A notification pings: *"claude built me absolute garbage 😤"*. The robot's screen-face flickers. | *(spoken, small)* "…oh." | Silence after noise. Sympathy flips to the robot. *Whose fault is it?* |
| 0:21 | Pre-chorus | The drums build back in. Question marks pile up around the robot. | "Good for who? *(good for who?)* / Good for what? *(good for what?)*" | Rising tension |
| 0:24 | | Three dials flash up: speed, cost, longevity. | "Did you want it fast? Did you want it cheap? / Did you want it gone by the end of the week?" | The tradeoffs become concrete |
| 0:27 | **Chorus** | The full band. The robot sings straight to the camera in big type. **The empty prompt box appears,** cursor blinking, labelled *the prompt you should have sent*. | "You never told me who it's for! / You never told me who it's for!" | The release. The empty box opens a question that isn't answered until the end |
| 0:30 | | Close-up on the robot's face. | **"I can't read your mind / I'm only reading your prompt"** | The line to remember |
| 0:33 | Post-chorus | Pull right back from the robot into a vast crowd, the whole internet, busy with quality rituals: typing `expect(true).toBe(true)`, ticking checklists, polishing 100% coverage badges. Out of millions, a scattered handful hold up a sign: *who's it for?* | "I learned to code from everyone online / and most of them never asked who it's for" | The biggest shot in the video. The rituals are gags they recognise, and not knowing becomes normal |
| 0:36 | Verse 2 | Montage: one app card per line, its dials snapping into place. The wedding card: huge buttons, a grandparent's thumb. | "Wedding site for Grandma? Never lose a yes." | A new example on every beat |
| 0:38 | | Hackathon: a stage, a countdown timer, the judges. | "Hackathon demo? Wow them for three minutes." | *Which one am I?* |
| 0:41 | | A Discord bot in a group chat, everyone laughing. | "Bot for the group chat? Just make it funny." | |
| 0:43 | | An invoice with a calculator, and a tax-deadline calendar. | "Invoices for your side gig? Get the numbers right." | |
| 0:45 | | A recipe card in huge text, safely filed. | "Mum's recipes? Big text, and never lose one." | |
| 0:47 | | All five cards fan out, each with different dials. | "Every app a different good" | The pattern clicks |
| 0:49 | | The habit tracker again, small and alone, with a sun setting on it. | "It's fine if it's only for you / just know that it's only for you" | Back to our story: permission, not scolding |
| 0:51 | **Breakdown** | Half-time. Gang vocals, one word per hit, in type that fills the screen. Credit in the corner: *Weinberg · Bach & Bolton · via Ed Pringle* | "SOFT-WARE / QUAL-I-TY / IS VAL-UE / TO SOME-ONE / WHO MAT-TERS" | The musical peak and the line people will quote |
| 0:56 | | Quiet again. The robot looks down at its own code. | "And I'm someone too / I'm the one who has to debug it" | The emotional turn: the agent is on the team |
| 0:58 | | One by one, the Discord bot, the scraper and the assistant agent step in beside it. | "And so is every bot that talks to it" | A new idea, and a warm image: agents are users too |
| 1:00 | **Final chorus** | The full band returns. **The prompt box fills in, one line per beat** (see below). | "Now you've told me who it's for! / Now you've told me who it's for!" | Closes the question the empty box opened |
| 1:05 | | The robot builds a tiny, delightful habit tracker: one button, a streak, a little flame. The quota meter sits at 8%. | "I still can't read your mind / but I can read your prompt" | The locked line, turned into a happy ending |
| 1:10 | End card | The ∴ Tollens mark. *Software Quality Theory for Beginners · 1* | *(text)* **Who is YOUR app actually for? 👇** | Invites replies |

## The prompt, before and after

Before, as the viewer sees it at 0:03:

> build me a habit tracker. make it good.

After. It types itself out in the final chorus, one line per beat:

> habit tracker, just for me.
> fun matters most.
> don't blow my quota building it.
> easy for you to extend and debug.
> no comments saying what the code does. put why, and who it's for, in CLAUDE.md.
> fine if it dies after summer.

The comments line credits Martin Davidson on screen.

## Why they'd like it
It's funny, and the gags escalate. Sympathy flips to the underdog robot. The line to remember is
earnest. And the craft is visible: a band made entirely of code.

## Why they'd share it
- **To tag someone:** "the friend who says claude is dumb".
- **To be useful:** the "after" prompt is worth screenshotting.
- **For the novelty:** every note, frame and syllable is code.
- **To argue:** "it's not the agent's fault" is a mild provocation. "Most of them never asked who
  it's for" gives a fair answer to the replies.

## Post text (draft)

> Every note, every frame, and every syllable the singer sings is code.
> Software Quality Theory for Beginners, episode 1: "make it good."

## Open questions for the expert

1. **Is overbuilding the right failure to show?** Verse 1 has the agent gold-plate a tiny app. If
   vibecoders more often get something generic or bland, the gags should show that instead.
2. **"I'm only reading your prompt."** Strictly, agents also read the repo and CLAUDE.md. The
   final prompt points at CLAUDE.md, so I think the line is fair. Is it?
3. **"Every app a different good."** Is that shorthand clear, or does it suggest quality is purely
   relative, which would be the wrong lesson?

## Liner notes (to write when it's built)
How it was checked · where it falls short
