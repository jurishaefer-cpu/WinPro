// Katalog der Fenster-/Tür-Geometrien.
// open: Öffnungsart, din: Anschlag (Bänder), apex = Griffseite (gegenüber den Bändern).
export const GEOMETRIEN = [
  { code: 'F01', kategorie: 'fenster', gruppe: 'Einflügelig', label: 'Drehkippfenster DIN Links', open: 'drehkipp', din: 'links' },
  { code: 'F02', kategorie: 'fenster', gruppe: 'Einflügelig', label: 'Drehkippfenster DIN Rechts', open: 'drehkipp', din: 'rechts' },
  { code: 'F03', kategorie: 'fenster', gruppe: 'Einflügelig', label: 'Drehfenster DIN Links', open: 'dreh', din: 'links' },
  { code: 'F04', kategorie: 'fenster', gruppe: 'Einflügelig', label: 'Drehfenster DIN Rechts', open: 'dreh', din: 'rechts' },
  { code: 'F05', kategorie: 'fenster', gruppe: 'Einflügelig', label: 'Kippfenster', open: 'kipp' },
  { code: 'F06', kategorie: 'fenster', gruppe: 'Einflügelig', label: 'Festverglasung', open: 'fest' },
  { code: 'F07', kategorie: 'fenster', gruppe: 'Zweiflügelig', label: 'Zweiteiliges Drehkippfenster', teilung: 'pfosten',
    panes: [{ open: 'drehkipp', din: 'links' }, { open: 'drehkipp', din: 'rechts' }] },
  { code: 'F10', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Zweiteilig: Drehkipp links, Fest rechts',
    panes: [{ open: 'drehkipp', din: 'links' }, { fest: true }] },
  { code: 'F11', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Zweiteilig: Fest links, Drehkipp rechts',
    panes: [{ fest: true }, { open: 'drehkipp', din: 'rechts' }] },
  { code: 'F12', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Zweiteilig: Dreh links, Fest rechts',
    panes: [{ open: 'dreh', din: 'links' }, { fest: true }] },
  { code: 'F13', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Zweiteilig: Fest links, Dreh rechts',
    panes: [{ fest: true }, { open: 'dreh', din: 'rechts' }] },
  { code: 'F14', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Dreiteiliges Drehkippfenster',
    panes: [{ open: 'drehkipp', din: 'links' }, { open: 'drehkipp', din: 'rechts' }, { open: 'drehkipp', din: 'rechts' }] },
  { code: 'F15', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Dreiteiliges Drehkippfenster (Fest Mitte)',
    panes: [{ open: 'drehkipp', din: 'links' }, { fest: true }, { open: 'drehkipp', din: 'rechts' }] },
  { code: 'F16', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Dreiteilig Drehkipp mit Festfeldern',
    panes: [{ fest: true }, { open: 'drehkipp', din: 'links' }, { fest: true }] },
  { code: 'F17', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Vierteiliges Drehkippfenster', cols: 2,
    panes: [{ open: 'drehkipp', din: 'links' }, { open: 'drehkipp', din: 'rechts' }, { open: 'drehkipp', din: 'links' }, { open: 'drehkipp', din: 'rechts' }] },
  { code: 'F18', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Vierteiliges Drehkippfenster (Variante)', cols: 2,
    panes: [{ open: 'drehkipp', din: 'links' }, { open: 'drehkipp', din: 'rechts' }, { open: 'drehkipp', din: 'links' }, { open: 'drehkipp', din: 'rechts' }] },
  { code: 'F19', kategorie: 'fenster', gruppe: 'Übereinander', label: 'Zweiteiliges Drehkippfenster (übereinander)', cols: 1,
    panes: [{ open: 'drehkipp', din: 'links' }, { open: 'drehkipp', din: 'links' }] },
  { code: 'F20', kategorie: 'fenster', gruppe: 'Übereinander', label: 'Oberlicht Kipp, unten Drehkipp', cols: 1,
    panes: [{ open: 'kipp' }, { open: 'drehkipp', din: 'links' }] },
  { code: 'F21', kategorie: 'fenster', gruppe: 'Übereinander', label: 'Oberlicht Fest, unten Drehkipp', cols: 1,
    panes: [{ fest: true }, { open: 'drehkipp', din: 'links' }] },
  { code: 'T01', kategorie: 'tuer', gruppe: 'Türen', label: 'Haustür DIN Links', open: 'tuer', din: 'links' },
  { code: 'T02', kategorie: 'tuer', gruppe: 'Türen', label: 'Haustür DIN Rechts', open: 'tuer', din: 'rechts' },
  { code: 'T03', kategorie: 'tuer', gruppe: 'Türen', label: 'Balkontür Dreh-Kipp DIN Links', open: 'drehkipp', din: 'links', tuer: true },
  { code: 'T04', kategorie: 'tuer', gruppe: 'Türen', label: 'Balkontür Dreh-Kipp DIN Rechts', open: 'drehkipp', din: 'rechts', tuer: true },
  { code: 'T05', kategorie: 'tuer', gruppe: 'Türen', label: 'Zweiflügelige Haustür', teilung: 'stulp', tuer: true,
    panes: [{ open: 'tuer', din: 'links' }, { open: 'tuer', din: 'rechts' }] },
  { code: 'T06', kategorie: 'tuer', gruppe: 'Türen', label: 'Haustür mit festem Seitenteil', teilung: 'pfosten', tuer: true,
    panes: [{ open: 'tuer', din: 'links' }, { fest: true }] },
  { code: 'T07', kategorie: 'tuer', gruppe: 'Türen', label: 'Zweiflügelige Balkontür Dreh-Kipp', teilung: 'stulp', tuer: true,
    panes: [{ open: 'drehkipp', din: 'links' }, { open: 'drehkipp', din: 'rechts' }] },
  { code: 'T08', kategorie: 'tuer', gruppe: 'Türen', label: 'Zweiflügelige Balkontür Dreh', teilung: 'stulp', tuer: true,
    panes: [{ open: 'dreh', din: 'links' }, { open: 'dreh', din: 'rechts' }] },
];

export function geometrieByCode(code) {
  return GEOMETRIEN.find(g => g.code === code);
}

// Hat der Flügel eine Kippfunktion? (Dreh-Kipp oder reines Kippfenster)
function istKippbar(p) {
  return !!p && !p.fest && (p.open === 'drehkipp' || p.open === 'kipp');
}

const TEIL_ADJ = { 2: 'Zweiteiliges', 3: 'Dreiteiliges', 4: 'Vierteiliges', 5: 'Fünfteiliges', 6: 'Sechsteiliges' };
const TEIL_NOMEN = { 2: 'Zweiteilig', 3: 'Dreiteilig', 4: 'Vierteilig', 5: 'Fünfteilig', 6: 'Sechsteilig' };

// Öffnungsart eines Flügels als Wort
function fluegelArt(p) {
  if (!p || p.fest) return 'Fest';
  if (p.open === 'drehkipp') return 'Drehkipp';
  if (p.open === 'kipp') return 'Kipp';
  if (p.open === 'dreh') return 'Dreh';
  if (p.open === 'tuer') return 'Tür';
  return 'Fest';
}

// Anzeigename des Fensters – passt sich an die tatsächliche Flügelkonfiguration an.
export function fensterBezeichnung(geometrie, panes, cols) {
  const g = geometrie;
  if (!g) return '';
  if (g.kategorie === 'tuer') return g.label;                 // Türen: immer Katalogname (kein „Stulpfenster")
  const ps = panes || g.panes;
  if (!Array.isArray(ps) || ps.length < 2) return g.label;   // einflügelig: Katalogname

  const n = ps.length;
  const adj = TEIL_ADJ[n] || `${n}-teiliges`;
  const nomen = TEIL_NOMEN[n] || `${n}-teilig`;
  const spalten = cols || g.cols || n;         // 1 = übereinander gestapelt
  const gestapelt = spalten <= 1;

  // Stulpfenster: NEBENEINANDER liegende Flügel + mind. ein öffenbarer Flügel (Dreh/Tür)
  // ohne Kippfunktion. (Festfelder zählen nicht; gestapelte Fenster sind kein Stulp.)
  if (!gestapelt && ps.some(p => !p.fest && !istKippbar(p))) return `Stulpfenster ${nomen.toLowerCase()}`;

  // Unverändert gegenüber Katalog -> kuratierten Namen behalten
  if (Array.isArray(g.panes) && JSON.stringify(ps) === JSON.stringify(g.panes)) return g.label;

  // Aus der aktuellen Flügelkonfiguration ableiten
  const arten = ps.map(fluegelArt);
  if (arten.every(a => a === arten[0])) {
    const a = arten[0];
    if (a === 'Drehkipp') return `${adj} Drehkippfenster`;
    if (a === 'Dreh') return `${adj} Drehfenster`;
    if (a === 'Kipp') return `${adj} Kippfenster`;
    if (a === 'Fest') return `${adj} Festfeld`;
    return `${adj} Fenster`;
  }
  if (n === 2) {
    const [a, b] = gestapelt ? ['oben', 'unten'] : ['links', 'rechts'];
    return `${nomen}: ${arten[0]} ${a}, ${arten[1]} ${b}`;
  }
  return `${adj} Fenster (${arten.join(', ')})`;
}
// Stulpfenster: der mittlere Pfosten (kein fester Pfosten, sondern Stulp) entfällt,
// sobald mind. einer der beiden angrenzenden Flügel nicht kippbar ist.
function stulpPfostenZeigen(panes, cols, c) {
  const angrenzend = (panes || []).filter((_, idx) => { const cc = idx % cols; return cc === c - 1 || cc === c; });
  return angrenzend.length > 0 && angrenzend.every(istKippbar);
}

// Liefert die Öffnungs-Symbollinien innerhalb des Flügel-Rechtecks.
function oeffnungsLinien(g, r) {
  const { x, y, w, h } = r;
  const TL = [x, y], TR = [x + w, y], BR = [x + w, y + h], BL = [x, y + h];
  const midL = [x, y + h / 2], midR = [x + w, y + h / 2];
  const midT = [x + w / 2, y];
  const linien = [];
  const dreh = (din) => {
    // apex = Griffseite (gegenüber den Bändern)
    if (din === 'links') { linien.push([TL, midR], [BL, midR]); } // Bänder links → Griff rechts
    else { linien.push([TR, midL], [BR, midL]); }
  };
  // Kippstellung: Bänder unten, Dreieck-Spitze zeigt nach oben
  const kipp = () => { linien.push([BL, midT], [BR, midT]); };
  if (g.open === 'dreh' || g.open === 'tuer') dreh(g.din || 'links');
  else if (g.open === 'kipp') kipp();
  else if (g.open === 'drehkipp') { dreh(g.din || 'links'); kipp(); }
  return linien;
}

// Rechteck nach innen einrücken
function inset(r, d) {
  return { x: r.x + d, y: r.y + d, w: r.w - 2 * d, h: r.h - 2 * d };
}
// 45°-Gehrungslinien: verbindet die Ecken des äußeren mit dem inneren Rahmen
function gehrung(o, i) {
  return [
    [[o.x, o.y], [i.x, i.y]],
    [[o.x + o.w, o.y], [i.x + i.w, i.y]],
    [[o.x + o.w, o.y + o.h], [i.x + i.w, i.y + i.h]],
    [[o.x, o.y + o.h], [i.x, i.y + i.h]],
  ];
}

// Kleine Vorschau ohne Maßlinien (für das Geometrie-Dropdown)
export function GeometrieThumb({ geometrie, glasFarbe = '#cfe3ef' }) {
  const g = geometrie;
  const W = 120, H = 92, m = 7;
  const r0 = { x: m, y: m, w: W - 2 * m, h: H - 2 * m };
  const istFest = g?.open === 'fest';
  const blendIn = inset(r0, 6);           // Blendrahmen breit (äußerer Rahmen)
  const miterBlend = gehrung(r0, blendIn);
  const inner = inset(r0, 8);
  const sashW = 4.5;

  const mk = (rect, geo) => {
    const gl = inset(rect, sashW);
    return { sash: rect, glas: gl, miter: gehrung(rect, gl), lines: geo ? oeffnungsLinien(geo, gl) : [], tuer: geo?.open === 'tuer' };
  };
  let leaves = [];
  const pfostenList = [];
  if (istFest) {
    leaves = [{ sash: null, glas: inset(blendIn, 2.5), miter: [], lines: [], tuer: false }];
  } else if (g?.panes) {
    const anz = g.panes.length;
    const cols = g.cols || anz;
    const rows = Math.ceil(anz / cols);
    const dW = g.teilung === 'stulp' ? 3.5 : 5;
    const dH = 5;
    const colW = (inner.w - dW * (cols - 1)) / cols;
    const rowH = (inner.h - dH * (rows - 1)) / rows;
    const colX = []; for (let c = 0; c < cols; c++) colX.push(inner.x + c * (colW + dW));
    const rowY = []; for (let r = 0; r < rows; r++) rowY.push(inner.y + r * (rowH + dH));
    g.panes.forEach((p, idx) => {
      const c = idx % cols, r = Math.floor(idx / cols);
      const rect = { x: colX[c], y: rowY[r], w: colW, h: rowH };
      if (p.fest) leaves.push({ sash: null, glas: inset(rect, 2.5), miter: [], lines: [], tuer: false });
      else leaves.push(mk(rect, { open: p.open, din: p.din }));
    });
    const istStulp = g?.teilung === 'stulp';
    for (let c = 1; c < cols; c++) {
      if (istStulp && !stulpPfostenZeigen(g.panes, cols, c)) continue;
      pfostenList.push({ x: colX[c] - dW, y: inner.y, w: dW, h: inner.h });
    }
    for (let r = 1; r < rows; r++) pfostenList.push({ x: inner.x, y: rowY[r] - dH, w: inner.w, h: dH });
  } else {
    leaves = [mk(inner, g)];
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <rect x={r0.x} y={r0.y} width={r0.w} height={r0.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
      <rect x={blendIn.x} y={blendIn.y} width={blendIn.w} height={blendIn.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.1" />
      {miterBlend.map((l, i) => <line key={'mb' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="0.8" />)}
      {pfostenList.map((pf, i) => <rect key={'pf' + i} x={pf.x} y={pf.y} width={pf.w} height={pf.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.1" />)}
      {leaves.map((lf, li) => (
        <g key={'lf' + li}>
          {lf.sash && <rect x={lf.sash.x} y={lf.sash.y} width={lf.sash.w} height={lf.sash.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.1" />}
          {lf.miter.map((l, i) => <line key={'ms' + li + '-' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="0.8" />)}
          <rect x={lf.glas.x} y={lf.glas.y} width={lf.glas.w} height={lf.glas.h} fill={lf.tuer ? '#e7edf2' : glasFarbe} stroke="#0f1f3d" strokeWidth="0.9" />
        </g>
      ))}
      {leaves.map((lf, li) => lf.lines.map((l, i) => (
        <line key={'op' + li + '-' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="0.9" />
      )))}
    </svg>
  );
}

// Berechnet die Pixel-Geometrie EINER Einheit (Rahmen, Flügel, Glas, Pfosten, Sub-Maße)
// in das vorgegebene Gesamt-Rechteck r0 (px) bei Maßstab scale (px pro mm).
export function computeUnit(r0, scale, { geometrie, breite, hoehe, panes: panesProp, cols: colsProp, colWidths, rowHeights, verbreiterung, aufsatzkasten }) {
  const g = geometrie;
  const vo = Math.max(0, Number(verbreiterung?.oben) || 0) * scale;
  const vu = Math.max(0, Number(verbreiterung?.unten) || 0) * scale;
  const vl = Math.max(0, Number(verbreiterung?.links) || 0) * scale;
  const vr = Math.max(0, Number(verbreiterung?.rechts) || 0) * scale;
  const kh = aufsatzkasten ? Math.max(0, Number(aufsatzkasten.kastenhoehe) || 0) * scale : 0;
  const hatKasten = !!aufsatzkasten && kh > 0;
  const hatVerb = !!(vo || vu || vl || vr);
  const kasten = { x: r0.x, y: r0.y, w: r0.w, h: kh };
  const win = { x: r0.x + vl, y: r0.y + vo + kh, w: r0.w - vl - vr, h: r0.h - vo - vu - kh };

  const u = Math.min(win.w, win.h);
  const blendW = Math.max(12, u * 0.052);
  const gap = Math.max(2.5, u * 0.011);
  const sashW = Math.max(10, u * 0.045);
  const istFest = g?.open === 'fest';
  const blendIn = inset(win, blendW);
  const miterBlend = gehrung(win, blendIn);
  const inner = inset(win, blendW + gap);
  const istTuer = g?.open === 'tuer' || g?.kategorie === 'tuer';

  const machFluegel = (rect, geo) => {
    const gl = inset(rect, sashW);
    return { sash: rect, rect, glas: gl, miter: gehrung(rect, gl), lines: geo ? oeffnungsLinien(geo, gl) : [], tuer: geo?.open === 'tuer' };
  };
  const effPanes = panesProp || g?.panes;
  let leaves = [];
  const pfostenList = [];
  let subCols = [];
  let subRows = [];
  if (istFest && !effPanes) {
    leaves = [{ sash: null, rect: blendIn, glas: inset(blendIn, Math.max(6, u * 0.02)), miter: [], lines: [], tuer: false }];
  } else if (effPanes) {
    const anz = effPanes.length;
    const cols = colsProp || g?.cols || anz;
    const rows = Math.ceil(anz / cols);
    const dW = g?.teilung === 'stulp' ? Math.max(8, blendW * 0.6) : blendW;
    const dH = blendW;
    const cwMM = colWidths && colWidths.length === cols ? colWidths.map(v => Math.max(1, Number(v) || 0)) : Array(cols).fill((Number(breite) || 1000) / cols);
    const rhMM = rowHeights && rowHeights.length === rows ? rowHeights.map(v => Math.max(1, Number(v) || 0)) : Array(rows).fill((Number(hoehe) || 1200) / rows);
    const sumW = cwMM.reduce((a, c) => a + c, 0) || 1;
    const sumH = rhMM.reduce((a, c) => a + c, 0) || 1;
    const availW = inner.w - dW * (cols - 1);
    const availH = inner.h - dH * (rows - 1);
    const colWpx = cwMM.map(c => availW * c / sumW);
    const rowHpx = rhMM.map(r => availH * r / sumH);
    const colX = []; { let xa = inner.x; for (let c = 0; c < cols; c++) { colX.push(xa); xa += colWpx[c] + dW; } }
    const rowY = []; { let ya = inner.y; for (let r = 0; r < rows; r++) { rowY.push(ya); ya += rowHpx[r] + dH; } }
    effPanes.forEach((p, idx) => {
      const c = idx % cols, r = Math.floor(idx / cols);
      const rect = { x: colX[c], y: rowY[r], w: colWpx[c], h: rowHpx[r] };
      if (p.fest) leaves.push({ sash: null, rect, glas: inset(rect, Math.max(4, sashW * 0.5)), miter: [], lines: [], tuer: false });
      else leaves.push(machFluegel(rect, { open: p.open, din: p.din }));
    });
    const istStulp = g?.teilung === 'stulp';
    for (let c = 1; c < cols; c++) {
      if (istStulp && !stulpPfostenZeigen(effPanes, cols, c)) continue;
      pfostenList.push({ x: colX[c] - dW, y: inner.y, w: dW, h: inner.h, fest: !istStulp });
    }
    for (let r = 1; r < rows; r++) pfostenList.push({ x: inner.x, y: rowY[r] - dH, w: inner.w, h: dH, fest: true });
    if (cols > 1) subCols = colX.map((cx0, c) => ({ x0: cx0, x1: cx0 + colWpx[c], mm: Math.round(cwMM[c]), idx: c }));
    if (rows > 1) subRows = rowY.map((ry0, r) => ({ y0: ry0, y1: ry0 + rowHpx[r], mm: Math.round(rhMM[r]), idx: r }));
  } else {
    leaves = [machFluegel(inner, g)];
  }
  const glasMinX = Math.min(...leaves.map(l => l.glas.x));
  const glasMaxX = Math.max(...leaves.map(l => l.glas.x + l.glas.w));
  const glasTopY = leaves[0].glas.y;
  const glasH = leaves[0].glas.h;
  const lamellen = [];
  if (hatKasten) {
    const anz = 7;
    const bereich = glasH * 0.32;
    for (let i = 1; i <= anz; i++) lamellen.push(glasTopY + (bereich / anz) * i);
  }
  const badge = hatKasten ? {
    cx: aufsatzkasten.bedienungsseite === 'rechts' ? win.x + win.w : win.x,
    cy: win.y,
    r: Math.max(16, u * 0.05),
    text: aufsatzkasten.bedienung === 'Motor' ? 'M' : 'G',
  } : null;

  return { g, r0, win, kasten, blendIn, miterBlend, leaves, pfostenList, subCols, subRows, lamellen, badge, glasMinX, glasMaxX, hatVerb, hatKasten, istTuer, effPanes };
}

// Zeichnet den Körper EINER Einheit (ohne Maßketten) aus dem computeUnit-Ergebnis.
export function UnitBody({ c, glasFarbe = '#cfe3ef', onPaneClick, selectedPane, keyPrefix = '' }) {
  const { r0, win, kasten, blendIn, miterBlend, leaves, pfostenList, lamellen, badge, glasMinX, glasMaxX, hatVerb, hatKasten, istTuer, effPanes, g } = c;
  return (
    <g>
      {(hatVerb || hatKasten) && (
        <rect x={r0.x} y={r0.y} width={r0.w} height={r0.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" />
      )}
      {hatKasten && (
        <rect x={kasten.x} y={kasten.y} width={kasten.w} height={kasten.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" />
      )}
      <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" />
      <rect x={blendIn.x} y={blendIn.y} width={blendIn.w} height={blendIn.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
      {miterBlend.map((l, i) => (
        <line key={keyPrefix + 'mb' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />
      ))}
      {pfostenList.map((pf, i) => (
        <rect key={keyPrefix + 'pf' + i} x={pf.x} y={pf.y} width={pf.w} height={pf.h}
              fill="#fff" stroke="#0f1f3d" strokeWidth={pf.fest ? 2 : 1.6} />
      ))}
      {leaves.map((lf, li) => (
        <g key={keyPrefix + 'lf' + li}>
          {lf.sash && (
            <rect x={lf.sash.x} y={lf.sash.y} width={lf.sash.w} height={lf.sash.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2" />
          )}
          {lf.miter.map((l, i) => (
            <line key={keyPrefix + 'ms' + li + '-' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />
          ))}
          <rect x={lf.glas.x} y={lf.glas.y} width={lf.glas.w} height={lf.glas.h}
                fill={lf.tuer ? '#e7edf2' : glasFarbe} stroke="#0f1f3d" strokeWidth="1.4" opacity="0.95" />
        </g>
      ))}
      {lamellen.map((ly, i) => (
        <line key={keyPrefix + 'lam' + i} x1={glasMinX} y1={ly} x2={glasMaxX} y2={ly} stroke="#0f1f3d" strokeWidth="1" opacity="0.7" />
      ))}
      {leaves.map((lf, li) => lf.lines.map((l, i) => (
        <line key={keyPrefix + 'op' + li + '-' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]}
              stroke="#0f1f3d" strokeWidth="1.4" />
      )))}
      {badge && (
        <g>
          <circle cx={badge.cx} cy={badge.cy} r={badge.r} fill="#fff" stroke="#0f1f3d" strokeWidth="2" />
          <text x={badge.cx} y={badge.cy} textAnchor="middle" dominantBaseline="central"
                fontSize={badge.r * 1.1} fontWeight="700" fill="#0f1f3d">{badge.text}</text>
        </g>
      )}
      {istTuer && leaves.map((lf, li) => {
        const p = effPanes ? effPanes[li] : g;
        if (!p || p.fest) return null;
        const din = p.din || g.din || 'links';
        const hx = din === 'links' ? lf.glas.x + lf.glas.w - 12 : lf.glas.x + 6;
        return (
          <rect key={keyPrefix + 'griff' + li} x={hx} y={lf.glas.y + lf.glas.h / 2 - 18}
                width="6" height="36" rx="3" fill="#0f1f3d" />
        );
      })}
      {onPaneClick && leaves.map((lf, li) => (
        <rect key={keyPrefix + 'hit' + li} x={lf.rect.x} y={lf.rect.y} width={lf.rect.w} height={lf.rect.h}
              fill={selectedPane === li ? 'rgba(192,21,46,0.12)' : 'transparent'}
              stroke={selectedPane === li ? '#c0152e' : 'transparent'} strokeWidth="2.5"
              style={{ cursor: 'pointer' }} onClick={() => onPaneClick(li)} />
      ))}
    </g>
  );
}

function FensterZeichnung({ geometrie, breite, hoehe, verbreiterung, aufsatzkasten, glasFarbe = '#cfe3ef', onBreite, onHoehe, panes: panesProp, cols: colsProp, colWidths, rowHeights, onColWidth, onRowHeight, onPaneClick, selectedPane }) {
  const b = Math.max(200, Number(breite) || 1000);
  const hh = Math.max(200, Number(hoehe) || 1200);

  // Zeichenfläche
  const VB_W = 780, VB_H = 720;
  const maxW = 360, maxH = 430;
  const scale = Math.min(maxW / b, maxH / hh);
  const rw = b * scale, rh = hh * scale;
  const cx = VB_W / 2 + 24, cy = VB_H / 2 + 14;
  const x = cx - rw / 2, y = cy - rh / 2;

  const r0 = { x, y, w: rw, h: rh };                            // Gesamtmaß (mit Verbreiterung/Kasten)
  const c = computeUnit(r0, scale, { geometrie, breite, hoehe, panes: panesProp, cols: colsProp, colWidths, rowHeights, verbreiterung, aufsatzkasten });
  const hatSubB = c.subCols.length > 0;
  const hatSubH = c.subRows.length > 0;

  // Maß-Positionen: Hauptmaß weiter außen, wenn Zwischenmaße vorhanden
  const mainTopY = hatSubB ? y - 78 : y - 34;
  const subTopY = y - 32;
  const mainLeftX = hatSubH ? x - 86 : x - 34;
  const subLeftX = x - 34;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet" className="fz-svg">
      {/* Hauptmaß Breite (oben) */}
      <line x1={x} y1={mainTopY} x2={x + rw} y2={mainTopY} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={x} y1={mainTopY - 6} x2={x} y2={mainTopY + 6} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={x + rw} y1={mainTopY - 6} x2={x + rw} y2={mainTopY + 6} stroke="#0f1f3d" strokeWidth="1.2" />
      {onBreite ? (
        <foreignObject x={cx - 70} y={mainTopY - 46} width={140} height={38}>
          <input className="fz-massinput" type="number" value={breite}
                 onChange={e => onBreite(e.target.value)} />
        </foreignObject>
      ) : (
        <text x={cx} y={mainTopY - 10} textAnchor="middle" fontSize="22" fill="#0f1f3d" fontWeight="600">{Math.round(b)}</text>
      )}

      {/* Zwischenmaße Breite (je Spalte) – editierbar */}
      {c.subCols.map((s, i) => (
        <g key={'sb' + i}>
          <line x1={s.x0} y1={subTopY} x2={s.x1} y2={subTopY} stroke="#0f1f3d" strokeWidth="1" />
          <line x1={s.x0} y1={subTopY - 5} x2={s.x0} y2={subTopY + 5} stroke="#0f1f3d" strokeWidth="1" />
          <line x1={s.x1} y1={subTopY - 5} x2={s.x1} y2={subTopY + 5} stroke="#0f1f3d" strokeWidth="1" />
          {onColWidth ? (
            <foreignObject x={(s.x0 + s.x1) / 2 - 42} y={subTopY - 38} width={84} height={30}>
              <input className="fz-massinput fz-massinput--sub" type="number" value={(colWidths && colWidths[s.idx]) ?? s.mm}
                     onChange={e => onColWidth(s.idx, e.target.value)} />
            </foreignObject>
          ) : (
            <text x={(s.x0 + s.x1) / 2} y={subTopY - 7} textAnchor="middle" fontSize="15" fill="#0f1f3d" fontWeight="600">{s.mm}</text>
          )}
        </g>
      ))}

      {/* Hauptmaß Höhe (links) */}
      <line x1={mainLeftX} y1={y} x2={mainLeftX} y2={y + rh} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={mainLeftX - 6} y1={y} x2={mainLeftX + 6} y2={y} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={mainLeftX - 6} y1={y + rh} x2={mainLeftX + 6} y2={y + rh} stroke="#0f1f3d" strokeWidth="1.2" />
      {onHoehe ? (
        <foreignObject x={mainLeftX - 76} y={cy - 19} width={70} height={38}>
          <input className="fz-massinput" type="number" value={hoehe}
                 onChange={e => onHoehe(e.target.value)} />
        </foreignObject>
      ) : (
        <text x={mainLeftX - 10} y={cy} textAnchor="middle" fontSize="22" fill="#0f1f3d" fontWeight="600"
              transform={`rotate(-90 ${mainLeftX - 10} ${cy})`}>{Math.round(hh)}</text>
      )}

      {/* Zwischenmaße Höhe (je Zeile) – editierbar */}
      {c.subRows.map((s, i) => {
        const mid = (s.y0 + s.y1) / 2;
        const cxr = subLeftX - 22;
        return (
          <g key={'sh' + i}>
            <line x1={subLeftX} y1={s.y0} x2={subLeftX} y2={s.y1} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={subLeftX - 5} y1={s.y0} x2={subLeftX + 5} y2={s.y0} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={subLeftX - 5} y1={s.y1} x2={subLeftX + 5} y2={s.y1} stroke="#0f1f3d" strokeWidth="1" />
            {onRowHeight ? (
              <foreignObject x={cxr - 42} y={mid - 15} width={84} height={30} transform={`rotate(-90 ${cxr} ${mid})`}>
                <input className="fz-massinput fz-massinput--sub" type="number" value={(rowHeights && rowHeights[s.idx]) ?? s.mm}
                       onChange={e => onRowHeight(s.idx, e.target.value)} />
              </foreignObject>
            ) : (
              <text x={subLeftX - 7} y={mid} textAnchor="middle" fontSize="15" fill="#0f1f3d" fontWeight="600"
                    transform={`rotate(-90 ${subLeftX - 7} ${mid})`}>{s.mm}</text>
            )}
          </g>
        );
      })}

      {/* Fensterkörper (Rahmen, Flügel, Glas, Pfosten, Lamellen, Griffe, Klickflächen) */}
      <UnitBody c={c} glasFarbe={glasFarbe} onPaneClick={onPaneClick} selectedPane={selectedPane} />
    </svg>
  );
}

// Kombination mehrerer gekoppelter Einheiten (eigener Rahmen je Element), im Raster (row/col).
export function KombinationsZeichnung({ elemente, glasFarbe = '#cfe3ef', onUnitClick, activeId, onPaneClick, selectedPane }) {
  const els = (elemente || []).map((e, i) => ({ ...e, _key: e.id ?? i }));
  if (!els.length) return null;
  const colsSet = [...new Set(els.map(e => e.col ?? 0))].sort((a, b) => a - b);
  const rowsSet = [...new Set(els.map(e => e.row ?? 0))].sort((a, b) => a - b);
  const colWmm = {}; colsSet.forEach(cc => { colWmm[cc] = Math.max(...els.filter(e => (e.col ?? 0) === cc).map(e => Math.max(200, Number(e.breite) || 1000))); });
  const rowHmm = {}; rowsSet.forEach(rr => { rowHmm[rr] = Math.max(...els.filter(e => (e.row ?? 0) === rr).map(e => Math.max(200, Number(e.hoehe) || 1200))); });
  const totalWmm = colsSet.reduce((a, cc) => a + colWmm[cc], 0);
  const totalHmm = rowsSet.reduce((a, rr) => a + rowHmm[rr], 0);

  const maxW = 600, maxH = 440;
  const scale = Math.min(maxW / Math.max(200, totalWmm), maxH / Math.max(200, totalHmm));
  const totalWpx = totalWmm * scale, totalHpx = totalHmm * scale;
  const ML = 92, MT = 84, MR = 44, MB = 40;
  const VB_W = totalWpx + ML + MR;
  const VB_H = totalHpx + MT + MB;
  const ox = ML, oy = MT;

  const colXpx = {}; { let xa = ox; colsSet.forEach(cc => { colXpx[cc] = xa; xa += colWmm[cc] * scale; }); }
  const rowYpx = {}; { let ya = oy; rowsSet.forEach(rr => { rowYpx[rr] = ya; ya += rowHmm[rr] * scale; }); }

  const units = els.map(e => {
    const cc = e.col ?? 0, rr = e.row ?? 0;
    const r0 = { x: colXpx[cc], y: rowYpx[rr], w: colWmm[cc] * scale, h: rowHmm[rr] * scale };
    const c = computeUnit(r0, scale, {
      geometrie: geometrieByCode(e.code), breite: colWmm[cc], hoehe: rowHmm[rr],
      panes: e.panes, cols: e.cols, colWidths: e.colWidths, rowHeights: e.rowHeights,
      verbreiterung: e.verbreiterung ? e.verb : null, aufsatzkasten: e.aufsatzkasten ? e.kasten : null,
    });
    return { e, c, r0 };
  });

  const topY = oy - 34, leftX = ox - 34;          // Gesamtmaße ganz außen
  const interaktiv = !!onUnitClick;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet" className="fz-svg">
      {/* Gesamtmaß Breite (oben) */}
      <line x1={ox} y1={topY} x2={ox + totalWpx} y2={topY} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={ox} y1={topY - 6} x2={ox} y2={topY + 6} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={ox + totalWpx} y1={topY - 6} x2={ox + totalWpx} y2={topY + 6} stroke="#0f1f3d" strokeWidth="1.2" />
      <text x={ox + totalWpx / 2} y={topY - 10} textAnchor="middle" fontSize="20" fill="#0f1f3d" fontWeight="600">{Math.round(totalWmm)}</text>

      {/* Spaltenbreiten (oben, innen) */}
      {colsSet.length > 1 && colsSet.map(cc => {
        const x0 = colXpx[cc], x1 = colXpx[cc] + colWmm[cc] * scale;
        return (
          <g key={'cw' + cc}>
            <line x1={x0} y1={oy - 14} x2={x1} y2={oy - 14} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={x0} y1={oy - 19} x2={x0} y2={oy - 9} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={x1} y1={oy - 19} x2={x1} y2={oy - 9} stroke="#0f1f3d" strokeWidth="1" />
            <text x={(x0 + x1) / 2} y={oy - 22} textAnchor="middle" fontSize="13" fill="#0f1f3d" fontWeight="600">{Math.round(colWmm[cc])}</text>
          </g>
        );
      })}

      {/* Gesamtmaß Höhe (links) */}
      <line x1={leftX} y1={oy} x2={leftX} y2={oy + totalHpx} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={leftX - 6} y1={oy} x2={leftX + 6} y2={oy} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={leftX - 6} y1={oy + totalHpx} x2={leftX + 6} y2={oy + totalHpx} stroke="#0f1f3d" strokeWidth="1.2" />
      <text x={leftX - 10} y={oy + totalHpx / 2} textAnchor="middle" fontSize="20" fill="#0f1f3d" fontWeight="600"
            transform={`rotate(-90 ${leftX - 10} ${oy + totalHpx / 2})`}>{Math.round(totalHmm)}</text>

      {/* Zeilenhöhen (links, innen) */}
      {rowsSet.length > 1 && rowsSet.map(rr => {
        const y0 = rowYpx[rr], y1 = rowYpx[rr] + rowHmm[rr] * scale, mid = (y0 + y1) / 2;
        return (
          <g key={'rh' + rr}>
            <line x1={ox - 14} y1={y0} x2={ox - 14} y2={y1} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={ox - 19} y1={y0} x2={ox - 9} y2={y0} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={ox - 19} y1={y1} x2={ox - 9} y2={y1} stroke="#0f1f3d" strokeWidth="1" />
            <text x={ox - 22} y={mid} textAnchor="middle" fontSize="13" fill="#0f1f3d" fontWeight="600"
                  transform={`rotate(-90 ${ox - 22} ${mid})`}>{Math.round(rowHmm[rr])}</text>
          </g>
        );
      })}

      {/* Einheiten */}
      {units.map((u) => {
        const aktiv = activeId != null && u.e._key === activeId;
        return (
          <g key={'u' + u.e._key}>
            <UnitBody c={u.c} glasFarbe={u.e.ornament ? '#7fb0cc' : glasFarbe} keyPrefix={'u' + u.e._key + '-'}
              onPaneClick={interaktiv && aktiv ? onPaneClick : undefined} selectedPane={aktiv ? selectedPane : null} />
            {aktiv && (
              <rect x={u.r0.x} y={u.r0.y} width={u.r0.w} height={u.r0.h} fill="none"
                    stroke="#c0152e" strokeWidth="2.5" strokeDasharray="6 4" pointerEvents="none" />
            )}
            {interaktiv && !aktiv && (
              <rect x={u.r0.x} y={u.r0.y} width={u.r0.w} height={u.r0.h} fill="transparent"
                    style={{ cursor: 'pointer' }} onClick={() => onUnitClick(u.e._key)} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default FensterZeichnung;
