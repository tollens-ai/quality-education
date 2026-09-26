# Episode 1 video, v3: "The Pier"

The third video for "Good for Who?". The first two are archived in
[archive/ep01-video-v1/](../archive/ep01-video-v1/README.md) and
[archive/ep01-video-v2/](../archive/ep01-video-v2/README.md).

Qing's brief for this one (2026-09-26): "pull all the stops out and make a gorgeous animated music
video. no reviewer committees, just you and your taste and your work". So this was made by one
auteur, with no committee.

## The idea

**Clawd & the Bots play a British seaside pier at night.** The song is a band's complaint, so the
video is a gig: Clawd sings, Molty plays guitar, Grok's bot drums, the OpenAI bot plays bass and
Jolly, Muse's mascot, plays keys.

The world follows the lesson. Clawd starts in the dark, building with no context. The lights come
on when the chorus asks who it's for. Then the people arrive, the reasons come clear, and it ends
in daylight.

- **Verse 1 happens in the dark.** Clawd over-builds alone in a black studio with a glossy floor:
  confetti cannons and a disco ball for a flossing habit, a bank vault on a gym log, a container
  port for a blog with one view, twelve copies of itself round a clock. Then the quota runs out,
  and the power with it.
- **The chorus turns the pier on.** It plays to an empty pier, with one seagull. The questions
  hang on a fairground sign (WHO? WHAT?), and the trade-offs are fairground props:
  - a lit triangle of FAST, STURDY and CHEAP that yanks Clawd from corner to corner
  - a firework (wow) against a lighthouse (keep)
  - a paper boat launched off the pier (ship it now) against a ship in a bottle (polish it slow)
  - a cone of chips for the gull (does what they need) against the whole pier going off (steals
    the show)
- **Verse 2 is a row of beach huts,** opening like an advent calendar, one person per line.
- **Chorus 2 fills the pier.** The same questions come back, and each person pulls a different
  way.
- **The bridge is a sky whose stars are everyone's code,** pouring into Clawd. People throw
  their code over a harbour wall without looking. Clawd climbs up with a lantern and finds
  everyone on the other side.
- **The break lights the definition in bulbs** across the pier's gateway, with the credit on a
  plaque. Everyone under it lights up on "matters", and the bots pile in on "and me!".
- **The final chorus is at sunrise, and you answer.** Each device from chorus 1 comes back and
  settles: WHO? flips to ME!, WHAT? to ONE TAP!, WHO? to YOU TOO! (for Clawd). Then the gym log
  gets built right and the brief is held on screen.
- **The outro is summer, by day.** The app does its one job. Clawd builds a sandcastle, and the
  tide takes it at sunset. That's fine: it was a toy.

## Scenes

| Time | Section | Picture |
|---|---|---|
| 0:00 | Intro | Your laptop in the dark: `> make it good`. Clawd peeks over the screen, then leaps up. A Ferris wheel glows far off, out of focus. |
| 0:04 | Verse 1 | Confetti cannons around a habit tracker; the vault and chains on the gym log; containers stacking on a one-view blog; twelve subagents round a clock, throwing SUMMARY.md files |
| 0:15 | Verse end | Everything it built, crowding the dark. The quota battery drains, the power cuts, and only Clawd's eyes are left. "Guess I didn't ask!" |
| 0:20 | Pre-chorus | Clawd holds up the slip under the giant profile of your head, where what you want glows, blurred. The torch can't get in. It reads the three words through a magnifier |
| 0:27 | Chorus 1 | The pier switches on, the band plays to nobody, and the trade-offs play out as props |
| 0:50 | Verse 2 | Eight beach huts: the founder's demo, the baker's till, the joke bot, the 3am student, Nana's one-button phone, a blind user and their guide dog, the agents' data hatch, and Clawd's own hut with tidy diagnostics |
| 1:12 | Instrumental | Pull back along the whole row |
| 1:16 | Pre-chorus 2 | Everyone round Clawd with their thought bubbles, until its eyes spin |
| 1:23 | Chorus 2 | The pier is packed, with the hut people in the front row |
| 1:46 | Bridge | The code sky, the wall, the climb, the reveal |
| 2:09 | Break | SOFTWARE QUALITY IS VALUE TO SOMEONE WHO MATTERS, in bulbs |
| 2:22 | "I'm debugging this with you" | Your hand and Clawd catch a glowing bug in a jar |
| 2:27 | Final pre-chorus | First light. Clawd holds out a blank slip and a pencil; you start typing |
| 2:40 | Final chorus | Sunrise. Every question answered, then the brief and the app |
| 3:05 | Outro | Summer, the sandcastle, the tide, sunset |

## The brief on screen at the end

> a gym log. just for me.
> for: me, mid-set, sweaty hands
> good = log a set in one tap
> fast to open, cheap to run
> a 🔥 when I beat my best
> skip: 2FA, Kubernetes, confetti
> ship it by Monday
> for you: tidy diags, ask if unsure

## Liner notes

**What it is.** A 3:21 music video, 1080×1920 at 30 fps. Every frame is drawn in code by Claude
Opus (Canvas 2D in headless Chromium, as a pure function of the song's time). The code is in
[`video/ep01/pier/`](../video/ep01/pier/). The song is our lyrics, sung by a MiniMax generation
Qing chose.

**How it moves with the record.** `video/ep01/pier/tools/analyse.py` measures the take:
- the bar grid
- the kick
- the vocal, as the take minus Demucs's instrumental stem

Every character grooves on the beat, the camera breathes with the kick, and Clawd's mouth opens
with the vocal. Captions come from Whisper's word times, and each word appears on its sung onset.
Only the intro's first phrase shows ahead of the voice: it's the prompt you typed.

**How it was checked.**
- Stills of every shot at full resolution, reviewed four at a time.
- Frame strips at 10 to 30 fps across the moments that move, such as the leap, the confetti, the
  lights coming on, the hut swipes and the sign flips.
- Frame-to-frame motion measured for every second of each preview render, to find stretches that
  had gone static. The first preview had 78 near-still seconds out of 201; the last has 32, most
  of them in calm moments: the dark "Guess I didn't ask", the start of the bridge, the reveal, the
  debugging, the plea, the held brief, the sandcastle and the ending.
- Fixed from what the stills showed:
  - captions under the moon
  - characters in the bottom UI zone
  - a flame that read as a water drop
  - a sign word spilling off its board
  - people floating on the horizon
  - a caption word stranded on its own line

**The bots' marks.** Following [research/bot-marks.md](../research/bot-marks.md), corporate marks
are never redrawn. Grok's bot and the OpenAI bot are our own robots, and each wears its owner's
mark as an unaltered badge. Grok's mark is also on the kick drum. Muse's logo is on Jolly's
headphones in its own colours. Molty is drawn from OpenClaw's open-source SVG.

**Where it falls short.**
- **No human has watched it at speed yet,** and the model can't hear the song. Sync and feel
  need Qing's eyes and ears.
- **Clawd's lip-sync follows loudness, not the actual sounds,** so it reads as singing, not as
  the words.
- **Jolly is redrawn in the video's style.** Meta's terms forbid modifying their assets, and the
  research asked for him to be drawn faithfully. This is the one mark-related call Qing should
  make: keep him, or swap him for the Muse logo on a card.
- **Some frames are busy** (the verse-1 recap of everything Clawd built). **Some put characters
  in the bottom 400 px,** where platform UI can cover them.
- **The code-sky fragments are texture,** too small to read on a phone.
- **It's long for X:** 3:21.
