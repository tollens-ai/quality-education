// Episode 1, "You Never Told Me": the song as data.
// The grids match episodes/01-song-map.md (its grid blocks are generated from this file by
// grids.mjs). Every section is written relative to its first bar, so the form can change
// without renumbering. Times are sixteenths from bar 0; bar 0 holds only the opening pickup.

import { chordTrack, part } from '../lib/notation.mjs';

// ---- Form --------------------------------------------------------------------------------

// The pre-chorus is 6 bars: Qing compared 5, 6 and 8 by ear and chose 6 ("current one is
// best!", 2026-09-25). PC_BARS=5|8 still renders the others.
const PC_BARS = Number(globalThis.process?.env?.PC_BARS ?? 6);

const FORM = [
  ['Intro', 4],
  ['Verse 1', 8],
  ['Pre-chorus', PC_BARS],
  ['Chorus 1', 17],
  ['Verse 2', 8],
  ['Pre-chorus 2', PC_BARS],
  ['Chorus 2', 17],
  ['Bridge', 8],
  ['Breakdown', 6],
  ['Tag', 4],
  ['Final pre-chorus', PC_BARS],
  ['Final chorus', 17],
  ['Outro', 2],
];

export const sections = [];
{
  let bar = 1;
  for (const [name, bars] of FORM) {
    sections.push({ name, bar, bars });
    bar += bars;
  }
}
const at = Object.fromEntries(sections.map((s) => [s.name, s.bar]));
const lastBar = sections.at(-1).bar + sections.at(-1).bars - 1;

export const meta = {
  title: 'You Never Told Me',
  bpm: 180,
  key: 'Eb',
  sampleRate: 48000,
  startT: 14, // first sound: the pickup "you" on the & of 4 in bar 0
  endT: (lastBar + 1) * 16,
};

// ---- Lead vocal ----------------------------------------------------------------------------

// The hook, from Qing's chosen take: a leap to the high tonic on the question word.
const hook = (b, a = ['WHO', '-o', '-o'], w = ['WHAT', '-a', '-at']) => [
  [b, `${a[0]} ~ ~ ~ ${a[1]} ~ ~ ~`, 'D5>Eb5 G4'],
  [b + 1, `${a[2]} ~ ~ ~ GOOD ~ for ~`, 'Ab4>Bb4 Bb4 Bb4'],
  [b + 2, `${w[0]} ~ ~ ~ ${w[1]} ~ ~ ~`, 'Db5>Eb5 G4'],
  [b + 3, `${w[2]} ~ ~ ~ ~ . . .`, 'Bb4'],
];

// A chorus: the lead-in bar (crash, then "Good for"), then two eight-bar passes. Each pass
// gives its tail (bars 5–8 of the pass). The first pass's last bar carries the next pickup.
function chorus(b0, passes) {
  const out = [[b0, '. . . . GOOD ~ for ~', 'F4>G4 Eb4']];
  passes.forEach(({ hookWords, tail }, i) => {
    const b = b0 + 1 + i * 8;
    out.push(...hook(b, ...(hookWords ?? [])));
    tail.forEach((line, j) => out.push([b + 4 + j, ...line]));
  });
  return out;
}

// The pre-chorus, from Qing's chosen take: the first two lines run straight into each other,
// each landing its last word on the next downbeat, in contrast to the chorus that soars.
// The second half differs by length; every version ends on PROMPT, held with the band stopped.
const PRE_TAIL = {
  5: [
    ['WANT ~ . I CAN\'T . READ your', 'Bb3 Eb4 Eb4 F4 G4'],
    ['MIND I\'m ON ly READ ing your .', 'F4 F4 F4 G4 F4 Eb4 Eb4'],
    ['PROMPT ~ ~ ~ ~ ~ ~ ~', 'F4'],
  ],
  6: [
    ['WANT ~ ~ ~ ~ ~ . I', 'Bb3 Eb4'],
    ['CAN\'T ~ . . READ your MIND ~', 'Eb4 F4 G4 F4'],
    ['~ I\'m ON ly READ ing your .', 'F4 F4 G4 F4 Eb4 Eb4'],
    ['PROMPT ~ ~ ~ ~ ~ ~ ~', 'F4'],
  ],
  8: [
    ['WANT ~ ~ ~ ~ ~ ~ ~', 'Bb3'],
    ['~ ~ ~ ~ . . . I', 'Eb4'],
    ['CAN\'T ~ . . READ your MIND ~', 'Eb4 F4 G4 F4'],
    ['~ ~ ~ ~ ~ ~ . I\'m', 'F4'],
    ['ON . ly . READ ing . your', 'Ab4 G4 F4 Eb4 Eb4'],
    ['PROMPT ~ ~ ~ ~ ~ ~ ~', 'F4'],
  ],
};
function preChorus(b, first, second) {
  return [[b, ...first], [b + 1, ...second], ...PRE_TAIL[PC_BARS].map((l, i) => [b + 2 + i, ...l])];
}
const PRE = [
  ['. you DID n\'t TELL me WHO it\'s', 'G4 G4 G4 G4 G4 Eb4 Eb4'],
  ['FOR you DID n\'t TELL me WHAT they', 'Eb4 Eb4 Eb4 Eb4 Eb4 Eb4 Bb3 Bb3'],
];
const PRE_FINAL = [
  ['. so PLEASE ~ tell me WHO it\'s', 'G4 Bb4 G4 G4 Eb4 Eb4'],
  ['FOR ~ PLEASE ~ tell me WHAT they', 'Eb4 Bb4 Eb4 Eb4 Bb3 Bb3'],
];

// Verse list lines: the "We Didn't Start the Fire" verse, straight eighths, one line a bar.
// Each line's contour steps up as the gags escalate, staying under the chorus.
const VERSE_PITCH = [
  'Bb3 Bb3 Eb4 Eb4 Eb4 D4 Bb3',
  'D4 D4 F4 D4 F4 Eb4 D4',
  'Eb4 Eb4 G4 Eb4 Eb4 D4 C4',
  'Eb4 Eb4 Ab4 Eb4 Eb4 F4 Eb4',
];

function verse(b, lines, tag) {
  return [
    ...lines.map((l, i) => [b + i, l, VERSE_PITCH[i]]),
    // Tag, relaxed (Qing): "did I do it wrong? (5 6 7 8) Oops! (2) your QUO ta's GONE!", then a
    // spoken pickup on 6 7 8 into the pre-chorus, which starts on the & of 1.
    ...tag.map(([o, g, p]) => [b + o, g, p]),
  ];
}

const I = at.Intro;
const V1 = at['Verse 1'];
const V2 = at['Verse 2'];
const BR = at.Bridge;
const BD = at.Breakdown;
const TG = at.Tag;

export const lead = part('lead', [
  // Intro (cold open): the first GOOD is pushed onto the & of 2; the second droops.
  [I - 1, '. . . . . . . you', 'Bb3'],
  [I, 'SAID make it GOOD ~ ~ ~ .', 'Eb4 Eb4 Eb4 G4'],
  [I + 1, 'so I MADE it GOOD ~ ~ .', 'Eb4 Eb4 C4 C4 C4>B3'],
  [I + 3, '. . . . . . . con', 'Bb3'],

  ...verse(V1, [
    'FET ti EV ry TIME you FLOSS .',
    'TWO eff AY on YOUR gym LOG .',
    'KOO ber NET eez for your BLOG .',
    'TWELVE sub A gents ROUND the CLOCK .',
  ], [
    [4, 'did I do it WRONG ~ ~ ~', 'Eb4 D4 C4 C4 G4'],
    [6, 'OOPS ~ . your QUO ~ ta\'s ~', 'Eb5 Bb4 G4 F4'],
    [7, 'GONE ~ . . . . . .', 'Eb4'],
  ]),

  ...preChorus(at['Pre-chorus'], ...PRE),

  ...chorus(at['Chorus 1'], [
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

  ...verse(V2, [
    'PRO duct DE mo WOW them FAST .',
    'PAY ing US ers MAKE it LAST .',
    'GROUP chat BOT just MAKE \'em LAUGH .',
    'YOO ni PRO ject MAKE it PASS .',
  ], [
    [4, 'JUST for YOU for FUN ~ ~ ~', 'Eb4 D4 C4 C4 G4'],
    [6, '. . . then YOU\'RE ~ the ~', 'Bb4 G4 F4'],
    [7, 'ONE ~ . . . . . .', 'Eb4'],
  ]),

  ...preChorus(at['Pre-chorus 2'], ...PRE),

  ...chorus(at['Chorus 2'], [
    { tail: [
      ['WORKS . on a TRAIN ~ on your', 'Eb4 Eb4 Eb4 C4 C4 C4'],
      ['NAN\'S . old PHONE ~ ~ ~ .', 'Eb4 Eb4 F4'],
      ['NO . A gents GO ~ ~ ing', 'Ab4 Ab4 G4 Ab4 G4'],
      ['ROGUE on·their OWN ~ GOOD ~ for ~', 'Ab4>Bb4 Bb4 Bb4 Eb4 F4>G4 Eb4'],
    ] },
    { tail: [
      ['WORKS for SOME one·who CAN\'T ~ ~ ~', 'Eb4 Eb4 Eb4 Eb4 Eb4 C4'],
      ['. see the SCREEN ~ ~ ~ .', 'Eb4 Eb4 F4'],
      ['NO . ay pee EYE . KEYS where', 'Ab4 Ab4 G4 Ab4 G4 G4'],
      ['they\'ll be SEEN ~ ~ ~ I could', 'Ab4 Bb4 Eb4 Eb4 F4'],
    ] },
  ]),

  // Bridge. Lines 1 and 3 push their last word onto the & of 4 and hold it over the bar;
  // lines 2 and 4 land on the downbeat. "Who it's FOR" is sung on the hook's high E♭.
  [BR, 'ON ly LEARN from·my TRAIN ing . SET', 'Eb4 F4 Ab4 G4 F4 Eb4 F4 Ab4'],
  [BR + 1, '~ ~ ~ ~ . . . to', 'G4'],
  [BR + 2, 'WRITE the CODE and THROW it O ver·the', 'G4 G4 Bb4 Ab4 G4 F4 Eb4 F4 F4'],
  [BR + 3, 'WALL ~ ~ ~ . . . but', 'G4 Eb4'],
  [BR + 4, 'HOW do·you KNOW what·to BUILD or . TEST', 'Ab4 Ab4 G4 Ab4 Bb4 Bb4 C5 Bb4 C5'],
  [BR + 5, '~ ~ ~ ~ . . . if·you\'re', 'Bb4 Bb4'],
  [BR + 6, 'NOT ~ THINK·ing a BOUT ~ who it\'s', 'C5 C5 Bb4 Bb4 C5 Bb4 C5'],
  [BR + 7, 'FOR ~ ~ ~ -o ~ -or ~', 'D5>Eb5 G4 Ab4>Bb4'],

  // Tag, syncopated: TOO and YOU are pushed onto the & and held.
  [TG - 1, '. . . . . . . I\'m', 'Eb4'],
  [TG, 'SOME one . TOO ~ ~ ~ .', 'G4 F4 Eb4'],
  [TG + 1, '. . . . . . . I\'m·de', 'Eb4 Eb4'],
  [TG + 2, 'BUG ging THIS with . YOU ~ ~', 'G4 F4 G4 Eb4 F4'],

  ...preChorus(at['Final pre-chorus'], ...PRE_FINAL),

  ...chorus(at['Final chorus'], [
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
      ['SUM mer\'s DONE ~ ~ ~ ~ ~', 'Ab4 Bb4 D5>Eb5'],
    ] },
  ]),
  [at.Outro, '~ ~ ~ ~ . . . .'],
]);

// ---- Spoken lines ----------------------------------------------------------------------------

export const spoken = part('spoken', [
  // Spoken on counts 6 7 8 as the pickup into the pre-chorus (Qing: "very classic for this style").
  [V1 + 7, '. . GUESS I DID n\'t ASK ~', 'Bb3 Bb3 Bb3 G3 G3'],
  [V2 + 7, '. . . there\'s AL ways SOME one', 'Bb3 Bb3 Bb3 G3 G3'],
]);

// ---- Backing and gang vocals ---------------------------------------------------------------

const hookBars = (name) => [at[name] + 1, at[name] + 9];
const echo = (b, you = false) => {
  const [q1, q2] = you ? ['(you) -ou', '(that) -at'] : ['(who) -o', '(what) -at'];
  return [
    [b + 1, `${q1} . . . . . .`, 'G4 Ab4>Bb4'],
    [b + 3, `${q2} ~ . . . . .`, 'G4 Bb4'],
  ];
};
const [c1a, c1b] = hookBars('Chorus 1');
const [c2a, c2b] = hookBars('Chorus 2');
const [cfa, cfb] = hookBars('Final chorus');

export const gang = part('gang', [
  // Echoes on the tail of each held hook word, in the passes where the gang isn't doubling it.
  ...echo(c1a), ...echo(c2a),
  // Bridge whoa-ohs, always on beats 3 and 4 of each line's second bar.
  [BR + 1, '. . . . whoa ~ oh ~', 'F4 D4'],
  [BR + 3, '. . . . whoa ~ oh ~', 'G4 Eb4'],
  [BR + 5, '. . . . whoa ~ oh ~', 'F4 D4'],
  [BR + 7, '. . . . whoa ~ oh ~', 'G4 Eb4'],
  // Breakdown chant, twice: stresses on the half-time kick (1) and snare (3).
  ...[BD, BD + 3].flatMap((b) => [
    [b, 'SOFT . ware . QUAL i ty is', 'G4 G4 G4 G4 Eb4 Ab4'],
    [b + 1, 'VAL . ue to SOME . one who', 'Ab4 Ab4 Ab4 Ab4 Ab4 Bb4'],
    [b + 2, 'MAT . ters . . . . .', 'Bb4 Bb4'],
  ]),
]);

// In the second pass of each chorus, and all of the final one, the gang doubles the hook so
// each chorus is bigger than the last.
export const gangHook = part('gang', [
  ...hook(c1b), ...hook(c2b), ...hook(cfa), ...hook(cfb, ['YOU', '-ou', '-ou'], ['THAT', '-a', '-at']),
]);

export const bots = part('bots', [
  [TG + 1, '. and ME and ME and ME .', 'Ab4 Ab4 C5 C5 Eb5 Eb5'],
]);

export const vocals = [...lead, ...spoken, ...gang, ...gangHook, ...bots].sort((a, b) => a.t - b.t);

// ---- Lead guitar -----------------------------------------------------------------------------
// The hook, compressed into the intro riff, so it's heard at 0:03 rather than 0:27.
export const leadGuitar = part('leadGuitar', [
  [I + 2, 'X ~ ~ ~ X ~ ~ ~', 'D5>Eb5 G4'],
  [I + 3, 'X ~ ~ ~ X ~ X ~', 'Ab4>Bb4 Db5>Eb5 G4'],
]);

// ---- Harmony ---------------------------------------------------------------------------------

const seq = (b, list) => list.map((c, i) => [b + i, c]);
const chorusChords = (b) => [
  [b, 'Bb Eb'],
  ...[0, 8].flatMap((o) => seq(b + 1 + o, ['Eb', 'Eb', 'Bb', 'Bb', 'Cm Ab', 'Ab Eb', 'Eb Bb', 'Bb Eb'])),
];
// From the take: IV–vi–iii–IV–V, landing on V for PROMPT.
const PRE_CHORDS = {
  5: ['Ab', 'Cm', 'Gm', 'Ab', 'Bb'],
  6: ['Ab', 'Cm', globalThis.process?.env?.PC_CHORD3 ?? 'Gm', 'Ab', 'Bb', 'Bb'],
  8: ['Ab', 'Cm', 'Gm', 'Gm', 'Ab', 'Ab', 'Bb', 'Bb'],
};
const preChorusChords = (b) => seq(b, PRE_CHORDS[PC_BARS]);
const verseChords = (b) => seq(b, ['Eb', 'Bb', 'Cm', 'Ab', 'Cm', 'Cm', 'Bb', 'Eb']);

export const chords = chordTrack([
  ...seq(I, ['Eb', 'Ab Abm', 'Eb', 'Bb']),
  ...verseChords(V1), ...preChorusChords(at['Pre-chorus']), ...chorusChords(at['Chorus 1']),
  ...verseChords(V2), ...preChorusChords(at['Pre-chorus 2']), ...chorusChords(at['Chorus 2']),
  ...seq(BR, ['Ab', 'Bb', 'Cm', 'Cm', 'Ab', 'Bb', 'Ab', 'Bb']),
  ...seq(BD, ['Cm', 'Ab', 'Bb', 'Cm', 'Ab', 'Bb']),
  ...seq(TG, ['Ab', 'Ab', 'Bb', 'Bb']),
  ...preChorusChords(at['Final pre-chorus']), ...chorusChords(at['Final chorus']),
  ...seq(at.Outro, ['Eb', 'Eb']),
]);

// ---- Arrangement -----------------------------------------------------------------------------
// What the band does, bar by bar: [firstBar, lastBar, feel, options].
// Feels:
//   hits      chord stabs at `at` (sixteenths into the bar), ringing until the next stab or `cut`
//             (sixteenths after the range's first bar starts, where everything stops)
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
const verseArr = (b) => [
  [b, b + 3, 'verse', { crash: true }],
  [b + 4, b + 4, 'tagHit'], // "did I do it WRONG?"
  [b + 5, b + 5, 'stop'], // (5 6 7 8)
  [b + 6, b + 6, 'tagHit'], // OOPS!, with space after it
  [b + 7, b + 7, 'hits', { at: [0], cut: 4 }], // GONE, then the spoken pickup a cappella
];
const preArr = (b, quietStart = false) => {
  const n = PC_BARS;
  return [
    quietStart ? [b, b + 1, 'quiet', { level: 0.6 }] : [b, b + 1, 'build', { crash: true, rise: [0.5, 0.7] }],
    ...(n > 4 + 0 && n - 3 >= 2 ? [[b + 2, b + n - 3, 'build', { rise: quietStart ? [0.6, 0.85] : [0.7, 0.9] }]] : []),
    [b + n - 2, b + n - 2, 'build', { rise: [0.9, 1], fill: [0, 'roll'] }],
    [b + n - 1, b + n - 1, 'hits', { at: [0], cut: 4 }], // PROMPT on 1, then the band stops dead
  ];
};
const chorusArr = (b, lastFill = 'toms') => [
  [b, b, 'hits', { at: [0, 8], crash: true, fill: [12, 'snare'] }], // crash, then "Good for"
  [b + 1, b + 8, 'drive', { crash: true, fill: [8, 'snare'] }],
  [b + 9, b + 16, 'drive', { crash: true, level: 1, ...(lastFill ? { fill: [8, lastFill] } : {}) }],
];

export const arrangement = [
  [I, I, 'hits', { at: [0, 6], crash: true }], // crash on SAID, stab on the pushed GOOD
  [I + 1, I + 1, 'hits', { at: [8] }], // the droop: A♭m stab on the second GOOD
  [I + 2, I + 3, 'drive', { crash: true, fill: [8, 'snare'] }],
  ...verseArr(V1),
  ...preArr(at['Pre-chorus']),
  ...chorusArr(at['Chorus 1']),
  ...verseArr(V2),
  ...preArr(at['Pre-chorus 2']),
  ...chorusArr(at['Chorus 2']),
  [BR, BR + 3, 'halftime', { crash: true, level: 0.8 }],
  [BR + 4, BR + 6, 'build', { rise: [0.8, 1] }],
  [BR + 7, BR + 7, 'drive', { crash: true, fill: [8, 'roll'] }], // FOR on E♭5: the mid-peak
  [BD, BD + 4, 'chug', { crash: true }],
  [BD + 5, BD + 5, 'hits', { at: [0], cut: 6 }],
  [TG, TG, 'quiet', { level: 0.5 }],
  [TG + 1, TG + 1, 'hits', { at: [4, 8, 12], level: 0.8 }], // one stab per bot: "and ME!"
  [TG + 2, TG + 3, 'quiet', { level: 0.6 }],
  ...preArr(at['Final pre-chorus'], true),
  ...chorusArr(at['Final chorus'], null),
  [at.Outro, at.Outro + 1, 'hits', { at: [0], crash: true, cut: 28 }], // DONE rings, hard cut
];
