# Music craft

How to make a song entirely in code: composed, arranged, synthesised, mixed and checked in
JavaScript, then rendered offline to a WAV file. The rules adapt standard songwriting, music theory
and production practice to code. Qing's brief (2026-09-24): "you'll need to figure out your own
'doing songs with javascript' best practices based on standard music writing and songwriting and
music production best practices", and "you'll need to map out the full song's rhythm and chord
sequences before you can go into generation - we need coherent rhythmic phrasing throughout".
[LYRICS.md](LYRICS.md) covers the words. This file covers everything else. Add a rule whenever a
fix teaches one. Numbers are starting points unless a source is given.

## Order of work
- **Map the whole song before making any sound.** Work in this order: song map, melody,
  arrangement, sound design, mix. Each stage is fixed before the next one starts. A sound-design
  change can't fix a phrase that's a bar too long, and it costs a re-render every time.
- **The map is a file, not a thought.** It holds tempo, key, time signature, and the form with a
  bar count for every section. Each bar gets its chord, its drum pattern, and every syllable placed
  on the grid. Episode 1: 180 bpm, E♭ major, 4/4, one bar = 1.33 s.
- **Phrases come in 2, 4 and 8 bars.** Lines are usually 2 bars and sections 8 or 16, and every
  chorus is sung twice. Any odd length (a 1-bar stop, a 2-bar extension) goes in the map with its
  reason. Otherwise the listener feels a stumble they can't name.
- **Name the rhythmic motifs and reuse them.** Give each line's rhythm an ID (A, A′, B) and write
  it in the map. Lines 1, 2 and 4 of a verse share motif A, and line 3 varies it. The verses match
  each other and the choruses repeat exactly. This is what "coherent rhythmic phrasing" means in
  practice, and the map is where you check it.
- **Write pickups as pickups.** A line that starts before the bar line ("and a", then ONE) gets its
  pickup notes written in the previous bar, so the first stressed syllable still lands on beat 1.
- **Stressed syllables go on strong beats.** Beat 1 is strongest, then 3, then 2 and 4, then the
  off-beat eighths. Unstressed syllables go on weak positions. Pattison calls this prosody: match
  stressed notes with stressed syllables. A syncopation that pushes a stressed syllable an eighth
  early is fine, but write it down as a deliberate choice.
- **Leave room to breathe.** Put at least an eighth-note rest between lines, and more before a
  high or long note. A synth voice doesn't need the air, but listeners expect gaps, and captions
  read better with them.
- **Map format** (illustration only; the real chords come from the chosen take):
  ```
  CHORUS 1a  bars 1-8  drums: open 8ths, crash on 1   chords: E♭ | B♭ | Cm | A♭ | ...
  bar 1  | GOOD for WHO-o-  | -o          | GOOD for WHAT  | (rest)
  motif  | H (hook)                       | H
  ```

## Pop-punk conventions
- **Tempo is 145–180 bpm, felt in 4.** "All the Small Things" is 150 bpm, "Sk8er Boi" 150,
  "Basket Case" and "good 4 u" about 170, "Misery Business" 173. Sheet music often gives half
  these numbers (85, 86) because it counts the half-time feel. Pick one convention and state it in
  the map.
- **Form:** intro (4–8 bars of the chorus riff), then verse, pre-chorus and chorus twice, then a
  bridge or breakdown, then a double last chorus. Songs are short and the intro gets to the voice
  fast.
- **Chords:** I–V–vi–IV and its rotations are sometimes called the "pop-punk progression" (Blink-182's
  "Dammit", The Offspring's "Self Esteem" as vi–IV–I–V). I–IV–V also works ("All the Small
  Things"). In E♭ major, I–V–vi–IV is E♭–B♭–Cm–A♭. Change chords once a bar, or every two bars in
  verses.
- **Guitars:** power chords (root, fifth and octave), down-picked eighth notes. Palm-mute them in
  the verse and let them ring in the chorus, as "All the Small Things" does. Add a lead line or
  octave riff only in the intro, the gaps between vocal lines, and the bridge.
- **Double the rhythm guitar and pan it hard left and right.** In a real studio, two separate
  takes differ slightly in attack and timing, and those differences make the width. In code,
  render two separate performances with different seeds, pluck noise and few-ms timing offsets.
  Never copy one track with a delay: that gives comb filtering, not width.
- **Bass follows the roots,** in eighth notes locked to the kick. It moves to the fifth or walks
  up only at section changes.
- **Drums by section:**
  - Verse: an eighth-note groove with kick on 1 and 3 (plus the "and" of 2 or 3), snare on 2 and
    4, and closed hats.
  - Chorus: open hats or ride, crash on the one of each 2- or 4-bar phrase, or the "skank" beat
    (Drumeo: "the double-time polka beat") for the biggest lift.
  - Breakdown: half time, with the snare on 3 only.
  - Fill in the last bar, or last two beats, before every chorus. Crash plus kick on the chorus's
    first beat.
- **Band stops land with the lyric.** Everything cuts at the end of the pre-chorus (see
  [LYRICS.md](LYRICS.md)), and the chorus crashes in on the one. The drummer's fill or a snare
  pickup goes into the gap, or it stays silent. Write the stop into the map.
- **Gang vocals** double the chorus hook and the shouted answers. There are 4 to 8 voices, each
  rendered separately with its own seed: ±10–20 cents of detune, ±10–30 ms of timing, a different
  vocal-tract length, spread across the stereo field, with the lead kept in the centre.
- **References:** Blink-182 "All the Small Things", "Dammit"; Paramore "Misery Business"; Olivia
  Rodrigo "good 4 u"; Avril Lavigne "Sk8er Boi"; Green Day "Basket Case". Pick one per song as the
  A/B reference and write it in the map.

## Melody
- **Keep the lead in a pop female range.** Hayley Williams covers F3–E♭5 on "Misery Business". For
  our voice, keep verses around B♭3–B♭4 and put the chorus peak at about E♭5. Episode 1's hook leaps
  to the high tonic, E♭5, which is the top of that range. Avoid holding notes in the A4–C5 break
  region for long unless the voice model handles it.
- **The chorus sits higher than the verse.** A corpus study of Billboard songs found chorus
  sections "louder, sharper and rougher" than others, with "slightly higher and more salient pitch".
  Timbre mattered more than pitch height, so lift the arrangement as well as the melody.
- **Verses talk, choruses sing.** Verses use repeated notes and steps in a narrow range, which suits
  list rhythms like "We Didn't Start the Fire". Choruses use longer notes, open vowels and a leap.
- **Leap to the hook, then step back.** Put the widest leap in the song (a fifth to an octave) on
  the hook word. Then turn and come down by step. Melodies across cultures do this, largely
  because a leap reaches the edge of the singer's range (von Hippel & Huron).
- **Leaps are seasoning.** A big leap only lands if the melody around it mostly moves by step
  (Qing: "it's like seasoning"). Keep the song's top note for the hook and its deliberate
  callbacks, and use a smaller interval elsewhere: in episode 1, "the octave tonic is a waste for
  'oops' when the fifth would do". `music/ep01/leaps.mjs` lists every leap of five semitones or
  more, with each section's share of steps.
- **Repeat the hook exactly; vary the rest.** The hook's melody and rhythm are identical every
  time; that's why episode 1 left MiniMax. Second halves and later verses vary one thing (the
  ending note, a pickup, one interval), not everything.
- **Strong-beat notes are chord tones.** Passing notes go on weak beats. Any clash with the bass
  on beat 1 has to be deliberate.

## Harmony
Roman numerals name each chord by its place in the key. In E♭ major: I = E♭, ii = Fm, iii = Gm,
IV = A♭, V = B♭, vi = Cm; borrowed from E♭ minor, ♭III = G♭, iv = A♭m, ♭VI = C♭, ♭VII = D♭.
Rock harmony is looser than classical harmony, but it isn't random. In a corpus of 100 classic
rock songs, chords on the roots I, IV, V, ♭VII and VI make up 87% of all chords (de Clercq &
Temperley). Any other chord is a marked choice, so write its reason in the map.

### Function and tension
- **Every chord has a job: home, leaving home, or pulling home.** I is the tonic, or home. The
  predominants leave home: IV and ii strongly, vi and iii weakly. The dominant, V, pulls back to I,
  and in rock ♭VII can do the same job. Classical phrases run tonic, then predominant, then
  dominant, and "harmonic functions do not progress right to left" (Open Music Theory). Rock
  loosens this: IV is the chord that most often comes both before and after I (de Clercq &
  Temperley). But a section that is meant to build still has to move its functions forward.
- **A pre-chorus builds; it doesn't arrive.** Leave the tonic early. Change chords faster than the
  verse did, and climb in the bass or the melody. End on an unresolved chord so the chorus lands as
  the answer. Summach lists harmonic progression and harmonic rhythm among the changes that
  "increase forward formal urgency" in a prechorus. Good last chords are V (a half cadence, the
  strongest pull), IV (the chorus then arrives by a plagal step), ♭VI–♭VII (the rock fanfare into
  I), or Vsus4. Any of these can take a band stop. Don't end on I, or on a chord that shares most
  of I's notes.
- **iii is the weakest chord in pop, so use it only in a line that is going somewhere.** It is
  rare: 1.9% of chords in the rock corpus, against 22.6% for IV. It shares two notes with I
  (Gm is G–B♭–D, E♭ is E♭–G–B♭) and two with V (B♭–D). So it sounds like a blurred tonic or a
  weak dominant, not a step away. It works in a falling sequence: Pachelbel's I–V–vi–iii–IV–I–IV–V,
  which Green Day's "Basket Case" (in E♭) closely follows. It also works at the start of a phrase
  heading for IV: the "puff" schema I–iii–IV, or I–III–IV with a major III in Radiohead's "Creep".
  In Hooktheory's analysis of about 1,300 popular songs, iii went on to vi or IV 93% of the time.
- **Example: episode 1's pre-chorus,** where Qing disliked the Gm bar. A♭–Cm–Gm–A♭–B♭–B♭ is
  IV–vi–iii–IV–V. It opens on a strong predominant, then drifts back through two weak ones before
  starting again on IV, so the build stalls for two bars. On the Gm bar the melody holds B♭, a note
  Gm shares with E♭, so the tonic seems to come early. Gm to A♭ is ordinary; the backward drift is
  the likely fault. Options that keep moving: IV–vi–ii–IV–V (A♭–Cm–Fm–A♭–B♭; over an F power chord
  the held B♭ is a sus4 that wants to move), or Cm held for two bars with IV–V doing the pushing.

### Progressions
- **Four-chord loops are the backbone, and each rotation reaches I differently** (Open Music
  Theory). They all use I, IV, V and vi:
  - I–V–vi–IV (Blink-182, "Dammit") and vi–IV–I–V (The Offspring, "Self Esteem"). With no V–I,
    the tonic can sound like I or vi, which suits a looping verse.
  - I–vi–IV–V, the "doo-wop" loop, approaches I from V. It sounds the most resolved.
  - IV–V–vi–I, the "hopscotch" loop, has been common since about 2010. Its opening, IV–V–vi, is a
    ready-made pre-chorus climb with a deceptive twist.
  - IV–I–V–vi ends on a deceptive V–vi (Lady Gaga, "Alejandro").
  - I–IV–V ("All the Small Things"). Rock prefers IV–V–I to jazz's ii–V–I: 352 against 63
    instances in the rock corpus.
- **Pick the loop for the section's job.** A verse loop shouldn't resolve hard, so it can repeat.
  A pre-chorus is a line, not a loop. A chorus puts I on its first downbeat.

### Borrowed chords
- **Borrow from the parallel minor for rock weight.** ♭VII is the fourth most common root in rock
  (8.1% of chords, in 37 of 100 songs) and "quite rare" in classical music (de Clercq &
  Temperley). The standard moves, all named in Open Music Theory:
  - ♭VII–IV–I, the "double plagal" (the coda of "Hey Jude").
  - The I–♭VII shuttle (The Kinks, "Tired of Waiting for You").
  - ♭VI–♭VII–I, the "Mario cadence", a victory fanfare and a strong way into a chorus.
  - IV–iv–I, the "plagal sigh", which is nostalgic ("Creep" runs I–III–IV–iv).
  - ♭III and ♭VI together: "Smells Like Teen Spirit" is i–iv–♭III–♭VI in F minor.
- **Borrowed chords come as a set.** ♭VII, ♭III and ♭VI turn up in the same songs, and II, VI and
  III in others (de Clercq & Temperley), so choose one palette per song. Check the melody against
  each borrowed chord's new notes: a D♮ in the tune clashes with D♭.

### Bass line and inversions
- **The bass is the second melody.** Write it out and sing it. Roots under every chord is the
  pop-punk default, and inversions let the bass walk by step. E♭–B♭/D–Cm–Gm/B♭–A♭ keeps the
  I–V–vi–iii–IV sequence but turns the bass into a falling scale.
- **Pedal points build tension without changing chord function.** Hold B♭ in the bass under
  A♭/B♭, then B♭, to wind up a pre-chorus. Hold E♭ under changing chords to keep a verse at home.
- **Check what a slash chord adds up to.** The guitar plays the chord's power chord and the bass
  plays the slash note. E♭5 over a G bass gives E♭/G, but B♭5 over G reads as Gm7.

### Harmonic rhythm
- **One chord a bar is the default; change the rate on purpose.** Verses can hold a chord for two
  bars. Faster changes build tension, so a pre-chorus may end with two a bar.
- **A pushed note belongs to the next chord.** In rock, an accented note just before a strong beat
  is heard as belonging to that beat (Tan, Lustig & Temperley). So a sung push on the `&` of 4
  must fit the next bar's chord. Either the band pushes with it (guitars, bass and crash on the
  `&`), or the old chord holds under a note that fits both. Write every push in the map.

### Melody against the chords
- **A held note counts against every chord it crosses,** as if it were on each strong beat.
- **Rock verses may float free of the chords; choruses lock to them.** Temperley found this
  melodic-harmonic "divorce" "usually in pentatonically based melodies, and in verses rather than
  choruses". So audit choruses strictly and verses more loosely.
- **With power chords, the melody or the bass supplies the third.** A power chord is "neither
  major nor minor"; under distortion, full triads turn muddy. Over E♭5, F (the 9th) and A♭ (the
  sus4) are colour. Over a full E♭ triad, a held A♭ grinds against G.
- **Avoid notes are a half step above a chord tone, held on a strong beat.** The usual ones are
  the 4th over a major chord (A♭ over E♭) and the ♭6 over a minor chord (A♭ over Cm). A keys or
  pad part that plays full triads brings back the third that the power chords left out. So drop
  the pad's third, or write the chord as sus, where the melody sits on the 4th.

### Voice leading
- **Power chords move in parallel; pads move by the smallest step.** Classical part-writing
  forbids parallel fifths, and power-chord rock is built on them. Pick each root's octave to keep
  the guitar within about five frets. A pad or keys part keeps common tones, moves its other
  voices by a tone or less, and sits above or below the lead's range, not inside it.

### Jazz ideas, used sparingly
- **Secondary dominants point at their target.** G major (V/vi) before Cm, or F major (V/V)
  before B♭. The raised note (B♮, A♮) is the pull. Use one or two in a song, where the lyric turns.
- **A key change needs its new V.** For a last chorus a tone up (E♭ to F), put C or Gm–C in the
  bar before. It's the pop cliché called the "truck driver's gear change", so use it knowingly.
- **Prefer a chromatic slide to a tritone substitution.** E7 for B♭7 slides the bass down a
  semitone into E♭ but sounds like jazz. A power chord a semitone off the target, on the `&`
  before it, gives the same slide.
- **The deceptive cadence (V–vi, B♭ to Cm) delays the tonic.** Use it at the end of a chorus to
  add a line, or once in the last chorus before the final I.

### Auditing a progression
1. Label every chord with its numeral and function (T, PD, D). Each build moves forward, and no
   strong predominant slips back to a weak one without a reason.
2. Flag every chord outside I, IV, V, vi and ♭VII, and write its reason in the map.
3. The pre-chorus ends off the tonic. Its chords change at least as fast as the verse's, and its
   bass or melody rises.
4. The chorus's first downbeat is I, or the song's strongest arrival, approached from V, IV or ♭VII.
5. Write out the bass line. Look for unplanned leaps bigger than a fifth, and slash chords that
   the guitar and bass disagree about.
6. Every strong-beat and held note is a chord tone, a 9th or sus4 over a power chord, or a written
   exception. No avoid note is held, and every pushed note fits the next chord.
7. The tension curve (function and rate of change per section) rises through the pre-chorus and
   resolves on chorus bar 1. The last chorus adds one new thing, not everything.
8. Checks 1–6 are mechanical and belong in `music/ep01/audit.mjs`; Qing judges the rest by ear.

## Sound design (synthesis in JS)
- **Kick:** a sine wave with a fast downward pitch sweep (about 150 → 50 Hz over 30–50 ms) and an
  amplitude decay of 200–400 ms. Add a 2–5 ms click from a noise burst or a quick filter opening
  (Sound on Sound).
- **Snare:** two sines at about 180 and 330 Hz, the drum's (0,1) mode. They decay fast. Add
  filtered noise on a slower envelope of 150–250 ms. A harder hit opens the noise filter wider
  (Sound on Sound).
- **Hats and cymbals:** six square waves at inharmonic ratios with no even multiples. Band-pass
  them around 3.4 kHz and 7.1 kHz and high-pass after that, as the TR-808 does. A closed hat
  decays in 40–60 ms, an open hat in about 300 ms, a crash in 1.5–3 s. A closed hat chokes an
  open one.
- **Distorted guitar:** use extended Karplus–Strong (Jaffe & Smith). Add an all-pass filter for
  exact tuning, pick position, and a loop low-pass that closes for palm mutes. Strum the six
  strings 5–15 ms apart. Then pre-EQ, then a `tanh` waveshaper at 4× oversampling, then a
  cabinet. The cabinet is a low-pass at 4–6 kHz plus a high-pass at 80–100 Hz, or a synthetic
  impulse response. Distortion without a cabinet sounds like a fizzing razor.
- **Bass:** Karplus–Strong or a band-limited saw through a low-pass, with light drive so it's
  audible on phone speakers. Tune the kick's resting pitch to the key.
- **Band-limit every oscillator.** A naive saw or square aliases into inharmonic whine on high
  notes. Use PolyBLEP or wavetables (Välimäki & Huovilainen), and oversample every nonlinearity.
- **Voice: formant synthesis first, an external voice as fallback.** A source–filter voice uses a
  glottal pulse through cascaded formant resonators, with parallel resonators for fricatives
  (Klatt 1980). Pink Trombone shows an articulatory model in JS. If the all-code voice fails the
  intelligibility check below, an external singing model can render the same score line by line.
  The score still owns the timing.
- **Consonants carry the words.** Vowels make the tone; plosive bursts, fricative noise (/s/ at
  about 4–8 kHz) and 30–60 ms formant transitions into the vowel carry the meaning. Most
  "robot with a cold" failures are missing or mushy consonants.
- **The vowel starts on the beat.** Singers put the vowel onset on the beat, and accompanists sync
  to it (Sundberg & Bauer-Huppmann). So each consonant is scheduled before the beat, by its own
  length. "Good" starts its /g/ burst early, and /ʊ/ lands on the grid.
- **Take vowel targets from the right accent.** Published formant tables (Hillenbrand 1995) are
  American. Our voice is British, so measure formants from a British reference, such as Qing's
  chosen take, and store them per vowel.
- **High notes need vowel modification.** At E♭5 (622 Hz) the pitch is above the first formant of
  /u/ and /i/. Sopranos raise the first formant to follow the pitch, and intelligibility drops
  anyway. On "who-o-o" at the high tonic, open the vowel slightly and let the consonant and the
  caption carry the word.
- **The pitch line needs overshoot, preparation, vibrato and fine fluctuation.** A singing-synthesis
  study found overshoot, the brief pass above the new note, matters most (Saitou et al.). Pop-punk
  also scoops up into notes from below. Vibrato runs at about 5–7 Hz, and solo singers usually keep it
  within a semitone either side of the note (Sundberg). Use it only late in held notes; a
  pop-punk lead is mostly straight.

## Engineering
- **One score drives everything.** The score is data: tempo map, sections, chords, notes, drum
  hits, and syllables with their phonemes. Audio, captions, animation cues, the click-and-guide
  render and the beat-grid docs are all derived from it. Nothing is timed by hand in two places.
- **Store time in beats; convert to samples once.** Use `sample = round(beat × 60 / bpm × 48000)`
  through the tempo map, and never add up float durations. At 180 bpm an eighth note is exactly
  8000 samples. At 170 bpm it isn't an integer, and accumulated rounding drifts audibly within a
  minute.
- **Render offline at 48 kHz in 32-bit float.** 48 kHz is YouTube's recommended audio rate and the
  video norm. Render each stem (drums, bass, guitar L/R, lead, gang) and the mix, so checks can run
  on stems. Dither only at the final bit-depth reduction.
- **Rendering is deterministic.** Use a seeded PRNG keyed by `hash(track, eventId)`, not one shared
  stream. Then adding a note doesn't reshuffle every random value after it. Render twice and
  compare hashes.
- **Humanise on purpose.** A professional drummer's timing wanders with σ ≈ 20 ms, and listeners
  preferred long-range correlated drift to white-noise jitter (Hennig et al.). Use a random walk
  or 1/f noise, not independent jitter per note. Keep it small at 180 bpm (σ 3–8 ms, with the
  kick and snare tightest) and write the amounts in the score header. Vary velocity with an
  accent pattern: hats loud on the beat and soft off it.
- **No clicks.** Give every envelope at least 2–5 ms of attack and release, except deliberate
  transients. Check for NaN, DC offset, and samples over 0 dBFS in every stem.
- **Picture follows sound.** Audio may lead picture by up to 45 ms or lag by up to 125 ms before
  viewers notice (ITU-R BT.1359). Show a caption word on the frame that contains its vowel
  onset, or one frame early, never late.

## Mix and master
- **Stage gain even in float.** Nothing clips inside the mix, but waveshapers and compressors
  respond to level. Normalise each stem to a fixed level before its effects. Mix so the mix bus
  peaks around −6 dBFS before the master chain.
- **Give each part a frequency slot.**
  - Kick: 50–100 Hz, plus click at 2–5 kHz.
  - Bass: 40–250 Hz, high-passed at about 35 Hz.
  - Guitars: high-passed at 80–100 Hz; body at 200 Hz–5 kHz.
  - Snare: body at 150–250 Hz, snap above 5 kHz.
  - Cymbals: above 5 kHz.
  - Lead vocal: owns 1–4 kHz. Cut the guitars 2–4 dB there rather than boosting the voice.
- **Pan:** kick, snare, bass and lead in the centre. Rhythm guitars hard left and right. Hats and
  toms slightly off-centre. Gang vocals wide.
- **Compress in buses, gently.** On the drum bus, add parallel compression for punch. On the mix
  bus, use 2:1 with 1–3 dB of gain reduction, a 10–30 ms attack and an auto release.
- **Master to −14 LUFS integrated, −1 dBTP.** YouTube turns down anything louder than about −14
  and leaves quieter material alone. AES TD1008 recommends −16 LUFS for music and a true peak no
  higher than −1 dBTP. TikTok, Instagram and X publish no targets; every online number for them is
  a guess. Use a true-peak limiter with oversampling. Pop-punk CDs are mastered much louder
  (around −8), and we don't chase that. If a test upload on X plays noticeably quieter than its
  neighbours, make a separate louder X export rather than squashing the master.

## Checking (the model can't hear)
- **Measure loudness.** Record integrated LUFS, loudness range and true peak for the mix and
  every stem (`ffmpeg -af ebur128=peak=true` or pyloudnorm).
- **Compare stems with the reference.** Separate the reference track with Demucs and measure each
  stem's loudness relative to its mix. Match ours within about 2 dB, especially the lead vocal
  and the kick.
- **Look at the spectrum.** Render spectrogram and long-term-spectrum PNGs for ours and the
  reference at matched loudness, and look at them. Check for bass mud, missing air, harsh
  2–5 kHz, and aliasing lines that fall as the notes rise.
- **Check onsets against the score.** Detect onsets in the drum stem and vowel onsets in the lead,
  and diff them against the event list. Drums should match to about 1 ms (anything more is a
  bug). Vowels should land within the humanisation budget.
- **Track the pitch back.** Run pYIN or CREPE on the solo vocal and compare it with the score in
  cents. Flag any note whose median error is over about 30 cents, outside the intended
  scoops and overshoots.
- **Run Whisper on the lead stem and on the mix.** Compute word error rate per line against the
  lyric sheet and list the misheard words. Whisper filled in "Diags" wrongly in every MiniMax take.
  Whisper guesses from context, so a pass is a floor, not proof that people will hear it.
- **Check small speakers and mono.** Sum to mono and high-pass at 200 Hz, as a stand-in for a
  phone speaker. The bass line and the lead should still be clear.
- **Render a click-and-guide for the human ear.** Before the full voice exists, render a click, the
  chords and a plain guide melody with the lyrics on screen. Qing checks the phrasing on that.
  It's cheap to fix at that stage.
- **A/B at matched loudness.** Match the integrated loudness of our mix and the reference before
  comparing. Louder always sounds better, so an unmatched comparison proves nothing.
- **A human ear is still required** for scansion and phrasing feel, groove, mishearings, whether
  the voice is pleasant or "robot with a cold", and final balance. Everything measurable is
  checked before Qing hears it, so her time goes on those.

## Sources
- Pattison on prosody: https://online.berklee.edu/takenote/prosody-in-music-and-songwriting/
- "All the Small Things" (150 bpm, C, I–IV–V, palm-muted verses): https://en.wikipedia.org/wiki/All_the_Small_Things
- "Misery Business" (173 bpm; F3–E♭5): https://en.wikipedia.org/wiki/Misery_Business
- "good 4 u" (85 bpm in sheet music): https://en.wikipedia.org/wiki/Good_4_U
- "Sk8er Boi" and "Basket Case" tempi: https://songbpm.com/@avril-lavigne/sk8er-boi, https://songbpm.com/@green-day/basket-case
- I–V–vi–IV as the "pop-punk progression": https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression
- Drumeo, punk drumming and the skank beat: https://www.drumeo.com/beat/a-drummers-guide-to-punk/
- Double tracking: https://en.wikipedia.org/wiki/Double_tracking
- Van Balen et al. 2013, "An analysis of chorus features in popular song", ISMIR: https://webspace.science.uu.nl/~veltk101/publications/art/ismir2013-chorus.pdf
- von Hippel & Huron 2000, "Why do skips precede reversals?", Music Perception 18(1): https://online.ucpress.edu/mp/article-abstract/18/1/59/62088/
- de Clercq & Temperley 2011, "A corpus analysis of rock harmony", Popular Music 30(1) (root frequencies, transitions, trigrams): https://rockcorpus.midside.com/2011_paper/declercq_temperley_2011.pdf
- Hooktheory, chords of 1,300 popular songs (what follows iii): https://www.hooktheory.com/blog/i-analyzed-the-chords-of-1300-popular-songs-for-patterns-this-is-what-i-found/
- Open Music Theory 2e (Gotham et al.), harmonic function and the phrase model: https://human.libretexts.org/Bookshelves/Music/Music_Theory/Open_Music_Theory_2e_(Gotham_et_al.)/04%3A_Diatonic_Harmony_Tonicization_and_Modulation/4.01%3A_Introduction_to_Harmony_Cadences_and_Phrase_Endings
- Open Music Theory 2e, four-chord, puff, modal and blues-based schemas: https://human.libretexts.org/Bookshelves/Music/Music_Theory/Open_Music_Theory_2e_(Gotham_et_al.)/07%3A_Popular_Music
- Summach 2011, "The Structure, Function, and Genesis of the Prechorus", Music Theory Online 17(3): https://mtosmt.org/issues/mto.11.17.3/mto.11.17.3.summach.html
- Tan, Lustig & Temperley 2019, "Anticipatory Syncopation in Rock: A Corpus Study", Music Perception 36(4): http://davidtemperley.com/wp-content/uploads/2019/04/tan-lustig-temperley.pdf
- Temperley 2007, "The melodic-harmonic 'divorce' in rock", Popular Music 26(2): https://www.cambridge.org/core/journals/popular-music/article/abs/melodicharmonic-divorce-in-rock/33D93CFAE1EDBC800B86318078D35F7C
- Power chords, indeterminate quality and distortion: https://en.wikipedia.org/wiki/Power_chord
- "Basket Case" (E♭ major, Pachelbel-like progression): https://en.wikipedia.org/wiki/Basket_Case_(song)
- Pop-punk uses of I–V–vi–IV ("Dammit", "Self Esteem"): https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression
- Sound on Sound, synthesising the bass drum and snare, practical cymbal synthesis: https://www.soundonsound.com/techniques/synthesizing-drums-bass-drum, https://www.soundonsound.com/techniques/synthesizing-drums-snare-drum, https://www.soundonsound.com/techniques/practical-cymbal-synthesis
- TR-808 cymbal and hat architecture: https://www.baratatronix.com/blog/cascadia-808-cymbal-hi-hat-synthesis
- Jaffe & Smith 1983, Karplus–Strong extensions: https://ccrma.stanford.edu/~jos/waveguide/Karplus_Strong_Algorithms.html
- Guitar cabinet as a 4–5 kHz low-pass: https://www.hexefx.com/diy/tech/cabsims
- Välimäki & Huovilainen 2007, antialiasing oscillators: https://research.aalto.fi/en/publications/antialiasing-oscillators-in-subtractive-synthesis/
- Klatt 1980, cascade/parallel formant synthesiser: https://pubs.aip.org/asa/jasa/article/67/3/971/787172/Software-for-a-cascade-parallel-formant
- Pink Trombone (JS vocal tract): https://github.com/zakaton/Pink-Trombone
- Sundberg & Bauer-Huppmann 2007, "When does a sung tone start?", J. Voice 21: https://pubmed.ncbi.nlm.nih.gov/16564674/
- Hillenbrand et al. 1995, American English vowels: https://pubmed.ncbi.nlm.nih.gov/7759650
- Soprano formant tuning: https://newt.phys.unsw.edu.au/jw/soprane.html
- Saitou et al. 2005, F0 control model for singing synthesis: https://www.sciencedirect.com/science/article/abs/pii/S0167639305000993
- Vibrato rate and extent (Sundberg): https://en.wikipedia.org/wiki/Vibrato
- Hennig et al. 2011, fluctuations in human musical rhythms: https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0026457
- ITU-R BT.1359 lip-sync thresholds: https://en.wikipedia.org/wiki/Audio-to-video_synchronization
- YouTube upload audio specs (48 kHz): https://support.google.com/youtube/answer/1722171
- YouTube normalisation: https://productionadvice.co.uk/stats-for-nerds/
- AES TD1008: https://aes2.org/wp-content/uploads/2024/01/20210924_TD1008_v3.13.pdf
- Social platforms publish no LUFS targets: https://danmurtagh.com/lufs-loudness-standards
- Gain staging to about −6 dBFS mix peaks: https://kansamples.com/blogs/learn/gain-staging-routing-mix
