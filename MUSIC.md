# Music craft

How to make a song, adapting standard songwriting, theory and production practice. The
sound-design, engineering and mix rules are for making it in code; episode 1 shipped a MiniMax
take instead ([the two routes](music/README.md#two-routes)). Qing's brief (2026-09-24): "you'll
need to figure out your own 'doing songs with javascript' best practices based on standard music
writing and songwriting and music production best practices", and "you'll need to map out the
full song's rhythm and chord sequences before you can go into generation - we need coherent
rhythmic phrasing throughout". [LYRICS.md](LYRICS.md) covers the words. This file covers
everything else. Numbers are starting points unless a source is given.

**Adding a rule.** Write the principle under a correction, not the fix. Check it against the
existing rules and a song that worked, and merge or replace rather than append.

## Order of work
- **Map the whole song before making any sound.** Work in this order: song map, melody,
  arrangement, sound design, mix. Each stage is fixed before the next one starts. A sound-design
  change can't fix a phrase that's a bar too long, and it costs a re-render every time.
- **The map is a file, not a thought.** It holds tempo, key, time signature, and the form with a
  bar count for every section. Each bar gets its chord, its drum pattern, and every syllable placed
  on the grid. Episode 1: 180 bpm, E♭ major, 4/4, one bar = 1.33 s.
- **Phrases come in 2, 4 and 8 bars.** Lines are usually 2 bars and sections 8 or 16. Any odd
  length (a 1-bar stop, a 2-bar extension) goes in the map with its reason. Otherwise the listener
  feels a stumble they can't name.
- **Name the rhythmic motifs and reuse them.** Give each line's rhythm an ID (A, A′, B) and write
  it in the map. Parallel lines within a section share a rhythm; that is what "coherent rhythmic
  phrasing" means in practice, and the map is where you check it. Choose how much repeats across
  sections to suit the performer ([LYRICS.md](LYRICS.md), *Writing for the performer*).
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

## Genre conventions
Pick the genre per song and write its conventions in the song's map. Episode 1's pop-punk,
below, is the worked example, not the default.
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
    (a fast polka feel) for the biggest lift.
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
- **Keep the lead in the singer's range.** Take it from a reference singer in the genre and write
  it in the map. Episode 1's example: Hayley Williams covers F3–E♭5 on "Misery Business", so
  verses sat around B♭3–B♭4 and the hook leapt to the high tonic, E♭5, the top of that range.
  Avoid holding notes in the singer's break (A4–C5 for that voice) unless the voice handles it.
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
- **Repeat the hook exactly.** The hook's melody and rhythm are identical every time. How much
  else repeats depends on the performer (see *Name the rhythmic motifs* above).
- **Strong-beat notes are chord tones.** Passing notes go on weak beats. Any clash with the bass
  on beat 1 has to be deliberate.

## Harmony
How to choose and audit chords, with the research behind it, lives in the songwriting skill pack:
[references/harmony.md](.claude/skills/songwriting/references/harmony.md). The rules that govern
this series in particular stay here and in [LYRICS.md](LYRICS.md).

- **Qing's harmony verdicts are hard filters, at the level she gave them.** Options that repeat
  a rejected *move* are cut before she hears them. Record what she actually objected to, not the
  nearest chord: in episode 1 the pre-chorus Gm stalled the build (strong, weak, weak), and a
  chorus-tail option ending iii–vi–I was "a really stupid cadence". Neither is a verdict on Gm
  itself (2026-09-25: "THERE'S NOTHING WRONG WITH A Gm CHORD IT'S JUST A REALLY STUPID CADENCE").
- **A doubled chorus needs a second-time ending.** The first pass ends open, sending the song
  back to the hook; the second pass keeps the tune but changes its last bar or two to close
  (Qing, 2026-09-25: "it needs a second time bar that ties a bow on it though - just repeating
  won't work").
- **An ending must sound like arriving home.** Check what the melody note and the chord sound
  like together at the arrival, not just the numerals; the cadences that work are in
  [harmony.md](.claude/skills/songwriting/references/harmony.md). Episode 1's option b ended
  iii–vi–I with the melody holding the shared third (G over Gm, Cm, E♭), so the arrival sounded
  like the minor chord, not home (Qing, 2026-09-25: "what on earth in your harmonic theory
  analysis makes you think it's OK to end the chorus on G minor here"). A loop built to keep
  going, like the "royal road" (IV–V–iii–vi), won't end a section.

## Singing voice
- **Glide between pitches.** Ornaments and melismas slide: S-shaped transitions of roughly
  60–120 ms, with a little preparation or overshoot, never a jump between flat plateaus. Stepped
  pitch is what made episode 1's code voice sound unnatural (Qing, 2026-09-25: "the ornamentation
  is very unnatural because it's not gliding between pitches"). Plot the f0 of a melisma and look.
- **The accent has to sound like a real one.** Qing also found the code voice's accent "kinda
  odd". A formant voice's vowels are a guess at an accent, so compare them with a real speaker's.

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
- **Voice in code: formant synthesis.** A source–filter voice uses a glottal pulse through
  cascaded formant resonators, with parallel resonators for fricatives (Klatt 1980). Pink
  Trombone shows an articulatory model in JS. The score owns the timing.
- **Consonants carry the words.** Vowels make the tone; plosive bursts, fricative noise (/s/ at
  about 4–8 kHz) and 30–60 ms formant transitions into the vowel carry the meaning. Most
  "robot with a cold" failures are missing or mushy consonants.
- **The vowel starts on the beat.** Singers put the vowel onset on the beat, and accompanists sync
  to it (Sundberg & Bauer-Huppmann). So each consonant is scheduled before the beat, by its own
  length. "Good" starts its /g/ burst early, and /ʊ/ lands on the grid.
- **Take vowel targets from the accent the song is sung in.** Published formant tables
  (Hillenbrand 1995) are American, which matches the General American the rhymes are written for
  ([LYRICS.md](LYRICS.md)). For any other accent, measure a reference singer and store the
  formants per vowel.
- **High notes need vowel modification.** At E♭5 (622 Hz) the pitch is above the first formant of
  /u/ and /i/. Sopranos raise the first formant to follow the pitch, and intelligibility drops
  anyway. On a closed vowel at the top (episode 1's "who" on the high tonic), open the vowel
  slightly and let the consonant and the caption carry the word.
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
