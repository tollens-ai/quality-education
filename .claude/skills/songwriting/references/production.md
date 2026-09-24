# Arrangement, production and mixing in code

How to make a song built in code (the score is data, with a bar-by-bar arrangement such as
`[firstBar, lastBar, feel, { level, rise, fill, crash }]`; every part is synthesised and rendered
offline) sound like a record rather than a demo. It assumes the basics: frequency slots, a pan
plan, doubled rhythm guitars, a −14 LUFS master, rendered stems. Numbers are starting points
unless a source is given; *(heuristic)* marks our own practice.

## Arrangement
- **Plan the energy curve before you arrange.** Give every section an energy level from 0 to 1 in
  the score, then make the arrangement meet it. Example: intro 0.7, verse 1 0.45, pre-chorus
  0.6 → 0.9, chorus 1.0, verse 2 0.55, bridge 0.6, breakdown 0.4, final chorus 1.0 plus one extra
  layer. Choruses really are "louder, sharper and rougher" than other sections (Van Balen et al.),
  so the curve can be measured afterwards (see *Checkable*).
- **Energy has more knobs than volume.** Onset density, register, brightness (open hats, filter
  cutoff), width and layer count all raise it; make each a parameter of the `feel`.
- **No more than four elements at once.** Owsinski splits a song into foundation (bass and drums),
  pad, rhythm, lead and fills: "usually there should not be more than four arrangement elements
  playing at the same time." A pop-punk chorus of drums+bass, guitar wall, lead vocal and gang
  double is already four, so a lead-guitar hook there must replace something, not add to it.
- **One new thing per section** *(heuristic)*. Verse 2 adds a ride or a guitar counter-line that
  verse 1 didn't have. Chorus 2 adds the gang double; the last chorus adds harmonies. If a section
  adds everything at once, the next one has nowhere to go.
- **Clear the lead vocal's register, not just its frequency band.** Keep other melodic parts at
  least an octave away from the sung line, or silent while it sings. Fills go in the gaps between
  lines, which is what Owsinski's "fills" are: "an answer to the Lead". In code, compute each
  vocal line's span from the score and schedule the guitar hook only in the gaps.
- **A lead-guitar hook states the vocal hook early.** Play the chorus melody on one bending string
  in the intro, so the hook is heard in the first seconds, and bring it back in the outro.
- **Counter-melodies move when the lead holds.** Move under the singer's long notes, hold while
  the singer is busy; listed per beat, the two parts' onsets should rarely coincide.
- **Silence is an arrangement part.** A one-bar stop before the chorus, or a cut to voice alone
  on the last pre-chorus word, makes the downbeat land harder than any crash. Write stops into the
  arrangement as their own feel, with the exact sixteenth where the band cuts, and let the reverb
  tails ring through the gap (don't gate them).
- **Builds use the four tension devices EDM made explicit.** Solberg found build-ups work through
  "uplifters" (risers), the "drum roll effect", "large frequency changes" and the "removal and
  reintroduction of bass and bass drum". In a band: snare eighths → sixteenths over the last two
  bars, a noise riser (white noise through a band-pass sweeping 500 Hz → 8 kHz), a high-pass
  sweep on the band bus, and the kick and bass dropped for the final beat. The drop is then
  everything taken away coming back on one sample, so keep the bar before it thin.
- **Lift the last chorus with something new, not just louder.** The options are gang vocals on
  every line, a harmony a third above the hook, a higher lead guitar, a key change, or a
  half-bar stop before it. Pick one or two. Normalisation turns the whole song down by one gain,
  so the lift has to come from the arrangement.

## Pop-punk production
- **Big guitars come from many real takes, hard-panned.** Chris Lord-Alge's mix of My Chemical
  Romance's "Welcome to the Black Parade" had a main guitar pair that "was originally four tracks"
  and a second stereo pair that "was 10 tracks", and his panning is "either left, right, or
  centre". In code, render four or more rhythm performances with separate seeds, pick timing and
  amp settings (two per side); sum each side and keep L and R decorrelated.
- **Mix hard, check quiet.** Lord-Alge: "I listen really quietly... in order for it to hit you in
  the face, you have to really push it." On *Enema of the State* (produced by Jerry Finn), mixer
  Tom Lord-Alge's aim was to "Make it sound as aggressive as possible", and some drum sounds were
  triggered at mixdown.
- **Tight drums are consistent drums.** Travis Barker tracked most of *Enema of the State* in
  eight hours, with no click, and Finn had him tune his snares down for "a bigger, tougher sound".
  Lord-Alge replaced a kick with a sample and added two snare samples, "all samples were
  taken from the track". In code: every snare hit shares one body sample, with velocity and small
  seeded variation in the noise only, and the humanised timing sits on top.
- **Compress drums slowly so the hit gets through.** Lord-Alge: 4:1 and 2:1, "slow attack and
  quick release", "4–5dB movement". Release before the next eighth (167 ms at 180 bpm).
- **The modern revival is often made in the box.** Dan Nigro on Olivia Rodrigo's "good 4 u":
  "that song was completely made in the box. Actually, there's one instrument that was recorded
  live - the hi-hat," because it needed "some element that actually made it feel like only a
  drummer could play this." So spend the humanising budget on the hats, the part the ear reads
  as a player: accents, open/closed variation, drift.
- **Bass tone is a picked, driven low-mid.** The bass carries the harmony on small speakers
  through its 2nd–4th harmonics (200–600 Hz), not its fundamental. Render a bright pick attack
  and oversampled drive, then low-pass above about 2.5 kHz so it stays out of the vocal's band.

## Vocal production
- **A produced vocal is a stack, not one line.** Verse: one lead, centred. Pre-chorus: add a
  quiet double. Chorus: a tight double, a harmony, and a gang on the hook. Each layer is a
  separate render. As Wikipedia's double-tracking entry puts it, a copy with a delay "does not
  yield the same results as a real recording of two separate tracks".
- **Tight doubles: small, correlated differences.** Render the double from the same score with
  its own seed, 5–20 ms timing offsets that drift slowly, ±5–10 cents of pitch wander and a
  slightly different vocal-tract length. Keep it 6–10 dB under the lead, centred or split
  ±20–40 %. Offsets under about 20 ms fuse with the lead into one thicker voice (precedence
  effect, below); 30–50 ms or more is heard as a second singer.
- **Harmonies go a third or sixth above, on the hook words only.** Derive them from the chord
  track (the next chord tone above the melody note) and put them 8–12 dB under the lead. Every
  harmony note gets the same consonant timing as the lead, or the consonants flam.
- **Ad-libs fill the gaps, off-centre.** Short shouts ("hey!", "whoa") in the rests between
  lines, panned 30–60 %, scheduled from the same gap list as the fills.
- **Presence EQ: shape the band before boosting the voice.** High-pass a soprano lead at about
  100–120 Hz, cut 250–400 Hz boxiness 2–3 dB, and add a broad 1–2 dB lift around 3–5 kHz only if
  the band is already cut there. Speech intelligibility is concentrated in the 1 kHz and 2 kHz
  octaves (SII importance weights 0.23 and 0.26, against 0.06 at 250 Hz).
- **De-ess at the source first.** Female sibilance sits at about 6–8 kHz (Wikipedia, De-essing).
  A synthesised voice creates every /s/ from a noise burst, so set fricative gain per phoneme in
  the synth. Then use a split-band de-esser: detect a 6–9 kHz band-pass, reduce only that band.
- **Compress in two stages.** A fast stage catches peaks (Lord-Alge used a 1176 at "4:1, quick
  release"), then a slower 2:1 stage levels the line. A synthetic voice is often too even
  already; its problem is the opposite: add small per-syllable level variation (±1–2 dB) before
  compressing, or it reads as a machine.
- **Delay for a fast vocal: throws, not washes.** At 180 bpm an eighth is 167 ms and a quarter
  333 ms. Lord-Alge's vocal delays were "quarter or eighth notes". Send only the last word of a
  line into the delay (automate the send from the score's line ends), filter the repeats to
  about 500 Hz–5 kHz, and duck the return while the dry vocal sings.
- **Reverb: pre-delay and short decay.** "Pre-delays in the range of 20 to 80 milliseconds"
  keep the consonants clear (iZotope). Keep decay under about 1.2 s at pop-punk tempos, or each
  syllable smears into the next.
- **Make the synthetic voice sound produced, not raw.** A raw synth voice is mono, dry, perfectly
  in time and has no breath or room. Produced means: a double, a short room (early reflections
  at 5–30 ms), aspiration noise at phrase starts, gentle tanh saturation for 2–5 kHz harmonics,
  and a delay throw at line ends. Add them in that order and A/B at matched loudness after each.

## Mix principles
- **Masking spreads upward, so cut low things to clear high things.** A masker hides sounds above
  its own frequency more than below it (upward spread of masking), and masking is strongest when
  both sit in the same critical band. So the guitars' and bass's low mids hide the vocal more than
  the vocal hides them: high-pass guitars at 100–120 Hz and cut them at 250–500 Hz before
  touching the voice.
- **Duck the band only while the voice sings.** Split the guitar bus into a 1–4 kHz band and the
  rest, and turn the band down 2–3 dB by an envelope follower on the lead vocal (a sidechain
  dynamic EQ). The guitars keep their bite between lines. Side-chaining is standard: "the
  side-chain input is used by disc jockeys for ducking".
- **Depth is dry, bright and early vs wet, dark and late.** Front: the lead, little reverb, full
  top end. Middle: guitars and snare in a short room. Back: pads and gang vocals, more reverb,
  top rolled off above 8 kHz. Use pre-delay for the front, none for the back.
- **Width comes from differences, and dies in mono if faked.** Real decorrelated takes survive
  mono; a Haas copy (one side 10–30 ms late) comb-filters when summed, so keep it to ear-candy.
- **Keep the low end mono, widen the top.** With M = (L+R)/2 and S = (L−R)/2, high-pass S at
  about 120–150 Hz, and lift S slightly above 6 kHz to widen without moving the centre.
- **Parallel compression keeps the transient and adds density.** Blend a crushed copy (8:1, fast
  attack) under the dry drums: "a form of upward compression that facilitates dynamic control
  without significant audible side effects". It also works on the vocal stack at −10 to −15 dB.
- **Saturate the bass so phones can play it.** Most telephones "cannot reproduce sounds lower than
  300 Hz", yet the pitch of the missing fundamental is still heard from its overtones. Add 2nd and
  3rd harmonics to the bass (parallel tanh, blended 20–30 %), so a 58 Hz B♭ still reads through
  its 117 and 175 Hz harmonics, and above 300 Hz through the higher ones.
- **Mix for the phone first** *(heuristic)*. "88% of TikTok users said that sound is essential to
  the TikTok experience" (Kantar for TikTok, 2021), and without headphones a feed plays on the
  phone speaker. The vocal, snare crack and bass harmonics must survive a phone simulation.

## Mastering for streaming and social video
- **Normalisation is one gain per track, so loudness buys nothing.** Spotify plays at −14 LUFS
  (ITU-R BS.1770), turning loud tracks down and lifting quiet ones only as far as true-peak
  headroom allows: a −20 LUFS track peaking at −5 dBFS is lifted only to −16. Apple Music's Sound
  Check targets −16 LUFS and is on by default on iOS.
- **True peak: −1 dBTP, or −2 if the master is louder than −14.** Spotify recommends this because
  lossy encoding can clip inter-sample peaks. Detect peaks on a 4× oversampled signal.
- **Keep the loud sections from being crushed.** Ian Shepherd's rule: "no lower than PSR 8 during
  the loudest parts of a song" (true peak minus 3-second short-term loudness); less "will often
  sound crushed".
- **Social feeds publish no targets, so decide an export per platform.** TikTok, Instagram and X
  publish none. Keep the −14 master for streaming and YouTube; make a louder social export (PSR
  still ≥ 8) only if a test upload plays quieter than its neighbours. In a feed there's no
  fade-in: the first hit is at full level on frame one.

## Psychoacoustics that matter
- **Ears are most sensitive at 2–5 kHz and deaf at the extremes when quiet.** The equal-loudness
  contours flatten as level rises, so at low volume the bass and the top end drop away (Fletcher
  and Munson; ISO 226). Check the balance at low volume as well as loud.
- **Temporal masking hides what follows a loud hit.** Forward masking can last around 100 ms, so
  a quiet consonant just after a crash or a kick can vanish. Schedule the snare and crash so they
  don't sit on a sung consonant, or duck the cymbals briefly at each consonant.
- **The first arrival sets the position (precedence effect).** Two copies of a sound fuse into
  one for delays up to about 40 ms with speech or music, and "a single reflection arriving at a
  delay of between 5 and 30 ms can be up to 10 dB louder than the direct sound without being
  perceived as a secondary auditory event". Use it for doubles (under 20 ms fuse) and early
  reflections (depth without echo); stay above 50 ms for an audible slapback.
- **Louder sounds better, even by fractions of a decibel.** Bob Katz found converters that sounded
  deeper and wider were adding 0.2 dB of gain, and a compressed version made 1 dB louder makes
  "even experienced listeners" hear the original as the compressed one (Vickers). "If you play the
  same piece of music at two different volumes... they will almost always choose the louder."
  So A/B fairly: gain-match both renders to 0.1 LU in code, randomise which is A, and decide
  before revealing. Judge every processor against its bypass the same way.

## Checkable
Measured on the rendered stems and mix; section boundaries come from the score's bar times.
- **Loudness per section matches the energy plan.** Method: BS.1770 integrated loudness over each
  section's samples; rank order matches the planned energy, chorus ≥ verse + 2 LU *(heuristic)*,
  final chorus ≥ chorus 1.
- **LRA per section and overall.** Method: EBU Tech 3342 (3 s windows, 10th to 95th percentile of
  gated short-term loudness), per section and whole song; flag a chorus with LRA over about 4 LU
  (its level is wobbling) or a song under about 3 LU (no contrast) *(heuristic)*.
- **Spectral balance vs a reference.** Method: long-term average spectrum in 1/3-octave bands for
  our mix and the reference at matched LUFS; flag any band more than 3 dB off *(heuristic)*.
- **Vocal-to-band ratio in 1–4 kHz.** Method: band-pass the lead stem and the band-minus-vocal sum
  at 1–4 kHz, RMS per bar where the vocal sings; calibrate the target on the reference's
  Demucs-separated stems, then flag bars more than 3 dB below it.
- **Stereo width by band.** Method: per octave band, side-to-mid energy ratio and inter-channel
  correlation; below 150 Hz S/M under −20 dB, the guitar bands wide (correlation 0–0.5), the
  vocal band near-mono.
- **Mono compatibility.** Method: per octave band, energy of (L+R)/2 against the mean of L and
  R; uncorrelated parts lose 3 dB, so flag bands that lose more (phase cancellation).
- **Crest factor and PSR.** Method: true peak minus short-term loudness (PSR) in the loudest
  section ≥ 8 dB; also report the whole-song PLR and per-stem crest factor (peak/RMS).
- **Energy curve vs the arrangement plan.** Method: per bar, short-term loudness, onset count
  and the number of stems above −30 dB of their peak; Spearman correlation with the planned
  energy ≥ 0.8, direction of change at every section boundary matches the plan, and never more
  than four active elements *(heuristic)*.
- **Phone translation.** Method: mono sum, high-pass at 300 Hz; re-run the vocal ratio, Whisper
  word error rate on the mix, and check the bass line's pitch still tracks (pYIN on 200–800 Hz).

## Sources
- Van Balen et al. 2013, "An analysis of chorus features in popular song", ISMIR: https://webspace.science.uu.nl/~veltk101/publications/art/ismir2013-chorus.pdf
- Owsinski, the five arrangement elements: https://bobbyowsinskiblog.com/song-arrangement-elements/
- Solberg 2014, "Waiting for the Bass to Drop", Dancecult 6(1): https://dj.dancecult.net/index.php/dancecult/article/view/451
- Tingen 2007, "Secrets of the Mix Engineers: Chris Lord-Alge", Sound on Sound: https://www.soundonsound.com/techniques/secrets-mix-engineers-chris-lord-alge
- *Enema of the State* (Finn, Barker's drums, Tom Lord-Alge's mix): https://en.wikipedia.org/wiki/Enema_of_the_State
- Dan Nigro on "good 4 u", MusicRadar: https://www.musicradar.com/artists/i-think-people-are-surprised-that-song-was-completely-made-in-the-box-producer-dan-nigro-on-the-olivia-rodrigo-song-that-has-just-one-instrument-that-was-recorded-live-and-why-bands-are-losing-out-to-solo-artists
- Wikipedia on double tracking, de-essing and compression (side-chain, ducking, parallel): https://en.wikipedia.org/wiki/Double_tracking, https://en.wikipedia.org/wiki/De-essing, https://en.wikipedia.org/wiki/Dynamic_range_compression
- SII band-importance weights (ANSI S3.5-1997), quoted in: https://pmc.ncbi.nlm.nih.gov/articles/PMC9584137/
- iZotope, reverb pre-delay: https://www.izotope.com/en/learn/reverb-pre-delay
- Wikipedia on auditory masking, the missing fundamental (telephones below 300 Hz) and the precedence effect: https://en.wikipedia.org/wiki/Auditory_masking, https://en.wikipedia.org/wiki/Missing_fundamental, https://en.wikipedia.org/wiki/Precedence_effect
- Mono low end, mid/side practice: https://blog.mixanalog.com/mono-low-end-guide
- Kantar for TikTok, sound on TikTok (2021): https://ads.tiktok.com/business/en-US/blog/kantar-report-how-brands-are-making-noise-and-driving-impact-with-sound-on-tiktok
- Spotify loudness normalisation: https://support.spotify.com/us/artists/article/loudness-normalization/
- Apple Music at −16 LUFS, Sound Check default (Production Expert, 2022): https://www.production-expert.com/production-expert-1/apple-choose-16lufs-loudness-level-for-apple-music-heres-why
- Social platforms publish no LUFS targets: https://danmurtagh.com/lufs-loudness-standards
- Shepherd, crest factor, PSR and PLR (MeterPlugs): https://www.meterplugs.com/blog/2017/05/18/crest-factor-psr-and-plr.html
- EBU Tech 3342, loudness range: https://tech.ebu.ch/publications/tech3342
- Equal-loudness contours: https://en.wikipedia.org/wiki/Equal-loudness_contour and ISO 226:2023: https://www.iso.org/standard/83117.html
- Vickers 2010, "The Loudness War: Background, Speculation and Recommendations", AES 129th Convention (Katz's 0.2 dB and 1 dB observations; Milner quote): https://www.sfxmachine.com/docs/loudnesswar/loudness_war.pdf

Not verified against a live page: the exact guitar track counts on Jerry Finn's blink-182 and
Paramore's *Riot!* sessions (no primary source found, so none are claimed here); the ±1–2 dB,
6–10 dB and 8–12 dB layer levels, which are working values, not sourced.
