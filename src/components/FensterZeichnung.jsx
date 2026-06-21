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
  { code: 'T01', kategorie: 'tuer', gruppe: 'Türen', label: 'Haustür DIN Links', open: 'tuer', din: 'links' },
  { code: 'T02', kategorie: 'tuer', gruppe: 'Türen', label: 'Haustür DIN Rechts', open: 'tuer', din: 'rechts' },
  { code: 'T03', kategorie: 'tuer', gruppe: 'Türen', label: 'Balkontür Dreh-Kipp DIN Links', open: 'drehkipp', din: 'links', tuer: true },
  { code: 'T04', kategorie: 'tuer', gruppe: 'Türen', label: 'Balkontür Dreh-Kipp DIN Rechts', open: 'drehkipp', din: 'rechts', tuer: true },
];

export function geometrieByCode(code) {
  return GEOMETRIEN.find(g => g.code === code);
}

// Hat der Flügel eine Kippfunktion? (Dreh-Kipp oder reines Kippfenster)
function istKippbar(p) {
  return !!p && !p.fest && (p.open === 'drehkipp' || p.open === 'kipp');
}

const TEIL_WORT = { 2: 'Zweiteiliges', 3: 'Dreiteiliges', 4: 'Vierteiliges', 5: 'Fünfteiliges', 6: 'Sechsteiliges' };
// Anzeigename des Fensters: ein Stulp-Element mit mind. einer nicht-kippbaren Seite
// heisst „Zweiteiliges/Dreiteiliges … Stulpfenster" – sonst das Katalog-Label.
export function fensterBezeichnung(geometrie, panes) {
  const g = geometrie;
  if (!g) return '';
  const ps = panes || g.panes;
  if (g.teilung === 'stulp' && Array.isArray(ps) && ps.length >= 2 && ps.some(p => !istKippbar(p))) {
    return `${TEIL_WORT[ps.length] || `${ps.length}-teiliges`} Stulpfenster`;
  }
  return g.label;
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
  const istTuer = g?.open === 'tuer';
  const blendIn = inset(r0, 6);           // Blendrahmen breit (äußerer Rahmen)
  const miterBlend = gehrung(r0, blendIn);
  const inner = inset(r0, 8);
  const sashW = 4.5;

  const mk = (rect, geo) => {
    const gl = inset(rect, sashW);
    return { sash: rect, glas: gl, miter: gehrung(rect, gl), lines: geo ? oeffnungsLinien(geo, gl) : [] };
  };
  let leaves = [];
  const pfostenList = [];
  if (istFest) {
    leaves = [{ sash: null, glas: inset(blendIn, 2.5), miter: [], lines: [] }];
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
      if (p.fest) leaves.push({ sash: null, glas: inset(rect, 2.5), miter: [], lines: [] });
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
          <rect x={lf.glas.x} y={lf.glas.y} width={lf.glas.w} height={lf.glas.h} fill={istTuer ? '#e7edf2' : glasFarbe} stroke="#0f1f3d" strokeWidth="0.9" />
        </g>
      ))}
      {leaves.map((lf, li) => lf.lines.map((l, i) => (
        <line key={'op' + li + '-' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="0.9" />
      )))}
    </svg>
  );
}

function FensterZeichnung({ geometrie, breite, hoehe, verbreiterung, aufsatzkasten, glasFarbe = '#cfe3ef', onBreite, onHoehe, panes: panesProp, cols: colsProp, colWidths, rowHeights, onColWidth, onRowHeight, onPaneClick, selectedPane }) {
  const g = geometrie;
  const b = Math.max(200, Number(breite) || 1000);
  const hh = Math.max(200, Number(hoehe) || 1200);

  // Zeichenfläche
  const VB_W = 780, VB_H = 720;
  const maxW = 360, maxH = 430;
  const scale = Math.min(maxW / b, maxH / hh);
  const rw = b * scale, rh = hh * scale;
  const cx = VB_W / 2 + 24, cy = VB_H / 2 + 14;
  const x = cx - rw / 2, y = cy - rh / 2;

  // Verbreiterungen (mm) als Streifen außen am Fenster, innerhalb des Gesamtmaßes
  const vo = Math.max(0, Number(verbreiterung?.oben) || 0) * scale;
  const vu = Math.max(0, Number(verbreiterung?.unten) || 0) * scale;
  const vl = Math.max(0, Number(verbreiterung?.links) || 0) * scale;
  const vr = Math.max(0, Number(verbreiterung?.rechts) || 0) * scale;
  // Aufsatzkasten (Rollladenkasten oben), Höhe innerhalb des Gesamtmaßes
  const kh = aufsatzkasten ? Math.max(0, Number(aufsatzkasten.kastenhoehe) || 0) * scale : 0;
  const hatKasten = !!aufsatzkasten && kh > 0;

  const hatVerb = vo || vu || vl || vr;
  const r0 = { x, y, w: rw, h: rh };                            // Gesamtmaß (mit Verbreiterung/Kasten)
  const kasten = { x, y, w: rw, h: kh };
  const win = { x: x + vl, y: y + vo + kh, w: rw - vl - vr, h: rh - vo - vu - kh }; // eigentliches Fenster

  const u = Math.min(win.w, win.h);
  const blendW = Math.max(12, u * 0.052);              // Blendrahmen-Breite (äußerer Rahmen)
  const gap = Math.max(2.5, u * 0.011);                // schmaler Zwischenraum Blend ↔ Flügel
  const sashW = Math.max(10, u * 0.045);               // Flügelrahmen-Breite
  const istFest = g?.open === 'fest';                  // Festverglasung: kein Flügelrahmen
  const blendIn = inset(win, blendW);                  // Blendrahmen-Innenkante
  const miterBlend = gehrung(win, blendIn);            // 45°-Gehrung am Blendrahmen
  const inner = inset(win, blendW + gap);              // Bereich innerhalb des Blendrahmens
  const istTuer = g?.open === 'tuer';

  // Flügel (1, 2 oder Festverglasung)
  const machFluegel = (rect, geo) => {
    const gl = inset(rect, sashW);
    return { sash: rect, rect, glas: gl, miter: gehrung(rect, gl), lines: geo ? oeffnungsLinien(geo, gl) : [] };
  };
  const effPanes = panesProp || g?.panes;
  let leaves = [];
  const pfostenList = [];
  let subCols = [];   // Zwischenmaße Spalten (Breite)
  let subRows = [];   // Zwischenmaße Zeilen (Höhe)
  if (istFest && !effPanes) {
    leaves = [{ sash: null, rect: blendIn, glas: inset(blendIn, Math.max(6, u * 0.02)), miter: [], lines: [] }];
  } else if (effPanes) {
    const anz = effPanes.length;
    const cols = colsProp || g?.cols || anz;
    const rows = Math.ceil(anz / cols);
    const dW = g?.teilung === 'stulp' ? Math.max(8, blendW * 0.6) : blendW;
    const dH = blendW;
    // einzelne Spaltenbreiten / Zeilenhöhen (mm) – sonst gleichmäßig
    const cwMM = colWidths && colWidths.length === cols ? colWidths.map(v => Math.max(1, Number(v) || 0)) : Array(cols).fill((Number(breite) || b) / cols);
    const rhMM = rowHeights && rowHeights.length === rows ? rowHeights.map(v => Math.max(1, Number(v) || 0)) : Array(rows).fill((Number(hoehe) || hh) / rows);
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
      if (p.fest) leaves.push({ sash: null, rect, glas: inset(rect, Math.max(4, sashW * 0.5)), miter: [], lines: [] });
      else leaves.push(machFluegel(rect, { open: p.open, din: p.din }));
    });
    const istStulp = g?.teilung === 'stulp';
    for (let c = 1; c < cols; c++) {
      // Stulp: Mittelpfosten verschwindet, wenn ein angrenzender Flügel nicht kippbar ist
      if (istStulp && !stulpPfostenZeigen(effPanes, cols, c)) continue;
      pfostenList.push({ x: colX[c] - dW, y: inner.y, w: dW, h: inner.h, fest: !istStulp });
    }
    for (let r = 1; r < rows; r++) pfostenList.push({ x: inner.x, y: rowY[r] - dH, w: inner.w, h: dH, fest: true });
    if (cols > 1) subCols = colX.map((cx0, c) => ({ x0: cx0, x1: cx0 + colWpx[c], mm: Math.round(cwMM[c]), idx: c }));
    if (rows > 1) subRows = rowY.map((ry0, r) => ({ y0: ry0, y1: ry0 + rowHpx[r], mm: Math.round(rhMM[r]), idx: r }));
  } else {
    leaves = [machFluegel(inner, g)];
  }
  const hatSubB = subCols.length > 0;
  const hatSubH = subRows.length > 0;

  // Glas-Gesamtbereich (für Lamellen)
  const glasMinX = Math.min(...leaves.map(l => l.glas.x));
  const glasMaxX = Math.max(...leaves.map(l => l.glas.x + l.glas.w));
  const glasTopY = leaves[0].glas.y;
  const glasH = leaves[0].glas.h;

  // Lamellen (Rollladen) im oberen Drittel der Glasfläche
  const lamellen = [];
  if (hatKasten) {
    const anz = 7;
    const bereich = glasH * 0.32;
    for (let i = 1; i <= anz; i++) lamellen.push(glasTopY + (bereich / anz) * i);
  }
  // Bedien-Badge (G = Gurt, M = Motor) an der Bedienungsseite
  const badge = hatKasten ? {
    cx: aufsatzkasten.bedienungsseite === 'rechts' ? win.x + win.w : win.x,
    cy: win.y,
    r: Math.max(16, u * 0.05),
    text: aufsatzkasten.bedienung === 'Motor' ? 'M' : 'G',
  } : null;

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
      {subCols.map((s, i) => (
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
      {subRows.map((s, i) => {
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

      {/* Gesamtmaß-Rahmen außen herum (bei Verbreiterung/Aufsatzkasten) */}
      {(hatVerb || hatKasten) && (
        <rect x={r0.x} y={r0.y} width={r0.w} height={r0.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" />
      )}

      {/* Aufsatzkasten oben */}
      {hatKasten && (
        <rect x={kasten.x} y={kasten.y} width={kasten.w} height={kasten.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" />
      )}

      {/* Blendrahmen (Außenring) + Zwischenrahmen mit 45°-Gehrung */}
      <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" />
      <rect x={blendIn.x} y={blendIn.y} width={blendIn.w} height={blendIn.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
      {miterBlend.map((l, i) => (
        <line key={'mb' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />
      ))}

      {/* Mittelpfosten bzw. Stulp (mehrteilig) */}
      {pfostenList.map((pf, i) => (
        <rect key={'pf' + i} x={pf.x} y={pf.y} width={pf.w} height={pf.h}
              fill="#fff" stroke="#0f1f3d" strokeWidth={pf.fest ? 2 : 1.6} />
      ))}

      {/* Flügelrahmen + Glas je Flügel */}
      {leaves.map((lf, li) => (
        <g key={'lf' + li}>
          {lf.sash && (
            <rect x={lf.sash.x} y={lf.sash.y} width={lf.sash.w} height={lf.sash.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2" />
          )}
          {lf.miter.map((l, i) => (
            <line key={'ms' + li + '-' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />
          ))}
          <rect x={lf.glas.x} y={lf.glas.y} width={lf.glas.w} height={lf.glas.h}
                fill={istTuer ? '#e7edf2' : glasFarbe} stroke="#0f1f3d" strokeWidth="1.4" opacity="0.95" />
        </g>
      ))}

      {/* Rollladen-Lamellen im oberen Glasbereich (über die gesamte Breite) */}
      {lamellen.map((ly, i) => (
        <line key={'lam' + i} x1={glasMinX} y1={ly} x2={glasMaxX} y2={ly} stroke="#0f1f3d" strokeWidth="1" opacity="0.7" />
      ))}

      {/* Öffnungssymbole je Flügel */}
      {leaves.map((lf, li) => lf.lines.map((l, i) => (
        <line key={'op' + li + '-' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]}
              stroke="#0f1f3d" strokeWidth="1.4" />
      )))}

      {/* Bedien-Badge (Gurt/Motor) */}
      {badge && (
        <g>
          <circle cx={badge.cx} cy={badge.cy} r={badge.r} fill="#fff" stroke="#0f1f3d" strokeWidth="2" />
          <text x={badge.cx} y={badge.cy} textAnchor="middle" dominantBaseline="central"
                fontSize={badge.r * 1.1} fontWeight="700" fill="#0f1f3d">{badge.text}</text>
        </g>
      )}

      {/* Türgriff-Andeutung */}
      {istTuer && leaves[0] && (
        <rect
          x={g.din === 'links' ? leaves[0].glas.x + leaves[0].glas.w - 12 : leaves[0].glas.x + 6}
          y={leaves[0].glas.y + leaves[0].glas.h / 2 - 18} width="6" height="36" rx="3" fill="#0f1f3d" />
      )}

      {/* Anklickbare Flügel-Flächen (nur im Editor) */}
      {onPaneClick && leaves.map((lf, li) => (
        <rect key={'hit' + li} x={lf.rect.x} y={lf.rect.y} width={lf.rect.w} height={lf.rect.h}
              fill={selectedPane === li ? 'rgba(192,21,46,0.12)' : 'transparent'}
              stroke={selectedPane === li ? '#c0152e' : 'transparent'} strokeWidth="2.5"
              style={{ cursor: 'pointer' }} onClick={() => onPaneClick(li)} />
      ))}
    </svg>
  );
}

export default FensterZeichnung;
