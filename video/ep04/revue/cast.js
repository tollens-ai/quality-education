// A new cast drawing for this film: four expressive Clawds and their app's users.
import {C,path,line,oval,box,text,groundShadow,twos,pulse,beat,check,magnifier} from './paint.js';

function glove(g,x,y,a=0,s=1,pose='open'){
  g.save();g.translate(x,y);g.rotate(a);g.scale(s,s);
  const d=pose==='point'?'M-17 10 Q-25 2 -19 -11 Q-16 -16 -9 -13 L-7 -35 Q-5 -44 2 -39 L5 -15 Q15 -23 19 -13 Q30 -13 26 -2 Q28 6 17 13 Q1 23 -17 10Z':pose==='fist'?'M-19 9 Q-24 -14 -7 -16 Q0 -21 9 -16 Q22 -19 26 -8 Q28 11 14 16 Q-1 24 -19 9Z':'M-17 10 Q-25 2 -21 -10 Q-18 -18 -11 -16 L-15 -29 Q-14 -38 -7 -31 L-1 -19 L-1 -33 Q1 -41 7 -34 L9 -20 L13 -29 Q19 -34 21 -26 L18 -12 Q29 -12 27 -3 Q27 6 17 12 Q2 23 -17 10Z';
  path(g,d,C.cream,C.ink,3.5);
  line(g,[[-12,8],[10,7]],C.brass,2);g.restore();
}
function arm(g,side,end,bend=0,col=C.ink){
  const sx=side*89,sy=7,ex=end[0],ey=end[1];
  path(g,`M${sx} ${sy} Q${(sx+ex)/2+side*23+bend} ${(sy+ey)/2+35} ${ex} ${ey}`,null,col,16);
  path(g,`M${sx-2} ${sy-2} Q${(sx+ex)/2+side*20+bend} ${(sy+ey)/2+29} ${ex-2} ${ey-3}`,null,'#48534a',3);
  glove(g,ex,ey,side*.25,1,end[2]||(ey<-20?'point':ey>60?'fist':'open'));
}
const skins={clawd:C.orange,ivy:'#bc916c',pip:'#c68f6c',bea:'#e8aa81'};
const clothes={clawd:C.night,ivy:C.emerald,pip:'#315f77',bea:C.velvet};

// Sol is an original GPT character, not a redrawing of the OpenAI mark. Its exact,
// supplied mark is a lapel pin; the soft silhouette, costume and performance are ours.
export function sol(g,x,y,s,t,o={}){
  const clock=twos(t),b=beat(clock)+(o.phase||0),dance=o.dance??.55;
  const hop=Math.max(0,Math.sin(b*Math.PI*2))*dance*16;
  groundShadow(g,x,y+140*s,92*s,12*s);
  g.save();g.translate(x,y-hop*s);g.scale(s*(1+hop*.0015),s*(1-hop*.0011));
  g.rotate((o.tilt||0)+Math.sin(b*Math.PI)*dance*.045);
  const skin=C.cream;
  for(const side of [-1,1]){
    const dx=side*41+Math.sin(b*Math.PI*2+side*.65)*dance*27;
    path(g,`M${side*36} 77 Q${side*47} 108 ${dx} 133`,null,C.ink,16);
    path(g,`M${dx-13} 127 Q${dx+7} 120 ${dx+side*28} 132 Q${dx+side*30} 141 ${dx-16} 141Z`,C.ink,C.ink,3);
    path(g,`M${dx-9} 119 L${dx+10} 120 L${dx+14} 132 L${dx-11} 130Z`,C.paper,C.ink,2);
    oval(g,dx+3,128,2,2,C.brass,null);
  }
  const wave=(v,side)=>[v[0]+Math.sin(b*Math.PI+side)*dance*7,v[1]+Math.sin(b*Math.PI*2+side)*dance*12,v[2]];
  const left=wave(o.left||[-131,31],-1),right=wave(o.right||[132,17],1);
  arm(g,-1,left,-8,C.night);arm(g,1,right,5,C.night);
  // A plump, ink-outlined ivory silhouette, with a little asymmetric forelock.
  path(g,'M-93 -34 Q-107 -98 -74 -139 Q-49 -172 -3 -167 Q11 -188 30 -166 Q84 -160 95 -98 Q105 -58 91 -7 L80 51 Q74 91 27 93 L-30 94 Q-79 87 -86 52Z',skin,C.ink,6);
  path(g,'M-73 -107 Q-64 -143 -41 -150 M-67 -96 Q-64 -105 -59 -108',null,C.white,6);
  path(g,'M79 -86 Q92 -53 80 -19 L71 47 Q68 65 53 67 L65 -12Z','#c7b79055',null);
  // Waistcoat and silk lapels: his rounded silhouette has a clear shape at phone size.
  path(g,'M-88 -5 Q-48 7 -29 2 L0 36 L28 2 Q69 7 91 -7 L78 53 Q72 91 22 91 L0 74 L-18 92 Q-70 89 -79 55Z',C.teal,C.ink,4);
  path(g,'M-75 -9 L-34 4 L-6 41 L-43 20 L-49 40Z',C.night,C.ink,2);
  path(g,'M75 -10 L35 4 L7 40 L44 19 L48 40Z',C.night,C.ink,2);
  path(g,'M-21 -1 L0 25 L23 -2 L13 -10 L-12 -10Z',C.white,C.ink,2);
  path(g,'M-27 -3 L-6 4 L-26 14Z',C.gold,C.ink,2);path(g,'M28 -3 L7 4 L27 14Z',C.gold,C.ink,2);oval(g,0,5,6,6,C.brass,C.ink,2);
  for(const yy of [46,66])oval(g,0,yy,3.5,3.5,C.gold,C.ink,1);
  const look=o.look||[0,0],mood=o.mood||'happy',blink=Math.sin(clock*1.81+(o.phase||0)*3)>.986;
  for(const side of [-1,1]){
    const ex=side*33,ey=-83+(mood==='curious'?side*3:0);
    if(blink)path(g,`M${ex-14} ${ey} Q${ex} ${ey+7} ${ex+14} ${ey}`,null,C.ink,5);
    else{
      oval(g,ex,ey,14,mood==='smug'?20:25,C.ink,null,-side*.025);
      oval(g,ex-4+look[0]*6,ey-9+look[1]*6,5,7,C.white,null);
      if(mood==='smug')path(g,`M${ex-16} ${ey-23} L${ex+17} ${ey-8} L${ex+17} ${ey-29}Z`,skin,null);
    }
    const yb=-122+(mood==='curious'?side*9:0);
    path(g,`M${ex-15} ${yb+6} Q${ex} ${yb-3} ${ex+15} ${yb+4}`,null,C.ink,4);
  }
  oval(g,-59,-40,15,7,'#cf74504d',null);oval(g,59,-40,15,7,'#cf74504d',null);
  const sing=o.sing||0;
  if(sing>.08){oval(g,1,-32,13+sing*6,5+sing*12,C.ink,null);oval(g,2,-26+sing*4,9,3.5,C.blush,null);}
  else if(mood==='worried')path(g,'M-15 -25 Q0 -35 17 -26',null,C.ink,4);
  else if(mood==='curious')oval(g,3,-28,6,6,C.ink,null);
  else path(g,'M-20 -35 Q0 -13 22 -35',null,C.ink,4);
  // Light hatching helps the face feel illustrated without a glossy robot finish.
  for(let i=0;i<3;i++){line(g,[[-66+i*6,-40],[-64+i*6,-34]],'#b9755d55',1.5);}
  if(o.badge){oval(g,58,30,17,17,C.cream,C.ink,1.5);g.drawImage(o.badge,44,16,28,28);}
  g.save();g.translate(-4,-150);g.rotate(-.11+Math.sin(b*Math.PI)*dance*.04);
  path(g,'M-51 -3 L-42 -96 Q0 -108 43 -92 L51 -4Z',C.deep,C.ink,5);
  path(g,'M-46 -29 Q0 -37 47 -26 L49 -8 Q0 -17 -48 -8Z',C.gold,C.ink,2);
  path(g,'M-71 1 Q-46 -10 0 -8 Q50 -11 71 2 Q59 14 -2 13 Q-59 15 -71 1Z',C.night,C.ink,4);
  path(g,'M-29 -83 Q-26 -92 -14 -94',null,C.gray,3);g.restore();
  if(o.note){g.save();g.translate(left[0]-3,left[1]+12);g.rotate(-.13);box(g,-39,-42,80,94,C.paper,4,C.ink,3);text(g,'?',0,19,50,C.teal,'Fraunces');g.restore();}
  if(o.glass){magnifier(g,right[0]-35,right[1]-21,.43,-.35);glove(g,right[0],right[1],.25,1,'fist');}
  g.restore();
}

export function clawd(g,x,y,s,t,o={}){
  const name=o.name||'clawd',clock=twos(t),phase=o.phase||0;
  const dance=o.dance??.55,b=beat(clock)+phase,hop=Math.max(0,Math.sin(b*Math.PI*2))*dance*15;
  const sway=Math.sin(b*Math.PI)*dance*.055,tilt=o.tilt||0;
  groundShadow(g,x,y+118*s,99*s,13*s);
  g.save();g.translate(x,y-hop*s);g.scale(s*(1+hop*.002),s*(1-hop*.0016));g.rotate(sway+tilt);
  // Individually articulated rubber-hose legs and little spat shoes.
  for(const side of [-1,1]){
    const sx=side*52,dx=side*53+Math.sin(b*Math.PI*2+side*.6)*dance*26;
    path(g,`M${sx} 58 Q${sx+side*20} 88 ${dx} 109`,null,C.ink,17);
    path(g,`M${dx-12} 106 Q${dx+13} 98 ${dx+side*28} 111 Q${dx+side*30} 121 ${dx-15} 121 Z`,C.ink,C.ink,4);
    path(g,`M${dx-8} 97 L${dx+11} 98 L${dx+15} 112 L${dx-9} 110Z`,C.paper,C.ink,2);
  }
  const wave=(v,side)=>[v[0]+Math.sin(b*Math.PI+side)*dance*6,v[1]+Math.sin(b*Math.PI*2+side)*dance*12,v[2]];
  const left=wave(o.left||[-133,52],-1),right=wave(o.right||[134,33],1);
  arm(g,-1,left);arm(g,1,right);
  // The stepped, orange crab silhouette remains recognisable in a painted stage costume.
  path(g,'M-83 -111 L-53 -111 L-53 -127 L-23 -127 L-23 -113 L28 -113 L28 -127 L59 -127 L59 -111 L87 -110 L88 -77 L111 -77 L111 -46 L94 -46 L94 48 L71 48 L71 67 L-71 67 L-71 48 L-94 48 L-94 -45 L-111 -45 L-111 -76 L-88 -76Z',skins[name],C.ink,6);
  path(g,'M-81 -100 L-52 -100 L-51 -116 M-74 -89 Q-57 -96 -39 -91',null,C.orangeLight,5);
  // Shadow on the right is painted, not a shiny bevel.
  path(g,'M72 -95 L85 -94 L85 -60 L93 -60 L83 -33 L83 38 L63 38 L63 57 L45 57 L55 8Z','#9d604128',null);
  path(g,'M-86 22 Q-31 28 0 20 Q38 25 88 18 L88 45 L68 45 L68 61 L-66 61 L-66 45 L-87 45Z',clothes[name],C.ink,3);
  path(g,'M-17 22 L0 47 L19 22 L12 14 L-11 14Z',C.cream,C.ink,2);
  path(g,'M-26 24 L-9 29 L-26 39Z',C.red,C.ink,2);path(g,'M27 24 L10 30 L26 40Z',C.red,C.ink,2);oval(g,0,30,7,7,C.gold,C.ink,2);
  const look=o.look||[0,0],mood=o.mood||'happy';
  const blink=Math.sin(clock*1.85+phase*2.3)> .989;
  for(const side of [-1,1]){
    const ex=side*38,ey=-51+(mood==='worried'?side*2:0);
    if(blink){path(g,`M${ex-14} ${ey} Q${ex} ${ey+4} ${ex+14} ${ey}`,null,C.ink,5);}
    else{
      box(g,ex-15,ey-17,29,37,C.ink,2,null);
      oval(g,ex+look[0]*5-3,ey+look[1]*4-8,4.5,5.5,C.cream,null);
      if(mood==='smug')path(g,`M${ex-16} ${ey-18} L${ex+17} ${ey-10} L${ex+17} ${ey-19}Z`,skins[name],null);
    }
    const by=-80+(mood==='curious'?side*8:mood==='worried'?-side*5:0);
    path(g,`M${ex-14} ${by+4} Q${ex} ${by-4} ${ex+13} ${by+1}`,null,C.ink,4);
  }
  oval(g,-62,-10,14,6,'#b9544230',null);oval(g,62,-10,14,6,'#b9544230',null);
  const sing=o.sing??0;
  if(sing>.1){oval(g,0,-2,12+sing*5,6+sing*11,C.ink,null);oval(g,1,5+sing*3,8,3,C.blush,null);}
  else if(mood==='worried')path(g,'M-13 5 Q0 -2 14 3',null,C.ink,4);
  else if(mood==='curious')oval(g,4,0,6,5,C.ink,null);
  else path(g,'M-17 -2 Q0 15 18 -3',null,C.ink,4);
  if(name==='clawd'){
    // A genuinely tipsy top hat: it nods while the face remains readable.
    g.save();g.translate(-5,-112);g.rotate(-.09+Math.sin(b*Math.PI)*dance*.035);
    path(g,'M-58 -7 L-47 -111 Q1 -124 47 -107 L57 -5Z',C.deep,C.ink,5);
    path(g,'M-50 -35 Q0 -46 52 -31 L55 -10 Q0 -20 -54 -9Z',C.gold,C.ink,2);
    path(g,'M-77 0 Q-52 -13 0 -9 Q50 -15 77 -1 Q68 10 -1 10 Q-67 15 -77 0Z',C.night,C.ink,4);
    path(g,'M-35 -92 Q-29 -108 -16 -107',null,C.gray,3);g.restore();
  }else if(name==='ivy'){
    path(g,'M-81 -118 Q-76 -163 -19 -155 Q37 -179 73 -134 Q42 -117 -30 -115Z',C.emerald,C.ink,4);
    oval(g,36,-153,7,7,C.gold,C.ink,2);
    for(const side of [-1,1])oval(g,side*38,-47,25,27,'#fff0cb00',C.brass,3);
    line(g,[[-13,-48],[13,-48]],C.brass,3);
  }else if(name==='pip'){
    path(g,'M-82 -117 Q-43 -150 14 -149 Q53 -151 73 -127 L61 -116Z',C.blue,C.ink,4);
    path(g,'M-27 -120 Q43 -139 97 -117 L79 -108 L-24 -109Z',C.cream,C.ink,4);
  }else{
    path(g,'M-68 -124 Q-72 -164 -23 -167 Q-8 -198 15 -167 Q54 -173 69 -132 Q34 -118 -68 -124Z',C.velvet,C.ink,4);
    path(g,'M34 -170 Q70 -210 90 -185 Q74 -166 45 -151Z',C.gold,C.ink,2);
  }
  if(o.note){g.save();g.translate(left[0]-5,left[1]+10);g.rotate(-.15);box(g,-40,-46,87,102,C.paper,4,C.ink,3);line(g,[[-26,-23],[29,-23]],C.brass,3);line(g,[[-26,-7],[21,-7]],C.brass,3);check(g,-5,20,.35,C.emerald);g.restore();}
  if(o.glass){magnifier(g,right[0]-35,right[1]-21,.43,-.35);glove(g,right[0],right[1],.25,1,'fist');}
  g.restore();
}

export function person(g,x,y,s,t,o={}){
  const clock=twos(t),phase=o.phase||0,b=beat(clock)+phase,dance=o.dance??.18;
  const type=o.type||'tess',skin=type==='sam'?'#d1a281':type==='pat'?'#edc19e':'#bf8164';
  const shirt=type==='sam'?C.blue:type==='pat'?C.blush:C.red;
  groundShadow(g,x,y+177*s,75*s,12*s);g.save();g.translate(x,y-3*dance*Math.sin(b*Math.PI*2));g.scale(s,s);
  for(const side of [-1,1]){
    const step=Math.sin(b*Math.PI*2+side*.8)*dance*15,xx=side*29+step;
    path(g,`M${side*27} 79 Q${side*27-5} 119 ${xx} 161`,null,skin,25);
    path(g,`M${xx-14} 151 Q${xx+12} 154 ${xx+22} 166 Q${xx+21} 177 ${xx-22} 173 L${xx-25} 164Z`,C.cream,C.ink,3);
    line(g,[[xx-7,157],[xx+8,161]],C.ink,2);
  }
  const l=o.left||[-69,60],r=o.right||[72,32];
  for(const [side,end] of [[-1,l],[1,r]]){
    path(g,`M${side*39} -31 Q${side*76} 9 ${end[0]} ${end[1]}`,null,C.ink,21);
    path(g,`M${side*39} -31 Q${side*76} 9 ${end[0]} ${end[1]}`,null,skin,16);
    oval(g,...end,11,15,skin,C.ink,3,-side*.4);
  }
  path(g,'M-27 -68 Q-54 -58 -48 -9 L-37 51 Q-11 70 43 48 L53 -11 Q49 -57 29 -64Z',shirt,C.ink,5);
  path(g,'M-37 47 Q0 65 43 47 L44 92 L4 92 L-2 75 L-9 95 L-44 95Z',type==='tess'?C.paper:C.night,C.ink,4);
  path(g,'M-15 -81 L-17 -55 Q0 -43 19 -59 L17 -83Z',skin,C.ink,3);
  path(g,'M-38 -153 Q-52 -129 -39 -102 Q-24 -83 9 -83 Q33 -84 43 -109 L46 -146 Q43 -176 7 -181 Q-23 -185 -38 -153Z',skin,C.ink,4);
  if(type==='tess'){
    path(g,'M-42 -140 Q-48 -192 -2 -196 Q44 -197 49 -154 L50 -116 Q47 -104 36 -101 L32 -147 Q5 -144 -9 -161 Q-20 -151 -31 -143 L-31 -103 Q-50 -102 -47 -119Z',C.ink,C.ink,3);
    path(g,'M-42 -156 Q3 -176 43 -158 L46 -144 Q0 -162 -41 -143Z',C.red,C.ink,3);
    path(g,'M43 -157 Q69 -167 62 -142 L45 -143Z',C.blush,C.ink,3);
  }else if(type==='sam'){
    path(g,'M-44 -146 Q-48 -181 -9 -188 Q12 -205 32 -185 Q54 -181 49 -153 Q11 -144 -14 -164 Q-30 -149 -44 -146Z',C.night,C.ink,4);
  }else{
    path(g,'M-42 -144 Q-49 -190 1 -191 Q46 -192 47 -150 Q10 -160 -9 -173 Q-24 -145 -42 -144Z',C.velvet,C.ink,4);
    path(g,'M40 -170 Q84 -159 68 -113 Q88 -140 58 -188Z',C.velvet,C.ink,4);
  }
  const blink=Math.sin(clock*1.7+phase*3)>.989,look=o.look||0;
  for(const side of [-1,1]){
    const ex=side*16+2;
    if(blink)line(g,[[ex-5,-126],[ex+5,-124]],C.ink,3);
    else oval(g,ex+look*3,-128,4,6,C.ink,null);
    path(g,`M${ex-6} -140 Q${ex} ${o.mood==='curious'?-149:-145} ${ex+6} -141`,null,C.ink,3);
  }
  path(g,'M3 -125 Q-2 -109 7 -110',null,'#965d4c',3);
  if(o.mood==='worried')path(g,'M-8 -98 Q2 -105 12 -101',null,C.ink,3);
  else path(g,'M-10 -102 Q1 -89 13 -103',null,C.ink,3);
  oval(g,-26,-111,8,4,'#d78b7060',null);
  if(type==='sam'){for(const side of [-1,1])box(g,side*16-11,-139,23,22,'#00000000',5,C.ink,2.5);line(g,[[-4,-129],[6,-129]],C.ink,2);}
  if(o.clipboard){box(g,l[0]-25,l[1]-20,66,93,C.paper,4,C.ink,3);text(g,'3 × 8',l[0]+7,l[1]+19,19,C.ink);line(g,[[l[0]-13,l[1]+35],[l[0]+28,l[1]+35]],C.brass,2);}
  g.restore();
}
