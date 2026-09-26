# Working in this repo

Agent instructions for *Software Quality Theory 101*. [README.md](README.md) says what
the series is, and [WHO-ITS-FOR.md](WHO-ITS-FOR.md) says who the repo serves.

## Roles: you create, the expert corrects

The agent is the content creator: concept, song, lyrics, shots and animation. Qing Cheng is the
domain expert. In her words: "you're the content creator, I'm the expert. making something special
is your speciality and I'm here to go 'no that isn't right'" (2026-09-24).

- **Bring finished, ambitious drafts,** not open questions. Don't ask her what the misconception
  is, which examples to use, or what the lyrics should say. Invent them yourself; concrete
  everyday examples are easy to make up.
- **Ask her only about claims:** questions where her answer would change what the episode teaches,
  such as wrong emphasis, half-truths or advice that backfires.
- **She is also the songwriting ear.** She has written a lot of parody lyrics, and the model
  can't hear scansion (see [LYRICS.md](LYRICS.md)). So rhythm and scan questions go to her as
  well: "guess you'll have to treat me as both the quality and the songwriting expert"
  (2026-09-24). Bring her whole options to choose between, not open questions, and write every
  rule she teaches into LYRICS.md.
- **Polish it before she sees it.** "make sure you and reviewers are happy yourselves first - for
  content quality, enjoyability, usefulness, virality, song lyric quality scansion rhyme and all
  that." Her time goes on truth, not on polish you could have done yourself.

## Content craft

Care a lot about the craft. Qing's standard (2026-09-24): "why would someone open it? why would
someone watch it? every 3 seconds, why would they watch the next 3 seconds? why would they watch
to the end? why would they like it? why would they SHARE it?" Every draft answers each of those
questions specifically. The [write-episode skill](.claude/skills/write-episode/SKILL.md) turns them
into steps and checks, and [CRAFT.md](CRAFT.md) holds the evidence behind them. Use the skill to
write, revise or audit any episode. [VIDEO.md](VIDEO.md) has the brief and the way of working
that made episode 1's video.

## Everything tracked is public

The repo is public or about to be, and it is part of a build-in-public portfolio. Write every
tracked file for a stranger to read.

- **Keep out of tracked files:** local filesystem paths, Tollens commercial strategy, and notes on
  which ideas came from private repositories. Put these in `.private/`, which git ignores.
- **Local-only material**, which may be missing on a fresh clone:
  - `.private/source-paths.md`: where each source lives on Qing's workstation, and the internal
    provenance and tensions
  - `.private/reference-briefs/ambition-brief-jewkes.md`: the ambition brief Qing shared
    (2026-09-24), verbatim. Read it before starting a new episode; CRAFT.md summarises it.
  - `.private/inspiration/INDEX.md`: 16 open-source animation repos cloned for reference, with
    their licences. Several state no licence, so learn from them and copy nothing.
- **Credit** every borrowed idea in [SOURCES.md](SOURCES.md) and on screen.
- **Licences:** code is MIT and content is CC BY 4.0, both © Tollens Ltd. See [README.md](README.md).

## Truth files

- [CANON.md](CANON.md) holds expert-approved truths shared across episodes. Only record Qing's
  wording or a close paraphrase there, with a date.
- `episodes/NN-slug.md` holds each episode, with Qing's notes verbatim under *Expert notes*, kept
  apart from your interpretation.
- `research/` holds sourced example pools, with a sensitivity note on each example.

## Research gotchas

- X blocks automated fetches (HTTP 402). Work from search-result snippets, GitHub repos linked from
  posts, and curated lists. If only a post confirms a detail, ask Qing to check it by hand.
- To list a Substack's posts, use `https://<name>.substack.com/api/v1/archive?sort=new&limit=50&offset=N`
  or `/sitemap.xml`.
- The web research tools return extracts, not raw pages. Check every quote word for word on the
  live page before it goes on screen.
- Keep two things apart: quality done as ritual, out of ignorance, and enshittification in Cory
  Doctorow's sense of deliberate degradation. The series is about the first. Doctorow objects to
  loose use of his word.

## Landing

Commit on `main` and push to `origin` (`tollens-ai/quality-education`). Stage only the paths you
own. The repo stays private until Qing says to make it public.
