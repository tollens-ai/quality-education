# Writing for the chosen performer

Detailed guidance for [lyric craft](../../LYRICS.md). Dated expert observations remain
alongside the rules they support; episode examples illustrate their stated scope.

## Writing for the performer
Treat the performer, human or generator, as a collaborator with preferences, and write a song it
can actually perform (Qing, 2026-09-25: "we should write structures of songs that they can actually
perform [...] Together that's the best"). Check what the chosen performer can do:
- **Suno can repeat a verse melody under new words when the beat grid matches exactly.** Qing
  confirmed this on episode 3 (2026-09-30). Match the intended beat placement, syllable counts
  and stress patterns in answering phrases; check the generated take before locking it.
- **MiniMax needed a different structure in episode 1.** Contrasting verses avoided its trouble
  reusing a melody under changed lyrics. Pre-choruses and choruses repeated word for word,
  story progression moved into the pictures, and the resolution became a separate outro
  (Qing, 2026-09-25). Keep this as a MiniMax workaround rather than a constraint on Suno or
  human singers.
- **Let verse lines breathe.** A storytelling verse can use full sentences; word compression was
  only ever needed to fit a fixed grid.
- **Within a section, sudoku the stresses harder.** Contrasting verses don't need to match each
  other (a template borrowed for one verse needn't bind the next), but lines that answer each other inside a section should share a stress pattern and
  syllable count exactly. This is the key thing for MiniMax, whatever the line structure (Qing,
  2026-09-27: "the key thing for minimax is that syllable stress matches need to be exact"). The more obviously the syllables fit, the easier the generator finds
  the phrasing. Check joins between phrases as well as answering lines. Keep the syllable and
  stress grid tight in generated patter, including in genres with flexible phrasing. Tighten
  the grid when takes are inconsistent, even when some manage it. Qing's Suno trial of episode 4
  (2026-09-30) found "the dramas to notification line is a bit flaky" and "they can do it
  sometimes but it's obviously difficult". It still isn't guaranteed. Qing (2026-09-25), after the first consistent take:
  "it works _better_ if we can sudoku the lyric stress patterns MORE, to match the intended
  phrasing". Her edits between the semi-decent copy and that take:
  - "So please tell me who it's for, please tell me" became "So please just tell me who it's for,
    so please just tell me", which matches "You didn't tell me who it's for, you didn't tell me"
    syllable for syllable.
  - "Just a toy and just for fun! / Fine if it dies when summer's done!" became "Just a toy, and
    only for fun! / Fine if it's gone, when summer's done!": JUST a TOY and ON-ly for FUN against
    FINE if it's GONE when SUM-mer's DONE.
## Generating the song (MiniMax)
Qing's findings from the first generations of episode 1 (2026-09-24):
- **Generate before the lyrics lock.** A generated track is the quickest scansion check: a
  clunky line is audible straight away.
- **Tag sections with MiniMax's names.** Write `[Pre-Chorus]` with a hyphen; `[Pre Chorus]`, as
  the API docs spell it, didn't work.
- **Respell tricky words when the take mispronounces them.** Acronyms and jargon such as "2FA"
  and "Kubernetes" needed sounded-out spellings in episode 1’s generator copy. Keep the real spelling on the lyric
  sheet and in the captions; only the generator's copy changes.
- **Punctuation steers the generator's phrasing.** A comma or question mark after the first word of a
  line (`Correct?`) made it pause there and lose the line's rhythm; taking it out fixed the take (Qing,
  2026-09-29: "I had to remove the punctuation after correct to get the rhythm right"). Keep the
  punctuation on the lyric sheet and drop what splits a line in the pasted copy, as with spellings.
- **Spellings that worked** (Qing's copy for episode 1, 2026-09-25, kept in the episode file):
  "Two eff ay" (2FA), "Cuber Netease" (Kubernetes), "Twelve sub agents", "de bugging",
  "Dye ags" (Diags). Splitting a compound into separate words fixes most stress errors.
- **One sung phrase per line.** Break lines where the singer breathes ("Did I do it wrong?" /
  "Oops, your quota's gone!"), not where the rhyme scheme would put them.
- **For MiniMax’s episode 1 holds, backing-vocal answers worked better than extra letters.** Dashes ("who-----"),
  asterisks and extra vowels ("whooo") all failed to make MiniMax hold a note, and extra vowels
  distorted neighbouring words. What worked: fill the space with a backing-vocal answer
  ("Make it good for who? (ooh-ooh-ooh)"). Qing's lesson (2026-09-25): "clear rhythms that are
  easy to deduce are better."
- **Expect uneven takes.** Each generation gets different sections right (a good chorus on one, a
  good verse 2 on another). Keep the best sections of each; stitching takes together in
  production is the fallback.
- **Britishisms are fine.** Qing: "it's still my song" (2026-09-26). Only the rhymes have to hold
  in General American.
- **Don't count on an accent.** Asking MiniMax for a British accent didn't work: it "always came
  out sounding like a vague mix between Taylor swift and every other girl singer" (Qing,
  2026-09-26). Write rhymes that hold in a General American pop accent, and leave the accent out
  of the style prompt.
- **Outcome for episode 1 (MiniMax):** once the song was restructured for the performer (repeated
  pre-chorus and chorus, contrasting verses, backing vocals instead of holds), MiniMax gave
  semi-decent takes, none good throughout. Tightening the stress patterns within each section
  (see "Writing for the performer") then gave "a consistent 8/10 good one" (Qing, 2026-09-25),
  and that take is the episode's song.
