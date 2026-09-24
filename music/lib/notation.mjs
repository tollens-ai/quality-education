// Parses the grid notation used in the song maps into timed note events.
//
// A bar is eight eighth-note slots: `1 & 2 & 3 & 4 &`. Each slot is one token:
//   SYL   a syllable (CAPITALS = stressed)     -syl  a melisma continuing the previous word
//   a·b   two sixteenths in one slot           ~     hold the previous note
//   .     rest
// Pitches are given separately, one per syllable, in scientific notation with flats written
// `b` (Eb4). `D5>Eb5` is a scoop or glide from the first pitch to the second.
//
// Time is kept in sixteenths from the start of bar 0 and converted to samples once, at render.

const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function midi(name) {
  const m = /^([A-G])(b|#)?(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad pitch ${name}`);
  const acc = m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0;
  return 12 * (Number(m[3]) + 1) + NOTE_INDEX[m[1]] + acc;
}

function parsePitch(p) {
  const parts = p.split('>').map(midi);
  return { midi: parts[parts.length - 1], glide: parts.length > 1 ? parts.slice(0, -1) : [] };
}

// Build one voice part from lines of [bar, grid, pitches].
export function part(voice, lines) {
  const slots = []; // { t (16ths), kind: 'syl'|'hold'|'rest', syl }
  for (const [bar, grid, pitches = ''] of lines) {
    const tokens = grid.trim().split(/\s+/);
    if (tokens.length !== 8) throw new Error(`${voice} bar ${bar}: ${tokens.length} slots, need 8: "${grid}"`);
    const notes = pitches.trim() ? pitches.trim().split(/\s+/) : [];
    let n = 0;
    tokens.forEach((tok, i) => {
      const subs = tok.includes('·') ? tok.split('·') : [tok];
      const step = 2 / subs.length;
      subs.forEach((s, j) => {
        const t = bar * 16 + i * 2 + j * step;
        const end = t + step;
        if (s === '~') slots.push({ t, end, kind: 'hold' });
        else if (s === '.') slots.push({ t, end, kind: 'rest' });
        else {
          if (n >= notes.length) throw new Error(`${voice} bar ${bar}: no pitch for "${s}"`);
          slots.push({ t, end, kind: 'syl', syl: s, pitch: notes[n++] });
        }
      });
    });
    if (n !== notes.length) throw new Error(`${voice} bar ${bar}: ${notes.length} pitches for ${n} syllables`);
  }
  slots.sort((a, b) => a.t - b.t);
  const events = [];
  let cur = null;
  const close = (t) => {
    if (cur) {
      cur.dur = t - cur.t;
      events.push(cur);
      cur = null;
    }
  };
  // A note sounds until the next syllable or rest; if the next written slot comes after the end
  // of the last one (an unwritten bar in between), it stops where the writing stopped.
  let lastEnd = -Infinity;
  for (const s of slots) {
    if (cur && s.t > lastEnd) close(lastEnd);
    lastEnd = Math.max(lastEnd, s.end);
    if (s.kind === 'hold') continue;
    close(s.t);
    if (s.kind === 'syl') {
      const melisma = s.syl.startsWith('-');
      const text = melisma ? s.syl.slice(1) : s.syl;
      const letters = text.replace(/[^A-Za-z]/g, '');
      cur = {
        voice,
        t: s.t,
        text: text.toLowerCase(),
        written: text, // as written in the grid, so the pronoun "I" and a syllable "i" differ
        stress: letters !== 'I' && letters.length > 0 && letters === letters.toUpperCase(), // 'I' is not a stress
        melisma,
        ...parsePitch(s.pitch),
      };
    }
  }
  // A note held to the end of the last written slot.
  close(lastEnd);
  return events;
}

// Chords as [bar, 'Eb'] or [bar, 'Cm Ab'] (second chord from beat 3).
export function chordTrack(list) {
  const out = [];
  for (const [bar, spec] of list) {
    const cs = spec.split(/\s+/);
    cs.forEach((c, i) => out.push({ t: bar * 16 + i * (16 / cs.length), chord: c }));
  }
  out.sort((a, b) => a.t - b.t);
  out.forEach((c, i) => (c.dur = (out[i + 1]?.t ?? c.t + 16) - c.t));
  return out;
}

const QUALITY = { '': [0, 4, 7], m: [0, 3, 7], '5': [0, 7], sus4: [0, 5, 7], NC: [] };

// 'Eb', 'Cm', 'Bb5', 'Bbsus4', or a slash chord 'Eb/G' (bass note after the slash).
export function chordTones(name) {
  if (name === 'NC') return { root: null, bass: null, tones: [] };
  const m = /^([A-G](?:b|#)?)(m|5|sus4)?(?:\/([A-G](?:b|#)?))?$/.exec(name);
  if (!m) throw new Error(`bad chord ${name}`);
  const root = midi(`${m[1]}2`) % 12;
  const bass = m[3] ? midi(`${m[3]}2`) % 12 : root;
  return { root, bass, tones: QUALITY[m[2] ?? ''].map((x) => (root + x) % 12) };
}
