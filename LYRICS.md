# Lyric craft

How to write lyrics for the series. The rules come from Qing's notes on episode 1 (2026-09-24);
she has written a lot of parody lyrics. Writing a lyric is like a sudoku: every line constrains the
others. Add a rule here whenever a fix teaches one.

## Meaning first
- **Rhyme and scansion serve the meaning.** The classic failure is working hard at rhyme and
  scansion until the meaning is diluted. If a line needs explaining ("put a lock on your water
  log"), rewrite it. You're allowed to add words or verses.
- **Pack in as much information as possible.** Workshopping drifts towards lines that recap,
  repeat or fill. Every line should teach something new. When a repeated section's second half
  changes, use the change to introduce new ideas (new tradeoffs, say), not to recap the verse.
- **Every phrase must be a real phrase.** "Test it through" rhymes but isn't English, so listeners
  stumble on it.
- **Say what was learned.** A line like "learned from everyone online" is weak until it says
  *what*: "I learned to code from all of you".
- **Check for mishearings.** Listeners heard "that's what product's for" as "that's what *the*
  product's for", which is the opposite of the point. Say each line aloud, fast, as a stranger
  would hear it.
- **Quotes vanish when sung.** Put someone else's view in the lead's mouth and it sounds like
  the singer's own view. Attribute it in the words ("most left the users at product's door"), or
  give it to another voice.
- **Fact-check the jokes too.** Summary docs don't burn much quota; subagents running round the
  clock do. Blame the thing that's actually true, and keep the in-joke in the picture instead.
- **Don't hand the viewer a job that isn't theirs.** "Tell me what can break" asked the user to
  name failures. Nobody reads it as "tell me your tradeoffs".
- **Keep the expert's hook words.** Where a word she chose also rhymes ("want" with "prompt"),
  it's usually the right one.

## Rhythm
- **Budget syllables to the slot.** See the song-fit limits in the
  [write-episode skill](.claude/skills/write-episode/SKILL.md): at 170 bpm, a 3-second row holds
  8 to 12 sung syllables. Pop-punk wants strong end rhymes; the tag is the one place a half rhyme
  is fine.
- **Borrow a rhythm template.** Name a known song whose rhythm the verse follows (verse 1 of
  episode 1 is the "We Didn't Start the Fire" verse rhythm) and fit every line to it. Write the
  template in the script.
- **Pickups only open a section.** A line that starts on an unstressed upbeat ("con-FET-ti") can
  only be the first line. Lines that start on the downbeat ("KU-ber-NE-tes") go after it.
- **Match the ending stress.** Rhyme words should land with the same stress pattern: "GYM LOG"
  with "BLOG" works; "GYM LOG" with "BAK-ing BLOG" bumps. Shorter is often the fix: "Kubernetes for
  your blog" scans where "Kubernetes for your food blog" doesn't.
- **Line length is the first suspect.** When a line drags, cut a word before rewriting it. When it limps, count against the
  template: "Bot for the group chat? Make it fun" didn't scan; "Group chat bot? Make 'em laugh" was a
  syllable short; "Group chat bot? Just make 'em laugh" fits the seven-syllable pattern. Likewise "A
  launch demo?" limped and "Product demo?" fits.

## Structure
- **Verses share a shape.** If verse 1 is four example lines and then a tag, verse 2 is too.
  Episode 1: four examples on one vowel, a two-line tag that rhymes with itself, then one spoken
  line that hands on to the next section.
- **A tag breaks the pattern to wind into the next section.** It doesn't need a full rhyme;
  echoing the verse's vowel is enough ("Did I do it wrong? / Oops, your quota's gone! / Guess I
  didn't ask.").
- **One example per line.** Each line is a different app or person. That gives the picture more
  to play with, and it makes the pattern the point.
- **Rhyme on a vowel family.** A whole verse can rhyme on one vowel: floss, log, blog, clock, wrong,
  gone. Note the accent: fast, last, laugh, pass rhyme in British English but not American. The
  synth voice's accent has to match the rhymes.
- **Put each idea where it belongs.** When two sections both want a line ("I'm someone too"),
  keep it in the one where it pays off, and don't let it leak into the other.

## Checking
- **The model can't hear.** Stress within a word is reliable (it's dictionary knowledge).
  Syllable counts slip on words that stretch or squash ("every", "summary"). Where stresses land on
  the beat is the weakest skill of all. A pronunciation dictionary doesn't fix this: CMU lacks
  "Kubernetes" and "2FA", stresses every one-syllable word, and counts "every" as three syllables.
  So:
  - Write a beat grid for each verse: syllables on eighth notes, stresses in capitals, bars split
    with `|`.
  - Get a human ear (Qing's) on every rhythm change.
  - Once the synth exists, sing the grid on a click and listen.
- **Re-read the whole sheet after every fix.** Lyrics interlock: changing one line can break a
  rhyme, a mirror in the other verse, or a callback.
