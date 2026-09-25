// Phoneme inventory for the all-code singing voice.
//
// Symbols are IPA for Southern British English (SSBE), one string per phoneme:
//   vowels      iː ɪ e æ ʌ ɑː ɒ ɔː ʊ uː ɜː ə i (happY)
//   diphthongs  eɪ aɪ ɔɪ əʊ aʊ ɪə eə ʊə
//   stops       p b t d k g
//   affricates  tʃ dʒ
//   fricatives  f v θ ð s z ʃ ʒ h
//   nasals      m n ŋ          (n, m, l can be a syllable nucleus: "didn't" = d n t)
//   approximants l r w j
//
// Vowel targets are for a young female SSBE voice (F1..F3 in Hz), set from published SSBE
// ranges (lowered TRAP, fronted GOOSE and FOOT) scaled to a female tract. They are not measured
// from the reference take: it is sung at 311-622 Hz, where LPC formant estimates lock onto
// harmonics. The reference was used for the long-term spectrum instead (see synth.mjs).
// F4 and up are speaker constants set in synth.mjs.

const V = (F1, F2, F3, B1 = 80, B2 = 100, B3 = 160) => ({ F: [F1, F2, F3], B: [B1, B2, B3] });

// Monophthong targets, plus a few glide-only targets (a, o, i, u) used inside diphthongs.
export const VOWELS = {
  'iː': V(330, 2650, 3250, 60, 100, 180),
  'ɪ': V(440, 2250, 2950),
  'e': V(620, 2100, 2900),
  'æ': V(920, 1650, 2800),
  'ʌ': V(820, 1450, 2800),
  'ɑː': V(780, 1200, 2750),
  'ɒ': V(680, 1020, 2800),
  'ɔː': V(480, 840, 2800),
  'ʊ': V(460, 1350, 2650),
  'uː': V(360, 1100, 2450, 70, 100, 160), // sung GOOSE: rounder than spoken SSBE [ʉː]
  'ɜː': V(620, 1750, 2850),
  'ə': V(560, 1650, 2850),
  'i': V(360, 2500, 3100),
  // glide targets
  'a': V(900, 1500, 2750),
  'o': V(580, 1350, 2700), // GOAT onset, British [əʊ] is fronted
  'u': V(400, 950, 2500),
  'ɛ': V(600, 2050, 2900),
};

// Diphthongs: [start target, end target]. The singer holds the first and glides late.
export const DIPHTHONGS = {
  'eɪ': ['e', 'i'],
  'aɪ': ['a', 'ɪ'],
  'ɔɪ': ['ɔː', 'ɪ'],
  'əʊ': ['o', 'u'],
  'aʊ': ['a', 'u'],
  'ɪə': ['ɪ', 'ə'],
  'eə': ['ɛ', 'ɛ'], // SQUARE is a long monophthong in current SSBE
  'ʊə': ['ʊ', 'ə'],
};

export const isVowel = (p) => p in DIPHTHONGS || (p in VOWELS && !['a', 'o', 'u', 'ɛ'].includes(p));
export const SYLLABIC = new Set(['n', 'm', 'l']);

export function vowelTargets(p) {
  if (p in DIPHTHONGS) return DIPHTHONGS[p].map((q) => VOWELS[q]);
  return [VOWELS[p], VOWELS[p]];
}

// Parallel (frication/burst) filter bank: centre frequencies and bandwidths in Hz.
// Spectra below are gains for [bypass, ...bank].
export const BANK_F = [1200, 1800, 2500, 3300, 4300, 5600, 7200, 9500];
export const BANK_BW = [350, 400, 500, 600, 800, 1100, 1600, 2500];

// Place spectra (after Stevens): labial diffuse-falling and weak, alveolar diffuse-rising,
// velar compact (built per vowel by velarSpec), /s/ high peak, /ʃ/ mid peak, /f θ/ weak and flat.
const SPEC = {
  lab: [0, 0.6, 0.5, 0.4, 0.3, 0.2, 0.12, 0.06, 0.03],
  alv: [0, 0, 0, 0.1, 0.3, 0.7, 0.9, 0.7, 0.35],
  s: [0, 0, 0, 0, 0.03, 0.12, 0.45, 1.0, 0.6],
  sh: [0, 0.05, 0.3, 0.9, 1.0, 0.7, 0.35, 0.12, 0.04],
  f: [0, 0.1, 0.12, 0.14, 0.16, 0.2, 0.24, 0.26, 0.24],
  th: [0, 0.03, 0.05, 0.07, 0.1, 0.16, 0.24, 0.28, 0.28],
};

// Velar bursts are compact: one peak near the velar locus (F2 onset) of the next vowel.
export function velarSpec(F2) {
  return [0, ...BANK_F.map((f) => Math.exp(-(((f - F2) / 600) ** 2)))];
}

// Consonants. Durations in seconds (speech-like; the scheduler compresses them in fast lines).
//   stop: clo = closure, vot = release-to-voicing (aspiration) as an onset; burst level `lvl`
//   fric: dur, frication level `lvl`
//   nasal: dur, `zero` = oral antiresonance during the murmur (place cue)
//   approx: dur, F = formant target (Fcoda for syllable-final variant)
export const CONS = {
  p: { kind: 'stop', place: 'lab', voiced: false, clo: 0.06, vot: 0.06, lvl: 0.3, spec: SPEC.lab },
  b: { kind: 'stop', place: 'lab', voiced: true, clo: 0.05, vot: 0.012, lvl: 0.18, spec: SPEC.lab },
  t: { kind: 'stop', place: 'alv', voiced: false, clo: 0.055, vot: 0.055, lvl: 0.5, spec: SPEC.alv },
  d: { kind: 'stop', place: 'alv', voiced: true, clo: 0.045, vot: 0.012, lvl: 0.35, spec: SPEC.alv },
  k: { kind: 'stop', place: 'vel', voiced: false, clo: 0.06, vot: 0.065, lvl: 0.6, spec: null },
  g: { kind: 'stop', place: 'vel', voiced: true, clo: 0.05, vot: 0.02, lvl: 0.4, spec: null },
  'tʃ': { kind: 'affr', place: 'post', voiced: false, clo: 0.05, fric: 0.08, lvl: 0.7, spec: SPEC.sh },
  'dʒ': { kind: 'affr', place: 'post', voiced: true, clo: 0.04, fric: 0.06, lvl: 0.5, spec: SPEC.sh },
  f: { kind: 'fric', place: 'lab', voiced: false, dur: 0.085, lvl: 0.22, spec: SPEC.f },
  // voiced non-sibilants are mostly voicing, with weak frication
  v: { kind: 'fric', place: 'lab', voiced: true, dur: 0.06, lvl: 0.1, spec: SPEC.f },
  'θ': { kind: 'fric', place: 'dent', voiced: false, dur: 0.075, lvl: 0.2, spec: SPEC.th },
  'ð': { kind: 'fric', place: 'dent', voiced: true, dur: 0.045, lvl: 0.05, spec: SPEC.th },
  s: { kind: 'fric', place: 'alv', voiced: false, dur: 0.09, lvl: 0.45, spec: SPEC.s },
  z: { kind: 'fric', place: 'alv', voiced: true, dur: 0.075, lvl: 0.18, spec: SPEC.s },
  'ʃ': { kind: 'fric', place: 'post', voiced: false, dur: 0.1, lvl: 0.7, spec: SPEC.sh },
  'ʒ': { kind: 'fric', place: 'post', voiced: true, dur: 0.07, lvl: 0.45, spec: SPEC.sh },
  h: { kind: 'h', dur: 0.06 },
  m: { kind: 'nasal', place: 'lab', dur: 0.065, zero: 1100 },
  n: { kind: 'nasal', place: 'alv', dur: 0.06, zero: 1800 },
  'ŋ': { kind: 'nasal', place: 'vel', dur: 0.065, zero: 3000 },
  // tin/tout: formant transition time into/out of the neighbouring vowel. /l/ releases fast
  // (the abrupt change is its cue); /r/ and /w/ glide slowly.
  // av: voicing level relative to the vowel's; lp: closed-tract low-pass amount
  l: { kind: 'approx', dur: 0.06, av: 0.8, F: [360, 1350, 3000], Fcoda: [460, 950, 2750], tin: 0.02, B: [90, 150, 250] },
  r: { kind: 'approx', dur: 0.065, F: [360, 1150, 1700], tin: 0.07 },
  w: { kind: 'approx', dur: 0.06, F: [300, 650, 2300], tin: 0.07, av: 0.6, lp: 0.5 },
  j: { kind: 'approx', dur: 0.05, F: [290, 2550, 3200], tin: 0.05 },
};

// Consonant formant target next to vowel target `v` (locus equations, female-scaled).
export function consonantFormants(ph, v, pos) {
  const c = CONS[ph];
  if (c.kind === 'approx') return pos === 'coda' && c.Fcoda ? c.Fcoda : c.F;
  if (c.kind === 'h') return v.F;
  const F2v = v.F[1], F3v = v.F[2];
  const F1 = c.kind === 'nasal' ? 280 : 260;
  switch (c.place) {
    case 'lab': return [F1, 0.75 * F2v + 150, F3v - 200];
    case 'alv': return [F1, 0.45 * F2v + 1100, 2950];
    case 'dent': return [F1, 0.5 * F2v + 900, 2800];
    case 'post': return [F1, 0.3 * F2v + 1500, 2650];
    case 'vel': {
      // velar pinch: F2 and F3 start close together
      const F2 = Math.max(1350, 0.95 * F2v + 250);
      return [F1, F2, F2 + 350];
    }
  }
  return v.F;
}
