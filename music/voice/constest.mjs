// Consonant identification test: "The word is X." for one word per English onset consonant,
// spoken at speech rate. Renders clips for check.py-style scoring (see constest.py).
// Usage: node music/voice/constest.mjs [--out=dir] [--opts=json]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLine, speakLine, writeWav } from './index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const flag = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const OUT = flag('out') ?? join(here, '..', 'out', 'voice', 'cons');
const OPTS = JSON.parse(flag('opts') ?? '{}');
mkdirSync(OUT, { recursive: true });

export const WORDS = [
  ['pack', 'p æ k'], ['back', 'b æ k'], ['tack', 't æ k'], ['dad', 'd æ d'], ['cat', 'k æ t'],
  ['gap', 'g æ p'], ['fat', 'f æ t'], ['van', 'v æ n'], ['thin', 'θ ɪ n'], ['that', 'ð æ t'],
  ['sat', 's æ t'], ['zap', 'z æ p'], ['shack', 'ʃ æ k'], ['chat', 'tʃ æ t'], ['jam', 'dʒ æ m'],
  ['hat', 'h æ t'], ['mat', 'm æ t'], ['nap', 'n æ p'], ['lap', 'l æ p'], ['rat', 'r æ t'],
  ['wax', 'w æ k s'], ['yak', 'j æ k'], ['coat', 'k əʊ t'], ['goose', 'g uː s'],
];

const manifest = [];
WORDS.forEach(([word, ph], c) => {
  const evs = speakLine([
    { ph: ['ð', 'ə'], stress: 0, dur: 0.1 },
    { ph: ['w', 'ɜː', 'd'], stress: 1, dur: 0.22 },
    { ph: ['ɪ', 'z'], dur: 0.14 },
    { ph: ph.split(' '), stress: 1, dur: 0.3 },
  ], { at: 0.4, hi: 58, lo: 51 });
  const { audio } = renderLine(evs, { seed: 11 + c, ...OPTS });
  const file = `${word}.wav`;
  writeWav(join(OUT, file), audio);
  manifest.push({ file, words: [word] });
});
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest));
