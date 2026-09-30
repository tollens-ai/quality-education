import {C,path,line,oval,box,text,arrow,check,cross,star,between,ease,smooth,beat,magnifier,wifi} from './paint.js';
import {sol,clawd,person} from './cast.js';
import {card,phone,receipt,calc,browser,gym,archive} from './world.js';

export function breakdown(g,t,F){
  const j=F.i-46,p=between(t,F.line.start,F.line.end),pair=Math.floor(j/2);
  // A quiet, intimate pool of light for the definitions. No mechanical dancing here.
  const glow=g.createRadialGradient(529,1089,16,529,1089,469);glow.addColorStop(0,'#cbb17a18');glow.addColorStop(1,'#cbb17a00');g.fillStyle=glow;g.fillRect(83,687,900,842);
  if(pair===0){
    card(g,528,763,644,80,'RULE: DO THE TOTALS MATCH?',{fill:C.teal,color:C.cream,font:'Josefin',size:27});
    calc(g,303,1010,.87,'APP');calc(g,764,1010,.87,'CHECK');
    text(g,'=',530,1027,71,C.gold,'Fraunces');
    if(j%2===1){card(g,529,1203,421,79,'RULE MET',{fill:C.emerald,color:C.cream,font:'Josefin',size:32});check(g,531,1163,.45,C.mint);}
    sol(g,530,1400,.69,t,{badge:F.badge,sing:F.sing,mood:'curious',right:[127,-90],left:[-121,23],dance:.07});
  }else if(pair===1){
    card(g,530,823,523,117,j%2?'TRY WITHOUT SIGNAL':'WHAT ELSE COULD MATTER?',{title:'FOLLOW THE CLUE',font:'Josefin',size:j%2?27:26});
    const pr=between(t,F.S.lyrics[48].start,F.S.lyrics[49].end);
    path(g,'M531 896 Q462 971 331 1000',null,C.gold,5);path(g,'M531 896 Q603 956 751 1000',null,C.gold,5);
    phone(g,313,1147,.42,t,{entry:pr<.55,saved:pr<.55,online:false,reload:pr>.55});
    card(g,776,1135,230,190,'3 × 8',{title:'TESS’S NOTES',font:'Josefin',size:52,angle:.025});
    text(g,'OBSERVE',312,1307,23,C.gold,'Josefin');text(g,'COMPARE',775,1307,23,C.gold,'Josefin');
    sol(g,531,1412,.68,t,{badge:F.badge,sing:F.sing,mood:'curious',look:[0,-1],note:true,right:[120,-66],dance:.06});
  }else if(pair===2){
    const compare=j%2===1;
    calc(g,285,989,.80,'APP');calc(g,762,989,.80,'CHECK');
    text(g,'=',526,1008,75,C.gold,'Fraunces');
    if(!compare){card(g,529,1196,444,72,'THE SUMS AGREE',{fill:C.emerald,color:C.cream,font:'Josefin',size:28});}
    else{
      receipt(g,530,1201,.66,'£20',{angle:-.025});
      line(g,[[461,1201],[392,1070]],C.red,4);line(g,[[600,1201],[652,1070]],C.red,4);
      cross(g,283,1013,.42,C.red);cross(g,763,1013,.42,C.red);
    }
    sol(g,204,1413,.70,t,{badge:F.badge,sing:F.sing,mood:'curious',look:[1,-1],right:[138,-54],left:[-100,38],dance:.08});
    clawd(g,874,1410,.70,t,{name:'ivy',mood:'curious',look:[-1,-1],left:[-127,-42],note:true,dance:.07,phase:1});
    if(compare)text(g,'COMPARE WITH SOMETHING ELSE',529,755,26,C.gold,'Josefin');
  }else{
    // A check sits INSIDE the investigation, with observations leading to the next question.
    path(g,'M277 874 Q510 725 790 901 Q950 1150 692 1240 Q476 1380 282 1170 Q165 1036 277 874Z','#213d3d',C.brass,4);
    card(g,529,913,419,135,'RECORD MISSING',{title:'CHECK: RECORD SHOULD STAY',font:'Josefin',size:27,fill:C.paper});
    cross(g,725,914,.33,C.red);
    arrow(g,691,999,743,1073,C.gold,5);arrow(g,681,1198,603,1231,C.gold,5);arrow(g,375,1220,307,1124,C.gold,5);arrow(g,302,951,344,918,C.gold,5);
    card(g,331,1111,191,80,'NOTICE',{font:'Josefin',size:27,fill:C.mint,angle:-.04});
    card(g,727,1111,191,80,'QUESTION',{font:'Josefin',size:25,fill:C.mint,angle:.04});
    card(g,529,1233,218,75,'TRY NEXT',{font:'Josefin',size:26,fill:C.gold});
    if(j%2){
      person(g,815,1385,.52,t,{clipboard:true,mood:'curious',look:-1,dance:.08});
      card(g,529,764,497,63,'WHAT SERVES TESS BEST?',{fill:C.teal,color:C.cream,font:'Josefin',size:28});
    }
    sol(g,324,1423,.62,t,{badge:F.badge,sing:F.sing,mood:'happy',look:[1,-1],right:[123,-87],left:[-107,27],dance:.08});
    clawd(g,718,1423,.63,t,{name:'ivy',mood:'curious',look:[-1,-1],note:true,dance:.08,phase:1});
  }
}

export function outro(g,t,F){
  const j=F.i-60;
  gym(g,t);
  if(j===0){
    phone(g,549,1009,.81,t,{online:false,entry:false,reload:true});
    card(g,524,754,670,71,'FINDING: OFFLINE SAVE IS LOST',{fill:C.teal,color:C.cream,font:'Josefin',size:28});
    person(g,220,1308,.76,t,{clipboard:true,mood:'curious',look:1,dance:.06});
    sol(g,765,1368,.91,t,{badge:F.badge,sing:F.sing,mood:'curious',note:true,look:[-1,-1],left:[-120,-53],dance:.17});
  }else{
    // Access to these gym records is UNKNOWN; the bridge's private chat was a different app.
    browser(g,531,981,580,343,'GYM LOG · READERS?');
    box(g,298,894,466,143,C.paper,8,C.brass,3);text(g,'WORKOUT LOGS',529,937,31,C.teal,'Josefin');
    for(let i=0;i<3;i++)line(g,[[335,967+i*17],[603-i*18,967+i*17]],C.brass,3);
    oval(g,677,980,40,40,C.teal,C.ink,3);text(g,'?',677,1004,65,C.gold,'Fraunces');
    card(g,531,754,636,72,'NOT TESTED YET',{fill:C.velvet,color:C.cream,font:'Josefin',size:31});
    sol(g,375,1401,.91,t,{badge:F.badge,sing:F.sing,mood:'curious',note:true,right:[132,-51],look:[1,-1],dance:.16});
    person(g,778,1336,.75,t,{clipboard:true,mood:'curious',look:-1,left:[-78,9],dance:.07});
    clawd(g,166,1409,.61,t,{name:'ivy',note:true,mood:'curious',look:[1,-1],dance:.09,phase:1});
  }
}

export function endCard(g,t,F){
  const p=ease(between(t,F.S.beats.audio_duration,F.S.beats.audio_duration+.5));
  g.save();g.globalAlpha=p;
  text(g,'DID YOU ACTUALLY',529,300,61,C.gold,'Limelight');text(g,'TEST IT?',529,397,92,C.cream,'Limelight');
  line(g,[[277,468],[779,468]],C.brass,2);star(g,529,468,9,C.gold);
  text(g,'BRIEF A TESTING CREW',529,578,35,C.mint,'Josefin');
  const rows=[
    ['Users, situations and goals.',C.cream],
    ['Browsers, a playbook and oracles.',C.cream],
    ['Room to follow clues.',C.gold],
    ['Findings, evidence and unknowns.',C.cream],
    ['Talk through the doubts.',C.cream],
  ];
  for(let i=0;i<rows.length;i++){
    star(g,161,698+i*114,5,C.brass);
    text(g,rows[i][0],203,713+i*114,41,rows[i][1],'Josefin','left');
  }
  line(g,[[201,1244],[852,1244]],C.brass,2);
  text(g,'Testing & checking: James Bach & Michael Bolton',528,1298,24,C.gray,'Josefin');
  text(g,'Oracles: Howden, Weyuker, Bach & Bolton',528,1333,24,C.gray,'Josefin');
  text(g,'Agent teamwork: Yanqing Cheng',528,1368,24,C.gray,'Josefin');
  text(g,'Lyrics: Qing with Claude · Music & voice: Suno',528,1403,24,C.gray,'Josefin');
  text(g,'Drawn & animated in JavaScript by Sol',528,1438,25,C.gold,'Josefin');
  text(g,'SOFTWARE QUALITY THEORY 101 · EPISODE 4',528,1583,24,C.gray,'Josefin');
  sol(g,841,1653,.36,t,{badge:F.badge,mood:'curious',note:true,dance:.05});
  g.restore();
}
