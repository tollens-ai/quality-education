# Episode 1: "You Never Told Me"

**Concept:** software quality is value to someone who matters.
**Line to remember:** "I can't read your mind, I'm only reading your prompt." **Locked**: Qing,
2026-09-24, "this is ace keep it! made me well up a little".
**Status:** script v6, after Qing's second lyric notes and a fourth internal review round. Ready for expert review.

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

Lyric notes on v5 (2026-09-24):

> oh I liked the first verse better when each line was talking about a different app - more
> comedic potential for the video.

> Chorus got worse, and wrong - definitely NOT the human's job to TELL YOU what can break! nobody
> will interpret that the way you're trying to do it
>
> if I try to work that hook, I'd go for - "you didn't tell me who it's FOR, you didn't tell me
> what they NEED"

> new post-chorus section is the right idea but it's a little clunky and doesn't rhyme

> we can tuck a tiny tollens watermark onto the corner of the video maybe


## Shape

The coding agent sings a pop-punk complaint song about being blamed for a vague prompt. The robot
voice is part of the character. Tempo is about 170 bpm, so one bar is about 1.4s. The song is
about 96 seconds, in 9:16. The times below are approximate; the synthesised song sets the exact
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
- **The user's side projects**: a gym log, a blog, a habit tracker, all briefed "make it
  good" on the same day. Verse 1 takes one per line. The gym log is the one we come back to.
- **The Tollens mark**: tiny and low-contrast, top left under the quota meter. Never animated.
- **The quota meter**, top left, labelled **quota used**. It fills from green to red during verse 1, resets with a *new session* tick at the final pre-chorus, and reads 8% (green) at the end.
- **The missing prompt**: an empty prompt box with a blinking cursor. It appears centre screen at
  the first pre-chorus, docks top right (clear of X's UI zones), flashes during verse 2, twitches
  in the second pre-chorus, starts typing at the final pre-chorus, fills in during the final
  chorus, and is then held full screen.
- **Captions**: a word-by-word wipe of the lead vocal only, inside the X safe zone.

## Script

| Time | Section | Picture | Lyric (lead vocal; *backing in italics*) | Why they keep watching |
|---|---|---|---|---|
| 0:00 | Cold open | **First frame, full width:** the post *"my AI built me absolute garbage 😤"* fills the frame; behind it, the user's gym log, smoking. The lyric caption lands on the first downbeat. | **"You said make it GOOD,"** on the first beat, over a guitar crash | Their own grievance, in their own words, with a mystery behind it. One thing to read |
| 0:03 | Rewind | A VHS rewind whoosh to this morning. The robot beams at a stack of prompts that all end the same way: *build me a gym log. make it good.* / *blog pls. make it good.* / *habit tracker, make it good.* Quota used: 3%. | "so I made it good!" | The rewind promises to show how it went wrong, and the stack is every viewer's history |
| 0:06 | Verse 1 | **Habit tracker.** A "floss" habit is ticked and a confetti cannon fires. Dial flash: **wow** maxed. | "Confetti every time you floss" | Gag 1: small and silly, and its pickup beat launches the verse |
| 0:09 | | **Gym log.** The user taps *log set*. A 2FA screen slams down; a phone buzzes with a six-digit code; a sweaty thumb hovers. Dial flash: **sturdy** maxed. | "2FA on your gym log" | Gag 2, a new app and bigger: security nobody asked for, readable in one glance |
| 0:12 | | **Blog.** One post, *hello world*, served by a server cluster that fills the screen, pods spinning up by the dozen. Dial flash: **speed** maxed. | "Kubernetes for your blog" | Gag 3, the biggest, and the classic over-engineering meme. The meter climbs |
| 0:15 | | The robot splits into twelve subagents, each with a clock face, busy round the clock across all three apps. Each one leaves a `SUMMARY.md` behind (`IMPLEMENTATION_SUMMARY.md`, `README_FINAL_v2.md`, `DONE_FINAL.md`…). Dial flash: **cost** maxed. | "Twelve subagents round the clock" | Gag 4, and what actually burns quota. The summary-file in-joke stays in the picture |
| 0:18 | | The subagents freeze and look up. The meter hits 100% and a generic **usage limit reached** banner drops. | "Did I do it wrong? / Oops, your quota's gone!" | The pattern breaks; the payoff of the meter |
| 0:21 | Turn | **Freeze frame, colour drained, two bars at most.** The post again. The robot's screen-face flickers. Its words are captioned large, so the silence reads on mute. | *(spoken, small)* "Guess I didn't ask." | A visible silence. The robot owns its part, so the next beat reads as fair rather than blaming |
| 0:23 | **Pre-chorus** | The drums build back in. **The missing prompt appears in the centre**, cursor blinking. On "FOR", the flosser, the gym-goer and the blog reader flash up; on "WANT", each gets a thought bubble: *fun!*, *just log it*, *just read it*. | "You didn't tell me who it's FOR, / you didn't tell me what they WANT" | Rising tension, and a new open question: the empty box |
| 0:26 | | Close-up on the robot. The band stops dead on "prompt"; one beat of silence. The box docks top right. | **"I can't read your mind / I'm only reading your prompt"** | The line to remember, then a held breath |
| 0:29 | **Chorus** | Everything crashes back in. Huge type, one word per hit, question marks raining. | "GOOD FOR WHO-O-O? *(who-o-o?)* / GOOD FOR WHA-A-AT? *(wha-a-at?)*" | The release, and the sing-along. It answers the cold open's "make it GOOD" with the right question |
| 0:32 | | The four dials from verse 1 line up: **speed**, **sturdy**, **cost**, **wow**. Each swings as it's sung. | "Fast to run, sturdy or cheap? / Wow for a week or built to keep?" | The gags come back as choices. Every setting is legitimate, including a week of wow |
| 0:35 | Verse 2 | The robot holds up cards, one per line, and each card's dials snap into place. A launch video playing on a phone. Dials: wow high, sturdy low. | "Product demo? Wow them fast" | New example, in the verse 1 rhythm |
| 0:38 | | A pricing page and a "your data" padlock. Dials: sturdy high. | "Paying users? Make it last" | *Which one am I?* |
| 0:41 | | A group chat, everyone crying with laughter at the bot. Dials: wow high, cost low. | "Group chat bot? Just make 'em laugh" | |
| 0:44 | | A laptop at 3am, a countdown reading *due 9am*. Dials: everything low except "works once, in the demo". | "Uni project? Make it pass" | A fourth card, the one students will tag each other on |
| 0:47 | | The gym log, small and alone. A spotlight finds the user's hand on the phone; a card with *their* face joins the others. | "Just for you, for fun? / Then you're the one!" | Back to our story, rhymed like "Did I do it wrong? / Oops, your quota's gone!". A solo project still has someone who matters: you |
| 0:50 | | The cards fan out, each with a different face; the missing prompt flashes, still empty. | *(spoken, small)* "There's always someone." | Mirrors "Guess I didn't ask." and hands on to the pre-chorus: someone, then *who* |
| 0:52 | **Pre-chorus 2** | The faces from the cards fill the screen, each with its own thought bubble. | "You didn't tell me who it's FOR, / you didn't tell me what they WANT" | Same words, new faces: now it's everyone's app |
| 0:55 | | Same stop on "prompt". The empty box twitches: the cursor types one letter, then deletes it. | **"I can't read your mind / I'm only reading your prompt"** | The line again, and the tease that someone nearly answered |
| 0:58 | **Chorus 2** | The crash again, bigger. | "GOOD FOR WHO-O-O? *(who-o-o?)* / GOOD FOR WHA-A-AT? *(wha-a-at?)*" | The crowd knows the words now |
| 1:01 | | Quick cuts, one per phrase: an app still working in a train tunnel with no signal; a cracked old phone with huge text; a sandbox box labelled *eval* with an agent-shaped hole in its side. | "Works on a train, on your nan's old phone? / No agents going rogue on their own?" | New tradeoffs nobody briefs: offline, old devices, agent safety. The hole in the box is for people who follow the news |
| 1:04 | **Bridge** | A big green **"✅ All tests pass"** over the broken blog. Pull back to a vast crowd of coders, the whole internet, heads down over keyboards. A sticky note reading **who's it for?** is passed hand to hand and tossed over a wall marked **PRODUCT TEAM**. | "I learned to code from all of you *(whoa-oh)* / and most left the users at product's door *(whoa-oh)*" | The biggest shot in the video. Why agents don't know: it's inherited, and it's normal |
| 1:08 | | The robot catches the sticky note mid-air and holds it up, the largest text in the shot. On "test", the ✅ cracks. | "But what you build and test won't do *(whoa-oh)* / unless you ask who it's for *(whoa-oh)*" | The deep point: who it's for is part of building *and* testing |
| 1:12 | **Breakdown** | Half-time. Gang vocals, one word per hit, in type that fills the screen. Credit shown only during the chant: *Weinberg · Bach & Bolton · via Ed Pringle* | "SOFT-WARE / QUAL-I-TY / IS VAL-UE / TO SOME-ONE / WHO MAT-TERS" | The musical peak, and the line people will quote |
| 1:18 | | The robot, quiet, looks at its own code. Then labelled bots pop up one after another, each squeezing into frame: *Muse*, *Instinct*, *Hermes*. Small credit: *someone or something who matters: Ed Pringle* | "I'm someone too, / I'm debugging this with you" / bots, one per hit: *"and me! and me! and me!"* | "Who matters" hands straight to "me too". Agents as team members, then a comic pile-up |
| 1:21 | **Final pre-chorus** | The quota meter ticks over: *new session*. The robot sings up at the empty box, pleading. | "So please tell me who it's FOR, / please tell me what they WANT" | The plea: the viewer is asked directly |
| 1:24 | | The stop on "prompt", and in the silence the cursor starts typing. | **"I can't read your mind / I'm only reading your prompt"** | The open question starts to close |
| 1:27 | **Final chorus** | Split screen: **the missing prompt fills in, one line per bar,** above; the robot builds below. | "GOOD FOR WHO-O-O? *(who-o-o?)* / GOOD FOR WHA-A-AT? *(wha-a-at?)*" | Now the questions have answers on screen |
| 1:30 | | In the lower half, the tiny, delightful gym log is finished: one tap per set, a PB flame. The bots from the bridge give a thumbs up. Quota used: 8%, green. As each phrase is sung, the matching prompt line highlights: *easy to debug*, *comments say why, not what*, *save this in CLAUDE.md*. | "Tests I can run, errors I can read? / Write down why in CLAUDE.md?" | Agent-facing quality, straight after the bots: what makes the software good for the agent on the team. The robot sings in its own voice, and the prompt shows the answers |
| 1:33 | Hold | **The finished prompt, full screen, for 3 seconds, cursor still blinking.** Small credit beside the comments line: *why, not what: Martin Davidson*. | The last chord cuts straight into the opening guitar crash, so the loop reads as after, then before: the full prompt, then "make it good". No end card | The screenshot. Ending on the lesson, not a logo, keeps it feeling like teaching |

## The prompt, before and after

Before:

> build me a gym log. make it good.

After, one line per bar:

> just for me. fun first: one tap per set, a flame for a PB.
> don't burn my quota.
> easy to debug. comments say why, not what.
> fine if it dies after summer.
> ask before adding big extras I didn't list.
> save this in CLAUDE.md.

## Why they'd like it
The gags escalate, and they're the gags the audience already jokes about (summary-file spam, the
usage limit). The robot is an underdog that owns its part. The line to remember is earnest. And the
craft is visible: a band made entirely of code.

## Why they'd share it
- **To clip:** the gag run, and the "Guess I didn't ask." freeze.
- **To save:** the finished prompt, held full screen.
- **To reply:** the post text asks for their vaguest prompt, as a question between builders, not a call to action.
- **For the novelty:** every note, frame and syllable is code.

## Post text (draft)

> POV: you're the coding agent and the whole spec is "make it good" 🎸
> (every note, frame and syllable in this is code)
>
> what's the vaguest prompt you've ever sent?

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

- **Expert lyric notes, round 1 (2026-09-24):** v5 made the app a gym log throughout, added
  "what can BREAK" to the chorus, rewrote the post-chorus around "who it's for was product's job",
  made the final chorus a plea, cut the end card and renamed the series *101*. Most of the lyric
  changes were superseded in round 2; the plea, the cut end card and the name stand.
- **Expert lyric notes, round 2 (2026-09-24):** verse 1 back to one app per line (more for the
  picture to play with); "fast to run, sturdy, cheap" goes in the pre-chorus as a list of
  tradeoffs; "what can break" dropped, since it wrongly made failure the user's job to name;
  chorus rebuilt on Qing's hook ("who it's FOR / what they NEED"); post-chorus rhymed; a tiny
  Tollens mark in the corner in place of the end card.

- **Round 4, internal (2026-09-24):** the four reviewers again. Changes made:
  - verse 1 reordered to escalate (confetti, then 2FA, then Kubernetes), each gag tagged to the
    dial it maxes, so the pre-chorus dials pay off the gags
  - "quota's lost" became "look what it cost", which ties to cost as a quality tradeoff
  - pre-chorus: "dead by the end of the week" sounded like failure; "wow for a week, or built to
    keep?" makes it a choice, and every dial now has a word
  - chorus: backing echoes, and the "need" bubbles show wants as well as functions
  - post-chorus: "product's for" could be heard as "the product's for", and the robot seemed to
    endorse it. Now "most left the users at product's door", which is not the robot's view and
    doesn't claim everyone. "Test it through" wasn't a phrase; now "what you build and test won't
    do / unless you ask who it's for"
  - first frame cut to one read; the usage banner moved to 0:15 and made generic; the post says
    "my AI", not a product name
  - bridge credit fixed: Ed's idea is "someone *or something*"; agents as team members is Qing's
  - "ask before adding anything" softened to "big extras", so the agent still does basic checks
  - quota resets on screen for the new session; hold cut to 3s; watermark moved top left

- **Expert lyric notes, round 3 (2026-09-24):** back to "WANT", which slant-rhymes with
  "prompt" and is closer to *value* than "need". Verse 1 rebuilt on the rhythm of "Confetti every
  time you floss", which Qing pointed out is the "We Didn't Start the Fire" verse meter: stressed
  list lines rhymed ABBA (floss / gym log / blog / cost). "Confetti" starts on an upbeat, so it
  has to open the verse; that also restores the escalation: confetti, 2FA, Kubernetes, then the
  docs. Line 4 then breaks the pattern to wind into "…oh. I didn't ask.": the rhyme lands on
  "clock" and "your quota's gone" trails off. Summary docs don't cost much, so the lyric now blames
  what does burn quota (subagents running round the clock); the docs stay in the picture as the
  in-joke.

- **Verse endings matched (2026-09-24):** both verses are now four pattern lines, opening on an
  upbeat, then a short tag that breaks the pattern and hands on: "and your quota's gone" into
  "…oh. I didn't ask.", and "and it's always someone" into the breakdown.

- **Verse 1 ending, Qing (2026-09-24):** "Did I do it wrong? / Oops, your quota's gone! / Guess
  I didn't ask." The robot's confusion rhymes on wrong / gone with the verse's vowel, and the turn
  shrinks to one spoken line.

- **Verse 2 rebuilt to mirror verse 1 (2026-09-24):** four example lines on one vowel (fast /
  last / laugh / pass, which rhyme in a British accent), a two-line tag that rhymes with itself
  ("Just for you, for fun? / Then you're the one!"), then one spoken line into the next section
  ("There's always someone."). A uni project card added so each verse has four examples.

- **Structure rejig (2026-09-24, with Qing):** pre-chorus and chorus swapped. "Good for
  who-o-o? Good for wha-a-at?" is now the chorus and repeats three times; its second half changes
  each time and adds information (tradeoffs the gags showed; tradeoffs nobody briefs; the answers
  from the prompt). "You didn't tell me…" plus the locked line is the pre-chorus, with the band
  stopping dead on "prompt" before each chorus. Form: verse, pre-chorus, chorus twice, then a
  bridge (the old post-chorus), the breakdown, "I'm someone too" with the bots, and the final
  pre-chorus and chorus.

- **Final chorus (2026-09-24, Qing):** its second half is agent-facing quality, since it follows
  the bots: tests an agent can run, errors it can read, and the *why* written down in CLAUDE.md.

## Open questions for the expert

1. **Muse, Instinct and Hermes.** Are these your agents, and are you happy to name them on screen
   in a public video? The fallback is generic labels (a Discord bot, a CI bot, *your other
   agent*).
2. **"I didn't ask."** Is it right for the robot to own part of the blame? Bach & Bolton say
   the operator bears responsibility, and an agent that gold-plates rather than asking is still
   exercising poor judgement.

## Liner notes (to write when it's built)
How it was checked · where it falls short
