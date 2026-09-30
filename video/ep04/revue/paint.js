// The Green Room: deliberately drawn contours, matte colours and theatrical light.
// Everything is a deterministic function of time. The grain is a held, original drawing.
export const C = {
  ink:'#17262a', night:'#142d35', deep:'#0b2028', teal:'#264c51', emerald:'#335d4e',
  velvet:'#642e3b', wine:'#833b46', red:'#c65b51', orange:'#dc8862', orangeLight:'#e9aa79',
  gold:'#e8bc70', brass:'#af8852', cream:'#f5ead1', paper:'#ead9b8', mint:'#acd0b7',
  blue:'#79aeb5', blush:'#e5ad9c', white:'#fff2da', gray:'#92a6a2', shadow:'#091c23',
};
export const W=1080, H=1920;
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const mix=(a,b,p)=>a+(b-a)*p;
export const smooth=p=>(p=clamp(p),p*p*(3-2*p));
export const ease=p=>1-(1-clamp(p))**3;
export const between=(t,a,b)=>clamp((t-a)/(b-a));
let beatTimes=[];
export function setBeatMap(beats){beatTimes=(beats.beats||[]).map(b=>typeof b==='number'?b:b.t);}
export const beat=t=>{
  if(beatTimes.length<2)return t*99/60;
  let lo=0,hi=beatTimes.length-1;
  while(hi-lo>1){const m=(lo+hi)>>1;if(beatTimes[m]<=t)lo=m;else hi=m;}
  return lo+(t-beatTimes[lo])/(beatTimes[hi]-beatTimes[lo]);
};
export const pulse=t=>Math.max(0,Math.cos(beat(t)*Math.PI*2))**5;
export const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export const twos=t=>Math.floor(t*15)/15;
export function path(g,d,fill=C.cream,stroke=C.ink,lw=5){
  const p=new Path2D(d);g.lineJoin='round';g.lineCap='round';
  if(fill){g.fillStyle=fill;g.fill(p);}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke(p);}
}
export function line(g,pts,col=C.ink,lw=5){
  g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))g.lineTo(...p);
  g.strokeStyle=col;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.stroke();
}
export function oval(g,x,y,rx,ry,fill=C.cream,stroke=C.ink,lw=4,rot=0){
  g.beginPath();g.ellipse(x,y,rx,ry,rot,0,Math.PI*2);g.fillStyle=fill;g.fill();
  if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke();}
}
export function box(g,x,y,w,h,fill=C.cream,r=14,stroke=C.ink,lw=4){
  // A slightly imperfect painted flat, rather than a stock round rectangle.
  path(g,`M${x+r} ${y} Q${x+w*.48} ${y-2} ${x+w-r} ${y+1}
    Q${x+w+1} ${y+1} ${x+w} ${y+r} L${x+w+1} ${y+h-r}
    Q${x+w} ${y+h+2} ${x+w-r} ${y+h} L${x+r} ${y+h+1}
    Q${x-1} ${y+h} ${x} ${y+h-r} L${x-1} ${y+r} Q${x} ${y} ${x+r} ${y} Z`,fill,stroke,lw);
}
export function text(g,s,x,y,size=32,col=C.cream,font='Josefin',align='center',weight=600){
  g.fillStyle=col;g.font=`${weight} ${size}px ${font}`;g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y);
}
export function arrow(g,x1,y1,x2,y2,col=C.gold,lw=7){
  line(g,[[x1,y1],[x2,y2]],col,lw);const a=Math.atan2(y2-y1,x2-x1);
  line(g,[[x2-19*Math.cos(a-.5),y2-19*Math.sin(a-.5)],[x2,y2],[x2-19*Math.cos(a+.5),y2-19*Math.sin(a+.5)]],col,lw);
}
export function star(g,x,y,r,col=C.gold,rot=0){
  g.save();g.translate(x,y);g.rotate(rot);path(g,`M0 ${-r} Q3 -3 ${r} 0 Q3 3 0 ${r} Q-3 3 ${-r} 0 Q-3 -3 0 ${-r}Z`,col,null);g.restore();
}
export function check(g,x,y,s=1,col=C.mint){
  g.save();g.translate(x,y);g.scale(s,s);path(g,'M-30 0 Q-12 9 -4 23 Q18 -9 39 -29',null,col,12);g.restore();
}
export function cross(g,x,y,s=1,col=C.red){g.save();g.translate(x,y);g.scale(s,s);line(g,[[-17,-17],[17,17]],col,8);line(g,[[-17,17],[17,-17]],col,8);g.restore();}
export function wifi(g,x,y,on=true,s=1){
  g.save();g.translate(x,y);g.scale(s,s);const c=on?C.mint:C.red;
  for(const r of [14,27,40]){g.beginPath();g.arc(0,24,r,Math.PI*1.2,Math.PI*1.8);g.strokeStyle=c;g.lineWidth=6;g.stroke();}
  oval(g,0,24,4,4,c,null);if(!on)line(g,[[-33,-18],[30,35]],c,7);g.restore();
}
export function magnifier(g,x,y,s=1,angle=-.25){
  g.save();g.translate(x,y);g.rotate(angle);g.scale(s,s);
  path(g,'M27 27 L67 74 Q74 81 82 72 L39 23Z',C.gold,C.ink,5);
  oval(g,0,0,43,43,C.blue,C.ink,7);oval(g,0,0,32,32,C.cream,null);path(g,'M-21 -5 Q-18 -23 0 -25',null,C.white,7);g.restore();
}
export function groundShadow(g,x,y,rx=100,ry=14){oval(g,x,y,rx,ry,'#0b1b2280',null);}

let grain;
export function initPaint(){
  grain=document.createElement('canvas');grain.width=W;grain.height=H;
  const q=grain.getContext('2d');
  for(let i=0;i<45000;i++){
    const x=hash(i*3+9)*W,y=hash(i*3+10)*H,r=.4+hash(i*3+11)*1.7;
    q.fillStyle=i%3===0?'#fff0cb12':'#06182010';q.fillRect(x,y,r,r*.65);
  }
}
export function finish(g,t){
  if(grain)g.drawImage(grain,0,0);
  // Quiet ink edge and a vignette. No changing screen-wide grain.
  const v=g.createRadialGradient(540,980,380,540,980,1180);
  v.addColorStop(0,'#091c2300');v.addColorStop(1,'#07192155');g.fillStyle=v;g.fillRect(0,0,W,H);
  g.save();g.globalAlpha=.45;line(g,[[29,57],[25,1863],[1053,1860],[1056,58]],C.brass,2);g.restore();
}

export function rays(g,x,y,t,alpha=.14){
  g.save();g.globalAlpha=alpha;for(let i=0;i<15;i++){
    const a=i/15*Math.PI*2+.03*Math.sin(t*.15),b=a+.032;
    path(g,`M${x} ${y} L${x+1700*Math.cos(a)} ${y+1700*Math.sin(a)} L${x+1700*Math.cos(b)} ${y+1700*Math.sin(b)}Z`,C.gold,null);
  }g.restore();
}
