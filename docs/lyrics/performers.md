# Writing for the chosen performer

Detailed guidance for [lyric craft](../../LYRICS.md). Dated expert observations remain
alongside the rules they support; episode examples illustrate their stated scope.

## Writing for the performer

Treat the performer, human or generator, as a collaborator with preferences, and write a song it
can actually perform (Qing, 2026-09-25: "we should write structures of songs that they can actually
perform [...] Together that's the best"). **Generate before the lyrics lock:** a generated track
is the fastest scansion check, because a clunky line or awkward join is audible straight away.

### Common phrasing rules

- **Within a section, sudoku the stresses harder.** Lines that answer each other should share a
  stress pattern and syllable count exactly — including in conversational or swing genres, and at
  joins *between* breathing phrases. Tighten the grid when takes are inconsistent, even if some
  manage it: on episode 4's Suno trial (2026-09-30), Qing found `"the dramas to notification line
  is a bit flaky"` and `"they can do it sometimes but it's obviously difficult"`. On episode 1
  (2026-09-25), tightening the stress match produced `"a consistent 8/10 good one"` (`"it works
  _better_ if we can sudoku the lyric stress patterns MORE, to match the intended phrasing"`):
  - `"So please tell me who it's for, please tell me"` → `"So please just tell me who it's for, so
    please just tell me"` (matches `"You didn't tell me who it's for, you didn't tell me"`
    syllable for syllable).
  - `"Just a toy and just for fun! / Fine if it dies when summer's done!"` → `"Just a toy, and only
    for fun! / Fine if it's gone, when summer's done!"` (`JUST a TOY and ON-ly for FUN` vs `FINE
    if it's GONE when SUM-mer's DONE`).
- **One sung phrase per line, and let storytelling verses breathe.** Break lines where the singer
  breathes (`"Did I do it wrong?"` / `"Oops, your quota's gone!"`), not where a rhyme scheme
  splits them. A storytelling verse can use full sentences; word compression is only needed to fit
  a fixed grid.

### Suno (active generator)

- **Suno can repeat a verse melody under new words when the beat grid matches exactly.** Qing
  confirmed this on episode 3 (2026-09-30). Match the intended beat placement, syllable counts
  and stress patterns in answering phrases; verify in the generated take before locking.
- **Punctuation steers the generator's phrasing.** A comma or question mark after the first word
  of a line (`Correct?`) made Suno pause there and lose the rhythm; taking it out fixed the take
  (Qing, 2026-09-29: `"I had to remove the punctuation after correct to get the rhythm right"`).
  Keep real punctuation on the lyric sheet and captions, and drop marks that split a line in the
  generator copy.
- **Starting defaults to try for Suno prompts and generator copy** *(verify against actual takes)*:
  keep the Style prompt global (genre, tempo, instrumentation, vocal character, mix) and put
  section-specific shifts in section tags so they don't bleed across the whole song; start Take 1
  with ordinary spellings and only respell a word after a take mispronounces it; omit speaker
  labels inside parentheticals (`(ooh)`, not `(Trio: ooh)`); and soften pause-inducing mid-line
  punctuation (`—`, extra commas) in the generator copy.

## Generating the song (MiniMax)

Preserved from episode 1 (2026-09-24 to 2026-09-26). Use these only for MiniMax; they do not
constrain Suno or human singers.

- **Structure workaround (2026-09-25):** Contrasting verses avoided MiniMax's trouble reusing a
  melody under changed lyrics. Pre-choruses and choruses repeated word for word, story progression
  moved into the pictures, and the resolution became a separate outro. Exact within-section stress
  matching (Qing, 2026-09-27: `"the key thing for minimax is that syllable stress matches need to
  be exact"`) then yielded the chosen `"consistent 8/10 good one"` (2026-09-25).
- **Tag sections with MiniMax's names.** Write `[Pre-Chorus]` with a hyphen; `[Pre Chorus]`, as
  the API docs spell it, didn't work.
- **Respell tricky words when the take mispronounces them.** Acronyms and jargon such as "2FA"
  and "Kubernetes" needed sounded-out spellings in episode 1’s generator copy (keep real spelling
  on the lyric sheet and captions). Spellings that worked (2026-09-25): `"Two eff ay"` (2FA),
  `"Cuber Netease"` (Kubernetes), `"Twelve sub agents"`, `"de bugging"`, `"Dye ags"` (Diags).
  Splitting a compound into separate words fixes most stress errors.
- **Held-note workaround:** Dashes (`who-----`), asterisks and extra vowels (`whooo`) all failed
  and distorted neighbouring words. Filling the space with a backing-vocal answer (`Make it good
  for who? (ooh-ooh-ooh)`) worked (Qing, 2026-09-25: `"clear rhythms that are easy to deduce are
  better"`).
- **Expect uneven takes.** Each generation got different sections right (a good chorus on one, a
  good verse 2 on another); stitching best sections in production was the fallback.
- **Don't count on an accent.** Asking MiniMax for a British accent didn't work (`"always came out
  sounding like a vague mix between Taylor swift and every other girl singer"`, Qing, 2026-09-26).
  Leave accent out of the style prompt and check rhymes in General American (see
  [rhythm and rhyme](rhythm-and-rhyme.md#rhythm)).
