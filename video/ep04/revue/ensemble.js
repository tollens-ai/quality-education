import {C,path,line,oval,box,text,arrow,check,cross,star,between,ease,smooth,beat,magnifier,wifi} from './paint.js';
import {sol,clawd,person} from './cast.js';
import {card,phone,receipt,calc,browser,palm,gym} from './world.js';

function thread(g,pts,t,col=C.gold){
  g.save();g.setLineDash([9,12]);g.lineDashOffset=-t*24;line(g,pts,col,3);g.restore();
}
function clue(g,x,y,s,t,o={}){
  g.save();g.translate(x,y);g.rotate(Math.sin(beat(t)*Math.PI)*.03);g.scale(s,s);
  box(g,-85,-76,170,151,C.paper,8,C.ink,4);
  text(g,o.label||'?',0,25,o.size||81,C.teal,'Fraunces');star(g,75,-65,13,C.gold,t*.2);
  g.restore();
}
export function chorus(g,t,F){
  const start=F.i<20?14:F.i<34?28:54,j=F.i-start,round=start===14?0:start===28?1:2;
  const p=between(t,F.line.start,F.line.end),pair=Math.floor(j/2);
  if(round===1){learnedChorus(g,t,F,j,p);return;}
  if(round===2){finale(g,t,F,j,p);return;}
  if(pair===0){
    // An invitation, not an interrogation: Ivy hands Sol the magnifying glass.
    const action=j%2,advance=round*.06;
    if(action===0){
      clue(g,529,909,.93,t,{label:round?'3 × 8':'?',size:round?48:81});
      magnifier(g,570,987,.80,-.35);
      thread(g,[[338,1220],[350,997],[426,930]],t);
      thread(g,[[716,1219],[703,1022],[635,955]],t);
    }else{
      // The three verbs become three actual moves of an investigation.
      browser(g,526,943,483,278,'TRY SOMETHING');
      box(g,355,886,347,114,C.mint,8,C.ink,3);text(g,round?'SQUATS 3 × 8':'OPEN THE APP',528,955,35,C.teal,'Josefin');
      const q=Math.floor(p*3);
      if(q===0){arrow(g,784,1026,690,963,C.gold,8);star(g,690,963,15,C.gold);}
      if(q===1){for(let i=0;i<3;i++)card(g,760-i*16,832-i*17,110,61,'?',{size:33,angle:.05*i,fill:C.gold});}
      if(q>=2){clue(g,260,949,.56,t);arrow(g,294,961,361,962,C.gold,7);text(g,'WHAT ELSE?',528,1065,27,C.teal,'Josefin');}
    }
    sol(g,370+Math.sin(beat(t)*Math.PI)*12,1372,1.05,t,{badge:F.badge,sing:F.sing,mood:'curious',right:[131,-88],left:[-115,40],glass:action>0,dance:.68});
    clawd(g,739-Math.sin(beat(t)*Math.PI)*12,1377,.97,t,{name:'ivy',sing:F.sing*.6,mood:'happy',left:[-136,-67],right:[125,24],glass:action===0,dance:.72,phase:1});
    if(round>0)person(g,171,1358,.53,t,{clipboard:true,mood:'curious',look:1,dance:.3});
  }else if(pair===1){
    // A tiny clue grows into a trail. Each subsequent performance has more evidence.
    clue(g,529,911,1.11,t,{label:round?'NO SET':'?',size:round?40:81});
    const k=between(t,F.S.lyrics[start+2].start+.8,F.S.lyrics[start+3].start+1.4);
    const pts=[[529,995],[331,1040],[327,1140],[603,1111],[795,1150]];
    thread(g,pts.slice(0,Math.max(2,Math.ceil(k*pts.length))),t);
    if(k>.18)clue(g,329,1100,.48,t,{label:'WHY?',size:42});
    if(k>.53)clue(g,746,1127,.53,t,{label:'TRY…',size:40});
    sol(g,496,1398,.91,t,{badge:F.badge,sing:F.sing,mood:'happy',right:[144,-78],left:[-125,-40],dance:.67});
    clawd(g,198,1382,.70,t,{name:'pip',sing:F.sing*.6,mood:'happy',note:true,right:[123,-86],dance:.75,phase:2});
    clawd(g,852,1382,.70,t,{name:'ivy',sing:F.sing*.6,mood:'happy',left:[-132,-85],dance:.7,phase:1});
    if(j%2===0){for(let k=0;k<6;k++)star(g,293+k*93,800-22*Math.sin(t+k),6+(k%2)*5,C.gold,t*.1);}
  }else{
    // The chorus lands on evidence and a changed next action, rather than an all-clear.
    if(j%2===0){
      card(g,302,919,310,172,round?'SAVE OFFLINE':'COPIED SUMS',{title:'WHAT WE TRIED',size:round?29:28,angle:-.025});
      card(g,755,919,310,172,round?'SET VANISHED':'BOTH SAY £25',{title:'WHAT WE FOUND',size:round?29:28,angle:.025});
      arrow(g,480,915,575,915,C.gold,6);
    }else{
      card(g,529,905,565,180,round?'TRY A DIFFERENT CONDITION':'COULD BOTH BE WRONG?',{title:'THE NEXT QUESTION',size:round?28:31,fill:C.paper});
      magnifier(g,531,1118,.73,-.52);
      thread(g,[[528,1000],[481,1048],[531,1118]],t);
    }
    sol(g,525,1395,.95,t,{badge:F.badge,sing:F.sing,mood:'curious',note:true,right:[127,-81],left:[-114,13],dance:.58});
    clawd(g,195,1390,.74,t,{name:'ivy',mood:'curious',note:true,look:[1,-1],dance:.5,phase:1});
    clawd(g,859,1391,.74,t,{name:'pip',mood:'curious',note:true,look:[-1,-1],dance:.66,phase:2});
    if(round===2){
      person(g,756,1326,.61,t,{clipboard:true,mood:'curious',look:-1,dance:.32});
      // Tess stands farther back; nearer Pip is drawn last below.
      clawd(g,881,1406,.70,t,{name:'bea',mood:'happy',dance:.66,phase:3});
    }
  }
}

function learnedChorus(g,t,F,j,p){
  gym(g,t);
  const pair=Math.floor(j/2),groove=Math.sin(beat(t)*Math.PI);
  if(pair===0){
    phone(g,384,997,.67,t,{online:false,entry:false,reload:true,angle:-.035});
    card(g,757,890,264,152,'LOST SET',{title:'A CLUE',font:'Josefin',size:32,angle:.055});
    if(j%2){
      card(g,748,1085,257,88,'TRY CONNECTED',{font:'Josefin',size:27,fill:C.mint,angle:-.03});
      arrow(g,685,1101,596,1140,C.gold,7);
    }
    person(g,218,1335,.97,t,{clipboard:true,mood:'curious',look:1,left:[-82,37],right:[71,-53],dance:.30});
    sol(g,651+groove*15,1381,.98,t,{badge:F.badge,sing:F.sing,mood:'curious',glass:true,left:[-129,20],right:[116,-87],look:[-1,-1],dance:.75});
    clawd(g,902,1419,.56,t,{name:'ivy',note:true,sing:F.sing*.5,mood:'curious',dance:.44,phase:1});
  }else if(pair===1){
    // The finding becomes the next experiment, rather than a victory badge.
    card(g,312,922,308,163,'OFFLINE',{title:'FIRST SAVE',font:'Josefin',size:38,fill:C.paper,angle:-.035});
    card(g,758,922,308,163,'CONNECTED',{title:'NEXT SAVE',font:'Josefin',size:33,fill:C.paper,angle:.035});
    wifi(g,313,1084,false,.98);wifi(g,759,1084,true,.98);
    arrow(g,488,921,573,921,C.gold,7);
    text(g,'LOST',314,1190,36,C.blush,'Josefin');text(g,'KEPT',758,1190,36,C.mint,'Josefin');
    sol(g,528+groove*18,1410,1.01,t,{badge:F.badge,sing:F.sing,mood:'happy',glass:true,note:true,left:[-126,15],right:[132,-88],dance:.76});
    person(g,176,1341,.84,t,{clipboard:true,mood:'happy',look:1,dance:.36});
    clawd(g,876,1410,.74,t,{name:'ivy',mood:'happy',sing:F.sing*.6,note:true,dance:.72,phase:1});
  }else{
    const label=j%2?'TRY THE NEXT CONDITION':'SAVED ≠ STORED';
    card(g,539,859,611,149,label,{title:j%2?'WHAT CHANGED OUR MIND':'WHAT WE FOUND',font:'Josefin',size:33,fill:C.paper});
    phone(g,364,1119,.42,t,{online:false,entry:false,reload:true,angle:-.045});
    card(g,750,1110,269,151,'3 × 8',{title:'TESS’S NOTES',font:'Josefin',size:55,angle:.04});
    thread(g,[[449,1109],[532,1016],[631,1088]],t);
    sol(g,655,1420,.89,t,{badge:F.badge,sing:F.sing,mood:'curious',glass:true,note:true,look:[-1,-1],dance:.68});
    person(g,205,1323,.94,t,{clipboard:true,mood:'curious',look:1,right:[75,-29],dance:.25});
    clawd(g,899,1416,.59,t,{name:'ivy',note:true,sing:F.sing*.6,mood:'curious',dance:.44,phase:1});
  }
}

function finale(g,t,F,j,p){
  const pair=Math.floor(j/2),b=beat(t),sway=Math.sin(b*Math.PI);
  // A full company on a shallow staircase. What they celebrate is learning.
  path(g,'M135 1399 L135 1340 L270 1340 L270 1287 L805 1287 L805 1340 L942 1340 L942 1400Z',C.teal,C.brass,3);
  for(const yy of [1340,1398])line(g,[[139,yy],[940,yy]],C.brass,2);
  if(pair===0){
    card(g,529,865,579,156,'OFFLINE SET LOST',{title:'A FINDING, WITH EVIDENCE',font:'Josefin',size:35,fill:C.paper,angle:0});
    if(j%2){
      clue(g,231,977,.43,t,{label:'TRY',size:39});clue(g,842,977,.43,t,{label:'WHY?',size:38});
      thread(g,[[276,977],[378,989],[527,961],[671,989],[797,977]],t);
    }
  }else if(pair===1){
    clue(g,528,817,.92,t,{label:'?',size:83});
    const rise=ease(between(t,F.S.lyrics[56].start,F.S.lyrics[57].start+1));
    thread(g,[[529,891],[356,933],[527,980],[712,933],[832,992]],t);
    card(g,278,951,212,95,'NOTICE',{font:'Josefin',size:29,fill:C.mint,angle:-.055});
    card(g,783,951,212,95,rise>.5?'TRY NEXT':'WONDER',{font:'Josefin',size:29,fill:C.gold,angle:.055});
    for(let k=0;k<10;k++)star(g,142+k*82,792+Math.sin(t*.8+k)*25,6+(k%3)*3,C.gold,t*.1);
  }else{
    card(g,304,850,291,140,'WHAT WE FOUND',{title:'EVIDENCE',font:'Josefin',size:27,fill:C.paper,angle:-.035});
    card(g,759,850,291,140,'WHAT WE DON’T KNOW',{title:'LIMITS',font:'Josefin',size:22,fill:C.paper,angle:.035});
    arrow(g,480,850,578,850,C.gold,6);
  }
  // Rear performers first; everybody has feet on a step, with foreground overlap.
  person(g,197+sway*10,1263,.72,t,{clipboard:true,mood:'happy',look:1,dance:.50});
  clawd(g,863-sway*10,1290,.83,t,{name:'ivy',sing:F.sing*.7,mood:'happy',note:true,right:[119,-82],dance:.87,phase:1});
  sol(g,528+sway*16,1271,1.18,t,{badge:F.badge,sing:F.sing,mood:pair===2?'curious':'happy',glass:true,note:pair===2,left:[-140,-30],right:[132,-98],dance:1.02});
  clawd(g,319-sway*15,1411,.76,t,{name:'pip',sing:F.sing*.6,mood:'happy',left:[-136,-31],right:[136,-59],dance:.95,phase:2});
  clawd(g,752+sway*15,1412,.77,t,{name:'bea',sing:F.sing*.6,mood:'happy',left:[-136,-31],right:[136,-66],dance:.92,phase:3});
}

function playbook(g,x,y,s,t){
  g.save();g.translate(x,y);g.rotate(-.06);g.scale(s,s);
  path(g,'M-82 -111 Q-1 -132 88 -107 L86 113 Q-9 90 -84 114Z',C.paper,C.ink,5);
  path(g,'M-80 -101 Q-2 -121 0 -108 L0 101 Q-46 94 -80 103Z',C.cream,C.ink,3);
  line(g,[[0,-108],[0,101]],C.brass,2);
  for(const [s,yy] of [['Explore',-55],['Notice',-7],['Follow clues',42]])text(g,s,40,yy,17,C.teal,'Josefin');
  magnifier(g,-38,-29,.44,-.4);text(g,'PLAYBOOK',0,143,26,C.cream,'Josefin');g.restore();
}
function boot(g,x,y,s,t){
  g.save();g.translate(x,y);g.scale(s,s);box(g,-57,-38,114,76,C.teal,8,C.ink,4);
  g.save();g.rotate(t*2.3);path(g,'M-21 1 A22 22 0 1 1 21 5',null,C.cream,4);path(g,'M13 1 L22 6 L26 -7',null,C.cream,4);g.restore();
  text(g,'RESTART',0,75,23,C.cream,'Josefin');g.restore();
}

export function bridge(g,t,F){
  const j=F.i-34,p=between(t,F.line.start,F.line.end),pair=Math.floor(j/2);
  if(pair===0){
    browser(g,335,963,377,298,'REAL BROWSER');
    box(g,183,882,303,130,C.mint,5,C.ink,2);text(g,'GYM LOG',334,926,30,C.teal,'Josefin');text(g,'3 × 8',334,982,42,C.ink,'Fraunces');
    playbook(g,766,939,.84,t);
    person(g,740,1343,.72,t,{clipboard:true,mood:'curious',look:-1,dance:.15});
    sol(g,425,1383,.90,t,{badge:F.badge,sing:F.sing,mood:'happy',right:[139,-46],left:[-128,30],dance:.55});
    clawd(g,170,1395,.66,t,{name:'ivy',mood:'happy',note:true,dance:.4,phase:1});
  }else if(pair===1){
    // Qualities tell the crew where to look; user notes are an oracle for this save.
    card(g,316,898,311,171,'KEEP MY WORK',{title:'TESS’S GOAL',font:'Josefin',size:26,angle:-.025});
    card(g,751,898,311,171,'RELIABLE SAVING',{title:'WHAT MATTERS',font:'Josefin',size:25,angle:.025});
    arrow(g,488,894,569,894,C.gold,6);
    card(g,529,1131,487,127,'Squats: 3 × 8',{title:'COMPARE WITH TESS’S NOTES',font:'Fraunces',size:38,angle:-.012});
    person(g,216,1348,.66,t,{clipboard:true,mood:'curious',look:1,right:[88,-35],dance:.12});
    sol(g,546,1397,.82,t,{badge:F.badge,sing:F.sing,mood:'curious',right:[131,-64],left:[-119,-41],dance:.32});
    clawd(g,863,1384,.70,t,{name:'ivy',mood:'curious',note:true,dance:.3,phase:1});
  }else if(pair===2){
    // A completely separate app: Sam's new account versus the private chat's readers.
    const reveal=j%2===1&&p>.12;
    browser(g,309,941,363,306,'ME + PAT');browser(g,763,941,363,306,'SAM · NEW');
    box(g,159,893,300,113,C.mint,8,C.ink,2);text(g,'Meet at six?',309,957,32,C.teal,'Fraunces');
    text(g,'PRIVATE CHAT',309,1070,21,C.teal,'Josefin');
    if(reveal){box(g,613,893,300,113,C.blush,8,C.ink,2);text(g,'Meet at six?',763,957,32,C.ink,'Fraunces');text(g,'WHO SHOULD SEE THIS?',763,1070,20,C.velvet,'Josefin');}
    else text(g,'Can Sam see it?',764,958,27,C.teal,'Fraunces');
    if(reveal)thread(g,[[465,943],[536,878],[609,943]],t,C.red);
    person(g,206,1345,.66,t,{type:'pat',mood:'curious',look:1,phase:1});
    person(g,846,1343,.66,t,{type:'sam',mood:'curious',look:-1,phase:2});
    sol(g,527,1399,.86,t,{badge:F.badge,sing:F.sing,mood:'curious',right:[130,-97],left:[-112,33],note:true,dance:.35});
    card(g,528,1194,285,64,'READERS: ME, PAT',{font:'Josefin',size:23,fill:C.paper});
  }else if(pair===3){
    // A successful observation is worth reporting too. The receipt is an independent reference.
    browser(g,715,930,389,315,'ORDER #42');text(g,'£20',715,981,95,C.emerald,'Fraunces');
    text(g,'after restart',715,1064,26,C.teal,'Josefin');
    receipt(g,292,948,.90,'£20',{angle:-.045});boot(g,522,1176,.72,t);
    if(j%2===1&&p>.2){check(g,528,947,.58,C.mint);thread(g,[[390,934],[526,986],[607,945]],t);}
    person(g,197,1354,.66,t,{type:'sam',mood:'happy',look:1,dance:.14});
    sol(g,649,1401,.83,t,{badge:F.badge,sing:F.sing,mood:'curious',left:[-126,-70],right:[115,37],dance:.42});
    clawd(g,889,1396,.66,t,{name:'pip',note:true,mood:'happy',dance:.4,phase:2});
  }else if(pair===4){
    // An evidence table with the same three cases, not a generic wall of post-its.
    card(g,253,934,236,164,'LOST SET',{title:'GYM',font:'Josefin',size:29,angle:-.05,fill:C.paper});
    card(g,529,882,237,163,'SAM SAW IT',{title:'CHAT',font:'Josefin',size:26,angle:.015,fill:C.paper});
    card(g,804,934,236,164,'£20 KEPT',{title:'ORDER',font:'Josefin',size:29,angle:.05,fill:C.paper});
    thread(g,[[253,1025],[410,1091],[529,973],[645,1090],[804,1025]],t);
    oval(g,532,1334,345,59,C.paper,C.ink,5);
    for(const xx of [245,811])line(g,[[xx,1360],[xx-12,1467]],C.ink,11);
    clawd(g,251,1216,.77,t,{name:'ivy',mood:'curious',note:true,right:[129,68],dance:.18,phase:1});
    clawd(g,816,1218,.76,t,{name:'pip',mood:'curious',left:[-131,68],dance:.18,phase:2});
    sol(g,534,1205,.90,t,{badge:F.badge,sing:F.sing,mood:'curious',left:[-131,71],right:[130,70],dance:.2,note:true});
    // Table apron occludes the bodies and the evidence rests on the tabletop.
    path(g,'M192 1333 Q532 1407 875 1338 L867 1365 Q532 1430 203 1367Z',C.brass,C.ink,4);
    card(g,533,1327,150,52,'?',{font:'Fraunces',size:38,angle:-.06});
  }else{
    // The human supplies context. Sol brings a question and evidence, not a request for a rubber stamp.
    card(g,530,905,606,189,'WHO SHOULD BE ALLOWED?',{title:'LET’S TALK IT THROUGH',font:'Josefin',size:30});
    thread(g,[[306,1147],[415,1102],[530,1087],[662,1110],[782,1156]],t);
    person(g,783,1274,.89,t,{mood:'curious',look:-1,clipboard:true,left:[-86,19],right:[63,54],dance:.10});
    sol(g,350,1353,.97,t,{badge:F.badge,sing:F.sing,mood:'curious',note:true,right:[136,-86],left:[-113,47],look:[1,0],dance:.22});
    clawd(g,549,1430,.56,t,{name:'ivy',mood:'curious',look:[1,-1],note:true,dance:.17,phase:1});
    card(g,672,1210,123,94,'?',{size:49,fill:C.paper,angle:.075});
  }
}
