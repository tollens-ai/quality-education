import {C,path,line,oval,box,text,arrow,check,cross,star,between,smooth,pulse,beat,ease} from './paint.js';
import {sol,clawd} from './cast.js';
import {score,calc,snapshot,card} from './world.js';

function lead(g,x,y,s,t,F,o={}){sol(g,x,y,s,t,{sing:F.sing,badge:F.badge,...o});}
export function opening(g,t,F){
  g.save();g.translate(627,923);g.scale(.86,.86);g.translate(-540,-940);score(g,t,{ribbon:F.i>0});g.restore();
  const p=F.i===0?0:between(t,F.line.start,F.line.start+1.3);
  lead(g,303,1376,1.36,t,F,{mood:'smug',left:[-125,52],right:[132-70*p,-33-110*p],dance:.75});
  // His hat is almost a second performer: a small bow to his own perfect score.
  clawd(g,844,1377,.72,t,{name:'ivy',mood:'curious',look:[-1,-1],dance:.16,note:true,phase:1});
  text(g,'THE PERFECT SCORE',627,698,25,C.brass,'Josefin');
}
export function boast(g,t,F){
  const j=F.i-2,p=between(t,F.line.start,F.line.end),pair=Math.floor(j/2);
  if(pair<=1){
    const paste=pair===0?smooth(between(t,F.S.lyrics[2].start+.7,F.S.lyrics[3].start+.5)):1;
    calc(g,297,967,1.02,'APP',{angle:-.026});
    calc(g,783,967,1.02,'“TEST”',{angle:.028,total:'£25'});
    // A sheet travelling from the app to the check explicitly shows copied logic.
    if(pair===0&&paste<.98){
      g.save();g.globalAlpha=Math.sin(paste*Math.PI);card(g,300+paste*485,939-95*Math.sin(paste*Math.PI),170,145,'£25',{title:'COPY',angle:paste*.09,size:50});g.restore();
    }
    arrow(g,464,882,617,882,C.gold,8);text(g,'COPY',541,863,24,C.gold,'Josefin');
    if(j>=1)check(g,540,1014,.57,C.mint);
    if(pair===1){
      card(g,528,1148,390,75,'THE SUMS AGREE',{fill:C.emerald,color:C.cream,font:'Josefin',size:30});
      if(j===3){
        // They agree with each other; neither agrees with ordinary arithmetic.
        cross(g,296,1019,.47,C.red);cross(g,782,1019,.47,C.red);
        text(g,'…both?',531,770,39,C.gold,'Fraunces');
      }
    }
    lead(g,528,1437,.92,t,F,{mood:j===3?'happy':'smug',right:[139,-55],left:[-134,-10],dance:.58});
    clawd(g,144,1387,.64,t,{name:'ivy',mood:'curious',look:[1,-1],dance:.15,note:true,phase:1});
    clawd(g,900,1386,.64,t,{name:'pip',mood:'curious',look:[-1,-1],dance:.12,phase:2});
  }else if(pair<=3){
    const updated=j>=7&&p>.14;
    snapshot(g,296,967,.99,!updated,'EXPECTED');snapshot(g,782,967,.99,false,'ACTUAL');
    if(pair===2){
      card(g,528,1148,423,72,'DIFFERENCE',{fill:C.velvet,color:C.cream,font:'Josefin',size:32});
      cross(g,530,1100,.46,C.red);
      // The comma is a tiny change, made huge by a magnifying theatrical spotlight.
      oval(g,466,967,35,35,'#00000000',C.gold,4);
      text(g,',',466,992,72,C.gold,'Fraunces');
      lead(g,525,1442,.90,t,F,{mood:'happy',right:[141,-89],left:[-118,42],dance:.56});
    }else{
      if(updated){card(g,528,1148,452,72,'EXPECTED CHANGED',{fill:C.emerald,color:C.cream,font:'Josefin',size:29});check(g,530,1100,.46,C.mint);}
      else{card(g,528,1148,452,72,'CHANGE EXPECTED…',{fill:C.velvet,color:C.cream,font:'Josefin',size:29});}
      lead(g,525,1442,.90,t,F,{mood:'smug',left:[-151,-107],right:[125,13],dance:.48});
      // A reference replacement, rather than an app repair.
      if(!updated){path(g,'M383 1252 Q272 1150 320 1081',null,C.gold,7);arrow(g,320,1081,319,1040,C.gold,7);}
    }
    clawd(g,140,1387,.63,t,{name:'ivy',mood:'curious',look:[1,-1],dance:.11,note:true,phase:1});
    clawd(g,900,1397,.65,t,{name:'pip',mood:'curious',look:[-1,-1],dance:.24,phase:2});
  }else{
    // A schoolroom set slides into the same theatre. The reward system shapes the work.
    box(g,171,761,730,389,C.emerald,7,C.brass,7);
    text(g,'MAKE THE GRADE',528,817,35,C.cream,'Josefin');
    const pct=Math.round(72+28*ease(between(t,F.S.lyrics[10].start,F.S.lyrics[11].start+1)));
    text(g,`${pct}%`,528,955,103,C.gold,'Limelight');
    text(g,'COVERAGE',528,1004,28,C.mint,'Josefin');
    for(let k=0;k<10;k++){box(g,250+k*57,1051,43,39,k<pct/10?C.mint:'#31524b',3,C.ink,2);}
    if(pair===5){
      card(g,745,900,203,116,'A+',{title:'SCORE',size:61,angle:.065,fill:C.paper});
      // A desktop and notebook let Sol act the pupil, rather than turning users into a gag.
      path(g,'M394 1392 L687 1391 L727 1425 L363 1427Z',C.paper,C.ink,5);
      for(const xx of [399,681])line(g,[[xx,1426],[xx+7,1510]],C.ink,9);
      card(g,532,1395,124,52,'✓',{font:'Josefin',color:C.emerald,size:32,angle:-.04});
      lead(g,528,1269,.91,t,F,{mood:'smug',left:[-113,107],right:[130,100],dance:.30});
      // Foreground desk occludes the lower costume correctly.
      path(g,'M368 1410 L721 1410 L704 1445 L383 1445Z',C.brass,C.ink,4);
    }else{
      lead(g,528,1384,.95,t,F,{mood:'smug',right:[146,-104],left:[-125,39],dance:.72});
      star(g,667,1262,20,C.gold,.1);
    }
    clawd(g,167,1386,.67,t,{name:'ivy',mood:'curious',look:[1,-1],dance:.2,note:true,phase:1});
    clawd(g,901,1385,.64,t,{name:'pip',mood:'curious',look:[-1,-1],dance:.23,phase:2});
  }
}
