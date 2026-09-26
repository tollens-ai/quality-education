# Episode 1 video, first attempt: didn't work

Archived 2026-09-26. The first video for episode 1, "Who Lives Here?", and the process that made
it. Kept as a record of an approach that failed, not as a template. The song, lyrics, captions,
beat map and teaching plan were not part of the failure and stay in
[episodes/](../../episodes/01-you-never-told-me.md) and [music/](../../music/README.md).

## The verdict (Qing, 2026-09-26, verbatim)

> I'm kind of disappointed in the first one - it jumps around so much it makes me dizzy, I can't
> tell what's happening, some of the text is spoiling future lyrics so they don't land, and the
> art style is simplistic rather than beautiful. I think I over managed you. can you archive that
> build and that process as "didn't work" and we'll start over with a different prompt?

Then:

> I think our mistake was trying to make a slop tiktok rather than an artsy music video

## What's here

| Path | What it was |
|---|---|
| [storyboard.md](storyboard.md) | The one-shot storyboard: a cutaway tower block at night, the camera riding a glass lift between floors |
| [process-storyboard-guide.md](process-storyboard-guide.md) | The process, formerly `.claude/skills/write-episode/storyboard.md`: teaching inventory, a world-rule concept funnel judged blind, treatments, beat jobs, a grey-box animatic, and a section-by-section build |
| [episode-notes.md](episode-notes.md) | The concept funnel's results, the post text and the liner notes, moved out of the episode file |
| [code/](code/) | The renderer scenes (Canvas 2D), formerly `video/ep01/who/`. They import `../../lib/stage.js`, so they no longer run from here; check out commit `f2acaa4` to render them |

The renders and the funnel's working files are local only (`.private/archive/ep01-video-v1/`).

## Why it didn't work (my reading, not Qing's)

Each of Qing's four points traces to a choice in the process:

- **Dizzy.** The one-shot rule ruled out cuts, so every change of attention became camera travel:
  up and down a lift shaft, in and out of flats, at zooms that changed every few seconds. Nobody
  checked it for motion comfort, because every screening looked at 1 fps contact sheets. Those
  show composition, but not how movement feels.
- **Can't tell what's happening.** The world carried a five-rule visual grammar (flats are people,
  gold is value, orange is Clawd, ink is you, the blind is you), plus a directory board, a quota
  tube and name plates. That was dense on paper. At speed, with the camera moving, it was a
  puzzle.
- **Text spoiling the lyrics.** From the first frame, the ticket's printed boxes read FOR · GOOD =
  · DON'T NEED · COST · FOR YOU, and the directory board listed the people. Both were planted as
  set-ups, but they put the song's answers on screen before they were sung.
- **Simplistic art.** Effort went into process (funnels, judges, handoff geometry, six parallel
  builders) instead of craft on the picture. Flat Canvas 2D shapes, split across six builders
  working to a shared plan, gave consistency but no artistic voice. The guide said visuals win
  every second, but no stage of the process tested for beauty.
- **Over-management.** The guide piled up rules, gates and quoted constraints until satisfying
  them became the job. The checks were mechanical (continuity, sync, legibility, truth) and they
  all passed. The things that failed were judgement: comfort, clarity, surprise and beauty. Only
  watching it at speed catches those.

## What to carry forward

- The song, the lyrics, the teaching plan and the fact-checks.
- `video/lib/` (the headless render and contact-sheet tooling) is generic and stays.
- As lessons, not rules: watch motion at real speed, not as stills; keep the song's answers off
  screen until they're sung; judge beauty directly.
