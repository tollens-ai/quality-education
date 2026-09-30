// The storyboard: what every shot is and what it teaches, as sheets Qing can read on her phone.
//
//   node tools/storyboard.mjs <film.mp4> <out.pdf> [--cols 3] [--per 6]
//
// Reads shots.json — the table of every sung line, its time, and the "Says:" claim under it — pulls
// three frames from the BUILT film for each, and lays them out on A5 pages with the line and the
// claim. The claims are what she is being asked to judge, so they are written from the film and not
// from the plan: this is the tool that catches a shot that stopped showing what it says.
//
// It draws the pages itself rather than using a PDF library, so it needs nothing installed.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PW = 420, PH = 595;              // A5 in points
const M = 22;                          // margin
const AR = 1920 / 1080;

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : dflt;
}

function grab(film, out, t) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', t.toFixed(2), '-i', film,
    '-frames:v', '1', '-vf', 'scale=300:-1', out], { stdio: 'inherit' });
  return out;
}

// A minimal PDF with JPEG images: enough for phone-sized sheets of frames, and nothing to install.
//
// Object numbering: 1 catalog, 2 pages, 3 font, then every image on the document, then for each page
// its content stream followed by its page dictionary. An xref offset is the length BEFORE the object,
// which is why every offset is taken with at() and not with the length put() returns.
function pdf(pages, out, PWp, PHp) {
  const parts = [];
  let len = 0;
  const at = () => len;
  const put = buf => { if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf); parts.push(buf); len += buf.length; };
  put('%PDF-1.4\n');
  const offsets = [];
  const write = (num, body) => { offsets[num] = at(); put(`${num} 0 obj\n${body}\nendobj\n`); };

  const imgs = [];
  for (const pg of pages) for (const p of pg.imgs) imgs.push(p);
  const imgStart = 4;
  const imgNo = i => imgStart + i;
  const contentStart = imgStart + imgs.length;
  const contentNo = i => contentStart + 1 + i * 2;
  const pageNo = i => contentStart + 2 + i * 2;

  write(1, '<< /Type /Catalog /Pages 2 0 R >>');
  write(2, `<< /Type /Pages /Kids [${pages.map((_, i) => `${pageNo(i)} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  write(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  pages.forEach((pg, pi) => pg.imgs.forEach((p) => {
    const jpg = fs.readFileSync(p);
    const w = pg.w, h = pg.h;
    offsets[imgNo(imgs.indexOf(p))] = at();
    put(`${imgNo(imgs.indexOf(p))} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);
    put(jpg);
    put('\nendstream\nendobj\n');
  }));

  pages.forEach((pg, i) => {
    const firstImg = pages.slice(0, i).reduce((a, p) => a + p.imgs.length, 0);
    const xo = pg.imgs.map((_, k) => `/Im${k + 1} ${imgNo(firstImg + k)} 0 R`).join(' ');
    const body = pg.text;
    offsets[contentNo(i)] = at();
    put(`${contentNo(i)} 0 obj\n<< /Length ${Buffer.byteLength(body)} >>\nstream\n${body}\nendstream\nendobj\n`);
    write(pageNo(i), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PWp} ${PHp}] /Resources << /Font << /F1 3 0 R >> /XObject << ${xo} >> >> /Contents ${contentNo(i)} 0 R >>`);
  });

  const n = pageNo(pages.length - 1) + 1;
  const xref = at();
  let tail = `xref\n0 ${n}\n0000000000 65535 f \n`;
  for (let i = 1; i < n; i++) tail += String(offsets[i] ?? 0).padStart(10, '0') + ' 00000 n \n';
  tail += `trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  put(tail);
  fs.writeFileSync(out, Buffer.concat(parts));
}

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const film = arg(2, 'video/out/the-counter-master.mp4');
const outPath = arg(3, 'video/out/the-counter-storyboard.pdf');
const perPage = +arg('--per', 4);
const shots = JSON.parse(fs.readFileSync('video/ep01/counter/tools/shots.json', 'utf8'));
const dir = 'video/out/storyboard-counter';
fs.mkdirSync(dir, { recursive: true });

const fw = (PW - M * 2) / 3, fh = fw * AR;
const rowH = fh + 46;
const rowsPerPage = Math.max(1, Math.floor((PH - M * 2) / rowH));

// Build the rows first, then flow them onto pages.
const rows = [];
for (const s of shots) {
  const imgs = s.times.map((t, k) => {
    const p = path.join(dir, `${String(s.i).padStart(2, '0')}-${k}.jpg`);
    if (!fs.existsSync(p)) grab(film, p, t);
    return p;
  });
  rows.push({ s, imgs });
}

const pages = [];
for (let i = 0; i < rows.length; i += rowsPerPage) {
  const chunk = rows.slice(i, i + rowsPerPage);
  let y = PH - M;
  const cells = [], imgs = [];
  for (const { s, imgs: rowImgs } of chunk) {
    imgs.push(...rowImgs);
    const n = imgs.length;
    cells.push(rowImgs.map((p, k) => {
      const no = imgs.indexOf(p) + 1;
      return `q ${fw.toFixed(1)} 0 0 ${fh.toFixed(1)} ${(M + k * fw).toFixed(1)} ${(y - fh - 26).toFixed(1)} cm /Im${no} Do Q`;
    }).join('\n'));
    cells.push(`BT /F1 9 Tf ${M} ${(y - 10).toFixed(1)} Td (${esc(s.time + '  ' + s.line)}) Tj ET`);
    cells.push(`BT /F1 8 Tf ${M} ${(y - 22).toFixed(1)} Td (${esc('Says: ' + s.says)}) Tj ET`);
    y -= rowH;
  }
  pages.push({ text: cells.join('\n'), imgs, w: 300, h: Math.round(fw * AR) });
}
pdf(pages, outPath, PW, PH);
console.log(`${outPath}  (${shots.length} shots on ${pages.length} pages)`);
