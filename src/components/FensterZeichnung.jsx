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
  { code: 'S01', kategorie: 'fenster', gruppe: 'Sonderformen', label: 'Rundbogen', form: 'rundbogen', open: 'fest', defBreite: 1000, defHoehe: 500 },
  { code: 'S02', kategorie: 'fenster', gruppe: 'Sonderformen', label: 'Segmentbogen', form: 'segmentbogen', open: 'fest', defBreite: 1200, defHoehe: 350 },
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
  if (g.form) {                                               // Sonderform (Bogen/Dreieck): Name + ggf. Öffnungsart
    const p = (panes && panes[0]) || (g.panes && g.panes[0]) || {};
    if (p.fest || !p.open || p.open === 'fest') return g.label;
    const art = fluegelArt(p);
    const din = (p.din && (art === 'Dreh' || art === 'Drehkipp')) ? (p.din === 'links' ? ' DIN Links' : ' DIN Rechts') : '';
    return `${g.label} ${art}${din}`;
  }
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
export function RolloZeichnung({ breite = 1000, hoehe = 1400, kastenhoehe = 165, bedienung = 'Gurt', bedienungsseite = 'rechts', panzerOnly = false, beleg = false, kompakt = false, onBreite, onHoehe }) {
  const b = Math.max(200, Number(breite) || 1000);
  const h = Math.max(200, Number(hoehe) || 1400);
  const kh = panzerOnly ? 0 : Math.min(h * 0.5, Math.max(40, Number(kastenhoehe) || 0));
  // Gleiche Zeichenflächen-Skalierung wie FensterZeichnung (maxW/maxH), damit Rollo,
  // Panzer und Kasten auf Belegen optisch gleich groß/proportional zu den Fenstern wirken.
  const maxW = 360, maxH = 430;
  const scale = Math.min(maxW / b, maxH / h);
  const rw = b * scale, rh = h * scale, khpx = kh * scale;
  // Layout + Maß-Schrift: in der kompakten Übersicht exakt wie FensterZeichnung skalieren,
  // damit die Maße nach dem Einpassen (preserveAspectRatio) gleich groß erscheinen wie bei
  // den Fensterkarten. Editor- (PAD 46) und Beleg-Darstellung (PAD 12) bleiben unverändert.
  // Auf dem Beleg kein „Kasten"-Label rechts (redundant zum Text) → gleicher rechter Rand
  // wie bei den Fenstern, damit Rollo und Fenster identisch/symmetrisch positioniert sind.
  const rightMargin = (f) => ((panzerOnly || beleg) ? 14 : 16 + f * 0.8);
  let fMain, ox, oy, VB_W, VB_H;
  if (kompakt || beleg) {
    const BOX_W = 185, BOX_H = 150, ZIEL_FONT = 13;
    let f = 30, rand;
    for (let i = 0; i < 4; i++) {
      rand = 12 + f * 0.85;
      const vbW = 34 + rand + rw + rightMargin(f);
      const vbH = 34 + rand + rh + 14;
      f = ZIEL_FONT * Math.max(vbW / BOX_W, vbH / BOX_H);
    }
    fMain = Math.round(f);
    rand = Math.round(12 + fMain * 0.85);
    ox = 34 + rand; oy = 34 + rand;
    VB_W = ox + rw + Math.round(rightMargin(fMain));
    VB_H = oy + rh + 14;
  } else {
    // Editor: links/oben mehr Rand für die editierbaren Maß-Felder (Breite oben, Höhe links)
    const PAD_L = 92, PAD_T = 60, PAD_R = 50, PAD_B = 44;
    fMain = 13; ox = PAD_L; oy = PAD_T;
    VB_W = rw + PAD_L + PAD_R; VB_H = rh + PAD_T + PAD_B;
  }
  const rail = panzerOnly ? 0 : Math.max(6, Math.min(rw * 0.05, 14));
  const pz = { x: ox + rail, y: oy + khpx, w: rw - rail * 2, h: rh - khpx };
  // Lamellen als gefüllte Bänder (statt dünner Linien) – rastern in jedem Renderer (Bildschirm + html2canvas/PDF) gleichmäßig.
  const panzerMm = Math.max(1, h - kh);
  const bandCount = Math.max(6, Math.min(26, Math.round(panzerMm / 110)));
  const bandH = pz.h / bandCount;
  const txt = { fontSize: fMain, fill: '#0f1f3d', fontWeight: 700 };
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
      {/* Maße – feste/editierbare Variante (Editor) */}
      {!beleg && !kompakt && (
        <>
          {/* Breite oben – im Editor als Eingabefeld direkt in der Grafik */}
          <line x1={ox} y1={oy - 8} x2={ox + rw} y2={oy - 8} stroke="#0f1f3d" strokeWidth="1" />
          {onBreite ? (
            <foreignObject x={ox + rw / 2 - 70} y={oy - 50} width={140} height={38}>
              <input className="fz-massinput" type="number" value={breite} onChange={e => onBreite(e.target.value)} />
            </foreignObject>
          ) : (
            <text x={ox + rw / 2} y={oy - 16} textAnchor="middle" {...txt}>{Math.round(b)}</text>
          )}
          {/* Höhe links – im Editor als Eingabefeld direkt in der Grafik */}
          {onHoehe ? (
            <foreignObject x={ox - 84} y={oy + rh / 2 - 19} width={70} height={38}>
              <input className="fz-massinput" type="number" value={hoehe} onChange={e => onHoehe(e.target.value)} />
            </foreignObject>
          ) : (
            <text x={ox - 14} y={oy + rh / 2} textAnchor="middle" transform={`rotate(-90 ${ox - 14} ${oy + rh / 2})`} {...txt}>{Math.round(h)}</text>
          )}
          {!panzerOnly && (
            <text x={ox + rw + 16} y={oy + khpx / 2 + 4} textAnchor="middle" transform={`rotate(-90 ${ox + rw + 16} ${oy + khpx / 2})`} fontSize="11" fill="#667085" fontWeight="600">Kasten {Math.round(kh)}</text>
          )}
        </>
      )}
      {/* Maße – skalierte Variante (Übersicht + Beleg, identisch zu FensterZeichnung) */}
      {(kompakt || beleg) && (
        <>
          {/* Breite oben */}
          <line x1={ox} y1={oy - 34} x2={ox + rw} y2={oy - 34} stroke="#0f1f3d" strokeWidth="1.2" />
          <line x1={ox} y1={oy - 40} x2={ox} y2={oy - 28} stroke="#0f1f3d" strokeWidth="1.2" />
          <line x1={ox + rw} y1={oy - 40} x2={ox + rw} y2={oy - 28} stroke="#0f1f3d" strokeWidth="1.2" />
          <text x={ox + rw / 2} y={oy - 44} textAnchor="middle" {...txt}>{Math.round(b)}</text>
          {/* Höhe links */}
          <line x1={ox - 34} y1={oy} x2={ox - 34} y2={oy + rh} stroke="#0f1f3d" strokeWidth="1.2" />
          <line x1={ox - 40} y1={oy} x2={ox - 28} y2={oy} stroke="#0f1f3d" strokeWidth="1.2" />
          <line x1={ox - 40} y1={oy + rh} x2={ox - 28} y2={oy + rh} stroke="#0f1f3d" strokeWidth="1.2" />
          <text x={ox - 44} y={oy + rh / 2} textAnchor="middle" transform={`rotate(-90 ${ox - 44} ${oy + rh / 2})`} {...txt}>{Math.round(h)}</text>
          {!panzerOnly && !beleg && (
            <text x={ox + rw + 16} y={oy + khpx / 2 + 4} textAnchor="middle" transform={`rotate(-90 ${ox + rw + 16} ${oy + khpx / 2})`} fontSize={Math.round(fMain * 0.55)} fill="#667085" fontWeight="600">Kasten {Math.round(kh)}</text>
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
// Festverglasung: NUR Blendrahmen (außen + innen, mit 45°-Gehrung) + Glas (kein Flügelrahmen).
// Mit Öffnungsart (offen=true): zusätzlich der innere Flügelrahmen wie beim öffenbaren Fenster.
//   c0 Blendrahmen außen, c1 Blendrahmen innen, (c2 Flügel außen), c3 Glas – Gesamtrahmen = fw.
export function sonderformPfade(r, geo, frame, offen = false) {
  const { x, y, w, h } = r;
  const fw = Math.max(4, frame || 0);
  // Fest: breiter Blendrahmen + schmale Glasleiste. Offen: Blendrahmen + Luft + Flügelrahmen.
  const d1 = offen ? fw * 0.40 : fw * 0.66;   // Blendrahmen innen
  const d2 = fw * 0.58;                        // Flügel außen (nur bei offen)
  const d3 = fw;                               // Glas

  // contour(d) → { path, corners } : Kontur um d nach innen versetzt + ihre geraden Ecken (für Gehrung).
  let contour;
  if (geo.form === 'dreieck') {
    let pts;
    if (geo.variante === 'links') pts = [[x, y], [x, y + h], [x + w, y + h]];            // Spitze oben links
    else if (geo.variante === 'rechts') pts = [[x + w, y], [x, y + h], [x + w, y + h]];  // Spitze oben rechts
    else pts = [[x + w / 2, y], [x, y + h], [x + w, y + h]];                             // gleichschenklig
    const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    contour = (d) => {
      const s = Math.max(0.15, 1 - (2.8 * d) / Math.min(w, h));
      const ip = pts.map(([px, py]) => [cx + (px - cx) * s, cy + (py - cy) * s]);
      return { path: `M ${ip[0][0]},${ip[0][1]} L ${ip[1][0]},${ip[1][1]} L ${ip[2][0]},${ip[2][1]} Z`, corners: ip };
    };
  } else if (geo.form === 'rundbogen') {
    // Rundbogen: Halbellipse; iry um 2·d eingerückt, damit die Rahmenbreite am Scheitel = d bleibt.
    const rx = w / 2, ry = h;
    contour = (d) => {
      const rxd = Math.max(2, rx - d), ryd = Math.max(2, ry - 2 * d);
      const ax = x + d, ay = y + h - d, bx = x + w - d;
      return { path: `M ${ax},${ay} A ${rxd},${ryd} 0 0 1 ${bx},${ay} Z`, corners: [[ax, ay], [bx, ay]] };
    };
  } else {
    // Segmentbogen: konzentrische Kreisbögen (Radius R−d) → überall gleich breiter Rahmen.
    const rise = Math.max(2, h);
    const cx = x + w / 2;
    const R = (w * w / 4 + rise * rise) / (2 * rise);
    const yc = (y + h) - rise + R;                     // Kreismittelpunkt (unter dem Scheitel)
    contour = (d) => {
      const Rd = Math.max(2, R - d), yb = y + h - d;
      const dx = Math.sqrt(Math.max(1, Rd * Rd - (yc - yb) * (yc - yb)));
      return { path: `M ${cx - dx},${yb} A ${Rd},${Rd} 0 0 1 ${cx + dx},${yb} Z`, corners: [[cx - dx, yb], [cx + dx, yb]] };
    };
  }

  const c0 = contour(0), c1 = contour(d1), c3 = contour(d3);
  // Gehrung am Blendrahmen (c0→c1); bei Öffnungsart zusätzlich am Flügelrahmen (c2→c3).
  const miter = c0.corners.map((p, i) => [p, c1.corners[i]]);
  let sash;
  if (offen) {
    const c2 = contour(d2);
    sash = c2.path;
    c2.corners.forEach((p, i) => miter.push([p, c3.corners[i]]));
  }
  // Glas-Box (für die Öffnungsart-Symbole; Linien werden später auf die Glasform geclippt).
  const glasBox = { x: x + fw, y: y + fw, w: Math.max(1, w - 2 * fw), h: Math.max(1, h - 2 * fw) };
  return { outer: c0.path, mid: c1.path, sash, inner: c3.path, miter, glasBox };
}

// Zeichnet den Sonderform-Rahmen (Bögen/Dreiecke) wie einen Fensterrahmen: Blendrahmen + Glas.
// oeffnung: { open, din } – zeichnet die Öffnungssymbole (Dreh/Kipp …) auf die Glasfläche.
// onPaneClick/selected: macht die Glasfläche anklickbar (Öffnungsart wählen).
export function SonderBody({ sp, glas = '#cfe3ef', kp = '', oeffnung, onPaneClick, selected }) {
  const offen = oeffnung && !oeffnung.fest && oeffnung.open && oeffnung.open !== 'fest';
  const lines = offen ? oeffnungsLinien(oeffnung, sp.glasBox) : [];
  const clipId = 'sbclip-' + kp;
  return (
    <g>
      <path d={sp.outer} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" strokeLinejoin="round" />
      {sp.mid && <path d={sp.mid} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" strokeLinejoin="round" />}
      {sp.sash && <path d={sp.sash} fill="#fff" stroke="#0f1f3d" strokeWidth="2" strokeLinejoin="round" />}
      <path d={sp.inner} fill={glas} stroke="#0f1f3d" strokeWidth="1.4" strokeLinejoin="round" opacity="0.95" />
      {(sp.miter || []).map((l, i) => (
        <line key={kp + 'm' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />
      ))}
      {lines.length > 0 && (
        <>
          <clipPath id={clipId}><path d={sp.inner} /></clipPath>
          <g clipPath={`url(#${clipId})`}>
            {lines.map((l, i) => (
              <line key={kp + 'o' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />
            ))}
          </g>
        </>
      )}
      {onPaneClick && (
        <path d={sp.inner} fill={selected ? 'rgba(192,21,46,0.12)' : 'transparent'}
              stroke={selected ? '#c0152e' : 'transparent'} strokeWidth="2.5"
              style={{ cursor: 'pointer' }} onClick={onPaneClick} />
      )}
    </g>
  );
}

// Verbundenes „Bogen über Fenster" als EIN Bogenfenster: durchgehender Außenrahmen (Bogen oben +
// gerade Seiten + Boden), Kämpfer (Querbalken) am Übergang, oben das feste Oberlicht-Glas, unten
// der Fenster-Flügel mit Glas und Öffnungssymbol. Liefert null, wenn der Fall nicht passt
// (dann zeichnet der Aufrufer die Teile wie bisher).
export function VerbundBogenBody({ r0, teile, scale, glasFarbe = '#cfe3ef', kp = '', panes, onPaneClick, selectedPane, onRowDrag }) {
  if (!Array.isArray(teile) || teile.length !== 2) return null;
  const formIdx = geometrieByCode(teile[0]?.code)?.form ? 0 : (geometrieByCode(teile[1]?.code)?.form ? 1 : -1);
  if (formIdx !== 0) return null;                                  // nur Bogen OBEN
  const g = geometrieByCode(teile[0].code);
  if (g.form !== 'rundbogen' && g.form !== 'segmentbogen') return null;
  const { x, y, w, h } = r0;
  const fw = Math.max(6, 60 * scale);
  const winTeil = teile[1];
  // Öffnungsart des Fensterteils: liegt im Gesamt-panes-Array hinter den Bogen-Feldern.
  const winPaneIdx = (teile[0].panes?.length || 1);
  const total = (Number(teile[0].hoehe) || 0) + (Number(teile[1].hoehe) || 0) || 1;
  const archH = (Number(teile[0].hoehe) || 0) / total * h;
  const splitY = y + archH;
  // Segmentbogen funktioniert nur flach (Stich < halbe Breite); sonst als Ellipse (Rundbogen) zeichnen.
  const ellipse = g.form === 'rundbogen' || archH > w * 0.5;
  // Silhouette des Bogenfensters, um d nach innen versetzt.
  const sil = (d) => {
    const L = x + d, Rr = x + w - d, bot = y + h - d;
    const rise = Math.max(2, archH - d);
    if (ellipse) {
      return `M ${L},${bot} L ${L},${splitY} A ${Math.max(2, w / 2 - d)},${rise} 0 0 1 ${Rr},${splitY} L ${Rr},${bot} Z`;
    }
    const ww = w - 2 * d, R = (ww * ww / 4 + rise * rise) / (2 * rise);
    return `M ${L},${bot} L ${L},${splitY} A ${R},${R} 0 0 1 ${Rr},${splitY} L ${Rr},${bot} Z`;
  };
  const fwB = fw * 0.6;                 // Blendrahmen innen (durchgehend)
  // Fenster-Felder gehen über die VOLLE Höhe (Bogen + gerader Teil = eine Scheibe je Spalte).
  // Das Öffnungssymbol sitzt im geraden Fensterteil (unterhalb des Bogenansatzes splitY).
  const winRect = { x: x + fwB, y: splitY, w: w - 2 * fwB, h: (y + h - fwB) - splitY };
  const wCols = Math.max(1, winTeil.cols || 1);
  const wPanes = (winTeil.panes && winTeil.panes.length) ? winTeil.panes : [{ open: 'drehkipp', din: 'links' }];
  const wRows = Math.max(1, Math.ceil(wPanes.length / wCols));
  const wCW = (winTeil.colWidths && winTeil.colWidths.length === wCols) ? winTeil.colWidths.map(v => Math.max(1, Number(v) || 1)) : Array(wCols).fill(1);
  const wRH = (winTeil.rowHeights && winTeil.rowHeights.length === wRows) ? winTeil.rowHeights.map(v => Math.max(1, Number(v) || 1)) : Array(wRows).fill(1);
  const sumCW = wCW.reduce((a, c) => a + c, 0) || 1, sumRH = wRH.reduce((a, c) => a + c, 0) || 1;
  const colX = []; { let acc = 0; for (let c = 0; c < wCols; c++) { colX.push(winRect.x + (acc / sumCW) * winRect.w); acc += wCW[c]; } }
  const colW = wCW.map(cw => (cw / sumCW) * winRect.w);
  const rowY = []; { let acc = 0; for (let r = 0; r < wRows; r++) { rowY.push(winRect.y + (acc / sumRH) * winRect.h); acc += wRH[r]; } }
  const rowH = wRH.map(rh => (rh / sumRH) * winRect.h);
  const pfW = Math.max(3, fwB * 0.8);                       // Pfostenbreite
  const pad = (d) => Math.max(2, d);
  // Horizontalen Pfosten vertikal ziehen → Zeilenhöhen im Fensterteil verschieben.
  const rowDrag = useRef(null);
  const vbScaleRef = useRef(scale); vbScaleRef.current = scale;
  const pfDown = (e, i) => { e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId); rowDrag.current = { y: e.clientY, h0: wRH[i] }; };
  const pfMove = (e, i) => { const d = rowDrag.current; if (!d || !onRowDrag) return; const nh = Math.round(d.h0 + (e.clientY - d.y) / Math.max(0.0001, vbScaleRef.current)); onRowDrag(i, nh); };
  const pfUp = () => { rowDrag.current = null; };
  return (
    <g>
      {/* Durchgehender Blendrahmen (außen + innen) */}
      <path d={sil(0)} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" strokeLinejoin="round" />
      <path d={sil(fwB)} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" strokeLinejoin="round" />
      {/* Felder über die VOLLE Höhe: je Spalte (und Zeile) eine durchgehende Scheibe bis in den Bogen. */}
      {Array.from({ length: wRows }).map((_, r) => Array.from({ length: wCols }).map((__, c) => {
        const idx = r * wCols + c;
        const cellTop = r === 0 ? y : rowY[r];                 // oberste Zeile reicht bis zum Bogen-Scheitel
        const cellBot = rowY[r] + rowH[r];
        const cClip = kp + 'cf' + idx;
        const cellPane = (panes && panes[winPaneIdx + idx]) || wPanes[idx] || { fest: true };
        const offen = !cellPane.fest && cellPane.open && cellPane.open !== 'fest';
        const sashD = fwB + pad(pfW * 0.3);                    // Flügel-Außenkante
        const glasD = offen ? sashD + pad(pfW * 0.5) : fw;     // Glaskante
        // Öffnungssymbol nur im geraden Fensterteil der Zelle (unter splitY).
        const symTop = Math.max(cellTop, splitY) + pad(pfW * 0.6);
        const symBox = { x: colX[c] + pad(pfW * 0.7), y: symTop, w: colW[c] - 2 * pad(pfW * 0.7), h: cellBot - pad(pfW * 0.6) - symTop };
        const cLines = (offen && symBox.h > 10 && symBox.w > 10) ? oeffnungsLinien(cellPane, symBox) : [];
        const cSel = selectedPane === (winPaneIdx + idx);
        return (
          <g key={kp + 'wf' + idx}>
            <clipPath id={cClip}><rect x={colX[c]} y={cellTop} width={colW[c]} height={Math.max(1, cellBot - cellTop)} /></clipPath>
            <g clipPath={`url(#${cClip})`}>
              {offen && <path d={sil(sashD)} fill="#fff" stroke="#0f1f3d" strokeWidth="2" strokeLinejoin="round" />}
              <path d={sil(glasD)} fill={glasFarbe} stroke="#0f1f3d" strokeWidth="1.4" strokeLinejoin="round" opacity="0.95" />
              {cLines.map((l, i) => <line key={kp + 'ol' + idx + '-' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />)}
              {onPaneClick && (
                <path d={sil(fwB)} fill={cSel ? 'rgba(192,21,46,0.12)' : 'transparent'}
                      stroke={cSel ? '#c0152e' : 'transparent'} strokeWidth="2.5"
                      style={{ cursor: 'pointer' }} onClick={() => onPaneClick(winPaneIdx + idx)} />
              )}
            </g>
          </g>
        );
      }))}
      {/* Vertikaler Pfosten: geht bis ganz oben durch den Bogen (auf die Innen-Silhouette geclippt). */}
      {wCols > 1 && <clipPath id={'vbpfv-' + kp}><path d={sil(fwB)} /></clipPath>}
      {Array.from({ length: wCols - 1 }).map((_, i) => (
        <rect key={kp + 'pfv' + i} clipPath={`url(#vbpfv-${kp})`}
              x={colX[i + 1] - pfW / 2} y={y + fwB} width={pfW} height={(y + h - fwB) - (y + fwB)}
              fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
      ))}
      {/* Horizontaler Pfosten: nur im Fensterteil (1 Balken je hinzugefügter Zeile). */}
      {Array.from({ length: wRows - 1 }).map((_, i) => (
        <g key={kp + 'pfh' + i}>
          <rect x={winRect.x} y={rowY[i + 1] - pfW / 2} width={winRect.w} height={pfW} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
          {/* Breite, unsichtbare Ziehfläche zum vertikalen Verschieben des Pfostens */}
          {onRowDrag && (
            <rect x={winRect.x} y={rowY[i + 1] - Math.max(11, pfW)} width={winRect.w} height={Math.max(22, pfW * 2)}
                  fill="transparent" style={{ cursor: 'ns-resize', touchAction: 'none' }}
                  onPointerDown={e => pfDown(e, i)} onPointerMove={e => pfMove(e, i)} onPointerUp={pfUp}>
              <title>Pfosten ziehen</title>
            </rect>
          )}
        </g>
      ))}
    </g>
  );
}

// Durchgehende Silhouette eines verbundenen Elements (Trennrahmen entfernt → ein Glas).
// Behandelt vertikalen 2er-Stapel: Sonderform-Teil + Rechteck-Teil.
export function durchgehendPfade(r0, teile, dir, frame) {
  const { x, y, w, h } = r0;
  const fw = Math.max(4, frame || 0);
  if (dir !== 'v' || !Array.isArray(teile) || teile.length !== 2) return null;
  const formIdx = geometrieByCode(teile[0].code)?.form ? 0 : (geometrieByCode(teile[1].code)?.form ? 1 : -1);
  if (formIdx < 0) return null;
  const g = geometrieByCode(teile[formIdx].code);
  const formOnTop = formIdx === 0;
  const total = (Number(teile[0].hoehe) || 0) + (Number(teile[1].hoehe) || 0) || 1;
  const splitY = y + (Number(teile[0].hoehe) / total) * h;
  // Bogen + Rechteck verschmolzen = Bogenfenster mit geraden Seiten + Rundung oben (über die volle Höhe).
  if (g.form === 'rundbogen' || g.form === 'segmentbogen') {
    const rise = g.form === 'rundbogen' ? Math.min(w / 2, h * 0.92) : Math.min(w * 0.22, h * 0.6);
    const R = (w * w / 4 + rise * rise) / (2 * rise);
    const outer = `M ${x},${y + h} L ${x},${y + rise} A ${R},${R} 0 0 1 ${x + w},${y + rise} L ${x + w},${y + h} Z`;
    const ix = x + fw, iw = w - 2 * fw, iyTop = y + fw, iBot = y + h - fw;
    const irise = Math.max(2, rise - fw);
    const iR = (iw * iw / 4 + irise * irise) / (2 * irise);
    const inner = `M ${ix},${iBot} L ${ix},${iyTop + irise} A ${iR},${iR} 0 0 1 ${ix + iw},${iyTop + irise} L ${ix + iw},${iBot} Z`;
    return { outer, inner };
  }
  // Dreieck oben/unten + Rechteck = Fünfeck (Giebel-/Hausform).
  let pts;
  if (formOnTop) {
    const apex = g.variante === 'links' ? [x, y] : g.variante === 'rechts' ? [x + w, y] : [x + w / 2, y];
    pts = [[x, y + h], [x, splitY], apex, [x + w, splitY], [x + w, y + h]];
  } else {
    const apex = g.variante === 'links' ? [x, y + h] : g.variante === 'rechts' ? [x + w, y + h] : [x + w / 2, y + h];
    pts = [[x, y], [x + w, y], [x + w, splitY], apex, [x, splitY]];
  }
  const path = ps => 'M ' + ps.map(p => `${p[0]},${p[1]}`).join(' L ') + ' Z';
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const s = Math.max(0.3, 1 - (2.6 * fw) / Math.min(w, h));
  const ip = pts.map(([px, py]) => [cx + (px - cx) * s, cy + (py - cy) * s]);
  return { outer: path(pts), inner: path(ip) };
}

function FensterZeichnung({ geometrie, breite, hoehe, verbreiterung, aufsatzkasten, schwelle, oberlichtHoehe, glasFarbe = '#cfe3ef', onBreite, onHoehe, onOberlichtHoehe, onBottomHoehe, panes: panesProp, cols: colsProp, colWidths, rowHeights, onColWidth, onRowHeight, onPaneClick, selectedPane, teile, dir: teilDir, durchgehend, onDivider, onBackgroundClick, onBogenRowHeight }) {
  const b = Math.max(200, Number(breite) || 1000);
  const hh = Math.max(200, Number(hoehe) || 1200);

  // Zeichenfläche
  const VB_W = 780, VB_H = 720;
  // Breite bis 600 px zulassen (wie die Mehrfach-Ansicht), damit breite/verbundene Fenster die
  // Fläche füllen statt herausgezoomt zu wirken. Hochformat-Fenster bleiben höhenbegrenzt (maxH).
  const maxW = 600, maxH = 430;
  const scale = Math.min(maxW / b, maxH / hh);
  const rw = b * scale, rh = hh * scale;
  const cx = VB_W / 2 + 24, cy = VB_H / 2 + 14;
  const x = cx - rw / 2, y = cy - rh / 2;

  const r0 = { x, y, w: rw, h: rh };                            // Gesamtmaß (mit Verbreiterung/Kasten)
  const istSonderform = !!geometrie?.form;
  const sonderOffen = !!(panesProp?.[0] && !panesProp[0].fest && panesProp[0].open && panesProp[0].open !== 'fest');
  const sonder = istSonderform ? sonderformPfade(r0, geometrie, Math.max(6, 60 * scale), sonderOffen) : null;
  // Höhen-Griff am Bogen-Scheitel (nur unverbundene Sonderform): vertikal ziehen ändert die Höhe.
  const archDrag = useRef(null);
  const scaleRef = useRef(scale); scaleRef.current = scale;
  function archDown(e) { e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId); archDrag.current = { y: e.clientY, h: Number(hoehe) || 0 }; }
  function archMove(e) { const d = archDrag.current; if (!d || !onHoehe) return; const nh = Math.max(100, Math.round(d.h + (d.y - e.clientY) / Math.max(0.0001, scaleRef.current))); onHoehe(nh); }
  function archUp() { archDrag.current = null; }
  // Verbundenes Element mit Sonderform-Teil: gemeinsamer Rahmen, jedes Teil behält seine Form.
  const formTeile = (Array.isArray(teile) && teile.length > 1 && teile.some(t => geometrieByCode(t.code)?.form)) ? teile : null;
  let teilBodies = null;
  if (formTeile) {
    const tdir = teilDir || 'h';
    const total = formTeile.reduce((a, t) => a + ((tdir === 'h' ? Number(t.breite) : Number(t.hoehe)) || 0), 0) || 1;
    let acc = 0;
    teilBodies = formTeile.map((t, ti) => {
      const size = (tdir === 'h' ? Number(t.breite) : Number(t.hoehe)) || 0;
      const sub = tdir === 'h'
        ? { x: x + (acc / total) * rw, y, w: (size / total) * rw, h: rh }
        : { x, y: y + (acc / total) * rh, w: rw, h: (size / total) * rh };
      acc += size;
      const tGeo = geometrieByCode(t.code);
      const tGlas = t.ornament ? '#7fb0cc' : glasFarbe;
      if (tGeo?.form) {
        const sp = sonderformPfade(sub, tGeo, Math.max(6, 60 * scale));
        return <SonderBody key={'t' + ti} sp={sp} glas={tGlas} kp={'t' + ti + '-'} />;
      }
      const tc = computeUnit(sub, scale, {
        geometrie: tGeo, breite: tdir === 'h' ? size : Number(t.breite), hoehe: tdir === 'h' ? Number(t.hoehe) : size,
        panes: t.panes, cols: t.cols, colWidths: t.colWidths,
      });
      return <UnitBody key={'t' + ti} c={tc} glasFarbe={tGlas} keyPrefix={'ft' + ti + '-'} />;
    });
  }
  // Trennrahmen entfernt → durchgehende Form (ein Glas).
  const durchPf = (formTeile && durchgehend) ? durchgehendPfade(r0, formTeile, teilDir || 'h', Math.max(6, 60 * scale)) : null;
  // „Bogen über Fenster" verbunden → durchgehender Außenrahmen + Kämpfer (statt zwei Rahmen).
  const bogenOben = !durchgehend && formTeile && formTeile.length === 2 && (teilDir || 'h') === 'v'
    && ['rundbogen', 'segmentbogen'].includes(geometrieByCode(formTeile[0]?.code)?.form);
  // Klickbarer Trennrahmen-Streifen zwischen den beiden Teilen (nur Editor, solange nicht durchgehend).
  let dividerStrip = null;
  if (formTeile && formTeile.length === 2 && onDivider && !durchgehend) {
    const tdir = teilDir || 'h';
    const total = formTeile.reduce((a, t) => a + ((tdir === 'h' ? Number(t.breite) : Number(t.hoehe)) || 0), 0) || 1;
    const first = (tdir === 'h' ? Number(formTeile[0].breite) : Number(formTeile[0].hoehe)) || 0;
    const sp = tdir === 'h' ? x + (first / total) * rw : y + (first / total) * rh;
    dividerStrip = tdir === 'h' ? { x: sp - 9, y, w: 18, h: rh } : { x, y: sp - 9, w: rw, h: 18 };
  }
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
      {/* Klick neben die Fenster (leerer Hintergrund) hebt die Auswahl auf. NUR die Zeichenfläche
          abdecken (viewBox) – sonst ragt der Rect bei overflow:visible über die Kopfzeile und
          fängt Klicks auf z. B. den „Verbinden"-Knopf ab. */}
      {onBackgroundClick && (
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="transparent" onClick={onBackgroundClick} />
      )}
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

      {/* Fensterkörper: durchgehende Form (Trennrahmen entfernt) / verbundene Teile / Sonderform / normaler Rahmen */}
      {durchPf ? (() => {
        // Durchgehendes Glas: wie ein echtes Fenster zeichnen – Blendrahmen + (bei Öffnungsart)
        // Flügelrahmen + Glas + EIN Öffnungssymbol fürs ganze Fenster. Konturen via durchgehendPfade
        // mit verschiedenen Rahmenbreiten (gleicher Außenrand, weiter innen versetzte Innenkonturen).
        const dfw = Math.max(6, 60 * scale);
        const dPane = (panesProp && panesProp[0]) || { fest: true };
        const offen = !dPane.fest && dPane.open && dPane.open !== 'fest';
        const dir2 = teilDir || 'h';
        const blendIn = durchgehendPfade(r0, formTeile, dir2, dfw * (offen ? 0.42 : 0.66))?.inner;
        const sashP = offen ? durchgehendPfade(r0, formTeile, dir2, dfw * 0.6)?.inner : null;
        const glassP = durchgehendPfade(r0, formTeile, dir2, dfw)?.inner || durchPf.inner;
        const dBox = { x: r0.x + dfw, y: r0.y + dfw, w: Math.max(2, r0.w - 2 * dfw), h: Math.max(2, r0.h - 2 * dfw) };
        const dLines = offen ? oeffnungsLinien(dPane, dBox) : [];
        const dSel = selectedPane === 0;
        return (
          <g>
            <path d={durchPf.outer} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" strokeLinejoin="round" />
            {blendIn && <path d={blendIn} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" strokeLinejoin="round" />}
            {sashP && <path d={sashP} fill="#fff" stroke="#0f1f3d" strokeWidth="2" strokeLinejoin="round" />}
            <path d={glassP} fill={glasFarbe} stroke="#0f1f3d" strokeWidth="1.4" strokeLinejoin="round" opacity="0.95" />
            {dLines.length > 0 && (
              <>
                <clipPath id={'dpclip-' + Math.round(r0.x) + '-' + Math.round(r0.y)}><path d={glassP} /></clipPath>
                <g clipPath={`url(#dpclip-${Math.round(r0.x)}-${Math.round(r0.y)})`}>
                  {dLines.map((l, i) => <line key={'dpl' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />)}
                </g>
              </>
            )}
            {onPaneClick && (
              <path d={glassP} fill={dSel ? 'rgba(192,21,46,0.12)' : 'transparent'}
                    stroke={dSel ? '#c0152e' : 'transparent'} strokeWidth="2.5"
                    style={{ cursor: 'pointer' }} onClick={() => onPaneClick(0)} />
            )}
          </g>
        );
      })() : bogenOben ? (
        <VerbundBogenBody r0={r0} teile={formTeile} scale={scale} glasFarbe={glasFarbe} kp="vb"
          panes={panesProp} onPaneClick={onPaneClick} selectedPane={selectedPane} onRowDrag={onBogenRowHeight} />
      ) : teilBodies ? (
        <g>{teilBodies}</g>
      ) : istSonderform ? (
        <SonderBody sp={sonder} glas={glasFarbe} kp="s" oeffnung={panesProp?.[0]}
          onPaneClick={onPaneClick ? () => onPaneClick(0) : undefined} selected={selectedPane === 0} />
      ) : (
        <UnitBody c={c} glasFarbe={glasFarbe} onPaneClick={onPaneClick} selectedPane={selectedPane} />
      )}

      {/* Höhen-Griff am Bogen-Scheitel (nur unverbundener Bogen/Dreieck): vertikal ziehen = Höhe */}
      {istSonderform && !formTeile && !durchPf && onHoehe && (
        <g>
          <line x1={r0.x + r0.w / 2} y1={r0.y} x2={r0.x + r0.w / 2} y2={r0.y - 26} stroke="#c0152e" strokeWidth="1.6" pointerEvents="none" />
          <circle cx={r0.x + r0.w / 2} cy={r0.y - 26} r="9" fill="#fff" stroke="#c0152e" strokeWidth="2.5"
                  style={{ cursor: 'ns-resize', touchAction: 'none' }}
                  onPointerDown={archDown} onPointerMove={archMove} onPointerUp={archUp}>
            <title>Bogenhöhe ziehen</title>
          </circle>
        </g>
      )}

      {/* Klickbarer Trennrahmen zwischen den Teilen → „Entfernen" macht durchgehendes Glas */}
      {dividerStrip && (
        <rect x={dividerStrip.x} y={dividerStrip.y} width={dividerStrip.w} height={dividerStrip.h}
              fill="transparent" style={{ cursor: 'pointer' }} onClick={onDivider} />
      )}
    </svg>
  );
}

// Kombination mehrerer gekoppelter Einheiten (eigener Rahmen je Element), im Raster (row/col).
export function KombinationsZeichnung({ elemente, glasFarbe = '#cfe3ef', weissesGlas = false, onUnitClick, activeId, onPaneClick, selectedPane, onDock, onSlide, onTotalBreite, onTotalHoehe, onElementBreite, onElementHoehe, onBackgroundClick, rahmen }) {
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

  // „Wand"/Maueröffnung: begrenzt die Fenster. Ist sie größer als die Fenster-Hülle, bleibt rechts/unten
  // Luft (die Wand), die Fenster bleiben oben-links. Die Fenster ragen nie über die Wand hinaus.
  const inhaltWmm = totalWmm, inhaltHmm = totalHmm;
  if (rahmen) { totalWmm = Math.max(totalWmm, Number(rahmen.w) || 0); totalHmm = Math.max(totalHmm, Number(rahmen.h) || 0); }
  const hatWand = rahmen && (totalWmm > inhaltWmm + 0.5 || totalHmm > inhaltHmm + 0.5);

  // Im Beleg (nicht interaktiv) den Rahmen eng halten: rechts/unten gibt es keine Maße,
  // links/oben nur so viel Rand wie die Maßzahlen brauchen → Zeichnung füllt ihre Spalte.
  const beleg = !onUnitClick;
  // Im Editor denselben Maßstab/Canvas wie die Einzel-Ansicht (maxW 600 / maxH 430, festes
  // 780×720-viewBox), damit gleiche reale Maße gleich groß erscheinen – egal ob ein verbundenes
  // Element oder viele Einzelteile. Beleg bleibt eng am Inhalt.
  const maxW = 600, maxH = beleg ? 440 : 430;
  const scale = Math.min(maxW / Math.max(200, totalWmm), maxH / Math.max(200, totalHmm));
  const totalWpx = totalWmm * scale, totalHpx = totalHmm * scale;
  // Maß-Schrift box-bewusst wählen: nach dem Einpassen in die feste Beleg-Box (.beleg-zeichnung)
  // sollen die Maße auf jeder Position gleich groß/lesbar sein – auch bei hohen Kombinationen.
  const MR = beleg ? 22 : 86, MB = beleg ? 20 : 40;
  const BOX_W = 185, BOX_H = 150, ZIEL_FONT = 13;
  let fMain, ML, MT, VB_W, VB_H, ox, oy;
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
    VB_W = totalWpx + ML + MR; VB_H = totalHpx + MT + MB;
    ox = ML; oy = MT;
  } else {
    // Fester Canvas wie die Einzel-Ansicht; Inhalt zentriert (leicht nach rechts/unten für die Maße).
    fMain = 22;
    VB_W = 780; VB_H = 720;
    ox = Math.round(VB_W / 2 - totalWpx / 2 + 24);
    oy = Math.round(VB_H / 2 - totalHpx / 2 + 14);
  }
  const fSub = beleg ? Math.round(fMain * 0.76) : 17;

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
    const zonen = [];
    els.forEach(e => {
      if (e._key === dragId) return;
      const cc = e.col ?? 0, rr = e.row ?? 0;
      // Andockstreifen an JEDER der 4 Kanten jedes Fensters (echte Element-Geometrie).
      // An belegten Kanten wird beim Ablegen eine Spalte/Zeile eingefügt (siehe dockElement),
      // damit man wirklich an jede Kante andocken kann.
      const cl = colXpx[cc], cw = (Number(e.breite) || colWmm[cc]) * scale;
      const ct = rowYpx[rr], ch = (Number(e.hoehe) || rowHmm[rr]) * scale;
      const kanten = [
        ['rechts', cl + cw + GAP, ct, STRIP, ch],
        ['links', cl - STRIP - GAP, ct, STRIP, ch],
        ['unten', cl, ct + ch + GAP, cw, STRIP],
        ['oben', cl, ct - STRIP - GAP, cw, STRIP],
      ];
      kanten.forEach(([side, zx, zy, zw, zh]) => {
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
  // Press-and-Hold: das ganze Element lässt sich durch Gedrückthalten + Ziehen verschieben.
  // Kurzes Tippen (unter der Schwelle) bleibt ein Klick (Auswahl / Öffnungsart).
  const pressRef = useRef(null);
  const justDraggedRef = useRef(false);
  function pressDown(e, id) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    justDraggedRef.current = false;
    pressRef.current = { id, sx: e.clientX, sy: e.clientY, dragging: false };
  }
  function pressMove(e, id) {
    const pr = pressRef.current;
    if (!pr || pr.id !== id) return;
    const p = svgPoint(e.clientX, e.clientY);
    if (!pr.dragging) {
      if (Math.hypot(e.clientX - pr.sx, e.clientY - pr.sy) < 5) return;   // erst ab kleiner Bewegung ziehen
      pr.dragging = true;
      setDrag({ id, side: null, px: p.x, py: p.y });
      return;
    }
    const zone = zoneAt(p);
    // Zeigerposition mitführen (für den ausgegrauten „Geist", der dem Finger folgt) + Andock-Vorschau
    setDrag(d => (d ? { ...d, px: p.x, py: p.y, side: zone ? zone.side : null, targetId: zone ? zone.targetId : null } : d));
  }
  function pressUp(e, id) {
    const pr = pressRef.current;
    pressRef.current = null;
    if (pr && pr.dragging) {
      if (drag && drag.id === id && drag.side && onDock) onDock(id, drag.side, drag.targetId);
      setDrag(null);
      justDraggedRef.current = true;   // den direkt folgenden Klick (Auswahl/Feld) unterdrücken
    }
  }
  // Höhen-Griff am Bogen-Scheitel (nur unverbundener Bogen): vertikal ziehen ändert die Höhe.
  const archDrag = useRef(null);
  const scaleRef = useRef(scale); scaleRef.current = scale;
  function archDown(e, h) { e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId); archDrag.current = { y: e.clientY, h: Number(h) || 0 }; }
  function archMove(e, id) { const d = archDrag.current; if (!d || !onElementHoehe) return; const nh = Math.max(100, Math.round(d.h + (d.y - e.clientY) / Math.max(0.0001, scaleRef.current))); onElementHoehe(id, nh); }
  function archUp() { archDrag.current = null; }

  return (
    <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet" className="fz-svg"
         style={onUnitClick ? { overflow: 'visible' } : undefined}>
      {/* Klick neben die Fenster (leerer Hintergrund) hebt die Auswahl auf. NUR die Zeichenfläche
          abdecken (viewBox) – sonst ragt der Rect bei overflow:visible über die Kopfzeile und
          fängt Klicks auf z. B. den „Verbinden"-Knopf ab. */}
      {onBackgroundClick && (
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="transparent" onClick={onBackgroundClick} />
      )}
      {/* Wand/Maueröffnung: Begrenzung, über die die Fenster nicht hinausragen */}
      {hatWand && (
        <rect x={ox} y={oy} width={totalWpx} height={totalHpx} fill="none"
              stroke="#9aa3b2" strokeWidth="1.6" strokeDasharray="7 5" pointerEvents="none" />
      )}
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
                <input className="fz-massinput fz-massinput--sub" type="number"
                       key={'ew' + u.e._key + '_' + Math.round(Number(u.e.breite) || 0)}
                       defaultValue={Math.round(Number(u.e.breite) || 0)}
                       onBlur={e => onElementBreite(u.e._key, e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} />
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
        const uGeo = geometrieByCode(u.e.code);
        const uOffen = !!(u.e.panes?.[0] && !u.e.panes[0].fest && u.e.panes[0].open && u.e.panes[0].open !== 'fest');
        const uSonder = uGeo?.form ? sonderformPfade(u.r0, uGeo, Math.max(5, 60 * scale), uOffen) : null;
        const uGlas = weissesGlas ? '#ffffff' : (u.e.ornament ? '#7fb0cc' : glasFarbe);
        // Verbundenes Element mit Sonderform-Teil: gemeinsamer Rahmen, aber jedes Teil
        // behält im Inneren seine eigene Form (statt zu einem rechteckigen Mehrfeld zu werden).
        const teile = (u.e.verbunden && Array.isArray(u.e._teile) && u.e._teile.length > 1) ? u.e._teile : null;
        const teilForm = teile && teile.some(t => geometrieByCode(t.code)?.form);
        // „Bogen über Fenster" verbunden → durchgehender Außenrahmen + Kämpfer.
        const uBogenOben = teile && teile.length === 2 && (u.e._dir || 'h') === 'v'
          && ['rundbogen', 'segmentbogen'].includes(geometrieByCode(teile[0]?.code)?.form);
        let teilBodies = null;
        if (teilForm && !uBogenOben) {
          const dir = u.e._dir || 'h';
          const total = teile.reduce((a, t) => a + ((dir === 'h' ? Number(t.breite) : Number(t.hoehe)) || 0), 0) || 1;
          let acc = 0;
          teilBodies = teile.map((t, ti) => {
            const size = (dir === 'h' ? Number(t.breite) : Number(t.hoehe)) || 0;
            const sub = dir === 'h'
              ? { x: u.r0.x + (acc / total) * u.r0.w, y: u.r0.y, w: (size / total) * u.r0.w, h: u.r0.h }
              : { x: u.r0.x, y: u.r0.y + (acc / total) * u.r0.h, w: u.r0.w, h: (size / total) * u.r0.h };
            acc += size;
            const tGeo = geometrieByCode(t.code);
            const tGlas = weissesGlas ? '#ffffff' : (t.ornament ? '#7fb0cc' : glasFarbe);
            if (tGeo?.form) {
              const sp = sonderformPfade(sub, tGeo, Math.max(5, 60 * scale));
              return <SonderBody key={'t' + ti} sp={sp} glas={tGlas} kp={'kt' + ti + '-'} />;
            }
            const tc = computeUnit(sub, scale, {
              geometrie: tGeo, breite: dir === 'h' ? size : Number(t.breite), hoehe: dir === 'h' ? Number(t.hoehe) : size,
              panes: t.panes, cols: t.cols, colWidths: t.colWidths,
            });
            return <UnitBody key={'t' + ti} c={tc} glasFarbe={tGlas} keyPrefix={'u' + u.e._key + '-t' + ti + '-'} />;
          });
        }
        // Nur das AKTIVE Element ist ziehbar – sonst fängt die Ziehfläche den ersten Klick ab
        // (Touch-Wackeln startet einen Drag → Auswahl bleibt aus). So wechselt ein Tipp auf ein
        // anderes Element zuverlässig beim ersten Klick; danach lässt es sich ziehen.
        const ziehbar = interaktiv && aktiv && !istMainUnit;
        // Beim Ziehen folgt das Element ausgegraut frei dem Finger. Das Zentrum bleibt im
        // Zeichenbereich; das Element ragt (per overflow:visible) in die Ränder → frei beweglich
        // UND immer sichtbar (kein Abschneiden, nicht off-screen).
        const wirdGezogen = drag && drag.id === u.e._key && drag.px != null;
        let gx = 0, gy = 0;
        if (wirdGezogen) {
          const cx = Math.max(0, Math.min(VB_W, drag.px));
          const cy = Math.max(0, Math.min(VB_H, drag.py));
          gx = cx - (u.r0.x + u.r0.w / 2);
          gy = cy - (u.r0.y + u.r0.h / 2);
        }
        return (
          <g key={'u' + u.e._key}>
            <g opacity={wirdGezogen ? 0.4 : 1}
               transform={wirdGezogen ? `translate(${gx} ${gy})` : undefined}
               style={wirdGezogen ? { pointerEvents: 'none' } : undefined}>
            {uBogenOben ? (
              <VerbundBogenBody r0={u.r0} teile={teile} scale={scale} glasFarbe={uGlas} kp={'u' + u.e._key + '-vb'}
                panes={u.e.panes} onPaneClick={interaktiv && aktiv ? (i => { if (!justDraggedRef.current) onPaneClick(i); }) : undefined}
                selectedPane={aktiv ? selectedPane : null} />
            ) : teilBodies ? (
              <g>{teilBodies}</g>
            ) : uSonder ? (
              <SonderBody sp={uSonder} glas={uGlas} kp={'u' + u.e._key + '-'} oeffnung={u.e.panes?.[0]}
                onPaneClick={interaktiv && aktiv ? () => { if (!justDraggedRef.current) onPaneClick(0); } : undefined}
                selected={aktiv && selectedPane === 0} />
            ) : (
              <UnitBody c={u.c} glasFarbe={uGlas} keyPrefix={'u' + u.e._key + '-'}
                onPaneClick={interaktiv && aktiv ? (i => { if (!justDraggedRef.current) onPaneClick(i); }) : undefined} selectedPane={aktiv ? selectedPane : null} />
            )}
            </g>
            {aktiv && (
              <rect x={u.r0.x} y={u.r0.y} width={u.r0.w} height={u.r0.h} fill="none"
                    stroke="#c0152e" strokeWidth="2.5" strokeDasharray="6 4" pointerEvents="none" />
            )}
            {interaktiv && !aktiv && (
              <rect x={u.r0.x} y={u.r0.y} width={u.r0.w} height={u.r0.h} fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={() => { if (!justDraggedRef.current) onUnitClick(u.e._key); }} />
            )}
            {/* Ziehfläche: bei Bögen/Sonderformen das GANZE Element (kein Feld-Klick nötig, da
                fest) – die rechteckige Ring-Trefferfläche passt nicht zur Bogenkontur, sonst
                lässt sich der Bogen nicht greifen. Sonst nur der Rahmen-Ring (Feldmitte bleibt
                für die Öffnungsart klickbar). */}
            {ziehbar && (() => {
              const { x, y, w, h } = u.r0;
              const istSonder = !!(uSonder || teilForm);
              const fw = Math.max(14, Math.min(w, h) * 0.16);
              const d = istSonder
                ? `M ${x},${y} H ${x + w} V ${y + h} H ${x} Z`
                : `M ${x},${y} H ${x + w} V ${y + h} H ${x} Z M ${x + fw},${y + fw} H ${x + w - fw} V ${y + h - fw} H ${x + fw} Z`;
              return (
                <path d={d} fillRule="evenodd" fill="transparent"
                      style={{ cursor: 'move', touchAction: 'none' }}
                      onPointerDown={e => pressDown(e, u.e._key)}
                      onPointerMove={e => pressMove(e, u.e._key)}
                      onPointerUp={e => pressUp(e, u.e._key)}
                      onClick={() => { if (justDraggedRef.current) return; if (aktiv && onPaneClick && (uSonder || uBogenOben)) onPaneClick(uBogenOben ? (teile[0].panes?.length || 1) : 0); else onUnitClick(u.e._key); }} />
              );
            })()}
            {/* Höhen-Griff am Bogen-Scheitel (aktiver, unverbundener Bogen): vertikal ziehen = Höhe */}
            {interaktiv && aktiv && uSonder && onElementHoehe && !wirdGezogen && (
              <g>
                <line x1={u.r0.x + u.r0.w / 2} y1={u.r0.y} x2={u.r0.x + u.r0.w / 2} y2={u.r0.y - 24} stroke="#c0152e" strokeWidth="1.6" pointerEvents="none" />
                <circle cx={u.r0.x + u.r0.w / 2} cy={u.r0.y - 24} r="9" fill="#fff" stroke="#c0152e" strokeWidth="2.5"
                        style={{ cursor: 'ns-resize', touchAction: 'none' }}
                        onPointerDown={e => archDown(e, u.e.hoehe)} onPointerMove={e => archMove(e, u.e._key)} onPointerUp={archUp}>
                  <title>Bogenhöhe ziehen</title>
                </circle>
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
                <input className="fz-massinput fz-massinput--sub" type="number"
                       key={'eh' + u.e._key + '_' + Math.round(Number(u.e.hoehe) || 0)}
                       defaultValue={Math.round(Number(u.e.hoehe) || 0)}
                       onBlur={e => onElementHoehe(u.e._key, e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} />
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
