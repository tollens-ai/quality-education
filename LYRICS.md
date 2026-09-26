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
- **Use the words people actually say.** Don't swap in a near-synonym just to make a rhyme work.
  People say an agent "deleted my files", not that it "wiped what you own"; they say "keeps your
  data safe", not "keeps your data locked". If the natural phrase won't rhyme, rebuild the line
  around a different natural phrase. Prefer the international word when it costs nothing ("works
  on a train", not "works on the Tube").
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
- **A transformation line must be true.** "Now you've told me who it's for" claims the viewer has
  changed, and they probably haven't. A plea ("So please tell me who it's for") is honest, and
  the picture can show the hoped-for answer.
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
- **Unstressed upbeats are fine anywhere.** The exception is a list of lines that start on the
  downbeat: there a line that starts on an upbeat ("con-FET-ti") has to go first, or it breaks
  the run.
- **At patter speed, keep the template and let a stress bend.** "2FA on your gym log" in
  straight eighths puts the stress on "your". Squeezing "on your" into sixteenths to fix it broke
  the "Fire" rhythm; sung that fast, the bent stress goes by unnoticed and the rhythm carries the
  line (Qing, 2026-09-24).
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
- **Each example carries its own context.** Examples are heard out of context, so each line has
  to say where it is. "2FA to use your gym log" names the app; "No signal: did it save the set?"
  doesn't say gym, so "the set" means nothing (Qing, 2026-09-26: "the examples have to stay
  examples and because they're out of context they have to make the context clear").
- **One example per line.** Each line is a different app or person. That gives the picture more
  to play with, and it makes the pattern the point.
- **Rhyme on a vowel family.** A whole verse can rhyme on one vowel: floss, log, blog, clock, wrong,
  gone. Note the accent: fast, last, laugh, pass rhyme in British English but not American, and
  the generator won't sing British (see *Generating the song*). Choose rhymes that work in a
  General American pop accent.
- **Hard-to-rhyme words go inside the line.** When an important word won't rhyme ("rogue"), keep
  it and move it inside the line, where it can still take a stress. Rhyme on an easier word: "No
  rogue agent wipes what you own?" Don't swap out the word people actually use.
- **Keep allusions open.** When a word is there to call up something in the news ("going rogue"
  and the agents that broke out of eval environments), keep the word people use and don't narrow
  it ("running on its own" pins it to one meaning). Let the picture drop the hint.
- **Name concrete constraints, not categories.** "Works on the Tube" teaches more than "offline
  support". Check the concrete version doesn't just restate an earlier line ("loads before you
  blink" is "fast to run" again).
- **The payoff phrase goes last, once.** In a section built to land a phrase, hold it back for
  the final line and don't spend it earlier. Episode 1's bridge used "who's it for" in lines 2
  and 4; now it only closes the bridge, held ("who it's fo-o-or?").
- **Name the singer's real source, not a crowd.** "I learned to code from all of you" was limp.
  "I could only learn from my training set" is concrete, true for an agent, and rhymes with
  "test".
- **Put each idea where it belongs.** When two sections both want a line ("I'm someone too"),
  keep it in the one where it pays off, and don't let it leak into the other.

- **The singalong question is the chorus.** The shortest, most shoutable phrase with open vowels
  ("Good for who-o-o? Good for wha-a-at?") is the chorus, even if it was drafted as a pre-chorus.
  The complaint that builds tension goes before it, and the band can stop dead at the end of the
  pre-chorus so the chorus crashes in.
- **Repeat the hook; vary the second half.** Every chorus repeats the hook. Its second half
  changes each time and moves the argument on (episode 1: the tradeoffs the gags showed, then
  the ones nobody briefs, then the agent-facing ones). Each chorus is sung twice, so each needs two second
  halves, and the second one adds new tradeoffs rather than restating the first.
- **The last chorus can answer the hook.** Episode 1 asks "Good for who? Good for what?" three
  times; the last chorus answers it ("Good for you! Good for that!") and its second half turns
  from questions to exclamations. Keep the same sounds so the singalong still works.
- **Use standard form, and fold stray sections into it.** Verse, pre-chorus, chorus, twice, then
  bridge, breakdown and a final chorus. A section that doesn't repeat and isn't the bridge is
  usually in the wrong place: episode 1's post-chorus became its bridge.
- **Mark held notes.** Write melismas the way they're sung ("who-o-o") so the synth gives them
  several notes.

## Process
- **Lyrics before storyboard.** Work on the lyric sheet, noting only the key frames a line
  depends on. Rebuild the storyboard once the lyrics are locked; before that, every lyric change
  throws storyboard work away. This applies to conversation too: lyric options come with no
  pictures, shots or timings unless the line can't be understood without one.
- **Bring the expert whole options.** Two or three finished lines to choose between, each with
  what it covers and what it costs, and a recommendation. Not open questions.

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

## Writing for the performer
Treat the performer, human or generator, as a collaborator with preferences, and write a song it
can actually perform (Qing, 2026-09-25: "we should write structures of songs that they can actually
perform [...] Together that's the best"). For a lyrics-to-song generator, that means:
- **Contrasting verses.** Each verse can have its own shape and rhythm. Don't force verse 2 onto
  verse 1's grid; that syllable-matching puzzle is what generators can't do.
- **Repeat the pre-chorus and chorus word for word.** Carry the story's progression in the
  pictures, not in new chorus lyrics. A generator repeats a section well; it can't reliably reuse
  a melody under new words.
- **Resolution goes in an outro,** written as its own section.
- **Let verse lines breathe.** A storytelling verse can use full sentences; word compression was
  only ever needed to fit a fixed grid.
- **Within a section, sudoku the stresses harder.** Contrasting verses don't need to match each
  other, but lines that answer each other inside a section should share a stress pattern and
  syllable count exactly. The more obviously the syllables fit, the easier the generator finds
  the phrasing. It still isn't guaranteed. Qing (2026-09-25), after the first consistent take:
  "it works _better_ if we can sudoku the lyric stress patterns MORE, to match the intended
  phrasing". Her edits between the semi-decent copy and that take:
  - "So please tell me who it's for, please tell me" became "So please just tell me who it's for,
    so please just tell me", which matches "You didn't tell me who it's for, you didn't tell me"
    syllable for syllable.
  - "Just a toy and just for fun! / Fine if it dies when summer's done!" became "Just a toy, and
    only for fun! / Fine if it's gone, when summer's done!": JUST a TOY and ON-ly for FUN against
    FINE if it's GONE when SUM-mer's DONE.
  - "Ship it now or room to grow?" became "Ship it now, or polish it slow?", mirroring "Fast to
    run, or sturdy or cheap?" above it.
  - "(matters, matters)" became "(matters, matters, matters)", three hits like "and me! and me!
    and me!".
  - "And for us, keep the dye aggs neat!" became "And for us keep dye aggs neat!", seven syllables
    like the rest of verse 2.

## Generating the song (MiniMax)
Qing's findings from the first generations of episode 1 (2026-09-24):
- **Generate before the lyrics lock.** A generated track is the quickest scansion check: a
  clunky line is audible straight away.
- **Tag sections with MiniMax's names.** Write `[Pre-Chorus]` with a hyphen; `[Pre Chorus]`, as
  the API docs spell it, didn't work.
- **Spell tricky words as they're said.** Acronyms and jargon ("2FA", "Kubernetes") come out wrong
  unless they're spelled phonetically in the pasted lyrics. Keep the real spelling on the lyric
  sheet and in the captions; only the generator's copy changes.
- **Spellings that worked** (Qing's copy for episode 1, 2026-09-25, kept in the episode file):
  "Two eff ay" (2FA), "Cuber Netease" (Kubernetes), "Twelve sub agents", "de bugging",
  "Dye ags" (Diags). Splitting a compound into separate words fixes most stress errors.
- **One sung phrase per line.** Break lines where the singer breathes ("Did I do it wrong?" /
  "Oops, your quota's gone!"), not where the rhyme scheme would put them.
- **Don't write long holds; write rhythms the generator can deduce.** Dashes ("who-----"),
  asterisks and extra vowels ("whooo") all failed to make MiniMax hold a note, and extra vowels
  distorted neighbouring words. What worked: fill the space with a backing-vocal answer
  ("Make it good for who? (ooh-ooh-ooh)"). Qing's lesson (2026-09-25): "clear rhythms that are
  easy to deduce are better."
- **Expect uneven takes.** Each generation gets different sections right (a good chorus on one, a
  good verse 2 on another). Keep the best sections of each; stitching takes together in
  production is the fallback.
- **Britishisms are fine; British rhymes aren't.** Qing: "it's still my song" (2026-09-26). Keep
  British words and idioms; just don't rely on a British vowel for a rhyme.
- **Don't count on an accent.** Asking MiniMax for a British accent didn't work: it "always came
  out sounding like a vague mix between Taylor swift and every other girl singer" (Qing,
  2026-09-26). Write rhymes that hold in a General American pop accent, and leave the accent out
  of the style prompt.
- **Outcome for episode 1:** once the song was restructured for the performer (repeated
  pre-chorus and chorus, contrasting verses, backing vocals instead of holds), MiniMax gave
  semi-decent takes, none good throughout. Tightening the stress patterns within each section
  (see "Writing for the performer") then gave "a consistent 8/10 good one" (Qing, 2026-09-25),
  and that take is the episode's song.
