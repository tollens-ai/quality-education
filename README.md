# Software Quality Theory 101

Short animated music videos about software quality, for people who build with AI coding agents.
Each episode teaches one idea from quality theory, and ends with what that idea changes about how
you brief your agent. Episode 1 is out. The series is in development, and its outline, scripts
and animation code are built in public here.

![Three frames from episode 1. A laptop shows the prompt "make it good" under the words "You said make it good, so I made it GOOD!". A fairground sign over a packed pier at night asks "Make it good for WHO?". At sunrise, the same sign answers "ME!".](episodes/01-good-for-who.jpg)

## Episode 1: "Good for Who?"

You ask your AI coding agent to "make it good", and it does, by its own idea of good: "Confetti
cannons every time you floss", "2FA to use your gym log", "Kubernetes scaling up your blog". In
the video, Clawd, the Claude Code mascot, sings as your agent, backed by a band of other AI bots.
Its line to remember:

> I can't read your mind, I'm only reading your prompt.

The idea it teaches: **software quality is value to someone who matters** (after Jerry Weinberg,
and James Bach and Michael Bolton, via Ed Pringle). So tell your agent who it's for, and what good
means for them. By the end of the video, "make it good" has become this:

```text
a gym log. just for me.
for: me, mid-set, sweaty hands
good = log a set in one tap
fast to open, cheap to run
a 🔥 when I beat my best
skip: 2FA, Kubernetes, confetti
ship it by Monday
for you: tidy diags, ask if unsure
```

The last line is for the agent itself: agents are people who matter too, and tidy diagnostics
("diags") help them do the job.

More on episode 1:

- [The plan and the lyrics](episodes/01-you-never-told-me.md): what the episode teaches, the
  lyrics, and notes from the quality expert who checked them
- [How the video was made](episodes/01-video.md): the look, the lettering, how it was checked,
  and where it falls short
- [The code that draws it](video/ep01/pier/README.md)

## How it's made

- **An expert checks every claim.** Qing (Yanqing Cheng), who writes about software quality, is
  the domain expert: she corrects what an episode claims about quality, and she has the final say.
- **Claude drew every frame in code.** Claude, Anthropic's AI model, designed the video and wrote
  the code that draws it: JavaScript on an HTML canvas, one frame at a time, timed to the song. A
  layer of the code makes every shape look painted by hand, and each word is lettered stroke by
  stroke as it's sung.
- **The song** has lyrics by Qing with Claude. The music and the singing come from MiniMax's AI
  music generator, in a take Qing chose. The repo also has a band and a singing voice made
  entirely in code, which episode 1 tried before switching to the generator.
- **Checks are measured where they can be.** Scripts check every sung word's size, contrast and
  time on screen, and how much each second of the video moves.
- **The method is written down,** so the next episode can reuse it: [LYRICS.md](LYRICS.md) for
  writing the lyrics, [MUSIC.md](MUSIC.md) for the music, [VIDEO.md](VIDEO.md) for the video,
  [CRAFT.md](CRAFT.md) for the research on explainer videos people watch to the end, and
  step-by-step [skills](.claude/skills/) an AI agent can follow to write an episode, its song and
  its video.

Made by Qing (@yanqingcheng) at [Tollens](https://github.com/tollens-ai), with Claude. It
isn't affiliated with or endorsed by Anthropic, MiniMax, or any other company whose mascot, logo
or product appears in it.

## What's in this repo

| Where | What |
|---|---|
| [SERIES.md](SERIES.md) | The plan for the season: thirteen episodes, one idea each |
| [episodes/](episodes/) | Each episode's teaching plan, lyrics and expert notes, and its video's liner notes |
| [video/](video/) | The code that draws the videos: a renderer for each episode, and shared tools |
| [music/](music/) | Tools for the songs: timing analysis, checks, and the all-code band and voice |
| [CANON.md](CANON.md) | What the expert has approved about quality, for every episode to build on |
| [SOURCES.md](SOURCES.md) | Where the ideas come from, and who to credit |
| [research/](research/) | Sourced background: real software failures, testing as ritual, each AI maker's rules for using its logo, and how studios make videos |
| [archive/](archive/) | Two earlier attempts at episode 1's video that didn't work, and why |
| [WHO-ITS-FOR.md](WHO-ITS-FOR.md) | Who this repo is for, and what that asks of us |

## Draw the frames yourself

You need Node.js and Playwright's Chromium (and ffmpeg, to make a video). From the repo root:

```sh
npm install --no-save playwright
npx playwright install chromium
node video/lib/render.mjs --scene video/ep01/pier/main.js --song music/ep01 --stills 28.9,84.3 --w 1080
```

That draws two stills of episode 1 into `video/out/`. The song's audio and the AI makers' logos
aren't in the repo, so any video you render is silent, and simple stand-ins take the place of the
logos.
[The renderer's README](video/ep01/pier/README.md) has the rest.

## Credits

- **The idea** that quality is value to someone who matters comes to the series via Ed Pringle,
  whose wording is "value to someone (or something) who matters". It builds on Jerry Weinberg
  ("value to some person") and on James Bach and Michael Bolton ("who matters"). The video
  credits them on screen, and [SOURCES.md](SOURCES.md) lists every source.
- **Clawd** is Anthropic's Claude Code mascot. The other bots carry their makers' official logos,
  unaltered; [SOURCES.md](SOURCES.md) says where each one comes from.

## Licence

- **Code** (renderers, synthesis, tooling) is under the [MIT licence](LICENSE).
- **Content** (scripts, lyrics, treatments, docs and the rendered videos) is under
  [CC BY 4.0](LICENSE-CONTENT). You can reuse and adapt it if you credit Tollens Ltd and link back
  here.

Ideas credited to other people in [SOURCES.md](SOURCES.md) remain theirs. The credit goes with them.
Clawd, and the other makers' mascots and logos in the videos, belong to their owners; these
licences don't cover them.
