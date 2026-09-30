import {C,path,line,oval,box,text,star,hash,rays,pulse,beat,check,cross,wifi,arrow} from './paint.js';

function decoFan(g,x,y,r,col=C.brass){
  for(let i=-4;i<=4;i++){
    const a=-Math.PI/2+i*.15;
    line(g,[[x,y],[x+r*Math.cos(a),y+r*Math.sin(a)]],col,2.5);
  }
  for(const f of [.56,.74,1]){g.beginPath();g.arc(x,y,r*f,Math.PI*1.28,Math.PI*1.72);g.strokeStyle=col;g.lineWidth=2;g.stroke();}
}
export function stage(g,t,mode='theatre'){
  const bg=g.createLinearGradient(0,0,0,1920);bg.addColorStop(0,C.deep);bg.addColorStop(.58,mode==='gym'?'#224b4c':C.night);bg.addColorStop(1,C.deep);
  g.fillStyle=bg;g.fillRect(0,0,1080,1920);
  const glow=g.createRadialGradient(540,1020,35,540,1040,710);glow.addColorStop(0,'#74927527');glow.addColorStop(1,'#74927500');g.fillStyle=glow;g.fillRect(0,300,1080,1350);
  if(mode==='chorus')rays(g,540,1160,t,.075);
  // Both curtains are painted from flowing, asymmetric curves with held shading.
  for(const side of [-1,1]){
    g.save();if(side===1){g.translate(1080,0);g.scale(-1,1);}
    path(g,'M0 0 L161 0 Q145 297 123 535 Q83 868 72 1459 L0 1585Z',C.velvet,null);
    for(let i=0;i<7;i++){
      const x=10+i*20;
      path(g,`M${x} 0 Q${x-6} 250 ${x-14} 515 Q${x-40} 913 ${Math.max(2,x-66)} 1490`,null,i%2?'#7b3b4780':'#391d2b75',i%2?11:7);
    }
    path(g,'M0 116 Q52 165 133 125 L132 141 Q52 186 0 131Z',C.gold,C.ink,2);
    path(g,'M71 974 Q83 1009 91 988 L80 1040 Q58 1041 54 1017Z',C.gold,C.ink,3);
    line(g,[[78,1036],[68,1132]],C.brass,6);oval(g,68,1136,9,17,C.gold,C.ink,2);
    g.restore();
  }
  path(g,'M0 0 L1080 0 L1080 59 Q859 139 736 80 Q540 138 349 82 Q174 137 0 56Z',C.velvet,C.ink,4);
  path(g,'M0 61 Q173 142 349 87 Q540 147 736 86 Q875 146 1080 63',null,C.gold,3);
  // Fluted brass proscenium columns, not an abstract floating frame.
  for(const x of [25,1028]){
    box(g,x,116,27,1390,C.deep,1,C.brass,3);
    for(let i=1;i<4;i++)line(g,[[x+i*6,143],[x+i*6,1476]],'#9a795b75',1);
    path(g,`M${x-6} 142 L${x+14} 120 L${x+33} 142 L${x+14} 164Z`,C.brass,null);
  }
  // The lyric space is an integral part of the theatre's poster composition.
  decoFan(g,540,170,76,'#d5aa6850');
  line(g,[[145,159],[438,159]],'#e8bc7055',2);line(g,[[642,159],[935,159]],'#e8bc7055',2);
  path(g,'M0 1465 Q526 1439 1080 1467 L1080 1920 L0 1920Z','#3d3632',C.ink,4);
  for(let i=-8;i<=8;i++)line(g,[[540+i*45,1462],[540+i*136,1920]],'#ba976225',3);
  for(const yy of [1514,1581,1670,1791]){line(g,[[0,yy],[1080,yy+4]],'#1c292b80',3);}
  path(g,'M0 1674 Q548 1655 1080 1677 L1080 1718 Q550 1692 0 1718Z',C.deep,C.ink,4);
  for(let i=0;i<13;i++){
    const x=44+i*83,alpha=.10+.025*Math.sin(t*2+i);
    const h=g.createRadialGradient(x,1684,2,x,1684,68);h.addColorStop(0,`rgba(232,188,112,${alpha})`);h.addColorStop(1,'#e8bc7000');g.fillStyle=h;g.fillRect(x-68,1616,136,136);
    oval(g,x,1686,12,5,C.gold,C.ink,2);
  }
  for(let i=0;i<16;i++){
    const x=165+hash(i*5+7)*750,y=650+hash(i*6+8)*720;
    if(mode==='chorus')star(g,x,y,3+hash(i+9)*4,C.brass,Math.sin(t+i)*.05);
  }
  // Cabaret patrons provide foreground depth. The whole story remains above them.
  for(const [xx,kind] of [[145,0],[951,1]]){
    const yy=1816+Math.sin(t*1.7+kind*2)*1.3;
    path(g,`M${xx-81} 1920 L${xx-74} 1869 Q${xx} 1826 ${xx+75} 1872 L${xx+89} 1920Z`,'#11242b',C.ink,3);
    oval(g,xx,yy,49,57,'#10232a',C.ink,4);
    if(kind===0){path(g,`M${xx-57} ${yy-18} Q${xx} ${yy-42} ${xx+58} ${yy-17} L${xx+61} ${yy-8} Q${xx} ${yy-29} ${xx-61} ${yy-6}Z`,'#21363b',C.ink,3);}
    else{path(g,`M${xx-35} ${yy-44} Q${xx-45} ${yy-72} ${xx-9} ${yy-68} Q${xx+17} ${yy-83} ${xx+42} ${yy-49}Z`,'#2c3635',C.ink,3);}
    path(g,`M${xx-79} 1907 Q${xx} 1863 ${xx+83} 1909`,null,C.brass,2);
  }
}

export function gym(g,t){
  // Tall municipal windows, a palm, a gym bench, and a pleasantly worn wooden floor.
  path(g,'M146 1427 L145 787 Q147 665 290 662 L790 662 Q933 664 932 787 L934 1427Z','#477370',C.ink,5);
  path(g,'M176 1060 L175 796 Q178 698 296 699 L783 699 Q898 700 901 795 L902 1062Z','#a4b9a0',C.ink,5);
  path(g,'M180 987 Q427 822 900 799 L901 1019 Q426 1021 181 1042Z','#d9cba15a',null);
  for(const xx of [327,538,749])line(g,[[xx,701],[xx,1062]],C.teal,9);
  line(g,[[179,894],[901,892]],C.teal,9);
  for(const xx of [163,918])box(g,xx,1090,10,333,'#355b55',1,null);
  box(g,193,1126,698,267,'#315f58',2,C.ink,3);
  for(let i=0;i<13;i++)line(g,[[213+i*53,1129],[213+i*53,1389]],'#244c48',2);
  text(g,'TESS’S GYM',537,741,31,C.teal,'Josefin');
  // Dumbbells on a real bench; main props never float.
  path(g,'M112 1338 L340 1338 L331 1381 L124 1381Z',C.paper,C.ink,4);
  for(const xx of [143,306])line(g,[[xx,1378],[xx-4,1450]],C.ink,9);
  for(const xx of [161,265]){
    line(g,[[xx-24,1317],[xx+24,1317]],C.brass,10);
    box(g,xx-32,1299,12,37,C.ink,3,C.cream,2);box(g,xx+21,1299,12,37,C.ink,3,C.cream,2);
  }
  palm(g,892,1391,.64,t);
}
export function palm(g,x,y,s,t){
  g.save();g.translate(x,y);g.scale(s,s);
  path(g,'M-43 0 L-30 78 Q0 95 36 77 L50 0Z',C.velvet,C.ink,4);oval(g,3,0,48,10,C.wine,C.ink,3);
  for(let i=0;i<7;i++){
    const a=i*.42-1.33,xx=Math.sin(a)*116,yy=-176+Math.abs(i-3)*20;
    const dx=Math.sin(t*.8+i)*3;
    path(g,`M0 -6 Q${xx*.08} -103 ${xx+dx} ${yy} Q${xx*.62+dx} ${yy+74} 0 -6Z`,i%2?C.emerald:'#527763',C.ink,3);
    path(g,`M0 -6 Q${xx*.08} -103 ${xx+dx} ${yy}`,null,C.brass,1.8);
  }g.restore();
}

export function score(g,t,o={}){
  const x=185,y=745,w=710,h=390;
  box(g,x-8,y-12,w+16,h+24,C.brass,12,C.ink,6);box(g,x,y,w,h,C.deep,8,C.ink,4);
  for(let i=0;i<200;i++){
    const xx=x+74+(i%20)*29.6,yy=y+135+Math.floor(i/20)*21;
    const on=t>i*.006;oval(g,xx,yy,5,5,on?C.mint:'#35514d',null);
  }
  text(g,'200',540,y+105,120,C.gold,'Limelight');
  text(g,'GREEN',540,y+367,31,C.mint,'Josefin');
  if(o.ribbon){
    const yy=1183,xx=776;path(g,`M${xx-26} ${yy+21} L${xx-39} ${yy+109} L${xx-12} ${yy+90} L${xx+4} ${yy+107} L${xx+16} ${yy+19}Z`,C.red,C.ink,3);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;oval(g,xx+Math.cos(a)*23,yy+Math.sin(a)*23,16,12,C.gold,C.ink,2,a);}
    oval(g,xx,yy,24,24,C.paper,C.ink,3);check(g,xx,yy,.44,C.emerald);
  }
}

export function calc(g,x,y,s,title,o={}){
  g.save();g.translate(x,y);g.rotate(o.angle||0);g.scale(s,s);
  box(g,-153,-155,306,305,C.paper,5,C.ink,5);
  box(g,-141,-142,282,54,C.teal,2,C.ink,2);text(g,title,0,-103,33,C.cream,'Josefin');
  text(g,'£12 + £8',0,-31,39,C.ink,'Josefin');
  text(g,o.total||'£25',0,74,96,o.total==='£20'?C.emerald:C.ink,'Fraunces');
  line(g,[[-125,101],[125,99]],C.brass,2);
  for(let i=0;i<6;i++)box(g,-121+i*42,117,26,14,'#b8a987',2,C.ink,1);
  g.restore();
}

export function receipt(g,x,y,s,total='£20',o={}){
  g.save();g.translate(x,y);g.rotate(o.angle||-.08);g.scale(s,s);
  path(g,'M-117 -147 L117 -147 L115 142 L101 128 L87 142 L71 128 L54 142 L38 128 L22 142 L7 128 L-9 142 L-25 128 L-42 142 L-58 128 L-74 142 L-91 128 L-116 142Z',C.cream,C.ink,4);
  text(g,o.title||'RECEIPT',0,-99,27,C.teal,'Josefin');
  line(g,[[-93,-80],[93,-80]],C.brass,2);
  text(g,'Item one    £12',0,-38,23,C.ink,'Josefin');text(g,'Item two     £8',0,1,23,C.ink,'Josefin');
  line(g,[[-93,21],[93,21]],C.brass,2);text(g,total,0,82,66,C.emerald,'Fraunces');
  g.restore();
}

export function phone(g,x,y,s,t,o={}){
  g.save();g.translate(x,y);g.rotate(o.angle||0);g.scale(s,s);
  box(g,-174,-262,348,524,C.ink,31,C.ink,6);box(g,-158,-244,316,490,C.cream,19,C.brass,3);
  line(g,[[-28,-231],[27,-231]],C.ink,5);
  text(g,o.title||'GYM LOG',-123,-188,32,C.teal,'Josefin','left');wifi(g,111,-210,o.online!==false,.5);
  line(g,[[-132,-165],[132,-165]],C.brass,2);
  if(o.entry){
    box(g,-128,-138,257,o.second?94:127,C.mint,9,C.ink,3);
    text(g,o.second?'KEPT SET':'SQUATS',-107,-103,25,C.teal,'Josefin','left');text(g,'3 × 8',-106,o.second?-60:-43,47,C.ink,'Josefin','left');
    check(g,103,-76,.3,C.emerald);
    if(o.second){
      box(g,-128,-28,257,93,o.second==='present'?C.paper:C.cream,9,C.brass,2);
      text(g,'NEW SET',-106,1,22,C.teal,'Josefin','left');
      if(o.second==='present')text(g,'3 × 8',-106,44,40,C.ink,'Josefin','left');
      else{text(g,'missing',0,43,33,C.velvet,'Fraunces');cross(g,105,35,.24,C.red);}
    }
  }else{
    oval(g,0,-81,30,30,'#e1d3b6',C.brass,2);line(g,[[-13,-81],[13,-81]],C.brass,3);
    text(g,'No sets',0,-20,35,C.teal,'Fraunces');
  }
  if(o.saved){
    box(g,-126,o.second?78:25,253,o.second?42:65,C.teal,6,C.ink,2);text(g,'Saved!',0,o.second?110:70,o.second?32:41,C.cream,'Fraunces');
  }
  if(o.reload){
    g.save();g.translate(0,163);g.rotate(t*3);path(g,'M-23 1 A24 24 0 1 1 21 13',null,C.teal,5);path(g,'M12 9 L25 13 L25 -2',null,C.teal,5);g.restore();
    text(g,'reload',0,218,25,C.teal,'Josefin');
  }else{box(g,-126,135,253,65,C.velvet,7,C.ink,2);text(g,'SAVE SET',0,178,26,C.cream,'Josefin');}
  if(o.tap){
    for(let i=0;i<4;i++){const a=i*Math.PI/2+t*.05;line(g,[[126+Math.cos(a)*17,168+Math.sin(a)*17],[126+Math.cos(a)*31,168+Math.sin(a)*31]],C.gold,4);}
  }
  g.restore();
}

export function archive(g,x,y,s,t,o={}){
  g.save();g.translate(x,y);g.scale(s,s);
  box(g,-101,-98,202,196,C.blue,8,C.ink,5);path(g,'M-100 -72 L100 -72 L100 -98 L-100 -98Z',C.teal,C.ink,3);
  for(const yy of [-55,17]){
    box(g,-85,yy,170,66,C.teal,4,C.ink,3);box(g,-17,yy+18,35,10,C.gold,1,C.ink,2);
  }
  if(o.entry){box(g,-66,-128,136,103,C.paper,3,C.ink,3);text(g,'3 × 8',0,-71,31,C.ink,'Josefin');}
  else if(o.empty){path(g,'M-84 37 L-121 80 L84 82 L84 39Z',C.deep,C.ink,3);path(g,'M-122 79 L85 79 L85 103 L-118 100Z',C.blue,C.ink,3);text(g,'empty',-16,71,24,C.paper,'Josefin');}
  text(g,'STORED',0,139,27,C.cream,'Josefin');g.restore();
}

export function card(g,x,y,w,h,label,o={}){
  g.save();g.translate(x,y);g.rotate(o.angle||0);
  box(g,-w/2,-h/2,w,h,o.fill||C.paper,5,C.ink,4);
  if(o.title){text(g,o.title,0,-h/2+40,26,C.teal,'Josefin');line(g,[[-w/2+20,-h/2+53],[w/2-20,-h/2+53]],C.brass,2);}
  text(g,label,0,o.title?29:12,o.size||41,o.color||C.ink,o.font||'Fraunces');g.restore();
}

export function snapshot(g,x,y,s,comma=true,title='EXPECTED'){
  g.save();g.translate(x,y);g.scale(s,s);
  box(g,-173,-129,346,258,C.paper,6,C.ink,5);
  box(g,-159,-117,318,43,C.teal,2,C.ink,2);text(g,title,0,-87,25,C.cream,'Josefin');
  box(g,-143,-53,285,106,C.cream,8,C.brass,2);
  text(g,comma?'Hello, Pat!':'Hello Pat!',0,15,39,C.ink,'Fraunces');
  for(let i=0;i<3;i++)line(g,[[-130,82+i*12],[-10+i*31,82+i*12]],C.brass,3);
  g.restore();
}

export function browser(g,x,y,w,h,title,o={}){
  g.save();g.translate(x,y);g.rotate(o.angle||0);
  box(g,-w/2,-h/2,w,h,C.cream,11,C.ink,5);
  box(g,-w/2+8,-h/2+8,w-16,48,C.teal,5,C.ink,2);
  for(let i=0;i<3;i++)oval(g,-w/2+25+i*18,-h/2+31,4,4,i===0?C.red:C.gold,null);
  text(g,title,0,-h/2+40,26,C.cream,'Josefin');
  g.restore();
}
