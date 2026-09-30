// Episode 4: The Green Room. An original portrait swing musical drawn entirely in JavaScript.
import {C,initPaint,finish,setBeatMap,text,line,oval,between,clamp} from './paint.js';
import {stage} from './world.js';
import {drawLyrics,lyricIndex,prelude} from './lyrics.js';
import {opening,boast} from './boast.js';
import {investigation} from './gym.js';
import {chorus,bridge} from './ensemble.js';
import {breakdown,outro,endCard} from './lesson.js';

export const fonts=[
  ['Fraunces','video/ep04/revue/fonts/Fraunces.ttf',{weight:'100 900'}],
  ['Josefin','video/ep04/revue/fonts/JosefinSans.ttf',{weight:'100 700'}],
  ['Limelight','video/ep04/revue/fonts/Limelight.ttf'],
];
export const images={badge:'video/ep04/revue/assets/openai-blossom.svg'};
let audio;
export async function init(S){
  initPaint();setBeatMap(S.beats);
  try{audio=await fetch('/music/ep04/audio.json').then(r=>r.json());}catch{audio=null;}
}
function singing(t){
  if(!audio?.db?.vocals)return .3;
  const k=Math.floor(t*audio.fps),v=audio.db.vocals[k]??-80;
  return clamp((v+47)/25)*.88;
}
const actLabels=['A SOFTWARE QUALITY REVUE','A MOST CONVENIENT RESULT','FOLLOW THE CLUE','TESS’S DISAPPEARING SET','FOLLOW THE CLUE','A CREW WITH QUESTIONS','THE DIFFERENCE','FOLLOW THE CLUE','WHAT WE KNOW · WHAT WE DON’T'];
function act(i){return i<2?0:i<14?1:i<20?2:i<28?3:i<34?4:i<46?5:i<54?6:i<60?7:8;}
export function draw(g,t,S){
  const i=lyricIndex(t,S),lineData=S.lyrics[i],a=act(i);
  const F={i,line:lineData,S,sing:singing(t),badge:S.img?.badge};
  const mode=i>=20&&i<28||i>=60?'gym':/Refrain/.test(lineData.section)?'chorus':'theatre';
  stage(g,t,mode);
  if(t>=S.beats.audio_duration){endCard(g,t,F);window.__wordRecords=[];}
  else{
    // Small, phrase-long breathing of the picture; lettering never follows the camera.
    const p=between(t,lineData.start,lineData.end);
    g.save();g.translate(528,1164);const z=1+.007*Math.sin(p*Math.PI);g.scale(z,z);g.translate(-528,-1164);
    if(i<2)opening(g,t,F);
    else if(i<14)boast(g,t,F);
    else if(i<20)chorus(g,t,F);
    else if(i<28)investigation(g,t,F);
    else if(i<34)chorus(g,t,F);
    else if(i<46)bridge(g,t,F);
    else if(i<54)breakdown(g,t,F);
    else if(i<60)chorus(g,t,F);
    else outro(g,t,F);
    g.restore();
    text(g,actLabels[a],528,211,23,C.gray,'Josefin');
    if(t<S.lyrics[0].start-.23)prelude(g,t);else drawLyrics(g,t,S);
  }
  finish(g,t);
}
export function drawMarks(g){
  text(g,'@yanqingcheng',82,1845,25,C.paper,'Josefin','left',500);
  // Therefore sign: the three dots sit at an equilateral triangle's corners.
  for(const [x,y] of [[891,1828],[881,1845.32],[901,1845.32]])oval(g,x,y,2.5,2.5,C.paper,null);
  text(g,'tollens',915,1845,25,C.paper,'Josefin','left',500);
}
