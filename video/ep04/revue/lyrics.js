// Pair-based theatrical lettering. Each word arrives from the measured vocal, then
// stays with its partner phrase. This also makes the patter's rhyme readable muted.
import {C,text,line,star,ease,beat,clamp} from './paint.js';

export const LYRIC_LEAD=.09;
function printed(w){return w.replace(/"([^"]*)"/g,'“$1”').replace(/^"/,'“').replace(/"/g,'”');}
function layout(g,lines,size,font,width){
  const rows=[];g.font=`${font==='Fraunces'?650:650} ${size}px ${font}`;
  const space=g.measureText(' ').width;
  for(let li=0;li<lines.length;li++){
    let row=[],ww=0;
    for(const w of lines[li].words){
      const str=printed(w.w),mw=g.measureText(str).width;
      if(ww+mw>width&&row.length){rows.push({words:row,width:ww-space,li});row=[];ww=0;}
      row.push({...w,str,width:mw,offset:ww});ww+=mw+space;
    }
    if(row.length)rows.push({words:row,width:ww-space,li});
  }
  return rows;
}
function composition(g,lines){
  const sec=lines[0].section,chorus=/Refrain|Chorus/.test(sec),intro=sec==='Opening';
  const font=chorus||intro?'Fraunces':'Josefin';
  let size=chorus?89:intro?83:69,rows=layout(g,lines,size,font,864);
  while((rows.length>5||rows.length*size*1.13>425)&&size>59){size-=2;rows=layout(g,lines,size,font,864);}
  const top=intro?321:chorus?320:281;
  let y=top,previousLi=-1;const placed=[];
  for(const row of rows){
    if(previousLi!==-1&&previousLi!==row.li)y+=21;
    previousLi=row.li;
    const left=528-row.width/2;
    for(const w of row.words)placed.push({...w,x:left+w.offset,y,li:row.li});
    y+=size*1.17;
  }
  return {font,size,placed,bottom:y};
}

export function lyricIndex(t,S){
  let i=0;for(let k=0;k<S.lyrics.length;k++)if(S.lyrics[k].start<=t+LYRIC_LEAD)i=k;
  return i;
}
export function lyricGroup(t,S){
  const i=lyricIndex(t,S),first=i-i%2;
  return {i,first,lines:S.lyrics.slice(first,first+2)};
}

export function drawLyrics(g,t,S){
  window.__wordRecords=[];
  if(t>=S.beats.audio_duration)return;
  const {i,first,lines}=lyricGroup(t,S);
  if(t<lines[0].start-.23)return;
  const {font,size,placed,bottom}=composition(g,lines);
  for(const w of placed){
      const p=clamp((t-(w.s-LYRIC_LEAD-.10))/.10),ep=ease(p);
      const current=t>=w.s-LYRIC_LEAD&&t<w.e;
      const chorus=/Refrain/.test(lines[0].section);
      const bob=Math.sin(beat(t)*Math.PI*2)*(chorus?3.8:1.7);
      const x=w.x,yv=w.y+(1-ep)*(chorus?49:22)+bob;
      const col=current?C.gold:C.cream;
      if(p>0){
        g.save();g.globalAlpha=ep;g.translate(x+w.width/2,yv);g.rotate((1-ep)*-.035);
        g.font=`650 ${size}px ${font}`;g.textAlign='center';g.textBaseline='alphabetic';
        g.fillStyle=col;g.fillText(w.str,0,0);g.restore();
      }
      window.__wordRecords.push({word:w.w,s:w.s,e:w.e,line:first+w.li,x,y:yv-size*.86,w:w.width,h:size*1.12,size,opacity:ep,fully:p>=1,font,color:col,background:C.deep,tilt:(1-ep)*-.035});
  }
  // Fast joins can leave a final word only 300ms before the next couplet. Carry
  // that small musical tail into its own lower row for a full 700ms of reading.
  let hasTail=false;
  if(first>0){
    const transition=lines[0].start-LYRIC_LEAD;
    const prevLines=S.lyrics.slice(first-2,first),prev=composition(g,prevLines);
    const tail=prev.placed.filter(w=>w.s+.70>transition&&w.li===1);
    if(tail.length&&t<Math.max(...tail.map(w=>w.s+.70))){
      hasTail=true;const slide=ease((t-transition)/.18),tailSize=60;
      g.font=`650 ${tailSize}px ${prev.font}`;const gap=g.measureText(' ').width;
      const widths=tail.map(w=>g.measureText(w.str).width),total=widths.reduce((a,b)=>a+b,0)+gap*(tail.length-1);
      let xx=528-total/2;
      for(let k=0;k<tail.length;k++){
        const w=tail[k],ww=widths[k];
        if(t<w.s+.70){
          const sz=prev.size+(tailSize-prev.size)*slide,x=w.x+(xx-w.x)*slide,yy=w.y+(681-w.y)*slide;
          const width=w.width+(ww-w.width)*slide;
          text(g,w.str,x+width/2,yy,sz,C.cream,prev.font,'center',650);
          window.__wordRecords.push({word:w.w,s:w.s,e:w.e,line:first-1,x,y:yy-sz*.86,w:width,h:sz*1.12,size:sz,opacity:1,fully:true,font:prev.font,color:C.cream,background:C.deep,tilt:0,tail:true});
        }xx+=ww+gap;
      }
    }
  }
  // A small ornamental rule echoes the picture's brass, leaving the words unboxed.
  if(!hasTail){const dy=Math.min(720,bottom+4);line(g,[[373,dy],[502,dy]],'#e8bc7060',2);line(g,[[554,dy],[683,dy]],'#e8bc7060',2);star(g,528,dy,6,C.brass);}
}

export function prelude(g,t){
  const p=ease(t/.6);g.save();g.globalAlpha=p;
  text(g,'DID YOU',528,282,66,C.cream,'Limelight');text(g,'ACTUALLY',528,366,83,C.gold,'Limelight');text(g,'TEST IT?',528,459,96,C.cream,'Limelight');
  text(g,'A LITTLE MUSICAL ABOUT SOFTWARE',528,540,24,C.gray,'Josefin');g.restore();
}
