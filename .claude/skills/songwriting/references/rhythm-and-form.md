# Lyric rhythm and form

Use a grid to make the intended phrasing explicit before asking a generator to sing it.
The [house rules](../../../../LYRICS.md) govern the lyric; the chosen take and Qing’s ear
establish how it actually phrases. The old score-composition research is
[archived](../../../../archive/code-composition/references/rhythm-and-form.md).

## Write the grid

In 4/4, a bar has four quarter-note beats. For an eighth-note pattern, count
`1 & 2 & 3 & 4 &`: eight positions. Positions 6, 7 and 8 are `& of 3`, `4` and `& of 4`.
One bar lasts `240 / bpm` seconds; at 180 bpm it is about 1.33 seconds, and an eighth is about
0.167 seconds. State the tempo and time signature when using these calculations.

Place each sung syllable in its intended slot, mark stressed syllables in capitals and bar
boundaries with `|`. Dictionary word stress and intended musical emphasis are different;
inspect jargon, contractions and compressed pronunciations instead of treating a dictionary
flag as a verdict. Record deliberate bends and check them in the generated take.

Within a recurring pattern, answering phrases share syllable positions, stresses, pickups and
rhyme slots. Check joins between breathing phrases too. Different sections can have different
patterns; see [performer guidance](../../../../docs/lyrics/performers.md) for how Suno and MiniMax
handle repeated verse melodies.

## Check pacing and runtime from the bar count

Don't judge song length or pacing by feel. In 4/4, `bars × (240 / bpm)` gives duration for any
span — count the bars each phrase actually occupies (whether full-time or half-time), plus any
planned instrumental passages. Check three landmarks before polishing lines:

- **When the first hook lands:** if a long intro, verse and pre-chorus push the first chorus too
  far back, listeners leave before hearing what the song is about.
- **The gap between hooks:** a long bridge stacked directly onto a breakdown can keep the song
  away from its chorus for too long.
- **Total duration:** a plausible overall runtime can hide both pacing problems above; cut
  examples or merge sections early when the shape drags.

## Choose the section jobs

Pick the leanest form that carries the genre and the lesson: each verse develops a distinct angle
and escalates on its own, a refrain reinforces the point, and a contrast makes a definition or
payoff audible. Episode 1’s pop-punk sequence is one worked example, not a checklist of sections to
stack into every song; a patter song can drop the chorus and intro, and a groove song can drop the
pre-chorus or merge bridge and breakdown.

Leave breathing space where the thought needs it. Budget the words against the phrase’s available
time; outside patter, the series uses about 3–4 sung syllables a second as a starting point.
Fast delivery needs clear pronunciation and predictable patterns. Compare the intended grid
with a generated take before declaring the phrasing successful.
