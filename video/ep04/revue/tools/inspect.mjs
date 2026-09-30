// Sample the actual browser drawing, not a second implementation of its layout.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/usr/lib/node_modules/playwright'));}
const args=Object.fromEntries(process.argv.slice(2).reduce((a,v,i,all)=>v.startsWith('--')?[...a,[v.slice(2),all[i+1]]]:a,[]));
const root=process.cwd(),out=args.out||'video/out/ep04';fs.mkdirSync(out,{recursive:true});
const types={'.js':'text/javascript','.json':'application/json','.html':'text/html','.ttf':'font/ttf','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const p=path.join(root,new URL(req.url,'http://x').pathname);if(!p.startsWith(root)||!fs.existsSync(p)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',types[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);}).listen(0,'127.0.0.1');
const browser=await chromium.launch({args:['--disable-dev-shm-usage']}),page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/video/lib/player.html?scene=/video/ep04/revue/main.js&song=/music/ep04&w=${args.w||540}&render=1`);
await page.waitForFunction(()=>window.ready===true);
if(args.at){
  for(const t of args.at.split(',').map(Number)){
    const result=await page.evaluate(t=>{renderAt(t);return {t,words:window.__wordRecords.filter(w=>w.opacity>0),fonts:[...document.fonts].map(f=>({family:f.family,status:f.status,weight:f.weight})),transform:[...['a','b','c','d','e','f'].map(k=>document.querySelector('canvas').getContext('2d').getTransform()[k])]};},t);
    fs.writeFileSync(path.join(out,`inspect-${t}.json`),JSON.stringify(result,null,2));
    console.log(JSON.stringify({t,extents:result.words.map(w=>({word:w.word,x:Math.round(w.x),right:Math.round(w.x+w.w),y:Math.round(w.y),size:w.size})),fonts:result.fonts,transform:result.transform}));
  }
}
if(args.audit){
  const records=await page.evaluate(()=>{
    const out=[];
    for(let t=0;t<window.duration;t+=.1){renderAt(t);for(const w of window.__wordRecords||[])if(w.opacity>.01)out.push({t:+t.toFixed(3),...w});}
    return out;
  });
  fs.writeFileSync(path.join(out,'word-audit.json'),JSON.stringify(records));
  const words=new Map(),flags=[];
  for(const r of records){
    const key=`${r.line}:${r.s}:${r.word}`;const q=words.get(key)||{word:r.word,line:r.line,s:r.s,e:r.e,first:null,last:null,minSize:Infinity};
    if(r.fully){q.first??=r.t;q.last=r.t;q.minSize=Math.min(q.minSize,r.size);}words.set(key,q);
    if(r.x<82||r.x+r.w>994||r.y<180||r.y+r.h>1510)flags.push({kind:'bounds',word:r.word,line:r.line,t:r.t,x:r.x,right:r.x+r.w,y:r.y,bottom:r.y+r.h});
    if(r.size<59)flags.push({kind:'size',word:r.word,line:r.line,t:r.t,size:r.size});
  }
  const summary={sampleSeconds:.1,errors,uniqueWords:words.size,flags:flags.length,minimumSize:Math.min(...[...words.values()].map(w=>w.minSize)),words:[...words.values()].map(w=>({...w,fullyVisibleSeconds:w.last===null?0:+(w.last-w.first+.1).toFixed(2)})),boundsFlags:flags};
  fs.writeFileSync(path.join(out,'word-audit-summary.json'),JSON.stringify(summary,null,2));
  console.log(JSON.stringify({errors,uniqueWords:words.size,flags:flags.length,minimumSize:summary.minimumSize,shortest:summary.words.toSorted((a,b)=>a.fullyVisibleSeconds-b.fullyVisibleSeconds).slice(0,12)}));
}
if(args.sheet){
  const L=JSON.parse(fs.readFileSync('music/ep04/lyrics.json','utf8'));
  const times=L.map((l,i)=>i%2===1?Math.min(l.end-.12,(L[i+1]?.start??185.232)-.10):null).filter(t=>t!==null);
  times.push(189);
  const tiles=[];for(const t of times){tiles.push(await page.evaluate(t=>{renderAt(t);return document.querySelector('canvas').toDataURL('image/jpeg',.9);},t));}
  const data=await page.evaluate(async({tiles,times})=>{
    const c=document.createElement('canvas'),cols=4,tw=270,th=480;c.width=cols*tw;c.height=Math.ceil(tiles.length/cols)*(th+28);
    const g=c.getContext('2d');g.fillStyle='#152c34';g.fillRect(0,0,c.width,c.height);
    for(let i=0;i<tiles.length;i++){const im=new Image();im.src=tiles[i];await im.decode();const x=i%cols*tw,y=Math.floor(i/cols)*(th+28);g.drawImage(im,x+4,y+26,tw-8,th-9);g.fillStyle='#f5ead1';g.font='15px sans-serif';g.fillText(`${i+1} · ${times[i].toFixed(2)} s`,x+10,y+19);}
    return c.toDataURL('image/jpeg',.94);
  },{tiles,times});
  fs.writeFileSync(path.join(out,'couplet-sheet.jpg'),Buffer.from(data.split(',')[1],'base64'));console.log(path.join(out,'couplet-sheet.jpg'));
}
await browser.close();server.close();if(errors.length)process.exitCode=1;
