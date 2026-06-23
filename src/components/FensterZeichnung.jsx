import { useRef, useState } from 'react';

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
  { code: 'T09', kategorie: 'tuer', gruppe: 'Schiebetüren', label: 'Hebe-Schiebe-Tür (HST), Fest links / Schiebe rechts', teilung: 'pfosten', tuer: true,
    panes: [{ fest: true }, { open: 'schiebe', din: 'links' }] },
  { code: 'T10', kategorie: 'tuer', gruppe: 'Schiebetüren', label: 'Hebe-Schiebe-Tür (HST), Schiebe links / Fest rechts', teilung: 'pfosten', tuer: true,
    panes: [{ open: 'schiebe', din: 'rechts' }, { fest: true }] },
  { code: 'T11', kategorie: 'tuer', gruppe: 'Schiebetüren', label: 'Hebe-Schiebe-Tür (HST), Fest / Schiebe / Fest', teilung: 'pfosten', tuer: true, cols: 3,
    panes: [{ fest: true }, { open: 'schiebe', din: 'links' }, { fest: true }] },
  { code: 'T12', kategorie: 'tuer', gruppe: 'Schiebetüren', label: 'Parallel-Schiebe-Kipp-Tür (PSK), Fest links / Schiebe rechts', teilung: 'pfosten', tuer: true,
    panes: [{ fest: true }, { open: 'psk', din: 'links' }] },
  { code: 'T13', kategorie: 'tuer', gruppe: 'Schiebetüren', label: 'Parallel-Schiebe-Kipp-Tür (PSK), Schiebe links / Fest rechts', teilung: 'pfosten', tuer: true,
    panes: [{ open: 'psk', din: 'rechts' }, { fest: true }] },
];

export function geometrieByCode(code) {
  return GEOMETRIEN.find(g => g.code === code);
}

// Hat der Flügel eine Kippfunktion? (Dreh-Kipp oder reines Kippfenster)
function istKippbar(p) {
  return !!p && !p.fest && (p.open === 'drehkipp' || p.open === 'kipp');
}

// Bewegliches Schiebeelement (Hebe-Schiebe / Parallel-Schiebe-Kipp)?
function istSchiebe(p) {
  return !!p && !p.fest && (p.open === 'schiebe' || p.open === 'psk');
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
  if (p.open === 'schiebe') return 'Hebe-Schiebe';
  if (p.open === 'psk') return 'Parallel-Schiebe-Kipp';
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
  // Schiebe-Pfeil: horizontaler Pfeil in Schieberichtung (Hebe-Schiebe / Parallel-Schiebe)
  const schiebe = (din, fy = 0.5) => {
    const cy = y + h * fy;
    const ax0 = x + w * 0.22, ax1 = x + w * 0.78;
    const hd = Math.min(w, h) * 0.09;
    if (din === 'links') {
      linien.push([[ax1, cy], [ax0, cy]], [[ax0, cy], [ax0 + hd, cy - hd]], [[ax0, cy], [ax0 + hd, cy + hd]]);
    } else {
      linien.push([[ax0, cy], [ax1, cy]], [[ax1, cy], [ax1 - hd, cy - hd]], [[ax1, cy], [ax1 - hd, cy + hd]]);
    }
  };
  if (g.open === 'dreh' || g.open === 'tuer') dreh(g.din || 'links');
  else if (g.open === 'kipp') kipp();
  else if (g.open === 'drehkipp') { dreh(g.din || 'links'); kipp(); }
  else if (g.open === 'schiebe') schiebe(g.din || 'rechts');           // Hebe-Schiebe-Tür (HST)
  else if (g.open === 'psk') { kipp(); schiebe(g.din || 'links', 0.78); } // Parallel-Schiebe-Kipp (PSK)
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
    const ueberlapp = dW + sashW;
    g.panes.forEach((p, idx) => {
      const c = idx % cols, r = Math.floor(idx / cols);
      let rect = { x: colX[c], y: rowY[r], w: colW, h: rowH };
      const schiebt = istSchiebe(p) && rows === 1;
      if (schiebt && p.din === 'links' && c > 0) rect = { ...rect, x: rect.x - ueberlapp, w: rect.w + ueberlapp };
      else if (schiebt && p.din !== 'links' && c < cols - 1) rect = { ...rect, w: rect.w + ueberlapp };
      if (p.fest) leaves.push({ sash: null, glas: inset(rect, 2.5), miter: [], lines: [], tuer: false });
      else { const lf = mk(rect, { open: p.open, din: p.din }); lf.zTop = schiebt; leaves.push(lf); }
    });
    const istStulp = g?.teilung === 'stulp';
    for (let c = 1; c < cols; c++) {
      if (istStulp && !stulpPfostenZeigen(g.panes, cols, c)) continue;
      if (rows === 1) {
        const li = g.panes[c - 1], re = g.panes[c];
        if ((istSchiebe(li) && li.din !== 'links') || (istSchiebe(re) && re.din === 'links')) continue;
      }
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
      {leaves.map((lf, li) => ({ lf, li })).sort((a, b) => (a.lf.zTop ? 1 : 0) - (b.lf.zTop ? 1 : 0)).map(({ lf, li }) => (
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
    const ueberlapp = dW + sashW;   // Schiebeflügel ragt über den Pfosten leicht in den Nachbarflügel
    effPanes.forEach((p, idx) => {
      const c = idx % cols, r = Math.floor(idx / cols);
      let rect = { x: colX[c], y: rowY[r], w: colWpx[c], h: rowHpx[r] };
      const schiebt = istSchiebe(p) && rows === 1;
      if (schiebt && p.din === 'links' && c > 0) rect = { ...rect, x: rect.x - ueberlapp, w: rect.w + ueberlapp };
      else if (schiebt && p.din !== 'links' && c < cols - 1) rect = { ...rect, w: rect.w + ueberlapp };
      if (p.fest) leaves.push({ sash: null, rect, glas: inset(rect, Math.max(4, sashW * 0.5)), miter: [], lines: [], tuer: false });
      else { const lf = machFluegel(rect, { open: p.open, din: p.din }); lf.zTop = schiebt; leaves.push(lf); }
    });
    const istStulp = g?.teilung === 'stulp';
    for (let c = 1; c < cols; c++) {
      if (istStulp && !stulpPfostenZeigen(effPanes, cols, c)) continue;
      // Schiebe-Überlappung: Pfosten entfällt, wenn ein bewegliches Element über diese Grenze ragt
      if (rows === 1) {
        const li = effPanes[c - 1], re = effPanes[c];
        if ((istSchiebe(li) && li.din !== 'links') || (istSchiebe(re) && re.din === 'links')) continue;
      }
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
      {/* Verbreiterung: obere/untere Trennlinie laeuft ueber die volle Breite bis zum Aussenrahmen
          (oben/unten liegendes Profil durchgehend, seitliche Verbreiterung setzt darunter an). */}
      {hatVerb && (win.y - r0.y > 0.5) && (
        <line x1={r0.x} y1={win.y} x2={r0.x + r0.w} y2={win.y} stroke="#0f1f3d" strokeWidth="2.5" />
      )}
      {hatVerb && ((r0.y + r0.h) - (win.y + win.h) > 0.5) && (
        <line x1={r0.x} y1={win.y + win.h} x2={r0.x + r0.w} y2={win.y + win.h} stroke="#0f1f3d" strokeWidth="2.5" />
      )}
      <rect x={blendIn.x} y={blendIn.y} width={blendIn.w} height={blendIn.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
      {miterBlend.map((l, i) => (
        <line key={keyPrefix + 'mb' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />
      ))}
      {pfostenList.map((pf, i) => (
        <rect key={keyPrefix + 'pf' + i} x={pf.x} y={pf.y} width={pf.w} height={pf.h}
              fill="#fff" stroke="#0f1f3d" strokeWidth={pf.fest ? 2 : 1.6} />
      ))}
      {leaves.map((lf, li) => ({ lf, li })).sort((a, b) => (a.lf.zTop ? 1 : 0) - (b.lf.zTop ? 1 : 0)).map(({ lf, li }) => (
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

  // Im Beleg (keine Editier-Handler) den viewBox eng an den Inhalt zuschneiden,
  // damit die Zeichnung ihre Spalte ausfüllt statt von Leerraum umgeben zu sein.
  const beleg = !onBreite && !onHoehe;
  // Maß-Fonts proportional zur Zeichnungsbreite, damit sie auf jedem Beleg gleich groß
  // rendern (Einzelfenster wie Kombination). Rand links/oben passend zur (rotierten)
  // Maßzahl, sonst ragt sie aus dem viewBox.
  const fMain = beleg ? Math.round(rw * 0.095) : 22;
  const fSub = beleg ? Math.round(rw * 0.072) : 17;
  const randLO = 12 + Math.round(fMain * 0.8);
  const vbLeft = mainLeftX - randLO, vbTop = mainTopY - randLO;
  const vbRight = x + rw + 14, vbBottom = y + rh + 14;
  const viewBox = beleg
    ? `${vbLeft} ${vbTop} ${vbRight - vbLeft} ${vbBottom - vbTop}`
    : `0 0 ${VB_W} ${VB_H}`;

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="fz-svg">
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
        <text x={cx} y={mainTopY - 10} textAnchor="middle" fontSize={fMain} fill="#0f1f3d" fontWeight="700">{Math.round(b)}</text>
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
            <text x={(s.x0 + s.x1) / 2} y={subTopY - 7} textAnchor="middle" fontSize={fSub} fill="#0f1f3d" fontWeight="700">{s.mm}</text>
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
        <text x={mainLeftX - 10} y={cy} textAnchor="middle" fontSize={fMain} fill="#0f1f3d" fontWeight="700"
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
              <text x={subLeftX - 7} y={mid} textAnchor="middle" fontSize={fSub} fill="#0f1f3d" fontWeight="700"
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
export function KombinationsZeichnung({ elemente, glasFarbe = '#cfe3ef', onUnitClick, activeId, onPaneClick, selectedPane, onDock, onSlide, onTotalBreite, onTotalHoehe, onElementBreite, onElementHoehe }) {
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null); // { id, side, targetId }
  function svgPoint(clientX, clientY) {
    const svg = svgRef.current;
    if (!svg || !svg.getScreenCTM) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint(); pt.x = clientX; pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }
  const els = (elemente || []).map((e, i) => ({ ...e, _key: e.id ?? i }));
  if (!els.length) return null;
  const colsSet = [...new Set(els.map(e => e.col ?? 0))].sort((a, b) => a - b);
  const rowsSet = [...new Set(els.map(e => e.row ?? 0))].sort((a, b) => a - b);
  const maxRow = Math.max(...rowsSet);
  const maxCol = Math.max(...colsSet);
  const hMm = e => Math.max(200, Number(e.hoehe) || 1200);
  const bMm = e => Math.max(200, Number(e.breite) || 1000);
  // Raster-Zeilenhöhe aus den „gebundenen" Elementen (die direkt ein weiteres Element unter sich
  // haben oder in der untersten Zeile liegen). Ein Element mit freiem Platz darunter darf höher
  // gezogen werden und über die Zeilen darunter reichen, ohne die Zeilenhöhe der Nachbarn aufzublähen.
  const gebundenH = e => {
    const c = e.col ?? 0, r = e.row ?? 0;
    if (r === maxRow) return true;
    return els.some(o => (o.col ?? 0) === c && (o.row ?? 0) === r + 1);
  };
  const rowHmm = {}; rowsSet.forEach(rr => {
    const inRow = els.filter(e => (e.row ?? 0) === rr);
    const pool = inRow.filter(gebundenH);
    rowHmm[rr] = Math.max(...(pool.length ? pool : inRow).map(hMm));
  });
  // Spaltenbreite analog: nur „gebundene" Elemente (die direkt rechts einen Nachbarn haben oder in
  // der rechten Spalte liegen) bestimmen die Spaltenbreite. Ein Element mit freiem Platz rechts darf
  // breiter sein und über die Spalten rechts daneben reichen, ohne die Nachbarspalten aufzublähen.
  const gebundenB = e => {
    const c = e.col ?? 0, r = e.row ?? 0;
    if (c === maxCol) return true;
    return els.some(o => (o.row ?? 0) === r && (o.col ?? 0) === c + 1);
  };
  const colWmm = {}; colsSet.forEach(cc => {
    const inCol = els.filter(e => (e.col ?? 0) === cc);
    const pool = inCol.filter(gebundenB);
    colWmm[cc] = Math.max(...(pool.length ? pool : inCol).map(bMm));
  });
  // Gesamtbreite: Summe der Spalten, mind. so breit wie das am weitesten nach rechts reichende Element.
  const colLeftMm = {}; { let x = 0; colsSet.forEach(cc => { colLeftMm[cc] = x; x += colWmm[cc]; }); }
  let totalWmm = colsSet.reduce((a, cc) => a + colWmm[cc], 0);
  els.forEach(e => { const r = colLeftMm[e.col ?? 0] + bMm(e); if (r > totalWmm) totalWmm = r; });
  // Gesamthöhe: Summe der Zeilen, mind. so hoch wie das am weitesten nach unten reichende Element.
  const rowTopMm = {}; { let y = 0; rowsSet.forEach(rr => { rowTopMm[rr] = y; y += rowHmm[rr]; }); }
  let totalHmm = rowsSet.reduce((a, rr) => a + rowHmm[rr], 0);
  els.forEach(e => { const b = rowTopMm[e.row ?? 0] + hMm(e); if (b > totalHmm) totalHmm = b; });

  const maxW = 600, maxH = 440;
  const scale = Math.min(maxW / Math.max(200, totalWmm), maxH / Math.max(200, totalHmm));
  const totalWpx = totalWmm * scale, totalHpx = totalHmm * scale;
  // Im Beleg (nicht interaktiv) den Rahmen eng halten: rechts/unten gibt es keine Maße,
  // links/oben nur so viel Rand wie die Maßzahlen brauchen → Zeichnung füllt ihre Spalte.
  const beleg = !onUnitClick;
  // Maß-Fonts proportional zur Zeichnungsbreite, damit sie auf dem Beleg genauso groß
  // rendern wie beim Einzelfenster (siehe FensterZeichnung). Links/oben muss der Rand
  // zur (rotierten) Maßzahl passen, sonst ragt sie aus dem viewBox.
  const fMain = beleg ? Math.round(totalWpx * 0.085) : 22;
  const fSub = beleg ? Math.round(totalWpx * 0.065) : 17;
  const ML = beleg ? Math.round(70 + fMain * 0.8) : 96;
  const MT = beleg ? Math.round(70 + fMain * 0.8) : 100;
  const MR = beleg ? 22 : 86, MB = beleg ? 20 : 40;
  const VB_W = totalWpx + ML + MR;
  const VB_H = totalHpx + MT + MB;
  const ox = ML, oy = MT;

  const colXpx = {}; { let xa = ox; colsSet.forEach(cc => { colXpx[cc] = xa; xa += colWmm[cc] * scale; }); }
  const rowYpx = {}; { let ya = oy; rowsSet.forEach(rr => { rowYpx[rr] = ya; ya += rowHmm[rr] * scale; }); }

  const units = els.map(e => {
    const cc = e.col ?? 0, rr = e.row ?? 0;
    const elHmm = Math.max(200, Number(e.hoehe) || rowHmm[rr]);
    const elBmm = Math.max(200, Number(e.breite) || colWmm[cc]);
    // Höhen unabhängig: Versatz entlang der Kante (offset = mm von Zeilenoberkante),
    // Standard = unten bündig; per Drag frei verschiebbar, bleibt aber innerhalb der Zeile (verbunden).
    const maxOffMm = Math.max(0, rowHmm[rr] - elHmm);
    let offMm = e.offset == null ? maxOffMm : Number(e.offset);
    if (!Number.isFinite(offMm)) offMm = maxOffMm;
    offMm = Math.min(maxOffMm, Math.max(0, offMm));
    const r0 = { x: colXpx[cc], y: rowYpx[rr] + offMm * scale, w: elBmm * scale, h: elHmm * scale };
    const c = computeUnit(r0, scale, {
      geometrie: geometrieByCode(e.code), breite: elBmm, hoehe: elHmm,
      panes: e.panes, cols: e.cols, colWidths: e.colWidths, rowHeights: e.rowHeights,
      verbreiterung: e.verbreiterung ? e.verb : null, aufsatzkasten: e.aufsatzkasten ? e.kasten : null,
    });
    // rechtsbündig letztes Element seiner Zeile? → Höhenbemaßung rechts
    const rightmost = !els.some(o => (o.row ?? 0) === rr && (o.col ?? 0) > cc);
    // oberstes Element seiner Spalte? → Breitenbemaßung oben
    const topmost = !els.some(o => (o.col ?? 0) === cc && (o.row ?? 0) < rr);
    return { e, c, r0, elHmm, rr, maxOffMm, rightmost, topmost };
  });

  const topY = oy - 56, leftX = ox - 56;          // Gesamtmaße ganz außen
  const interaktiv = !!onUnitClick;
  const editM = !!onElementBreite;                // Maße editierbar (nur im Editor)
  const mainKey = els[0]._key;

  // Dünne Andock-Streifen an JEDER freien Kante jedes Elements (außer dem gezogenen).
  // „Frei" = die im Raster angrenzende Zelle ist nicht von einem anderen Element belegt.
  const STRIP = 14, GAP = 2;
  function buildZonen(dragId) {
    if (dragId == null) return [];
    const belegt = new Set(els.filter(e => e._key !== dragId).map(e => `${e.col ?? 0},${e.row ?? 0}`));
    const gesehen = new Set();
    const zonen = [];
    els.forEach(e => {
      if (e._key === dragId) return;
      const cc = e.col ?? 0, rr = e.row ?? 0;
      const cl = colXpx[cc], cw = colWmm[cc] * scale;
      const ct = rowYpx[rr], ch = rowHmm[rr] * scale;
      const kanten = [
        ['rechts', cc + 1, rr, cl + cw + GAP, ct, STRIP, ch],
        ['links', cc - 1, rr, cl - STRIP - GAP, ct, STRIP, ch],
        ['unten', cc, rr + 1, cl, ct + ch + GAP, cw, STRIP],
        ['oben', cc, rr - 1, cl, ct - STRIP - GAP, cw, STRIP],
      ];
      kanten.forEach(([side, ncol, nrow, zx, zy, zw, zh]) => {
        if (belegt.has(`${ncol},${nrow}`)) return;          // dort sitzt ein Element → keine Zone
        const cellKey = `${ncol},${nrow}`;
        if (gesehen.has(cellKey)) return;                   // Zielzelle nur einmal anbieten
        gesehen.add(cellKey);
        zonen.push([side, e._key, zx, zy, zw, zh]);
      });
    });
    return zonen;
  }
  const dropZonen = buildZonen(drag?.id);
  // Liegt der Zeiger auf einem Andock-Streifen? → Um-Docken an dessen Kante; sonst entlang der Kante verschieben.
  function zoneAt(p) {
    for (const [side, targetId, zx, zy, zw, zh] of dropZonen) {
      if (p.x >= zx && p.x <= zx + zw && p.y >= zy && p.y <= zy + zh) return { side, targetId };
    }
    return null;
  }
  function handleDown(e, id) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id, side: null });
  }
  function handleMove(e, id) {
    if (!drag || drag.id !== id) return;
    const p = svgPoint(e.clientX, e.clientY);
    const zone = zoneAt(p);
    if (zone) {
      setDrag(d => (d ? { ...d, side: zone.side, targetId: zone.targetId } : d));   // an Kante → Vorschau Um-Docken
    } else {
      setDrag(d => (d ? { ...d, side: null, targetId: null } : d));
      // entlang der Kante verschieben: Element folgt vertikal dem Zeiger, bleibt in der Zeile
      const u = units.find(unit => unit.e._key === id);
      if (u && onSlide && u.maxOffMm > 0) {
        // Griff sitzt ~15px unter der Element-Oberkante → unter dem Finger halten
        let offMm = (p.y - 15 - rowYpx[u.rr]) / scale;
        offMm = Math.min(u.maxOffMm, Math.max(0, offMm));
        onSlide(id, offMm);
      }
    }
  }
  function handleUp(e, id) {
    if (drag && drag.id === id && drag.side && onDock) onDock(id, drag.side, drag.targetId);
    setDrag(null);
  }

  return (
    <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet" className="fz-svg">
      {/* Gesamtmaß Breite (oben) */}
      <line x1={ox} y1={topY} x2={ox + totalWpx} y2={topY} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={ox} y1={topY - 6} x2={ox} y2={topY + 6} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={ox + totalWpx} y1={topY - 6} x2={ox + totalWpx} y2={topY + 6} stroke="#0f1f3d" strokeWidth="1.2" />
      {editM && onTotalBreite ? (
        <foreignObject x={ox + totalWpx / 2 - 60} y={topY - 38} width={120} height={32}>
          <input className="fz-massinput" type="number" key={'tw' + Math.round(totalWmm)} defaultValue={Math.round(totalWmm)}
                 onBlur={e => onTotalBreite(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} />
        </foreignObject>
      ) : (
        <text x={ox + totalWpx / 2} y={topY - 10} textAnchor="middle" fontSize={fMain} fill="#0f1f3d" fontWeight="700">{Math.round(totalWmm)}</text>
      )}

      {/* Breitenbemaßung je Element (oben, innen) – oberstes Element jeder Spalte, eigene Breite */}
      {colsSet.length > 1 && units.filter(u => u.topmost).map(u => {
        const x0 = u.r0.x, x1 = u.r0.x + u.r0.w;
        return (
          <g key={'cw' + u.e._key}>
            <line x1={x0} y1={oy - 16} x2={x1} y2={oy - 16} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={x0} y1={oy - 21} x2={x0} y2={oy - 11} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={x1} y1={oy - 21} x2={x1} y2={oy - 11} stroke="#0f1f3d" strokeWidth="1" />
            {editM && onElementBreite ? (
              <foreignObject x={(x0 + x1) / 2 - 42} y={oy - 48} width={84} height={28}>
                <input className="fz-massinput fz-massinput--sub" type="number" value={u.e.breite}
                       onChange={e => onElementBreite(u.e._key, e.target.value)} />
              </foreignObject>
            ) : (
              <text x={(x0 + x1) / 2} y={oy - 22} textAnchor="middle" fontSize={fSub} fill="#0f1f3d" fontWeight="700">{Math.round(u.r0.w / scale)}</text>
            )}
          </g>
        );
      })}

      {/* Gesamtmaß Höhe (links) */}
      <line x1={leftX} y1={oy} x2={leftX} y2={oy + totalHpx} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={leftX - 6} y1={oy} x2={leftX + 6} y2={oy} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={leftX - 6} y1={oy + totalHpx} x2={leftX + 6} y2={oy + totalHpx} stroke="#0f1f3d" strokeWidth="1.2" />
      {editM && onTotalHoehe ? (
        <foreignObject x={leftX - 16 - 36} y={oy + totalHpx / 2 - 16} width={72} height={32}
                       transform={`rotate(-90 ${leftX - 16} ${oy + totalHpx / 2})`}>
          <input className="fz-massinput" type="number" key={'th' + Math.round(totalHmm)} defaultValue={Math.round(totalHmm)}
                 onBlur={e => onTotalHoehe(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} />
        </foreignObject>
      ) : (
        <text x={leftX - 10} y={oy + totalHpx / 2} textAnchor="middle" fontSize={fMain} fill="#0f1f3d" fontWeight="700"
              transform={`rotate(-90 ${leftX - 10} ${oy + totalHpx / 2})`}>{Math.round(totalHmm)}</text>
      )}

      {/* Zeilenhöhen (links, innen) */}
      {rowsSet.length > 1 && rowsSet.map(rr => {
        const y0 = rowYpx[rr], y1 = rowYpx[rr] + rowHmm[rr] * scale, mid = (y0 + y1) / 2;
        return (
          <g key={'rh' + rr}>
            <line x1={ox - 14} y1={y0} x2={ox - 14} y2={y1} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={ox - 19} y1={y0} x2={ox - 9} y2={y0} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={ox - 19} y1={y1} x2={ox - 9} y2={y1} stroke="#0f1f3d" strokeWidth="1" />
            <text x={ox - 22} y={mid} textAnchor="middle" fontSize={fSub} fill="#0f1f3d" fontWeight="700"
                  transform={`rotate(-90 ${ox - 22} ${mid})`}>{Math.round(rowHmm[rr])}</text>
          </g>
        );
      })}

      {/* Andock-Streifen an jeder freien Kante – während des Ziehens */}
      {drag && dropZonen.map(([side, targetId, zx, zy, zw, zh]) => {
        const aktiv = drag.side === side && drag.targetId === targetId;
        return (
          <rect key={'dz' + targetId + side} x={zx} y={zy} width={Math.max(0, zw)} height={Math.max(0, zh)} rx="4"
                pointerEvents="none"
                fill={aktiv ? 'rgba(192,21,46,0.16)' : 'rgba(15,31,61,0.05)'}
                stroke={aktiv ? '#c0152e' : '#aeb7c6'} strokeWidth="1.2" strokeDasharray="4 3" />
        );
      })}

      {/* Einheiten */}
      {units.map((u) => {
        const aktiv = activeId != null && u.e._key === activeId;
        const istMainUnit = u.e._key === mainKey;
        const hw = Math.max(64, Math.min(96, u.r0.w * 0.7));
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
            {/* Verschiebe-Griff (nicht am Hauptelement) */}
            {interaktiv && !istMainUnit && (
              <g style={{ cursor: 'move', touchAction: 'none' }}
                 onPointerDown={e => handleDown(e, u.e._key)}
                 onPointerMove={e => handleMove(e, u.e._key)}
                 onPointerUp={e => handleUp(e, u.e._key)}>
                <rect x={u.r0.x + u.r0.w / 2 - hw / 2} y={u.r0.y + 7} width={hw} height={26} rx="13"
                      fill="#0f1f3d" opacity={drag && drag.id === u.e._key ? 1 : 0.85} />
                <text x={u.r0.x + u.r0.w / 2} y={u.r0.y + 7 + 13} textAnchor="middle" dominantBaseline="central"
                      fontSize="12.5" fontWeight="700" fill="#fff" style={{ pointerEvents: 'none' }}>↔ ziehen</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Höhenbemaßung je Element (rechts) – nur wenn mehrere unterschiedliche Höhen sinnvoll */}
      {units.filter(u => u.rightmost).map(u => {
        const dx = u.r0.x + u.r0.w + 16;
        const mid = u.r0.y + u.r0.h / 2;
        return (
          <g key={'eh' + u.e._key}>
            <line x1={dx} y1={u.r0.y} x2={dx} y2={u.r0.y + u.r0.h} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={dx - 5} y1={u.r0.y} x2={dx + 5} y2={u.r0.y} stroke="#0f1f3d" strokeWidth="1" />
            <line x1={dx - 5} y1={u.r0.y + u.r0.h} x2={dx + 5} y2={u.r0.y + u.r0.h} stroke="#0f1f3d" strokeWidth="1" />
            {editM && onElementHoehe ? (
              <foreignObject x={dx + 14 - 36} y={mid - 14} width={72} height={28} transform={`rotate(-90 ${dx + 14} ${mid})`}>
                <input className="fz-massinput fz-massinput--sub" type="number" value={u.e.hoehe}
                       onChange={e => onElementHoehe(u.e._key, e.target.value)} />
              </foreignObject>
            ) : (
              <text x={dx + 16} y={mid} textAnchor="middle" fontSize="15" fill="#0f1f3d" fontWeight="600"
                    transform={`rotate(-90 ${dx + 16} ${mid})`}>{Math.round(u.elHmm)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default FensterZeichnung;
