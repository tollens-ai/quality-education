import {C,path,line,oval,box,text,arrow,check,cross,between,smooth,ease,beat,magnifier,wifi} from './paint.js';
import {sol,clawd,person} from './cast.js';
import {gym,phone,archive,card} from './world.js';

export function investigation(g,t,F){
  const j=F.i-20,p=between(t,F.line.start,F.line.end),prior=F.S.lyrics[20].start;
  gym(g,t);
  const online=j===3||j===4||j===5;
  let entry=j<2||j>=5,saved=j===1||j===5||j===6;
  if(j===2)entry=p<.22;
  const stored=j>=5;
  phone(g,532,1010,.92,t,{online,entry,saved,second:j===6?'present':j===7?'missing':null,reload:j===2||j===3||j===7,tap:j===0||j===5||j===6,angle:-.01*Math.sin(t)});
  archive(g,780,1267,.70,t,{entry:stored,empty:j===2||j===3});
  // This cable is an illustrative connection, clearly broken when there is no network.
  g.save();g.setLineDash([9,10]);path(g,'M690 1165 Q749 1134 786 1197',null,online?C.mint:C.red,4);g.restore();
  if(!online)cross(g,746,1167,.45,C.red);
  if(j===1){
    text(g,'SAYS “SAVED”…',538,682,31,C.gold,'Josefin');
    card(g,778,1088,213,77,'?',{fill:C.paper,size:48,angle:.04});
  }else if(j===2){
    // The record visibly leaves on reload; a physical notebook preserves the user's intent.
    const v=ease(between(p,.18,.6));
    if(v>0&&v<1){g.save();g.globalAlpha=1-v;card(g,532+v*112,930-v*99,214,91,'3 × 8',{fill:C.mint,angle:v*.5,size:40});g.restore();}
    text(g,'AFTER RELOAD',535,682,29,C.gold,'Josefin');
  }else if(j===3){
    text(g,'RECONNECTED',533,682,31,C.mint,'Josefin');
    text(g,'still empty',778,1119,26,C.gold,'Fraunces');
  }else if(j===4){
    // The next experiment follows the clue, with connectivity as the changed condition.
    card(g,532,713,596,67,'TRY: CONNECT BEFORE SAVING',{fill:C.teal,color:C.cream,font:'Josefin',size:27});
    arrow(g,765,895,714,895,C.mint,6);
  }else if(j===5){
    card(g,532,715,571,67,'CONNECTED SAVE → KEPT',{fill:C.teal,color:C.cream,font:'Josefin',size:29});
    check(g,779,1104,.53,C.mint);
  }else if(j===6){
    card(g,532,715,568,67,'REPEAT: SAVE WITHOUT SIGNAL',{fill:C.teal,color:C.cream,font:'Josefin',size:26});
  }else if(j===7){
    // A check made from the discovery fails. The film does not pretend the bug is fixed.
    card(g,785,1127,251,130,'NEW SET GONE',{title:'AFTER RELOAD',fill:C.paper,size:25});
    card(g,532,715,596,71,'NEW CHECK: RECORD SHOULD STAY',{fill:C.teal,color:C.cream,font:'Josefin',size:25});
    cross(g,773,1195,.52,C.red);
  }else{text(g,'NO SIGNAL',533,715,31,C.gold,'Josefin');}
  // Tess's face and notebook establish what matters to a real user.
  person(g,223,1300,.88,t,{mood:j===2||j===3?'worried':'curious',look:1,clipboard:true,left:[-77,24],right:[81,-5],dance:.1});
  sol(g,602,1400,.67,t,{badge:F.badge,sing:F.sing,mood:j<2?'happy':'curious',look:[0,-1],right:[111,-123],left:[-113,37],dance:.22,note:j>3});
  clawd(g,866,1400,.62,t,{name:'ivy',mood:'curious',look:[-1,-1],left:[-122,-41],right:[115,44],dance:.14,note:true,phase:1});
  if(j===4||j===7)magnifier(g,805,1341,.40,-.55);
}
