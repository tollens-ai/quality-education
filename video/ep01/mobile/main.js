// Episode 1, "Good for Who?", video v2: "The Mobile". A cut-paper film after Matisse's Jazz and
// Calder's mobiles; the treatment is episodes/01-video.md. Scenes are pure functions of song time
// and change with hard cuts.
// Render: node video/lib/render.mjs --scene video/ep01/mobile/main.js --song music/ep01 --stills 1,6
import { init as paperInit, setScale, grain, wall } from './paper.js';
import * as sec1 from './sec1.js';
import * as sec2 from './sec2.js';
import * as sec3 from './sec3.js';
import * as sec4 from './sec4.js';

export const font = 'Bricolage';
export const markColor = 'rgba(40,30,20,0.55)';
export const fonts = [
  ['Bricolage', 'video/fonts/BricolageGrotesque.ttf', { weight: '200 800' }],
  ['Caveat', 'video/fonts/Caveat.ttf', { weight: '400 700' }],
];

let SCENES = [...sec1.scenes];

// The other agents' official marks, drawn exactly as provided. They're kept locally (not in git);
// without them the cards are blank.
export const images = {
  molty: '.private/ep01-assets/openclaw.svg',
  muse: '.private/ep01-assets/muse-logo.svg',
  grok: '.private/ep01-assets/grok-512.png',
  openai: '.private/ep01-assets/openai-blossom.svg',
};

export async function init(S) {
  paperInit();
  sec1.init(S);
  sec2.init(S);
  sec4.init(S);
  SCENES = [...sec1.scenes, ...sec2.buildScenes(S), ...sec3.buildScenes(S), ...sec4.buildScenes(S)];
}

export function draw(g, t, S) {
  setScale(g.getTransform().a);
  const sc = SCENES.find(s => t >= s.from && t < s.to) || SCENES[SCENES.length - 1];
  try { sc.draw(g, t, S); }
  catch (e) { wall(g); console.error(`scene at ${t.toFixed(2)}: ${e.message}`); }
  grain(g, t);
}
