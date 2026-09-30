import * as T from '../type.js';

const all = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?\'-:()/%&+*∴…';
const missing = [...new Set(all)].filter(c => !T.has(c));
console.log('missing glyphs:', missing.join(' ') || '(none)');
console.log('measure "Make it good for who?" @100px =', T.measure('Make it good for who?', 100).toFixed(1));
for (const ch of 'AoBcegS58Q3') console.log(ch, 'strokes', T.layout(ch, 0, 100, 100).length);