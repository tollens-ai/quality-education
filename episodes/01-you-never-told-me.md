# Episode 1: "You Never Told Me"

**Concept:** software quality is value to someone who matters.
**Line to remember:** "I can't read your mind, I'm only reading your prompt." **Locked**: Qing,
2026-09-24, "this is ace keep it! made me well up a little".
**Status:** script v5, lyrics reworked after Qing's first lyric notes. Not yet re-reviewed.

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

Lyric notes on v4 (2026-09-24):

> we're now suffering from the CLASSIC problem [...] where we've tried hard to make things rhyme
> and scan and now we've diluted the meaning. [...] we totally can add more words to the verse or
> add more verses if we want!

> verse 1 - I really like the vibe but I struggled to parse "put a lock on your water log" - maybe
> we can go for, like, really stereotypical vibecode project like a gym log?
> chorus - I like the hook! maybe we can add a third thing like fast to run? sturdy or cheap? or
> something?
> "learned from everyone online" line is weak - learned what? and it's not most never learned to
> ask who it's for - deep point here. lots of engineers thought that wasn't their job! they though
> it's product's job. they just concentrate on code. but my point is you can't write, and TEST,
> quality software without thinking about the users. and are we focusing on the writing here or
> the testing here anyway?

> "just say so" feels weak at the end of a decent verse.

> also "Now you've told me who it's for" feels... weak, as the transformation. they probably
> haven't! As a songwriter I'd go for "So please tell me who it's for!"


## Shape

The coding agent sings a pop-punk complaint song about being blamed for a vague prompt. The robot
voice is part of the character. Tempo is about 170 bpm, so one bar is about 1.4s. The song is
about 81 seconds, in 9:16. The times below are approximate; the synthesised song sets the exact
cue times.

- **Misconception:** "good" is obvious, and the agent should know what I meant.
- **Refutation:** software quality is value to someone who matters. The agent can't know who that
  is, or what they value, unless you tell it. It should ask, and you should say.

**Cast**
- **The robot:** the coding agent, and the singer. It's eager, earnest and a little
  overwhelmed, and its face is a screen.
- **The user:** only ever seen through their posts and prompts, so every viewer can stand in their
  place.
- **The bots:** a Discord bot, a CI bot and "your other agent", each labelled. They appear in the bridge.

**Running devices**
- **The running app**: a gym log, the most vibecoded app there is.
- **The quota meter**, top left, labelled **quota used**. It fills from green to red during verse 1 and reads 8% (green) at the end.
- **The missing prompt**: an empty prompt box with a blinking cursor. It sits centre screen for one
  bar at the chorus, docks top right (clear of X's UI zones), flashes again during verse 2, fills in during the final chorus, and is then
  held full screen.
- **Captions**: a word-by-word wipe of the lead vocal only, inside the X safe zone.

## Script

| Time | Section | Picture | Lyric (lead vocal; *backing in italics*) | Why they keep watching |
|---|---|---|---|---|
| 0:00 | Cold open | **First frame, full width:** the post *"claude built me absolute garbage 😤"*, a real-looking **"Usage limit reached"** banner, and behind them a tiny gym log (one button: *log set*) with a smoking server tower bolted on. | **"You said make it GOOD,"** on the first beat, over a guitar crash | Their own grievance, in their own screens, with a mystery behind it |
| 0:03 | Rewind | A VHS rewind whoosh. A blank app. The robot beams at the prompt *build me a gym log. make it good.* Quota used: 3%. | "so I made it good!" | The rewind promises to show how it went wrong |
| 0:06 | Verse 1 | The user taps *log set*. A 2FA screen slams down, a phone buzzes with a six-digit code, a sweaty thumb hovers. | "Two-factor login just to log a set" | Gag 1: security nobody asked for, readable in one glance |
| 0:09 | | The app splits into eleven boxes joined by wires; the one in the middle holds a single dumbbell and a counter reading *1*. | "Eleven microservices to count a rep" | Gag 2, bigger, and satire of over-engineering. The meter climbs |
| 0:12 | | A new PB is logged and a confetti cannon fires across the whole gym. | "Confetti cannon for a new PB" | Gag 3, bigger still |
| 0:14 | | Files multiply across the screen: `IMPLEMENTATION_SUMMARY.md`, `README_FINAL.md`, `README_FINAL_v2.md`, `TESTING_GUIDE.md`… The meter hits 100% and a tiny tombstone pops up beside it: *quota*. | "Nine summary docs. Your quota: RIP" | The in-joke they'll recognise, and the payoff of the meter |
| 0:17 | Turn | **Freeze frame, colour drained.** The post again. The robot's screen-face flickers. | *(spoken, small)* "…oh. / I didn't ask." | A visible silence. The robot owns its part, so the next beat reads as fair rather than blaming |
| 0:20 | Pre-chorus | The drums build back in. Question marks pile up. | "Good for who? *(good for who?)* / Good for what? *(good for what?)*" | A sing-along, and rising tension |
| 0:23 | | Four dials flash up: **speed**, **cost**, **lifespan**, **wow**. | "Fast to run? Or cheap? / Dead by the end of the week?" | The tradeoffs become concrete |
| 0:26 | **Chorus** | The full band, big type, one word per hit. **The missing prompt appears in the centre for one bar**, cursor blinking, then docks in the corner. On "BREAK", the gym log's smoking tower cracks. | "You never told me who it's FOR, / what you WANT, / what can BREAK!" | The release, plus a new open question: the empty box |
| 0:29 | | Close-up. The band stops dead on "prompt". | **"I can't read your mind / I'm only reading your prompt"** | The line to remember |
| 0:32 | Post-chorus | Two readable close-ups: a big green **"✅ All tests pass"** over a broken app, and a *best practices* checklist ticking itself (microservices ✓, 2FA ✓, README ✓). Pull back to a vast crowd of coders, the whole internet, heads down over keyboards. A sticky note reading **who's it for?** is passed hand to hand and tossed over a wall marked **PRODUCT**. | "I learned to code from all of you *(whoa-oh)* / and you said 'users? That's product's job' *(whoa-oh)*" | The biggest shot in the video, and a habit they recognise from real teams. Not knowing is normal, and it's inherited |
| 0:36 | | Last beat: the robot catches the sticky note mid-air and holds it up, the largest text in the shot. The ✅ close-up flashes once more. | "But you can't write it, you can't test it *(whoa-oh)* / if you don't know who it's for *(whoa-oh)*" | The deep point, said plainly: who it's for is part of building *and* testing, not a handoff |
| 0:41 | Verse 2 | The robot holds up cards, one per line, and each card's dials snap into place. A launch video playing on a phone. Dials: wow high, lifespan low. | "Launch demo? Wow them fast" | New example |
| 0:44 | | A pricing page and a "your data" padlock. Dials: lifespan high. | "Paying users? Make it last" | *Which one am I?* |
| 0:47 | | A group chat, everyone laughing at the bot. Dials: wow high, cost low. | "Bot for the chat? Just make it fun" | |
| 0:50 | | The missing prompt flashes, still empty. The cards fan out, each with a different face on it. | "Every app, a different someone" | The pattern clicks, and it's about people rather than taste. The open question comes back |
| 0:53 | | The gym log, small and alone. A spotlight finds the user's hand on the phone; a card with *their* face drops into the fan. | "Just for you? Then you're the one." | Back to our story. A solo project still has someone who matters: you. Permission, not scolding |
| 0:56 | **Breakdown** | Half-time. Gang vocals, one word per hit, in type that fills the screen. Credit shown only during the chant: *Weinberg · Bach & Bolton · via Ed Pringle* | "SOFT-WARE / QUAL-I-TY / IS VAL-UE / TO SOME-ONE / WHO MAT-TERS" | The musical peak, and the line people will quote |
| 1:02 | Bridge | Quiet. The robot looks at its own code. Small credit: *agents as stakeholders: Ed Pringle* | "I'm someone too / I'm debugging this with you" | The emotional turn: the agent is on the team. It climbs from the last verse: you're someone, so am I |
| 1:05 | | One by one, labelled bots step in beside it: a Discord bot, a CI bot, *your other agent*. | "Every bot that uses it?" / gang vocal, in huge type on screen: **"THEM TOO!"** | A warm, new idea in one bar |
| 1:07 | **Final chorus** | The full band. Split screen, 1:07–1:15: the robot sings up at the empty box; **the missing prompt fills in, one line per bar,** above; the robot builds below. The last line lands just before the hold. | "So please tell me who it's FOR, / what you WANT, / what can BREAK!" | Closes the open question from the chorus: the plea is in the song, the answer is in the picture |
| 1:12 | | In the lower half, the tiny, delightful gym log is finished: one tap per set, a PB flame. Quota used: 8%, green. | **"I can't read your mind / I'm only reading your prompt"** | The same locked line, now a happy ending, because the prompt says everything |
| 1:15 | Hold | **The finished prompt, full screen, for 4 seconds.** Small credit on the comments line: *Martin Davidson*. | The last chord rings out; the song ends about 1:19 | The screenshot |
| 1:19–1:21 | End card | The ∴ Tollens mark. *Software Quality Theory for Beginners · 1*. The prompt stays visible. It loops cleanly back to the first frame. | *(text)* **Reply with your vaguest prompt. The robot will ask what it needs to know. 👇** | Something they want to do, and something you can reply to |

## The prompt, before and after

Before:

> build me a gym log. make it good.

After, one line per bar:

> just for me. fun first: one tap per set, a flame for a PB.
> don't burn my quota.
> easy to debug. comments say why, not what.
> fine if it dies after summer.
> ask before adding anything I didn't list.
> save this in CLAUDE.md.

## Why they'd like it
The gags escalate, and they're the gags the audience already jokes about (summary-file spam, the
usage limit). The robot is an underdog that owns its part. The line to remember is earnest. And the
craft is visible: a band made entirely of code.

## Why they'd share it
- **To clip:** the gag run, and the "…oh. / I didn't ask." freeze.
- **To save:** the finished prompt, held full screen.
- **To reply:** the end card asks for their vaguest prompt, and in the replies the robot asks the questions it would need answered. That demonstrates the lesson.
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

- **Round 2:** a combined craft reviewer and a fact-checker. The fact-checker said it's accurate
  enough to ship. Changes made:
  - "never wondered" changed to "never learned to ask", in line with CANON
  - over-building added to the ritual shot
  - the quota meter labelled "used"
  - "ask before adding anything I didn't list" added to the prompt, to target gold-plating
  - the end card no longer contradicts the lesson (the robot asks rather than rewrites)
  - the prompt fill runs split screen and is held for 4s
  - the bridge line is clearer ("debugging this with you")
  - the scraper swapped for a CI bot and "your other agent"
  - "like a boss" dropped
  - "I didn't ask", which is easier for the synth voice to sing
- **Round 3:** a final cold read found only consistency fixes: a **wow** dial so fun and wow can
  be set, per-card dial settings, the prompt fill fitted to its slot, "THEM TOO!" on screen for
  muted viewers, the end timing and the hold audio defined, and the prompt box docked top right.

- **Expert lyric notes (2026-09-24):** rhyme had started to beat meaning. Changes made:
  - the app is now a gym log, so every verse-1 gag parses on first hearing (2FA to log a set,
    microservices to count a rep, confetti for a PB, quota RIP)
  - the chorus gained a third item, "what can BREAK": which qualities you'll trade away
  - the post-chorus now says what was learned (to code) and the real inheritance: "who it's for"
    was treated as someone else's job. It ends on the claim that covers both writing and testing
  - "Just say so" replaced by "Then you're the one", which sets up the bridge's "I'm someone too"
  - the final chorus is a plea ("So please tell me"), and the picture shows the answer

## Open questions for the expert

1. **"I didn't ask."** Is it right for the robot to own part of the blame? Bach & Bolton say
   the operator bears responsibility, and an agent that gold-plates rather than asking is still
   exercising poor judgement.
2. **End card.** "Reply with your vaguest prompt. The robot will ask what it needs to know." commits
   the account to replying to the first few dozen replies with clarifying questions. Is that OK?
3. **Series title.** Reviewers flagged "for Beginners" as talking down to people who ship. Keep it?

## Liner notes (to write when it's built)
How it was checked · where it falls short
