// A composed poster, rather than a cropped frame with a caption missing its last word.
export {fonts,images,init,drawMarks} from './main.js';
import {C,text,line,star,finish,box} from './paint.js';
import {stage,card} from './world.js';
import {sol,clawd} from './cast.js';
export function draw(g,t,S){
  stage(g,9,'chorus');
  text(g,'SOFTWARE QUALITY THEORY 101 · 4',528,205,25,C.gray,'Josefin');
  text(g,'DID YOU',528,359,98,C.cream,'Limelight');
  text(g,'ACTUALLY',528,490,111,C.gold,'Limelight');
  text(g,'TEST IT?',528,642,140,C.cream,'Limelight');
  line(g,[[293,725],[763,725]],C.brass,2);star(g,528,725,9,C.gold);
  text(g,'A SWING REVUE WITH QUESTIONS',528,787,28,C.mint,'Josefin');
  card(g,756,1000,306,234,'200',{title:'GREEN',font:'Limelight',size:117,fill:C.paper,angle:.055});
  sol(g,364,1357,1.65,9.41,{badge:S.img?.badge,mood:'curious',glass:true,right:[139,-100],left:[-121,25],dance:.2,look:[1,-.4]});
  clawd(g,832,1377,.91,9.41,{name:'ivy',mood:'curious',note:true,look:[-1,-1],right:[119,-81],dance:.14,phase:1});
  text(g,'THE PERFECT SCORE. THE NEXT QUESTION.',528,1637,26,C.paper,'Josefin');
  finish(g,9);
}
