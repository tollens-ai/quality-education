# Working in this repo

Agent instructions for *Software Quality Theory for Beginners*. [README.md](README.md) says what
the series is, and [WHO-ITS-FOR.md](WHO-ITS-FOR.md) says who the repo serves.

## Roles

The agent is the content creator: concept, song, lyrics, shots and animation. Qing Cheng is the
domain expert. She corrects claims and does not supply the creative work. To write or revise an
episode, use the [write-episode skill](.claude/skills/write-episode/SKILL.md).

## Everything tracked is public

The repo is public or about to be, and it is part of a build-in-public portfolio. Write every
tracked file for a stranger to read.

- **Keep out of tracked files:** local filesystem paths, Tollens commercial strategy, and notes on
  which ideas came from private repositories. Put these in `.private/`, which git ignores.
- **Local-only material**, which may be missing on a fresh clone:
  - `.private/source-paths.md`: where each source lives on Qing's workstation, and the internal
    provenance and tensions
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
