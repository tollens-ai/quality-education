# Episode 1: "You Never Told Me"

Concept: software quality is value to someone who matters.
Status: first treatment, not yet reviewed by the expert.

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

## Treatment

A pop-punk complaint song sung by the coding agent. The singer is a robot, so the synthetic voice
is part of the character. Target length is about 80 seconds.

**Misconception:** "good" is obvious, and the agent should know what I meant.

| Beat | Picture | Words |
|---|---|---|
| Cold open (0–4s) | A post: "claude built me absolute garbage 😤". Zoom in on the prompt: *build me a habit tracker. make it good.* | — |
| Verse 1 | The agent builds eagerly, guessing at "good". Each guess arrives with confidence: login with 2FA, microservices, a 60fps confetti animation, a 40-page README. | "You said make it good / so I made it good / I made it good for somebody / I just don't know who" |
| Pre-chorus | Question marks pile up around the agent | "Good for who? Good for what?" |
| Chorus | The agent and the band | "You never told me who it's for" |
| Verse 2 | A fast montage from the examples table, one app per beat, each with the dials set differently. It lands on the same app split in two. **A toy just for you**: fast to build, fun, cheap, gone by summer, and that's fine. **A tool for your sister's running club**: clear on a phone, never loses a run, still works next year. Four dials swing between the two versions: cost, wow factor, longevity, usefulness. | "It's fine if it's only for you / just know that it's only for you" |
| Bridge | The concept, named on screen and credited: *Software quality is value to someone who matters.* Gerald Weinberg; Ed Pringle adds "or something". The agent points at itself: a codebase the next session can find its way around is value to someone, too. | "And I'm someone too" |
| Final chorus | The same prompt, rewritten, types itself out (see below). The agent lights up. | "Now I know who it's for" |
| End card | A question to get replies | "Who is your app actually for?" |

**What you'd say to your agent** (the rewritten prompt, on screen):

> A habit tracker just for me. I care that it's fun to use and costs nothing to run. I don't care
> if it lasts past summer, or if the code is pretty.

## Concrete examples: the same question with different right answers

In a montage, one app per beat. Each card shows the app, who it's for, and what "good" means to them.

| App | Who it's for | What good means | What doesn't matter |
|---|---|---|---|
| Wedding RSVP site | Grandparents on their phones | Never loses an RSVP; huge buttons | Code quality, and anything after the wedding |
| Hackathon demo | Judges, for 3 minutes, on one laptop | Wow factor | Everything that isn't on stage |
| Discord bot for your friends | Six mates | Funny | Occasional crashes |
| Invoicing tool for your freelance work | You, and the taxman | The numbers are always right; it still works in April | How it looks |
| Portfolio site | Someone hiring | Wow in the first 5 seconds | Scale |
| Mum's recipe app | Mum | Big text; recipes never disappear | New features |
| Script you run once | You, today | The answer is right | Everything else |
| Open-source library | Other devs, and their agents | Clear docs; it doesn't break on update | Being clever |
| Your repo | The next agent session | It can find its way around without re-reading everything | — |

## Liner notes (to write when it's built)
How it was checked · where it falls short
