// Episode 1, "You Never Told Me": the song as data.
// The grids match episodes/01-song-map.md; bar numbers are the map's.

import { chordTrack, part } from '../lib/notation.mjs';

export const meta = {
  title: 'You Never Told Me',
  bpm: 180,
  key: 'Eb',
  sampleRate: 48000,
  startT: 14, // first sound: the pickup "you" on the & of 4 in bar 0 (in sixteenths)
  endT: 116 * 16,
};

export const sections = [
  { name: 'Intro', bar: 1, bars: 4 },
  { name: 'Verse 1', bar: 5, bars: 8 },
  { name: 'Pre-chorus', bar: 13, bars: 8 },
  { name: 'Chorus 1', bar: 21, bars: 17 },
  { name: 'Verse 2', bar: 38, bars: 8 },
  { name: 'Pre-chorus 2', bar: 46, bars: 8 },
  { name: 'Chorus 2', bar: 54, bars: 17 },
  { name: 'Bridge', bar: 71, bars: 8 },
  { name: 'Breakdown', bar: 79, bars: 6 },
  { name: 'Tag', bar: 85, bars: 4 },
  { name: 'Final pre-chorus', bar: 89, bars: 8 },
  { name: 'Final chorus', bar: 97, bars: 17 },
  { name: 'Outro', bar: 114, bars: 2 },
];

// ---- Lead vocal -------------------------------------------------------------------------

const hook = (b, a = ['WHO', '-o', '-o'], w = ['WHAT', '-a', '-at']) => [
  [b, `${a[0]} ~ ~ ~ ${a[1]} ~ ~ ~`, 'D5>Eb5 G4'],
  [b + 1, `${a[2]} ~ ~ ~ GOOD ~ for ~`, 'Ab4>Bb4 Bb4 Bb4'],
  [b + 2, `${w[0]} ~ ~ ~ ${w[1]} ~ ~ ~`, 'Db5>Eb5 G4'],
  [b + 3, `${w[2]} ~ ~ ~ ~ . . .`, 'Bb4'],
];

// One chorus: the lead-in bar, then two eight-bar passes. `lines` gives each pass's tail
// (bars c5–c8) as [c5, c6, c7, c8]; c8 of the first pass carries the "Good for" pickup.
function chorus(b0, passes) {
  const out = [[b0, '. . . . GOOD ~ for ~', 'F4>G4 Eb4']];
  passes.forEach(({ hookWords, tail }, i) => {
    const b = b0 + 1 + i * 8;
    out.push(...hook(b, ...(hookWords ?? [])));
    tail.forEach((line, j) => out.push([b + 4 + j, ...line]));
  });
  return out;
}

const preChorus = (b, first = ['DID n\'t TELL me WHO it\'s FOR ~', 'G4 G4 G4 F4 G4 F4 Eb4'],
  second = ['DID n\'t TELL me WHAT they WANT ~', 'Eb4 Eb4 Eb4 D4 Eb4 D4 Bb3'], pickup = 'you') => [
  [b, ...first],
  [b + 1, `~ ~ ~ ~ ~ ~ . ${pickup === 'you' ? 'you' : '.'}`, pickup === 'you' ? 'Eb4' : ''],
  [b + 2, ...second],
  [b + 3, '~ ~ ~ ~ ~ ~ . I', 'Eb4'],
  [b + 4, 'CAN\'T . READ your MIND ~ ~ ~', 'Eb4 F4 G4 F4'],
  [b + 5, '~ ~ ~ ~ ~ ~ . I\'m', 'Eb4'],
  [b + 6, 'ON . ly . READ ing your .', 'Ab4 G4 F4 Eb4 Eb4'],
  [b + 7, 'PROMPT ~ ~ ~ ~ ~ ~ ~', 'F4'],
];

// Verse lines share one contour per line position, rising a step each line (the gags escalate).
const VERSE_PITCH = [
  'Eb4 Eb4 G4 G4 G4 F4 Eb4',
  'F4 F4 F4 D4 F4 Eb4 D4',
  'G4 G4 Bb4 G4 G4 F4 Eb4',
  'Ab4 Ab4 C5 Ab4 Ab4 G4 Ab4',
];

export const lead = part('lead', [
  // Intro (cold open)
  [0, '. . . . . . . you', 'Bb3'],
  [1, 'SAID . make it GOOD ~ ~ .', 'Eb4 Eb4 Eb4 G4'],
  [2, 'so I MADE it GOOD ~ ~ .', 'Eb4 Eb4 C4 C4 B3'],
  [4, '. . . . . . . con', 'Bb3'],

  // Verse 1
  [5, 'FET ti EV ry TIME you FLOSS .', VERSE_PITCH[0]],
  [6, 'TWO eff AY on YOUR gym LOG .', VERSE_PITCH[1]],
  [7, 'KOO ber NET eez for your BLOG .', VERSE_PITCH[2]],
  [8, 'TWELVE sub A gents ROUND the CLOCK .', VERSE_PITCH[3]],
  [9, 'did I do it WRONG ~ ~ ~', 'Eb4 D4 C4 C4 G4'],
  [10, 'OOPS your QUO ta\'s GONE ~ ~ ~', 'Eb5 C4 Bb3 G4 F4'],
  [12, '. . . . . . . you', 'G4'],

  ...preChorus(13),

  ...chorus(21, [
    { tail: [
      ['FAST . to . RUN ~ ~ ~', 'Eb4 Eb4 C4'],
      ['STUR dy or CHEAP ~ ~ ~ .', 'Eb4 Eb4 Eb4 F4'],
      ['WOW . for a WEEK ~ . or', 'Ab4 Ab4 G4 Ab4 G4'],
      ['BUILT to KEEP ~ GOOD ~ for ~', 'Ab4 Bb4 Eb4 F4>G4 Eb4'],
    ] },
    { tail: [
      ['SHIP . it . NOW ~ ~ or', 'Eb4 Eb4 C4 C4'],
      ['ROOM . to GROW ~ ~ ~ .', 'Eb4 Eb4 F4'],
      ['DOES . what they NEED ~ . or', 'Ab4 Ab4 G4 Ab4 G4'],
      ['STEALS the SHOW ~ ~ ~ . .', 'Ab4 Bb4 Eb4'],
    ] },
  ]),

  // Verse 2
  [38, 'PRO duct DE mo WOW them FAST .', VERSE_PITCH[0]],
  [39, 'PAY ing US ers MAKE it LAST .', VERSE_PITCH[1]],
  [40, 'GROUP chat BOT just MAKE \'em LAUGH .', VERSE_PITCH[2]],
  [41, 'YOO ni PRO ject MAKE it PASS .', VERSE_PITCH[3]],
  [42, 'JUST for YOU for FUN ~ ~ ~', 'Eb4 D4 C4 C4 G4'],
  [43, '. then YOU\'RE the ONE ~ ~ ~', 'C4 Bb3 G4 F4'],
  [45, '. . . . . . . you', 'G4'],

  ...preChorus(46),

  ...chorus(54, [
    { tail: [
      ['WORKS . on a TRAIN ~ . on·your', 'Eb4 Eb4 Eb4 C4 C4 C4'],
      ['NAN\'S . old PHONE ~ ~ ~ .', 'Eb4 Eb4 F4'],
      ['NO . A gents GO ing . .', 'Ab4 Ab4 G4 Ab4 G4'],
      ['ROGUE on·their OWN ~ GOOD ~ for ~', 'Ab4>Bb4 Bb4 Bb4 Eb4 F4>G4 Eb4'],
    ] },
    { tail: [
      ['WORKS for SOME one·who CAN\'T . see the', 'Eb4 Eb4 Eb4 Eb4 Eb4 C4 C4 C4'],
      ['SCREEN ~ ~ ~ ~ ~ ~ .', 'Eb4>F4'],
      ['NO . ay pee EYE . KEYS where', 'Ab4 Ab4 G4 Ab4 G4 G4'],
      ['they\'ll be SEEN ~ ~ ~ I could', 'Ab4 Bb4 Eb4 Eb4 F4'],
    ] },
  ]),

  // Bridge (half-time feel; the grid stays in eighths)
  [71, 'ON ly LEARN from·my TRAIN ing SET ~', 'G4 Ab4 Ab4 G4 F4 Eb4 F4 Ab4'],
  [72, '~ ~ . . . . . to', 'G4'],
  [73, 'WRITE the CODE and THROW it O ver·the', 'G4 G4 Bb4 Ab4 G4 F4 Eb4 F4 F4'],
  [74, 'WALL ~ ~ ~ ~ ~ . but', 'G4 Eb4'],
  [75, 'HOW do·you KNOW what·to BUILD or TEST ~', 'Ab4 Ab4 G4 Ab4 Bb4 Bb4 C5 Bb4 C5'],
  [76, '~ ~ . . . . . if·you\'re', 'Bb4 Bb4'],
  [77, 'NOT think ing a BOUT who it\'s .', 'C5 C5 Bb4 Bb4 C5 Bb4 C5'],
  [78, 'FOR ~ ~ ~ -o ~ -or ~', 'D5>Eb5 G4 Ab4>Bb4'],

  // Tag
  [84, '. . . . . . . I\'m', 'Eb4'],
  [85, 'SOME . one . TOO ~ ~ .', 'G4 F4 Eb4'],
  [86, '. . . . . . . I\'m·de', 'Eb4 Eb4'],
  [87, 'BUG ging THIS with YOU ~ ~ ~', 'G4 F4 G4 Eb4 F4'],
  [88, '~ ~ ~ ~ ~ ~ . so', 'G4'],

  ...preChorus(89,
    ['PLEASE . tell me WHO it\'s FOR ~', 'Bb4 G4 F4 G4 F4 Eb4'],
    ['PLEASE . tell me WHAT they WANT ~', 'Bb4 Eb4 D4 Eb4 D4 Bb3'],
    'none'),

  ...chorus(97, [
    { tail: [
      ['ROLL back my mis TAKES ~ ~ ~', 'Eb4 Eb4 Eb4 Eb4 C4'],
      ['DI ags I can USE ~ ~ .', 'Eb4 Eb4 Eb4 Eb4 F4'],
      ['NO . STALE . PROMPTS mak·ing me con', 'Ab4 Ab4 Ab4 G4 G4 G4 Ab4'],
      ['FUSED ~ ~ ~ GOOD ~ for ~', 'Bb4>Eb4 F4>G4 Eb4'],
    ] },
    { hookWords: [['YOU', '-ou', '-ou'], ['THAT', '-a', '-at']], tail: [
      ['JUST . a . TOY ~ ~ and', 'Eb4 Eb4 C4 C4'],
      ['JUST . for FUN ~ ~ ~ .', 'Eb4 Eb4 F4'],
      ['FINE . if it DIES ~ . when', 'Ab4 Ab4 G4 Ab4 G4'],
      ['SUM mer\'s DONE ~ ~ ~ ~ ~', 'Ab4 Bb4 Eb4'],
    ] },
  ]),
  [114, '~ ~ ~ ~ ~ ~ ~ ~'],
  [115, '~ ~ ~ ~ . . . .'],
]);

// ---- Spoken lines (free rhythm, placed at their bar) ----------------------------------------

export const spoken = part('spoken', [
  [11, 'GUESS I DID n\'t ASK . . .', 'Bb3 Bb3 Bb3 G3 G3'],
  [44, 'THERE\'S AL ways SOME one . . .', 'Bb3 Bb3 Bb3 G3 G3'],
]);

// ---- Backing and gang vocals -------------------------------------------------------------

export const gang = part('gang', [
  // Chorus echoes under each hook: "(who-o-o?)" and "(wha-a-at?)" answer the held notes.
  ...[22, 30, 55, 63, 98, 106].flatMap((b) => {
    const [q1, q2] = b === 106 ? ['(you) -ou', '(that) -at'] : ['(who) -o', '(what) -at'];
    return [
      [b + 1, `${q1} . . . . . .`, 'G4 Ab4>Bb4'],
      [b + 3, `${q2} ~ . . . . .`, 'G4 Bb4'],
    ];
  }),
  // Bridge whoa-ohs.
  [72, '. . whoa ~ oh ~ . .', 'F4 D4'],
  [74, '. . . . whoa ~ oh ~', 'G4 Eb4'],
  [76, '. . whoa ~ oh ~ . .', 'F4 D4'],
  // Breakdown chant, one stressed syllable per half-time kick.
  [79, 'SOFT . . . WARE . . .', 'G4 G4'],
  [80, 'QUAL . i . TY . . is', 'G4 G4 Eb4 Ab4'],
  [81, 'VAL . . . ue . . to', 'Ab4 Ab4 Ab4'],
  [82, 'SOME . . . one . . who', 'Ab4 Ab4 Bb4'],
  [83, 'MAT . . . ters . . .', 'Bb4 Bb4'],
]);

export const bots = part('bots', [
  [86, '. and ME and ME and ME .', 'Ab4 Ab4 C5 C5 Eb5 Eb5'],
]);

// ---- Harmony -----------------------------------------------------------------------------

const chorusChords = (b) => [
  [b, 'Bb Eb'],
  ...[0, 8].flatMap((o) => [
    [b + 1 + o, 'Eb'], [b + 2 + o, 'Eb'], [b + 3 + o, 'Bb'], [b + 4 + o, 'Bb'],
    [b + 5 + o, 'Cm Ab'], [b + 6 + o, 'Ab Eb'], [b + 7 + o, 'Eb Bb'], [b + 8 + o, 'Bb Eb'],
  ]),
];
const preChorusChords = (b) =>
  ['Cm', 'Cm', 'Gm', 'Gm', 'Fm', 'Fm', 'Ab', 'Bb'].map((c, i) => [b + i, c]);
const verseChords = (b) =>
  ['Eb', 'Bb', 'Cm', 'Ab', 'Cm', 'Bb', 'NC', 'NC'].map((c, i) => [b + i, c]);

export const chords = chordTrack([
  [1, 'Eb'], [2, 'Ab Abm'], [3, 'Eb'], [4, 'Bb'],
  ...verseChords(5), ...preChorusChords(13), ...chorusChords(21),
  ...verseChords(38), ...preChorusChords(46), ...chorusChords(54),
  ...['Ab', 'Bb', 'Cm', 'Cm', 'Ab', 'Bb', 'Ab', 'Bb'].map((c, i) => [71 + i, c]),
  ...['Cm', 'Cm', 'Ab', 'Ab', 'Bb', 'Bb'].map((c, i) => [79 + i, c]),
  ...['Ab', 'Ab', 'Bb', 'Bb'].map((c, i) => [85 + i, c]),
  ...preChorusChords(89), ...chorusChords(97),
  [114, 'Eb'], [115, 'Eb'],
]);

export const vocals = [...lead, ...spoken, ...gang, ...bots].sort((a, b) => a.t - b.t);

// ---- Arrangement -------------------------------------------------------------------------
// What the band does, bar by bar. Each entry is [firstBar, lastBar, feel, options].
// Feels:
//   hits      chord stabs at `at` (sixteenths into the bar), ringing until the next stab or `cut`
//   drive     full band: open eighth-note power chords, bass eighths, kick–snare backbeat, crash
//             or open hats riding eighths (choruses, intro riff)
//   verse     palm-muted eighths, bass eighths, closed hats, backbeat (lets the patter through)
//   tagHit    one open chord per bar, crash and kick on 1, hats in quarters
//   stop      silence
//   build     pre-chorus: sustained open chords, floor-tom eighths, kick quarters, rising
//   halftime  bridge: ringing chords, kick on 1, snare on 3, ride quarters, bass half notes
//   chug      breakdown: half-time palm-muted chugs, accents on 1 and 3 with kick and crash
//   quiet     tag: bass whole notes, soft muted quarters, heartbeat kick
// Options: fill = [startSixteenth, kind] in the last bar of the range (snare, toms, roll);
//          crash = crash on the first downbeat; level = 0–1 dynamics; rise = [from, to].
export const arrangement = [
  [1, 1, 'hits', { at: [0, 8], crash: true }], // crash on 1, stab on GOOD
  [2, 2, 'hits', { at: [8] }], // the droop: A♭m stab on the second GOOD
  [3, 4, 'drive', { crash: true, fill: [8, 'snare'] }],
  [5, 8, 'verse', { crash: true }],
  [9, 10, 'tagHit'],
  [11, 12, 'stop'],
  [13, 18, 'build', { crash: true, rise: [0.5, 0.8] }],
  [19, 19, 'build', { rise: [0.8, 1], fill: [0, 'roll'] }],
  [20, 20, 'hits', { at: [0], cut: 4 }], // PROMPT on 1, then the band stops dead
  [21, 21, 'hits', { at: [0], crash: true, fill: [12, 'snare'] }], // chorus lead-in
  [22, 29, 'drive', { crash: true, fill: [8, 'snare'] }],
  [30, 37, 'drive', { crash: true, fill: [8, 'toms'] }],
  [38, 41, 'verse', { crash: true }],
  [42, 43, 'tagHit'],
  [44, 45, 'stop'],
  [46, 51, 'build', { crash: true, rise: [0.5, 0.8] }],
  [52, 52, 'build', { rise: [0.8, 1], fill: [0, 'roll'] }],
  [53, 53, 'hits', { at: [0], cut: 4 }],
  [54, 54, 'hits', { at: [0], crash: true, fill: [12, 'snare'] }],
  [55, 62, 'drive', { crash: true, fill: [8, 'snare'] }],
  [63, 70, 'drive', { crash: true, fill: [8, 'toms'] }],
  [71, 76, 'halftime', { crash: true, level: 0.8 }],
  [77, 78, 'halftime', { level: 0.9, fill: [0, 'roll'] }],
  [79, 83, 'chug', { crash: true }],
  [84, 84, 'hits', { at: [0], cut: 6 }],
  [85, 85, 'quiet', { level: 0.5 }],
  [86, 86, 'hits', { at: [4, 8, 12], level: 0.8 }], // one stab per bot: "and ME! and ME! and ME!"
  [87, 88, 'build', { rise: [0.6, 1], fill: [8, 'roll'] }],
  [89, 94, 'build', { crash: true, rise: [0.6, 0.9] }],
  [95, 95, 'build', { rise: [0.9, 1], fill: [0, 'roll'] }],
  [96, 96, 'hits', { at: [0], cut: 4 }],
  [97, 97, 'hits', { at: [0], crash: true, fill: [12, 'snare'] }],
  [98, 105, 'drive', { crash: true, fill: [8, 'toms'] }],
  [106, 113, 'drive', { crash: true, level: 1 }],
  [114, 115, 'hits', { at: [0], crash: true, cut: 28 }], // DONE rings, then a hard cut
];
