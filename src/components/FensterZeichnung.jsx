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
  { code: 'F07', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Zweiteiliges Drehkippfenster', teilung: 'pfosten',
    panes: [{ open: 'drehkipp', din: 'links' }, { open: 'drehkipp', din: 'rechts' }] },
  { code: 'F08', kategorie: 'fenster', gruppe: 'Mehrteilig', label: 'Stulpfenster zweiteilig', teilung: 'stulp',
    panes: [{ open: 'drehkipp', din: 'links' }, { open: 'dreh', din: 'rechts' }] },
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
  // Sonderformen (feststehende Sonderform-Verglasungen): Bögen & Dreiecke. Eigene Zeichen-Routine.
  { code: 'S01', kategorie: 'fenster', gruppe: 'Sonderformen', label: 'Rundbogenfenster', form: 'rundbogen', open: 'fest', defBreite: 1000, defHoehe: 1200 },
  { code: 'S02', kategorie: 'fenster', gruppe: 'Sonderformen', label: 'Segmentbogenfenster', form: 'segmentbogen', open: 'fest', defBreite: 1200, defHoehe: 1000 },
  { code: 'S03', kategorie: 'fenster', gruppe: 'Sonderformen', label: 'Dreieckfenster gleichschenklig', form: 'dreieck', variante: 'gleich', open: 'fest', defBreite: 1200, defHoehe: 800 },
  { code: 'S04', kategorie: 'fenster', gruppe: 'Sonderformen', label: 'Dreieckfenster rechtwinklig (Spitze links)', form: 'dreieck', variante: 'links', open: 'fest', defBreite: 1200, defHoehe: 800 },
  { code: 'S05', kategorie: 'fenster', gruppe: 'Sonderformen', label: 'Dreieckfenster rechtwinklig (Spitze rechts)', form: 'dreieck', variante: 'rechts', open: 'fest', defBreite: 1200, defHoehe: 800 },
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

  // --- ALU Haustür: eigenes System „Aluminium Haustür". Diese Geometrien sind NUR sichtbar/
  // editierbar, wenn dieses System gewählt ist (aluHaustuer-Flag). `oberlicht` = fester Querriegel
  // über die volle Breite oben; `colRatio` = relative Spaltenbreiten (z. B. 500/1000/500).
  { code: 'A01', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Links', tuer: true, defBreite: 1100, defHoehe: 2100, open: 'tuer', din: 'links' },
  { code: 'A02', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Rechts', tuer: true, defBreite: 1100, defHoehe: 2100, open: 'tuer', din: 'rechts' },
  { code: 'A03', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Rechts mit Seitenteil', tuer: true, defBreite: 2000, defHoehe: 2100,
    panes: [{ fest: true }, { open: 'tuer', din: 'rechts' }] },
  { code: 'A04', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Links mit Seitenteil', tuer: true, defBreite: 2000, defHoehe: 2100,
    panes: [{ open: 'tuer', din: 'links' }, { fest: true }] },
  { code: 'A05', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Rechts mit 2 Seitenteilen', tuer: true, defBreite: 2000, defHoehe: 2100, cols: 3, colRatio: [1, 2, 1],
    panes: [{ fest: true }, { open: 'tuer', din: 'rechts' }, { fest: true }] },
  { code: 'A06', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Links mit 2 Seitenteilen', tuer: true, defBreite: 2000, defHoehe: 2100, cols: 3, colRatio: [1, 2, 1],
    panes: [{ fest: true }, { open: 'tuer', din: 'links' }, { fest: true }] },
  { code: 'A07', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Rechts mit Oberlicht', tuer: true, oberlicht: true, oberlichtMm: 400, defBreite: 1100, defHoehe: 2500, cols: 1,
    panes: [{ open: 'tuer', din: 'rechts' }] },
  { code: 'A08', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Links mit Oberlicht', tuer: true, oberlicht: true, oberlichtMm: 400, defBreite: 1100, defHoehe: 2500, cols: 1,
    panes: [{ open: 'tuer', din: 'links' }] },
  { code: 'A09', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Rechts mit Seitenteil und Oberlicht', tuer: true, oberlicht: true, oberlichtMm: 400, defBreite: 2000, defHoehe: 2500, cols: 2,
    panes: [{ fest: true }, { open: 'tuer', din: 'rechts' }] },
  { code: 'A10', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Links mit Seitenteil und Oberlicht', tuer: true, oberlicht: true, oberlichtMm: 400, defBreite: 2000, defHoehe: 2500, cols: 2,
    panes: [{ open: 'tuer', din: 'links' }, { fest: true }] },
  { code: 'A11', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Rechts mit 2 Seitenteilen und Oberlicht', tuer: true, oberlicht: true, oberlichtMm: 400, defBreite: 2000, defHoehe: 2500, cols: 3, colRatio: [1, 2, 1],
    panes: [{ fest: true }, { open: 'tuer', din: 'rechts' }, { fest: true }] },
  { code: 'A12', kategorie: 'tuer', aluHaustuer: true, gruppe: 'ALU Haustür', label: 'ALU Haustür DIN Links mit 2 Seitenteilen und Oberlicht', tuer: true, oberlicht: true, oberlichtMm: 400, defBreite: 2000, defHoehe: 2500, cols: 3, colRatio: [1, 2, 1],
    panes: [{ fest: true }, { open: 'tuer', din: 'links' }, { fest: true }] },

  // Rollladen (eigene Kategorie „rollo") – Skizze und Felder unterscheiden sich vom Fenster.
  { code: 'R01', kategorie: 'rollo', gruppe: 'Rollladen', label: 'Vorbau Rollladen', defBreite: 1000, defHoehe: 1400 },
  { code: 'R02', kategorie: 'rollo', gruppe: 'Rollladen', label: 'Rollo Panzer', panzerOnly: true, defBreite: 1000, defHoehe: 1400 },
];

// Codes der ALU-Haustür-Geometrien (nur im System „Aluminium Haustür" sichtbar).
export const ALU_HAUSTUER_CODES = GEOMETRIEN.filter(g => g.aluHaustuer).map(g => g.code);
export function istAluCode(code) { return ALU_HAUSTUER_CODES.includes(code); }

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
// Kürzel der Bedienung für das Kasten-Symbol: Gurt→G, Kurbel→K, (Funk-)Motor→M.
export function bedienungKuerzel(b) {
  if (!b) return '';
  if (/gurt/i.test(b)) return 'G';
  if (/kurbel/i.test(b)) return 'K';
  if (/motor/i.test(b)) return 'M';
  return b.trim().charAt(0).toUpperCase();
}

// Eigenständige Rollladen-Skizze: Kasten oben, Rollopanzer (Lamellen) mit Führungsschienen darunter.
// panzerOnly = nur der Behang (Rollo Panzer) ohne Vorbaukasten.
export function RolloZeichnung({ breite = 1000, hoehe = 1400, kastenhoehe = 165, bedienung = 'Gurt', bedienungsseite = 'rechts', panzerOnly = false, beleg = false }) {
  const b = Math.max(200, Number(breite) || 1000);
  const h = Math.max(200, Number(hoehe) || 1400);
  const kh = panzerOnly ? 0 : Math.min(h * 0.5, Math.max(40, Number(kastenhoehe) || 0));
  const maxW = 360, maxH = 300;
  const scale = Math.min(maxW / b, maxH / h);
  const PAD = beleg ? 12 : 46;
  const rw = b * scale, rh = h * scale, khpx = kh * scale;
  const ox = PAD, oy = PAD;
  const VB_W = rw + PAD * 2, VB_H = rh + PAD * 2;
  const rail = panzerOnly ? 0 : Math.max(6, Math.min(rw * 0.05, 14));
  const pz = { x: ox + rail, y: oy + khpx, w: rw - rail * 2, h: rh - khpx };
  // Lamellen als gefüllte Bänder (statt dünner Linien) – rastern in jedem Renderer (Bildschirm + html2canvas/PDF) gleichmäßig.
  const panzerMm = Math.max(1, h - kh);
  const bandCount = Math.max(6, Math.min(26, Math.round(panzerMm / 110)));
  const bandH = pz.h / bandCount;
  const txt = { fontSize: 13, fill: '#0f1f3d', fontWeight: 700 };
  // Symbol-Position: bei Kasten an dessen Unterkante, beim reinen Panzer oben im Behang.
  const r = Math.max(11, Math.min((khpx || rh * 0.12) * 0.62, 17));
  const bcx = bedienungsseite === 'links' ? ox + rail + r * 0.4 : ox + rw - rail - r * 0.4;
  const bcy = panzerOnly ? oy + r + 4 : oy + khpx;
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet" className="fz-svg">
      {/* Führungsschienen (nur Vorbau-Variante) */}
      {!panzerOnly && (
        <>
          <rect x={ox} y={oy + khpx} width={rail} height={rh - khpx} fill="#eef1f5" stroke="#0f1f3d" strokeWidth="1.5" />
          <rect x={ox + rw - rail} y={oy + khpx} width={rail} height={rh - khpx} fill="#eef1f5" stroke="#0f1f3d" strokeWidth="1.5" />
        </>
      )}
      {/* Behang (Panzer): weiße Lamellen mit schwarzen Trennstreifen (gefüllte Rechtecke → rastert gleichmäßig) */}
      <rect x={pz.x} y={pz.y} width={pz.w} height={pz.h} fill="#ffffff" stroke="none" />
      {Array.from({ length: bandCount - 1 }).map((_, i) => {
        const sepH = Math.max(1, bandH * 0.09);
        return <rect key={'s' + i} x={pz.x} y={Math.round(pz.y + (i + 1) * bandH - sepH / 2)} width={pz.w} height={sepH} fill="#0f1f3d" stroke="none" shapeRendering="crispEdges" />;
      })}
      <rect x={pz.x} y={pz.y} width={pz.w} height={pz.h} fill="none" stroke="#0f1f3d" strokeWidth="1.5" />
      {/* Rollladenkasten oben (nur Vorbau-Variante) */}
      {!panzerOnly && (
        <>
          <rect x={ox} y={oy} width={rw} height={khpx} fill="#fff" stroke="#0f1f3d" strokeWidth="2" />
          <line x1={ox} y1={oy + khpx} x2={ox + rw} y2={oy + khpx} stroke="#0f1f3d" strokeWidth="2" />
        </>
      )}
      {/* Bedienungs-Symbol (Kreis + Buchstabe) auf der gewählten Seite – nur Vorbau-Variante */}
      {!panzerOnly && (() => {
        const kuerzel = bedienungKuerzel(bedienung);
        if (!kuerzel) return null;
        return (
          <g>
            <circle cx={bcx} cy={bcy} r={r} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
            <text x={bcx} y={bcy + r * 0.34} textAnchor="middle" fontSize={r * 1.05} fontWeight="700" fill="#0f1f3d">{kuerzel}</text>
          </g>
        );
      })()}
      {!beleg && (
        <>
          <text x={ox + rw / 2} y={oy - 16} textAnchor="middle" {...txt}>{Math.round(b)}</text>
          <line x1={ox} y1={oy - 8} x2={ox + rw} y2={oy - 8} stroke="#0f1f3d" strokeWidth="1" />
          <text x={ox - 14} y={oy + rh / 2} textAnchor="middle" transform={`rotate(-90 ${ox - 14} ${oy + rh / 2})`} {...txt}>{Math.round(h)}</text>
          {!panzerOnly && (
            <text x={ox + rw + 16} y={oy + khpx / 2 + 4} textAnchor="middle" transform={`rotate(-90 ${ox + rw + 16} ${oy + khpx / 2})`} fontSize="11" fill="#667085" fontWeight="600">Kasten {Math.round(kh)}</text>
          )}
        </>
      )}
    </svg>
  );
}

export function GeometrieThumb({ geometrie, glasFarbe = '#cfe3ef' }) {
  const g = geometrie;
  // Rollladen: kompaktes Mini-Symbol (Kasten + Lamellen); Panzer-Variante ohne Kasten.
  if (g?.kategorie === 'rollo') {
    const W = 120, H = 92, m = 10, kh = g?.panzerOnly ? 0 : 18;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <rect x={m + 6} y={m + kh} width={W - 2 * m - 12} height={H - 2 * m - kh} fill="#f4f6f8" stroke="#0f1f3d" strokeWidth="1.4" />
        {[0, 1, 2, 3, 4].map(i => {
          const y = m + kh + 8 + i * ((H - 2 * m - kh - 8) / 5);
          return <line key={i} x1={m + 6} y1={y} x2={W - m - 6} y2={y} stroke="#0f1f3d" strokeWidth="0.7" opacity="0.55" />;
        })}
        {!g?.panzerOnly && <rect x={m} y={m} width={W - 2 * m} height={kh} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />}
      </svg>
    );
  }
  // Sonderformen (Bögen/Dreiecke): Mini-Kontur + Glas.
  if (g?.form) {
    const W = 120, H = 92, m = 9;
    const { outer, inner } = sonderformPfade({ x: m, y: m, w: W - 2 * m, h: H - 2 * m }, g, 6);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <path d={outer} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" strokeLinejoin="round" />
        <path d={inner} fill="#f4f6f8" stroke="#0f1f3d" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    );
  }
  const W = 120, H = 92, m = 7;
  const r0 = { x: m, y: m, w: W - 2 * m, h: H - 2 * m };
  const istFest = g?.open === 'fest';
  const blendIn = inset(r0, 6);           // Blendrahmen breit (äußerer Rahmen)
  const miterBlend = gehrung(r0, blendIn);
  let inner = inset(r0, 8);
  const sashW = 4.5;
  // Oberlicht (Vorschau): schmaler fester Streifen oben, Rest darunter.
  let olThumb = null;
  if (g?.oberlicht) {
    const olH = inner.h * 0.20;
    olThumb = { x: inner.x, y: inner.y, w: inner.w, h: olH };
    inner = { x: inner.x, y: inner.y + olH + 5, w: inner.w, h: inner.h - olH - 5 };
  }

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
  if (olThumb) {
    leaves.push({ sash: null, glas: inset(olThumb, 2.5), miter: [], lines: [], tuer: false });
    pfostenList.push({ x: olThumb.x, y: olThumb.y + olThumb.h, w: olThumb.w, h: 5 });
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
export function computeUnit(r0, scale, { geometrie, breite, hoehe, panes: panesProp, cols: colsProp, colWidths, rowHeights, verbreiterung, aufsatzkasten, schwelle, oberlichtHoehe }) {
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
  // Rahmen-/Flügelprofile als FESTE physische Breite (mm × scale), nicht proportional zur
  // Fenstergröße. So bleibt die Rahmenbreite gleich, wenn man die Fenstergröße ändert, und
  // alle Elemente einer Kombination (gleicher scale) haben dieselbe Profilbreite.
  // Nur bei sehr kleinen Einheiten wird das Profil so weit verkleinert, dass Glas übrig bleibt.
  const BLEND_MM = 50, GAP_MM = 10, SASH_MM = 45;
  const fit = Math.min(1, (u * 0.40) / Math.max(1, (BLEND_MM + GAP_MM + SASH_MM) * scale));
  const blendW = Math.max(6, BLEND_MM * scale * fit);
  const gap = Math.max(1.5, GAP_MM * scale * fit);
  const sashW = Math.max(5, SASH_MM * scale * fit);
  const istFest = g?.open === 'fest';
  const effPanes = panesProp || g?.panes;
  // Schwelle (schmaler Bodenabschluss statt vollem Rahmen unten): Haustüren haben sie immer,
  // Balkon-/Terrassentüren optional (Schalter im Editor → prop `schwelle`).
  // Umlauf oben/links/rechts bleibt jeweils gleich.
  const istHaustuer = g?.open === 'tuer' || (Array.isArray(effPanes) && effPanes.some(p => p?.open === 'tuer'));
  const hatSchwelle = istHaustuer || !!schwelle;
  const schwelleW = hatSchwelle ? Math.max(3, blendW * 0.32) : blendW;
  const insetTRBL = (r, t, ri, b, l) => ({ x: r.x + l, y: r.y + t, w: r.w - l - ri, h: r.h - t - b });
  const blendIn = insetTRBL(win, blendW, blendW, schwelleW, blendW);
  let miterBlend = gehrung(win, blendIn);
  if (hatSchwelle) {
    // Seitenrahmen laufen gerade nach unten durch; der Stoß zur Schwelle ist eine durchgehende
    // horizontale Linie (kein 45°-Gehrungsschnitt an den unteren Ecken → keine schräge Schwelle).
    const by = blendIn.y + blendIn.h;
    miterBlend = [
      miterBlend[0], miterBlend[1],
      [[win.x + win.w, by], [blendIn.x + blendIn.w, by]],
      [[win.x, by], [blendIn.x, by]],
    ];
  }
  let inner = insetTRBL(win, blendW + gap, blendW + gap, schwelleW + gap, blendW + gap);
  const istTuer = g?.open === 'tuer' || g?.kategorie === 'tuer';

  // Oberlicht: fester Querriegel über die VOLLE Breite oben (eigene Scheibe + waagrechter Kämpfer).
  // Die eigentliche Flügel-/Seitenteil-Aufteilung sitzt darunter (unverändertes Raster).
  let oberlichtRect = null, kaempferRect = null;
  if (g?.oberlicht) {
    const olMM = Math.max(50, Number(oberlichtHoehe) || g.oberlichtMm || 400);
    const olH = Math.min(olMM * scale, inner.h * 0.6);  // mind. unteren Bereich erhalten
    const kH = blendW;                                  // Kämpfer (waagrechter Rahmen) unter dem Oberlicht
    oberlichtRect = { x: inner.x, y: inner.y, w: inner.w, h: olH };
    kaempferRect = { x: inner.x, y: inner.y + olH, w: inner.w, h: kH, fest: true };
    inner = { x: inner.x, y: inner.y + olH + kH, w: inner.w, h: inner.h - olH - kH };
  }

  const machFluegel = (rect, geo) => {
    const gl = inset(rect, sashW);
    return { sash: rect, rect, glas: gl, miter: gehrung(rect, gl), lines: geo ? oeffnungsLinien(geo, gl) : [], tuer: geo?.open === 'tuer' };
  };
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
  if (oberlichtRect) {
    // Oberlicht als feste Scheibe (volle Breite) ans Ende; Kämpfer als waagrechter Rahmen.
    leaves.push({ sash: null, rect: oberlichtRect, glas: inset(oberlichtRect, Math.max(4, sashW * 0.5)), miter: [], lines: [], tuer: false });
    pfostenList.push(kaempferRect);
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

  const oberlichtBand = oberlichtRect ? { y0: oberlichtRect.y, y1: oberlichtRect.y + oberlichtRect.h } : null;
  const bottomBand = oberlichtRect ? { y0: inner.y, y1: inner.y + inner.h } : null;

  // Verbreiterungs-Bänder (für die separate Maß-Darstellung wie im WinPro-Beleg):
  // oben/unten = waagrechtes Profil über die volle Breite → vertikales Maß (Höhe des Bandes);
  // links/rechts = senkrechtes Profil neben dem Fenster → waagrechtes Maß (Breite des Bandes).
  const verbBands = {
    oben:   vo > 0.5 ? { dir: 'v', y0: r0.y + kh, y1: win.y, mm: Math.round(Number(verbreiterung?.oben) || 0) } : null,
    unten:  vu > 0.5 ? { dir: 'v', y0: win.y + win.h, y1: r0.y + r0.h, mm: Math.round(Number(verbreiterung?.unten) || 0) } : null,
    links:  vl > 0.5 ? { dir: 'h', x0: r0.x, x1: win.x, mm: Math.round(Number(verbreiterung?.links) || 0) } : null,
    rechts: vr > 0.5 ? { dir: 'h', x0: win.x + win.w, x1: r0.x + r0.w, mm: Math.round(Number(verbreiterung?.rechts) || 0) } : null,
  };
  return { g, r0, win, kasten, blendIn, miterBlend, leaves, pfostenList, subCols, subRows, lamellen, badge, glasMinX, glasMaxX, hatVerb, hatKasten, istTuer, effPanes, hatOberlicht: !!oberlichtRect, oberlichtBand, bottomBand, verbBands };
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
      {onPaneClick && leaves.map((lf, li) => {
        if (effPanes && li >= effPanes.length) return null;   // Oberlicht/Zusatzscheibe: nicht als Pane anklickbar
        return (
          <rect key={keyPrefix + 'hit' + li} x={lf.rect.x} y={lf.rect.y} width={lf.rect.w} height={lf.rect.h}
                fill={selectedPane === li ? 'rgba(192,21,46,0.12)' : 'transparent'}
                stroke={selectedPane === li ? '#c0152e' : 'transparent'} strokeWidth="2.5"
                style={{ cursor: 'pointer' }} onClick={() => onPaneClick(li)} />
        );
      })}
    </g>
  );
}

// --- Sonderformen (Bögen & Dreiecke) ---
// Liefert SVG-Pfade für Außenkontur und (eingerückte) Glasfläche innerhalb des Rechtecks r.
export function sonderformPfade(r, geo, frame) {
  const { x, y, w, h } = r;
  const fw = Math.max(4, frame || 0);
  if (geo.form === 'dreieck') {
    let pts;
    if (geo.variante === 'links') pts = [[x, y], [x, y + h], [x + w, y + h]];            // Spitze oben links
    else if (geo.variante === 'rechts') pts = [[x + w, y], [x, y + h], [x + w, y + h]];  // Spitze oben rechts
    else pts = [[x + w / 2, y], [x, y + h], [x + w, y + h]];                             // gleichschenklig
    const outer = `M ${pts[0][0]},${pts[0][1]} L ${pts[1][0]},${pts[1][1]} L ${pts[2][0]},${pts[2][1]} Z`;
    // Glasfläche: Ecken näherungsweise konstant Richtung Schwerpunkt einrücken.
    const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    const s = Math.max(0.3, 1 - (2.8 * fw) / Math.min(w, h));
    const ip = pts.map(([px, py]) => [cx + (px - cx) * s, cy + (py - cy) * s]);
    const inner = `M ${ip[0][0]},${ip[0][1]} L ${ip[1][0]},${ip[1][1]} L ${ip[2][0]},${ip[2][1]} Z`;
    return { outer, inner };
  }
  // Bögen: Rundbogen (Halbkreis, rise = w/2) bzw. Segmentbogen (flacher Kreissegment-Bogen).
  const rise = geo.form === 'rundbogen' ? Math.min(w / 2, h * 0.92) : Math.min(w * 0.22, h * 0.6);
  const R = (w * w / 4 + rise * rise) / (2 * rise);
  const outer = `M ${x},${y + h} L ${x},${y + rise} A ${R},${R} 0 0 1 ${x + w},${y + rise} L ${x + w},${y + h} Z`;
  const ix = x + fw, iw = w - 2 * fw, iyTop = y + fw, iBot = y + h - fw;
  const irise = Math.max(2, rise - fw);
  const iR = (iw * iw / 4 + irise * irise) / (2 * irise);
  const inner = `M ${ix},${iBot} L ${ix},${iyTop + irise} A ${iR},${iR} 0 0 1 ${ix + iw},${iyTop + irise} L ${ix + iw},${iBot} Z`;
  return { outer, inner };
}

function FensterZeichnung({ geometrie, breite, hoehe, verbreiterung, aufsatzkasten, schwelle, oberlichtHoehe, glasFarbe = '#cfe3ef', onBreite, onHoehe, onOberlichtHoehe, onBottomHoehe, panes: panesProp, cols: colsProp, colWidths, rowHeights, onColWidth, onRowHeight, onPaneClick, selectedPane }) {
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
  const istSonderform = !!geometrie?.form;
  const sonder = istSonderform ? sonderformPfade(r0, geometrie, Math.max(6, 60 * scale)) : null;
  const c = computeUnit(r0, scale, { geometrie, breite, hoehe, panes: panesProp, cols: colsProp, colWidths, rowHeights, verbreiterung, aufsatzkasten, schwelle, oberlichtHoehe });
  const hatSubB = c.subCols.length > 0;
  const hatSubH = c.subRows.length > 0 || c.hatOberlicht;

  // Maß-Positionen: Hauptmaß weiter außen, wenn Zwischenmaße vorhanden
  const mainTopY = hatSubB ? y - 78 : y - 34;
  const subTopY = y - 32;
  const mainLeftX = hatSubH ? x - 86 : x - 34;
  const subLeftX = x - 34;

  // Im Beleg (keine Editier-Handler) den viewBox eng an den Inhalt zuschneiden,
  // damit die Zeichnung ihre Spalte ausfüllt statt von Leerraum umgeben zu sein.
  const beleg = !onBreite && !onHoehe;
  // Beleg: feste Anzeige-Box (.beleg-zeichnung). Die Maß-Schrift wird so gewählt, dass sie
  // NACH dem Einpassen (preserveAspectRatio) auf jeder Position gleich groß/lesbar erscheint –
  // unabhängig vom Seitenverhältnis (hohe Fenster werden sonst stark verkleinert).
  const BOX_W = 185, BOX_H = 150, ZIEL_FONT = 13;
  const cRight = x + rw + 14, cBottom = y + rh + 14;
  let fMain, randLO;
  if (beleg) {
    fMain = 30;
    for (let i = 0; i < 4; i++) {
      randLO = 12 + fMain * 0.85;
      const vbW = (cRight - mainLeftX) + randLO;
      const vbH = (cBottom - mainTopY) + randLO;
      fMain = ZIEL_FONT * Math.max(vbW / BOX_W, vbH / BOX_H);
    }
    fMain = Math.round(fMain);
    randLO = Math.round(12 + fMain * 0.85);
  } else {
    fMain = 22;
    randLO = 12 + Math.round(22 * 0.8);
  }
  const fSub = beleg ? Math.round(fMain * 0.76) : 17;
  // Verbreiterungs-Maße: oben/unten rechts neben dem Rahmen (vertikal), links/rechts unter dem
  // Rahmen (horizontal). Bei Bedarf den Beleg-viewBox dafür etwas weiter aufmachen.
  const vb = c.verbBands || {};
  const hatVertVerb = !!(vb.oben || vb.unten);
  const hatHorizVerb = !!(vb.links || vb.rechts);
  const fVerb = Math.round(fSub * 0.92);
  const vbLeft = mainLeftX - randLO, vbTop = mainTopY - randLO;
  const vbRight = cRight + (hatVertVerb ? Math.round(fVerb * 1.6) : 0);
  const vbBottom = cBottom + (hatHorizVerb ? Math.round(fVerb * 1.4) : 0);
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

      {/* Oberlicht-/Unterteil-Höhen (links, innen) – wie Zeilenhöhen editierbar */}
      {c.hatOberlicht && (() => {
        const olVal = Math.round(Number(oberlichtHoehe) || (c.g?.oberlichtMm ?? 400));
        const bottomVal = Math.max(0, Math.round(hh - olVal));
        const bands = [
          { band: c.oberlichtBand, val: olVal, on: onOberlichtHoehe, key: 'olm' },
          { band: c.bottomBand, val: bottomVal, on: onBottomHoehe, key: 'bom' },
        ];
        return bands.map(({ band, val, on, key }) => {
          const mid = (band.y0 + band.y1) / 2;
          const cxr = subLeftX - 22;
          return (
            <g key={key}>
              <line x1={subLeftX} y1={band.y0} x2={subLeftX} y2={band.y1} stroke="#0f1f3d" strokeWidth="1" />
              <line x1={subLeftX - 5} y1={band.y0} x2={subLeftX + 5} y2={band.y0} stroke="#0f1f3d" strokeWidth="1" />
              <line x1={subLeftX - 5} y1={band.y1} x2={subLeftX + 5} y2={band.y1} stroke="#0f1f3d" strokeWidth="1" />
              {on ? (
                <foreignObject x={cxr - 42} y={mid - 15} width={84} height={30} transform={`rotate(-90 ${cxr} ${mid})`}>
                  <input className="fz-massinput fz-massinput--sub" type="number" value={val}
                         onChange={e => on(e.target.value)} />
                </foreignObject>
              ) : (
                <text x={subLeftX - 7} y={mid} textAnchor="middle" fontSize={fSub} fill="#0f1f3d" fontWeight="700"
                      transform={`rotate(-90 ${subLeftX - 7} ${mid})`}>{val}</text>
              )}
            </g>
          );
        });
      })()}

      {/* Verbreiterungs-Maße (separat, wie im WinPro-Beleg):
          oben/unten = vertikales Maß rechts neben dem Rahmen, links/rechts = waagrechtes Maß darunter. */}
      {hatVertVerb && (() => {
        const xV = x + rw + 12;
        return ['oben', 'unten'].map(k => {
          const band = vb[k]; if (!band) return null;
          const mid = (band.y0 + band.y1) / 2;
          const tx = xV + fVerb * 0.7;
          return (
            <g key={'vv' + k}>
              <line x1={xV} y1={band.y0} x2={xV} y2={band.y1} stroke="#0f1f3d" strokeWidth="1" />
              <line x1={xV - 4} y1={band.y0} x2={xV + 4} y2={band.y0} stroke="#0f1f3d" strokeWidth="1" />
              <line x1={xV - 4} y1={band.y1} x2={xV + 4} y2={band.y1} stroke="#0f1f3d" strokeWidth="1" />
              <text x={tx} y={mid} textAnchor="middle" fontSize={fVerb} fill="#0f1f3d" fontWeight="700"
                    transform={`rotate(-90 ${tx} ${mid})`}>{band.mm}</text>
            </g>
          );
        });
      })()}
      {hatHorizVerb && (() => {
        const yV = y + rh + 12;
        return ['links', 'rechts'].map(k => {
          const band = vb[k]; if (!band) return null;
          const mid = (band.x0 + band.x1) / 2;
          return (
            <g key={'hv' + k}>
              <line x1={band.x0} y1={yV} x2={band.x1} y2={yV} stroke="#0f1f3d" strokeWidth="1" />
              <line x1={band.x0} y1={yV - 4} x2={band.x0} y2={yV + 4} stroke="#0f1f3d" strokeWidth="1" />
              <line x1={band.x1} y1={yV - 4} x2={band.x1} y2={yV + 4} stroke="#0f1f3d" strokeWidth="1" />
              <text x={mid} y={yV + fVerb} textAnchor="middle" fontSize={fVerb} fill="#0f1f3d" fontWeight="700">{band.mm}</text>
            </g>
          );
        });
      })()}

      {/* Fensterkörper: Sonderform (Bogen/Dreieck) oder normaler Rahmenkörper */}
      {istSonderform ? (
        <g>
          <path d={sonder.outer} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" strokeLinejoin="round" />
          <path d={sonder.inner} fill={glasFarbe} stroke="#0f1f3d" strokeWidth="1.6" strokeLinejoin="round" opacity="0.95" />
        </g>
      ) : (
        <UnitBody c={c} glasFarbe={glasFarbe} onPaneClick={onPaneClick} selectedPane={selectedPane} />
      )}
    </svg>
  );
}

// Kombination mehrerer gekoppelter Einheiten (eigener Rahmen je Element), im Raster (row/col).
export function KombinationsZeichnung({ elemente, glasFarbe = '#cfe3ef', weissesGlas = false, onUnitClick, activeId, onPaneClick, selectedPane, onDock, onSlide, onTotalBreite, onTotalHoehe, onElementBreite, onElementHoehe }) {
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
  // Maß-Schrift box-bewusst wählen: nach dem Einpassen in die feste Beleg-Box (.beleg-zeichnung)
  // sollen die Maße auf jeder Position gleich groß/lesbar sein – auch bei hohen Kombinationen.
  const MR = beleg ? 22 : 86, MB = beleg ? 20 : 40;
  const BOX_W = 185, BOX_H = 150, ZIEL_FONT = 13;
  let fMain, ML, MT;
  if (beleg) {
    fMain = 30;
    for (let i = 0; i < 4; i++) {
      ML = 70 + fMain * 0.8; MT = 70 + fMain * 0.8;
      const vbW = totalWpx + ML + MR;
      const vbH = totalHpx + MT + MB;
      fMain = ZIEL_FONT * Math.max(vbW / BOX_W, vbH / BOX_H);
    }
    fMain = Math.round(fMain);
    ML = Math.round(70 + fMain * 0.8); MT = Math.round(70 + fMain * 0.8);
  } else {
    fMain = 22; ML = 96; MT = 100;
  }
  const fSub = beleg ? Math.round(fMain * 0.76) : 17;
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
      schwelle: e.schwelle, oberlichtHoehe: e.oberlichtHoehe,
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
        const uGeo = geometrieByCode(u.e.code);
        const uSonder = uGeo?.form ? sonderformPfade(u.r0, uGeo, Math.max(5, 60 * scale)) : null;
        const uGlas = weissesGlas ? '#ffffff' : (u.e.ornament ? '#7fb0cc' : glasFarbe);
        return (
          <g key={'u' + u.e._key}>
            {uSonder ? (
              <g>
                <path d={uSonder.outer} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" strokeLinejoin="round" />
                <path d={uSonder.inner} fill={uGlas} stroke="#0f1f3d" strokeWidth="1.6" strokeLinejoin="round" opacity="0.95" />
              </g>
            ) : (
              <UnitBody c={u.c} glasFarbe={uGlas} keyPrefix={'u' + u.e._key + '-'}
                onPaneClick={interaktiv && aktiv ? onPaneClick : undefined} selectedPane={aktiv ? selectedPane : null} />
            )}
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
