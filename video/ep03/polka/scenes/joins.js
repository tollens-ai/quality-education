// The joins between the film's sections: plain pushes and irises on the bar line, and cuts on a crash.
// (Joins inside a section are that section's own.) A join only shows if both of its shots exist.
import { join } from '../shots.js';

export function register(S) {
  join(16.2, 16.6, 'push', { dir: [-1, 0] });        // the night's end into verse 1's second half
  // 30.56: the crash, a cut, with confetti (chorus 1 draws it)
  join(52.15, 52.55, 'push', { dir: [-1, 0] });      // the ring into Blob's den
  join(87.2, 87.6, 'iris', { at: [540, 1180], col: '#f5eedd' });  // the den into the ring by night
  join(108.05, 108.45, 'push', { dir: [0, -1] });    // the night ring into the trials, on the band's return
  join(121.5, 121.85, 'push', { dir: [-1, 0] });     // the trials into the lesson
  join(151.2, 151.6, 'iris', { at: [540, 1300] });   // the lesson into the parade
  // 178.0 / 181.41: the lead-in's drums into the last chorus; cuts
}
