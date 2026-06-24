import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import FensterZeichnung, { GEOMETRIEN, geometrieByCode, GeometrieThumb, fensterBezeichnung, KombinationsZeichnung, istAluCode } from './FensterZeichnung';
import GeometrieSelect from './GeometrieSelect';
import RichTextEditor from './RichTextEditor';
import { kombiMass } from '../lib/belegHelfer';

const VERGLASUNGEN = [
  '2-fach Verglasung, Ug 1,1 mit warmer Kante',
  '3-fach Verglasung, Ug 0,7 mit warmer Kante',
];
const DICHTUNGEN = ['Grau', 'Schwarz'];
const ROLLLADEN = ['42x42mm'];

// Öffnungsarten je Flügel – Bausteine
const OPT = {
  dkl: { label: 'Drehkipp DIN Links', cfg: { open: 'drehkipp', din: 'links' } },
  dkr: { label: 'Drehkipp DIN Rechts', cfg: { open: 'drehkipp', din: 'rechts' } },
  dl:  { label: 'Dreh DIN Links', cfg: { open: 'dreh', din: 'links' } },
  dr:  { label: 'Dreh DIN Rechts', cfg: { open: 'dreh', din: 'rechts' } },
  k:   { label: 'Kippfenster', cfg: { open: 'kipp' } },
  tl:  { label: 'Tür DIN Links', cfg: { open: 'tuer', din: 'links' } },
  tr:  { label: 'Tür DIN Rechts', cfg: { open: 'tuer', din: 'rechts' } },
  hl:  { label: 'Hebe-Schiebe links', cfg: { open: 'schiebe', din: 'links' } },
  hr:  { label: 'Hebe-Schiebe rechts', cfg: { open: 'schiebe', din: 'rechts' } },
  pl:  { label: 'Parallel-Schiebe-Kipp links', cfg: { open: 'psk', din: 'links' } },
  pr:  { label: 'Parallel-Schiebe-Kipp rechts', cfg: { open: 'psk', din: 'rechts' } },
  f:   { label: 'Festverglasung', cfg: { fest: true } },
};

// Welche Öffnungsarten stehen für dieses Element (je nach Typ) zur Auswahl?
function paneOptionenFuer(geo) {
  if (!geo || geo.kategorie !== 'tuer') return [OPT.dkl, OPT.dkr, OPT.dl, OPT.dr, OPT.k, OPT.f]; // Fenster: alles außer Schieben
  const ps = geo.panes || [{ open: geo.open }];
  if (ps.some(p => p.open === 'schiebe')) return [OPT.hl, OPT.hr];          // HST: nur Schiebe-Pfeil links/rechts
  if (ps.some(p => p.open === 'psk')) return [OPT.pl, OPT.pr];              // PSK: nur Schiebe-Kipp links/rechts
  if (ps.some(p => p.open === 'tuer')) return [OPT.tl, OPT.tr];            // Haustür: nur Drehen links/rechts
  return [OPT.dkl, OPT.dkr, OPT.dl, OPT.dr, OPT.k, OPT.pl, OPT.pr];        // Balkontür: alles außer Festverglasung & HST
}

function panesFromGeo(geo) {
  if (!geo) return [{ open: 'drehkipp', din: 'links' }];
  if (geo.panes) return geo.panes.map(p => ({ ...p }));
  if (geo.open === 'fest') return [{ fest: true }];
  if (geo.open === 'tuer') return [{ open: 'tuer', din: geo.din }];
  return [{ open: geo.open, din: geo.din }];
}

// Spaltenbreiten aus relativen Proportionen (geo.colRatio, z. B. [1,2,1] → 500/1000/500); sonst gleich.
function verteileNachRatio(breite, cols, ratio) {
  const b = Math.max(0, Math.round(Number(breite) || 0));
  if (Array.isArray(ratio) && ratio.length === cols) {
    const sum = ratio.reduce((a, c) => a + c, 0) || 1;
    const w = ratio.map(r => Math.round(b * r / sum));
    w[cols - 1] += b - w.reduce((a, c) => a + c, 0);
    return w;
  }
  return Array(cols).fill(Math.round(b / cols));
}

// Erkennt das System „Aluminium Haustür" anhand von Hersteller/System des Profils (tolerant ggü. Schreibweise).
function istAluHaustuerProfil(p) {
  if (!p) return false;
  const t = `${p.hersteller || ''} ${p.system || ''}`.toLowerCase()
    .replace(/ü/g, 'u').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ß/g, 'ss');
  return t.includes('aluminium haustur') || t.includes('alu haustur') || (t.includes('alu') && t.includes('haustur'));
}

// Haustür = ALU-Haustür oder eine Tür mit Haustür-Flügel (open: 'tuer'). Für diese werden
// Standort, Aufsatzkasten/Rollladenführung und Dichtungen im Editor ausgeblendet.
function istHaustuerGeo(geo, panes) {
  if (!geo) return false;
  if (geo.aluHaustuer) return true;
  const ps = panes && panes.length ? panes : (geo.panes || [{ open: geo.open }]);
  return geo.open === 'tuer' || ps.some(p => p?.open === 'tuer');
}

// Balkon-/Terrassentür = Tür ohne Haustür-Flügel (Dreh-/Dreh-Kipp-/Schiebetür).
// Für diese ist die Schwelle frei wählbar; Haustüren haben sie ohnehin immer.
function istBalkonTuer(geo, panes) {
  if (!geo || geo.kategorie !== 'tuer') return false;
  const ps = panes && panes.length ? panes : (geo.panes || [{ open: geo.open }]);
  return !ps.some(p => p?.open === 'tuer');
}

const DEFAULT_KASTEN = { kastenhoehe: 165, bedienung: 'Gurt', bedienungsseite: 'rechts', lamellenfarbe: '', lamellentyp: 'Alulamelle' };

// Baut ein einzelnes Element aus (Teil-)Konfig oder Defaults.
function makeElement(src, id) {
  const toNum = (v, d) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : d; };
  const code = src?.code ?? 'F01';
  const geo = geometrieByCode(code);
  const panes = src?.panes ?? panesFromGeo(geo);
  const cols = src?.cols ?? (geo?.cols || panes.length);
  const rows = Math.ceil(panes.length / cols);
  const breite = toNum(src?.breite, 1000);
  const hoehe = toNum(src?.hoehe, 1200);
  return {
    id,
    row: src?.row ?? 0,
    col: src?.col ?? 0,
    offset: src?.offset,                 // Versatz entlang der Andock-Kante (mm); undefiniert = unten bündig
    kategorie: src?.kategorie ?? 'fenster',
    code,
    panes,
    cols,
    colWidths: src?.colWidths ?? verteileNachRatio(breite, cols, geo?.colRatio),
    rowHeights: src?.rowHeights ?? Array(rows).fill(Math.round(hoehe / rows)),
    breite,
    hoehe,
    verbreiterung: src?.verbreiterung ?? false,
    verb: src?.verb ?? { oben: 0, unten: 0, links: 0, rechts: 0 },
    aufsatzkasten: src?.aufsatzkasten ?? false,
    kasten: src?.kasten ?? { ...DEFAULT_KASTEN },
    schwelle: src?.schwelle ?? false,
    oberlichtHoehe: src?.oberlichtHoehe ?? geo?.oberlichtMm ?? null,
    rollladen: src?.rollladen && src.rollladen !== 'ohne' ? src.rollladen : '',
    innenfarbe: src?.innenfarbe ?? 'WEISS',
    aussenfarbe: src?.aussenfarbe ?? 'WEISS',
    verglasung: src?.verglasung ?? VERGLASUNGEN[0],
    vsg: src?.vsg ?? false,
    ornament: src?.ornament ?? false,
    ornamentArt: src?.ornamentArt ?? '',
    dichtungInnen: src?.dichtungInnen ?? 'Grau',
    dichtungAussen: src?.dichtungAussen ?? 'Grau',
    kommentar: src?.kommentar ?? '',
    nettoJeStueck: src?.nettoJeStueck ?? 0,
    // Verbinden/Trennen: aus zwei benachbarten Teilen zusammengeführtes Element
    verbunden: src?.verbunden ?? false,
    _dir: src?._dir ?? null,          // 'h' = nebeneinander, 'v' = übereinander
    _parts: src?._parts ?? null,      // Bauteile zum späteren Trennen
  };
}

// Flügel-Zeilenzahl eines Elements (1 = einreihig nebeneinander)
function elementRows(e) {
  return Math.ceil((e.panes?.length || 1) / (e.cols || 1));
}

// Findet einen verbindbaren Nachbarn des aktiven Elements:
// nebeneinander (gleiche Höhe, beide einreihig) oder übereinander (gleiche Breite, beide einspaltig).
function findMergePartner(a, els) {
  if (!a) return null;
  const ar = a.row ?? 0, ac = a.col ?? 0;
  const sameNum = (x, y) => Math.round(Number(x)) === Math.round(Number(y));
  if (elementRows(a) === 1) {
    const right = els.find(e => e.id !== a.id && (e.row ?? 0) === ar && (e.col ?? 0) === ac + 1 && elementRows(e) === 1 && sameNum(e.hoehe, a.hoehe));
    if (right) return { dir: 'h', left: a, right };
    const left = els.find(e => e.id !== a.id && (e.row ?? 0) === ar && (e.col ?? 0) === ac - 1 && elementRows(e) === 1 && sameNum(e.hoehe, a.hoehe));
    if (left) return { dir: 'h', left, right: a };
  }
  if ((a.cols || 1) === 1) {
    const below = els.find(e => e.id !== a.id && (e.col ?? 0) === ac && (e.row ?? 0) === ar + 1 && (e.cols || 1) === 1 && sameNum(e.breite, a.breite));
    if (below) return { dir: 'v', top: a, bottom: below };
    const above = els.find(e => e.id !== a.id && (e.col ?? 0) === ac && (e.row ?? 0) === ar - 1 && (e.cols || 1) === 1 && sameNum(e.breite, a.breite));
    if (above) return { dir: 'v', top: above, bottom: a };
  }
  return null;
}

// Bauteil-Beschreibung eines Elements (für späteres Trennen). Ein bereits verbundenes
// Element liefert seine eigenen Teile zurück, sonst sich selbst als ein Teil.
function partsOf(e) {
  if (e.verbunden && Array.isArray(e._parts) && e._parts.length) return e._parts;
  return [{ paneCount: e.panes.length, cols: e.cols || 1, code: e.code, kategorie: e.kategorie }];
}

// Breite eines Elements setzen und die Sub-Spaltenbreiten proportional mitskalieren.
function scaleBreite(e, nbRaw) {
  const n = e.cols || 1;
  const nb = Math.max(200, Math.round(Number(nbRaw) || 0));
  const old = (e.colWidths && e.colWidths.length === n) ? e.colWidths.map(x => Number(x) || 0) : Array(n).fill((Number(e.breite) || nb) / n);
  const sum = old.reduce((a, c) => a + c, 0) || 1;
  const cw = old.map(c => Math.round(nb * c / sum));
  cw[n - 1] += nb - cw.reduce((a, c) => a + c, 0);
  return { ...e, breite: nb, colWidths: cw };
}
// Höhe eines Elements setzen und die Sub-Zeilenhöhen proportional mitskalieren.
function scaleHoehe(e, nhRaw) {
  const r = Math.max(1, Math.ceil((e.panes?.length || 1) / (e.cols || 1)));
  const nh = Math.max(200, Math.round(Number(nhRaw) || 0));
  const old = (e.rowHeights && e.rowHeights.length === r) ? e.rowHeights.map(x => Number(x) || 0) : Array(r).fill((Number(e.hoehe) || nh) / r);
  const sum = old.reduce((a, c) => a + c, 0) || 1;
  const rh = old.map(c => Math.round(nh * c / sum));
  rh[r - 1] += nh - rh.reduce((a, c) => a + c, 0);
  return { ...e, hoehe: nh, rowHeights: rh };
}
// Elemente gleichmäßig so verteilen, dass die Spalten zusammen genau die Rahmenbreite Tw ergeben.
function verteileBreite(els, Tw) {
  const cols = [...new Set(els.map(e => e.col ?? 0))].sort((a, b) => a - b);
  const k = cols.length || 1;
  const base = Math.max(200, Math.round(Tw / k));
  const wByCol = {}; cols.forEach(c => { wByCol[c] = base; });
  wByCol[cols[k - 1]] = Math.max(200, Math.round(Tw) - base * (k - 1));   // Rundungsrest in die letzte Spalte
  return els.map(e => scaleBreite(e, wByCol[e.col ?? 0]));
}
// Elemente gleichmäßig so verteilen, dass die Zeilen zusammen genau die Rahmenhöhe Th ergeben.
function verteileHoehe(els, Th) {
  const rows = [...new Set(els.map(e => e.row ?? 0))].sort((a, b) => a - b);
  const k = rows.length || 1;
  const base = Math.max(200, Math.round(Th / k));
  const hByRow = {}; rows.forEach(r => { hByRow[r] = base; });
  hByRow[rows[k - 1]] = Math.max(200, Math.round(Th) - base * (k - 1));
  return els.map(e => scaleHoehe(e, hByRow[e.row ?? 0]));
}

function buildInitElemente(cfg) {
  if (cfg?.elemente?.length) {
    return cfg.elemente.map((e, i) => makeElement(e, e.id ?? `el${i}`));
  }
  return [makeElement(cfg, 'el0')];
}

function NeuePositionEditor({ kundeName, onClose, onSave, initial }) {
  const [profile, setProfile] = useState([]);
  const [katalog, setKatalog] = useState({}); // name -> code
  const [profilId, setProfilId] = useState(initial?.profilId ?? null);

  const [elemente, setElemente] = useState(() => buildInitElemente(initial));
  const [activeId, setActiveId] = useState(() => buildInitElemente(initial)[0].id);
  const [selectedPane, setSelectedPane] = useState(null);
  const [addMenu, setAddMenu] = useState(false);
  const nextId = useRef(1000);

  // Positions-Ebene (für alle Elemente gemeinsam)
  const [stueckzahl, setStueckzahl] = useState(initial?.stueckzahl ?? 1);
  const [standort, setStandort] = useState(initial?.standort ?? '');
  const [montage, setMontage] = useState(initial?.montage ?? 140);
  const [ausbau, setAusbau] = useState(initial?.ausbau ?? 30);
  const [entsorgung, setEntsorgung] = useState(initial?.entsorgung ?? 15);
  const [ohneMontage, setOhneMontage] = useState(initial?.ohneMontage ?? false);

  useEffect(() => {
    async function laden() {
      const { data: p } = await supabase.from('profile').select('*').order('created_at');
      setProfile(p ?? []);
      if (!initial?.profilId && p?.length) setProfilId(p[0].id);
      const { data: k } = await supabase.from('farbe_katalog').select('code,name');
      const map = {};
      (k ?? []).forEach(row => { map[row.name] = row.code; });
      setKatalog(map);
    }
    laden();
  }, [initial]);

  const profil = profile.find(p => p.id === profilId);
  const aktiv = elemente.find(e => e.id === activeId) || elemente[0];
  const aktivIndex = Math.max(0, elemente.findIndex(e => e.id === aktiv.id));
  const istMain = aktiv && aktiv.id === elemente[0].id;
  const geometrie = geometrieByCode(aktiv.code);
  // System „Aluminium Haustür": ausschließlich die ALU-Geometrien anbieten – sonst die bisherigen.
  const istAluSystem = istAluHaustuerProfil(profil);
  // Haustüren (ALU-System oder Haustür-Geometrie): Standort, Aufsatzkasten/Rollladen, Dichtungen ausblenden.
  const istHaustuerAktiv = istAluSystem || istHaustuerGeo(geometrie, aktiv.panes);
  const geomOptionen = istAluSystem
    ? GEOMETRIEN.filter(g => g.aluHaustuer)
    : GEOMETRIEN.filter(g => g.kategorie === aktiv.kategorie && !g.aluHaustuer);

  // Beim Wechsel DES SYSTEMS die aktive Geometrie auf eine gültige umstellen
  // (ALU↔Standard). Bestehende Positionen beim Laden bleiben unangetastet.
  const prevAluSystem = useRef(null);
  useEffect(() => {
    if (!profil) return;                                   // erst wenn das System geladen ist
    if (prevAluSystem.current === null) { prevAluSystem.current = istAluSystem; return; }
    if (istAluSystem === prevAluSystem.current) return;
    prevAluSystem.current = istAluSystem;
    if (istAluSystem && !istAluCode(aktiv.code)) waehleGeometrie('A01');
    else if (!istAluSystem && istAluCode(aktiv.code)) waehleGeometrie('F01');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [istAluSystem, profil]);
  const istKombi = elemente.length > 1;
  // Verbinden/Trennen: passender Nachbar zum aktiven Element (nur in einer Kombination)
  const mergePartner = istKombi ? findMergePartner(aktiv, elemente) : null;

  // Farboptionen aus dem gewählten Profil
  const farbOptionen = useMemo(() => {
    const namen = profil?.farben ?? [];
    return namen.map(name => ({ value: name, label: katalog[name] ? `${katalog[name]} -- ${name}` : name }));
  }, [profil, katalog]);

  // --- aktives Element ändern ---
  function updAktiv(patch) {
    setElemente(prev => prev.map(e => (e.id === activeId ? { ...e, ...patch } : e)));
  }
  // Farbauswahl: Listenwert übernehmen oder bei „Manuell eingeben…" zur Texteingabe wechseln
  function waehleFarbe(feld, val) {
    if (val === '__manuell__') {
      const eingabe = window.prompt('Farbe manuell eingeben:', aktiv?.[feld] ?? '');
      if (eingabe != null && eingabe.trim() !== '') updAktiv({ [feld]: eingabe.trim() });
    } else {
      updAktiv({ [feld]: val });
    }
  }
  function switchActive(id) {
    setActiveId(id);
    setSelectedPane(null);
  }

  function waehleGeometrie(neuCode) {
    const geo = geometrieByCode(neuCode);
    const np = panesFromGeo(geo);
    const c = geo?.cols || np.length;
    const r = Math.ceil(np.length / c);
    // ALU-Haustür-Geometrien bringen sinnvolle Standardmaße mit; sonst aktuelle Maße behalten.
    const nb = Number(geo?.defBreite) || Number(aktiv.breite) || 1000;
    const nh = Number(geo?.defHoehe) || Number(aktiv.hoehe) || 1200;
    updAktiv({
      code: neuCode,
      panes: np,
      cols: c,
      breite: nb,
      hoehe: nh,
      colWidths: verteileNachRatio(nb, c, geo?.colRatio),
      rowHeights: Array(r).fill(Math.round(nh / r)),
      oberlichtHoehe: geo?.oberlichtMm ?? null,
    });
    setSelectedPane(null);
  }

  function setMainBreite(val) {
    const n = aktiv.cols;
    updAktiv({ breite: val, colWidths: Array(n).fill(Math.round((Number(val) || 0) / n)) });
  }
  function setMainHoehe(val) {
    const n = Math.ceil(aktiv.panes.length / aktiv.cols);
    updAktiv({ hoehe: val, rowHeights: Array(n).fill(Math.round((Number(val) || 0) / n)) });
  }
  function setColWidth(i, val) {
    const next = aktiv.colWidths.map((c, idx) => (idx === i ? (Number(val) || 0) : c));
    updAktiv({ colWidths: next, breite: next.reduce((a, c) => a + c, 0) });
  }
  // Oberlicht-Höhe ändern: unterer Abschnitt (Tür/Seitenteile) bleibt, Gesamthöhe wächst/schrumpft mit.
  function setOberlichtHoehe(val) {
    const newOl = Math.max(50, Math.round(Number(val) || 0));
    const oldOl = Math.round(Number(aktiv.oberlichtHoehe) || 0);
    updAktiv({ oberlichtHoehe: newOl, hoehe: Math.max(400, Math.round(Number(aktiv.hoehe) || 0) + (newOl - oldOl)) });
  }
  // Höhe des unteren Abschnitts (Tür/Seitenteile) ändern: Gesamthöhe = Unterteil + Oberlicht.
  function setBottomHoehe(val) {
    const ol = Math.round(Number(aktiv.oberlichtHoehe) || 0);
    const bottom = Math.max(200, Math.round(Number(val) || 0));
    updAktiv({ hoehe: ol + bottom });
  }
  function setRowHeight(i, val) {
    const next = aktiv.rowHeights.map((rr, idx) => (idx === i ? (Number(val) || 0) : rr));
    updAktiv({ rowHeights: next, hoehe: next.reduce((a, c) => a + c, 0) });
  }

  function wechselKategorie(k) {
    const erste = GEOMETRIEN.find(g => g.kategorie === k);
    updAktiv({ kategorie: k });
    if (erste) waehleGeometrie(erste.code);
  }

  function setzePane(cfg) {
    if (selectedPane == null) return;
    updAktiv({ panes: aktiv.panes.map((p, i) => (i === selectedPane ? { ...cfg } : p)) });
    setSelectedPane(null);
  }

  // --- Elemente hinzufügen / entfernen ---
  function addElement(kat) {
    const id = `el${nextId.current++}`;
    const main = elemente[0];
    const isT = kat === 'tuer';
    const code = isT ? 'T01' : 'F01';
    // Der Rahmen (Gesamtmaß) bleibt fest – die Spalten teilen sich die Breite gleichmäßig.
    const { w: Tw, h: Th } = kombiMass(elemente);
    const maxCol = Math.max(...elemente.map(e => e.col ?? 0));
    const neu = makeElement({
      kategorie: kat, code, breite: 600, hoehe: Th, row: 0, col: maxCol + 1,
      innenfarbe: main.innenfarbe, aussenfarbe: main.aussenfarbe,
      verglasung: main.verglasung, dichtungInnen: main.dichtungInnen, dichtungAussen: main.dichtungAussen,
    }, id);
    setElemente(prev => verteileBreite([...prev, neu], Tw));
    setActiveId(id);
    setSelectedPane(null);
    setAddMenu(false);
  }
  function removeElement(id) {
    if (id === elemente[0].id) return;                  // Hauptelement bleibt
    setElemente(prev => {
      const { w: Tw, h: Th } = kombiMass(prev);         // Rahmen bleibt fest
      const rest = prev.filter(e => e.id !== id);
      if (!rest.length) return prev;
      return verteileHoehe(verteileBreite(rest, Tw), Th); // verbleibende Elemente füllen den Rahmen
    });
    if (activeId === id) setActiveId(elemente[0].id);
    setSelectedPane(null);
  }

  // Zwei benachbarte Teile zu EINEM Element (ein Rahmen mit Pfosten) verbinden.
  function verbinde() {
    const cand = findMergePartner(aktiv, elemente);
    if (!cand) return;
    const newId = `el${nextId.current++}`;
    setElemente(prev => {
      if (cand.dir === 'h') {
        const L = prev.find(e => e.id === cand.left.id);
        const R = prev.find(e => e.id === cand.right.id);
        if (!L || !R) return prev;
        const M = makeElement({
          ...L,
          panes: [...L.panes, ...R.panes],
          cols: (L.cols || 1) + (R.cols || 1),
          colWidths: [...L.colWidths, ...R.colWidths],
          rowHeights: [Number(L.hoehe)],
          breite: (Number(L.breite) || 0) + (Number(R.breite) || 0),
          hoehe: Number(L.hoehe),
          row: L.row ?? 0, col: L.col ?? 0, offset: undefined,
          verbunden: true, _dir: 'h', _parts: [...partsOf(L), ...partsOf(R)],
          nettoJeStueck: (Number(L.nettoJeStueck) || 0) + (Number(R.nettoJeStueck) || 0),
        }, newId);
        const wasMain = prev[0].id === L.id || prev[0].id === R.id;
        const rest = prev.filter(e => e.id !== L.id && e.id !== R.id)
          .map(e => ((e.col ?? 0) > (R.col ?? 0) ? { ...e, col: (e.col ?? 0) - 1 } : e));
        return wasMain ? [M, ...rest] : [...rest, M];
      }
      const T = prev.find(e => e.id === cand.top.id);
      const B = prev.find(e => e.id === cand.bottom.id);
      if (!T || !B) return prev;
      const M = makeElement({
        ...T,
        panes: [...T.panes, ...B.panes],
        cols: 1,
        colWidths: [Number(T.breite)],
        rowHeights: [...T.rowHeights, ...B.rowHeights],
        breite: Number(T.breite),
        hoehe: (Number(T.hoehe) || 0) + (Number(B.hoehe) || 0),
        row: T.row ?? 0, col: T.col ?? 0, offset: undefined,
        verbunden: true, _dir: 'v', _parts: [...partsOf(T), ...partsOf(B)],
        nettoJeStueck: (Number(T.nettoJeStueck) || 0) + (Number(B.nettoJeStueck) || 0),
      }, newId);
      const wasMain = prev[0].id === T.id || prev[0].id === B.id;
      const rest = prev.filter(e => e.id !== T.id && e.id !== B.id)
        .map(e => ((e.row ?? 0) > (B.row ?? 0) ? { ...e, row: (e.row ?? 0) - 1 } : e));
      return wasMain ? [M, ...rest] : [...rest, M];
    });
    setActiveId(newId);
    setSelectedPane(null);
  }

  // Verbundenes Element wieder in seine Bauteile trennen.
  function trenne() {
    const M = elemente.find(e => e.id === activeId);
    if (!M || !M.verbunden) return;
    const parts = partsOf(M);
    const dir = M._dir || 'h';
    const ids = parts.map(() => `el${nextId.current++}`);
    const frameProps = {
      innenfarbe: M.innenfarbe, aussenfarbe: M.aussenfarbe,
      verglasung: M.verglasung, vsg: M.vsg, ornament: M.ornament, ornamentArt: M.ornamentArt,
      dichtungInnen: M.dichtungInnen, dichtungAussen: M.dichtungAussen,
      verbreiterung: M.verbreiterung, verb: M.verb,
      aufsatzkasten: M.aufsatzkasten, kasten: M.kasten,
      rollladen: M.rollladen, kommentar: M.kommentar,
    };
    setElemente(prev => {
      const cur = prev.find(e => e.id === M.id) || M;
      const newEls = [];
      let pIdx = 0, wIdx = 0, hIdx = 0;
      parts.forEach((pt, i) => {
        const paneSlice = cur.panes.slice(pIdx, pIdx + pt.paneCount);
        pIdx += pt.paneCount;
        const netto = i === 0 ? (Number(cur.nettoJeStueck) || 0) : 0;
        if (dir === 'h') {
          const widthSlice = cur.colWidths.slice(wIdx, wIdx + pt.cols);
          wIdx += pt.cols;
          newEls.push(makeElement({
            ...frameProps, code: pt.code, kategorie: pt.kategorie,
            panes: paneSlice, cols: pt.cols, colWidths: widthSlice,
            breite: widthSlice.reduce((a, c) => a + (Number(c) || 0), 0),
            hoehe: Number(cur.hoehe), rowHeights: [Number(cur.hoehe)],
            row: cur.row ?? 0, col: (cur.col ?? 0) + i, nettoJeStueck: netto,
          }, ids[i]));
        } else {
          const heightSlice = cur.rowHeights.slice(hIdx, hIdx + pt.paneCount);
          hIdx += pt.paneCount;
          newEls.push(makeElement({
            ...frameProps, code: pt.code, kategorie: pt.kategorie,
            panes: paneSlice, cols: 1, colWidths: [Number(cur.breite)],
            breite: Number(cur.breite),
            hoehe: heightSlice.reduce((a, c) => a + (Number(c) || 0), 0), rowHeights: heightSlice,
            row: (cur.row ?? 0) + i, col: cur.col ?? 0, nettoJeStueck: netto,
          }, ids[i]));
        }
      });
      const shift = parts.length - 1;
      let rest = prev.filter(e => e.id !== M.id);
      if (dir === 'h') rest = rest.map(e => ((e.col ?? 0) > (cur.col ?? 0) ? { ...e, col: (e.col ?? 0) + shift } : e));
      else rest = rest.map(e => ((e.row ?? 0) > (cur.row ?? 0) ? { ...e, row: (e.row ?? 0) + shift } : e));
      const wasMain = prev[0].id === M.id;
      return wasMain ? [...newEls, ...rest] : [...rest, ...newEls];
    });
    setActiveId(ids[0]);
    setSelectedPane(null);
  }
  // Element an eine Seite des Hauptfensters andocken (Drag im Canvas)
  function dockElement(id, side, targetId) {
    setElemente(prev => {
      const { w: Tw, h: Th } = kombiMass(prev);         // Rahmen bleibt fest
      // An die freie Kante des Ziel-Elements docken (Fallback: Hauptelement).
      const target = (targetId != null && prev.find(e => e.id === targetId)) || prev[0];
      let row = target.row ?? 0, col = target.col ?? 0;
      if (side === 'rechts') col = (target.col ?? 0) + 1;
      else if (side === 'links') col = (target.col ?? 0) - 1;
      else if (side === 'unten') row = (target.row ?? 0) + 1;
      else if (side === 'oben') row = (target.row ?? 0) - 1;
      let next = prev.map(e => (e.id === id ? { ...e, row, col, offset: undefined } : e));
      const minR = Math.min(...next.map(e => e.row ?? 0));
      const minC = Math.min(...next.map(e => e.col ?? 0));
      next = next.map(e => ({ ...e, row: (e.row ?? 0) - minR, col: (e.col ?? 0) - minC }));
      // Spalten/Zeilen teilen sich Rahmen gleichmäßig auf, sodass alle Elemente im Rahmen bleiben.
      return verteileHoehe(verteileBreite(next, Tw), Th);
    });
  }
  // Element entlang seiner Andock-Kante verschieben (Versatz in mm)
  function slideElement(id, offsetMm) {
    setElemente(prev => prev.map(e => (e.id === id ? { ...e, offset: offsetMm } : e)));
  }
  // Einzelmaß in der Kombi-Zeichnung ändern: Rahmen bleibt fest, der Nachbar passt sich an.
  function setElementBreite(id, val) {
    setElemente(prev => {
      const el = prev.find(e => e.id === id);
      if (!el) return prev;
      const c = el.col ?? 0, r = el.row ?? 0;
      const nb = prev.find(e => (e.row ?? 0) === r && (e.col ?? 0) === c + 1)
              || prev.find(e => (e.row ?? 0) === r && (e.col ?? 0) === c - 1);
      let w = Math.max(200, Math.round(Number(val) || 0));
      if (!nb) return prev.map(e => e.id === id ? scaleBreite(e, w) : e);   // kein Nachbar → Rahmen folgt
      const paar = (Number(el.breite) || 0) + (Number(nb.breite) || 0);     // Spaltenpaar-Summe bleibt
      w = Math.min(paar - 200, w);
      return prev.map(e => e.id === id ? scaleBreite(e, w) : e.id === nb.id ? scaleBreite(e, paar - w) : e);
    });
  }
  function setElementHoehe(id, val) {
    setElemente(prev => {
      const el = prev.find(e => e.id === id);
      if (!el) return prev;
      const c = el.col ?? 0, r = el.row ?? 0;
      const nb = prev.find(e => (e.col ?? 0) === c && (e.row ?? 0) === r + 1)
              || prev.find(e => (e.col ?? 0) === c && (e.row ?? 0) === r - 1);
      let h = Math.max(200, Math.round(Number(val) || 0));
      if (!nb) return prev.map(e => e.id === id ? scaleHoehe(e, h) : e);
      const paar = (Number(el.hoehe) || 0) + (Number(nb.hoehe) || 0);
      h = Math.min(paar - 200, h);
      return prev.map(e => e.id === id ? scaleHoehe(e, h) : e.id === nb.id ? scaleHoehe(e, paar - h) : e);
    });
  }
  // Gesamtmaß (Rahmen) ändern: alle Spalten/Zeilen proportional mitskalieren.
  function setTotalBreite(val) {
    const v = Number(val);
    setElemente(prev => {
      const cur = kombiMass(prev).w;
      if (!Number.isFinite(v) || v <= 0 || cur <= 0) return prev;
      const f = v / cur;
      return prev.map(e => scaleBreite(e, (Number(e.breite) || 1000) * f));
    });
  }
  function setTotalHoehe(val) {
    const v = Number(val);
    setElemente(prev => {
      const cur = kombiMass(prev).h;
      if (!Number.isFinite(v) || v <= 0 || cur <= 0) return prev;
      const f = v / cur;
      return prev.map(e => scaleHoehe(e, (Number(e.hoehe) || 1200) * f));
    });
  }

  // --- Maße / Preis ---
  const kombi = kombiMass(elemente);
  const breiteGes = istKombi ? kombi.w : Number(aktiv.breite);
  const hoeheGes = istKombi ? kombi.h : Number(aktiv.hoehe);
  const flaeche = (breiteGes * hoeheGes) / 1_000_000; // m²
  const summeNetto = elemente.reduce((a, e) => a + (Number(e.nettoJeStueck) || 0), 0);
  const zuschlag = ohneMontage ? 0 : Number(montage) + Number(ausbau) + Number(entsorgung);
  const proStueck = summeNetto + zuschlag;
  const systemLabel = profil ? `${profil.hersteller} ${profil.system}`.trim() : '—';

  function buildBeschreibung() {
    const farbe = (name) => katalog[name] ? `${katalog[name]} ${name}` : name;
    const teile = [];
    if (istKombi) {
      teile.push('<strong>Fensterkombination</strong>');
      teile.push(`Gesamtmaß ${Math.round(breiteGes)} × ${Math.round(hoeheGes)} mm · ${flaeche.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`);
      teile.push(systemLabel);
      elemente.forEach((el, i) => {
        const geo = geometrieByCode(el.code);
        teile.push(`Element ${i + 1}: ${fensterBezeichnung(geo, el.panes, el.cols)} (${el.code}), ${Math.round(el.breite)} × ${Math.round(el.hoehe)} mm, Innen ${farbe(el.innenfarbe)} / Außen ${farbe(el.aussenfarbe)}, ${el.verglasung}${el.vsg ? ', VSG' : ''}${el.ornament ? ', Ornament' : ''}`);
      });
    } else {
      const el = aktiv;
      teile.push(`<strong>${fensterBezeichnung(geometrie, el.panes, el.cols)} (${el.code})</strong>`);
      teile.push(`${Math.round(el.breite)} × ${Math.round(el.hoehe)} mm · ${flaeche.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`);
      teile.push(systemLabel);
      teile.push(`Innen ${farbe(el.innenfarbe)} / Außen ${farbe(el.aussenfarbe)}`);
      teile.push(el.verglasung + (el.vsg ? ', VSG' : '') + (el.ornament ? `, Ornament${el.ornamentArt ? ` (${el.ornamentArt})` : ''}` : ''));
      if (!istHaustuerGeo(geometrie, el.panes)) teile.push(`Dichtung innen/außen: ${el.dichtungInnen}/${el.dichtungAussen}`);
      if (el.verbreiterung) {
        const seiten = ['oben', 'unten', 'links', 'rechts'].filter(k => Number(el.verb[k]) > 0).map(k => `${k} ${Number(el.verb[k])} mm`);
        teile.push('Verbreiterung' + (seiten.length ? ': ' + seiten.join(', ') : ''));
      }
      if (el.aufsatzkasten) {
        teile.push(`Aufsatzkasten ${Number(el.kasten.kastenhoehe) || 0} mm, ${el.kasten.bedienung} (${el.kasten.bedienungsseite})`
          + (el.kasten.lamellentyp ? `, ${el.kasten.lamellentyp}` : '')
          + (el.kasten.lamellenfarbe ? ` ${el.kasten.lamellenfarbe}` : ''));
      }
      if (el.schwelle && istBalkonTuer(geometrie, el.panes)) teile.push('mit Schwelle');
      if (el.rollladen && el.rollladen !== 'ohne') teile.push(`Rollladenführung ${el.rollladen}`);
      const komText = (el.kommentar || '').replace(/<[^>]*>/g, '').trim();
      if (komText) teile.push(`Kommentar: ${el.kommentar}`);
    }
    if (standort) teile.push(`Standort: ${standort}`);
    if (ohneMontage) teile.push('ohne Montage');
    return `<div>${teile.join('<br>')}</div>`;
  }

  function handleSave() {
    // Maße/Preise auf saubere Zahlen normieren (keine leeren/ungültigen Werte speichern)
    const elementeClean = elemente.map(e => ({
      ...e,
      breite: Number(e.breite) || 1000,
      hoehe: Number(e.hoehe) || 1200,
      nettoJeStueck: Number(e.nettoJeStueck) || 0,
    }));
    const main = elementeClean[0];
    const config = {
      profilId,
      // Positions-Ebene
      stueckzahl: Number(stueckzahl), standort,
      montage: Number(montage), ausbau: Number(ausbau), entsorgung: Number(entsorgung), ohneMontage,
      // Abwärtskompatibel: Flachfelder = Hauptelement
      kategorie: main.kategorie, code: main.code, panes: main.panes, cols: main.cols,
      colWidths: main.colWidths, rowHeights: main.rowHeights,
      breite: Number(main.breite), hoehe: Number(main.hoehe),
      verbreiterung: main.verbreiterung, verb: main.verb,
      aufsatzkasten: main.aufsatzkasten, kasten: main.kasten, schwelle: main.schwelle, oberlichtHoehe: main.oberlichtHoehe, rollladen: main.rollladen,
      innenfarbe: main.innenfarbe, aussenfarbe: main.aussenfarbe, verglasung: main.verglasung, vsg: main.vsg,
      ornament: main.ornament, ornamentArt: main.ornamentArt,
      dichtungInnen: main.dichtungInnen, dichtungAussen: main.dichtungAussen,
      kommentar: main.kommentar, nettoJeStueck: Number(main.nettoJeStueck),
      // Mehrteilig (immer mitgespeichert)
      elemente: elementeClean,
    };
    onSave({
      typ: 'fenster',
      beschreibung: buildBeschreibung(),
      menge: Number(stueckzahl) || 1,
      nettopreis: proStueck,
      config,
    });
  }

  return (
    <div className="np-overlay">
      {/* Kopfzeile */}
      <header className="np-header">
        <div className="np-title">
          <strong>{initial ? 'Position bearbeiten' : 'Neue Position'}</strong>
          <span className="np-subtitle">Position für {kundeName}</span>
        </div>
        <div className="np-header-right">
          <span className="np-system-label">System</span>
          <select className="np-select" value={profilId ?? ''} onChange={e => setProfilId(Number(e.target.value))}>
            {profile.map(p => <option key={p.id} value={p.id}>{`${p.hersteller} ${p.system}`.trim()}</option>)}
          </select>
          <button className="np-close" onClick={onClose} title="Schließen">✕</button>
        </div>
      </header>

      <div className="np-body">
        {/* Linke Spalte */}
        <aside className="np-col np-col--left">
          {istKombi && (
            <div className="np-aktiv-hinweis">
              <div className="np-elem-switch">
                {elemente.map((el, i) => (
                  <button key={el.id} type="button"
                          className={'np-elem-btn' + (el.id === activeId ? ' aktiv' : '')}
                          onClick={() => switchActive(el.id)}
                          title={i === 0 ? 'Hauptelement bearbeiten' : `Element ${i + 1} bearbeiten`}>
                    {i === 0 ? 'Haupt' : i + 1}
                  </button>
                ))}
              </div>
              <div className="np-aktiv-zeile">
                <span>{istMain ? 'Hauptelement' : `Element ${aktivIndex + 1}`} wird bearbeitet</span>
                {!istMain && (
                  <button className="np-aktiv-remove" onClick={() => removeElement(activeId)} title="Dieses Element entfernen">Entfernen</button>
                )}
              </div>
            </div>
          )}
          <div className="np-group-label">TYP &amp; GEOMETRIE</div>

          {!istAluSystem && (
            <>
              <label className="np-field-label">Kategorie</label>
              <div className="np-segmented">
                <button className={aktiv.kategorie === 'fenster' ? 'active' : ''} onClick={() => wechselKategorie('fenster')}>Fenster</button>
                <button className={aktiv.kategorie === 'tuer' ? 'active' : ''} onClick={() => wechselKategorie('tuer')}>Tür</button>
              </div>
            </>
          )}

          <label className="np-field-label">Geometrie</label>
          <GeometrieSelect optionen={geomOptionen} value={aktiv.code} onChange={waehleGeometrie} panes={aktiv.panes} cols={aktiv.cols} />

          {istKombi && (
            <>
              <div className="np-group-label" style={{ marginTop: 24 }}>GESAMTMASS (RAHMEN)</div>
              <div className="np-row">
                <div>
                  <label className="np-field-label">Gesamtbreite (mm)</label>
                  <input className="np-input" type="number" key={'gb' + Math.round(breiteGes)}
                         defaultValue={Math.round(breiteGes)}
                         onBlur={e => setTotalBreite(e.target.value)}
                         onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} />
                </div>
                <div>
                  <label className="np-field-label">Gesamthöhe (mm)</label>
                  <input className="np-input" type="number" key={'gh' + Math.round(hoeheGes)}
                         defaultValue={Math.round(hoeheGes)}
                         onBlur={e => setTotalHoehe(e.target.value)}
                         onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} />
                </div>
              </div>
            </>
          )}
          <div className="np-group-label" style={{ marginTop: 24 }}>{istKombi ? `MASSE – ELEMENT ${aktivIndex + 1}` : 'MASSE'}</div>
          <div className="np-row">
            <div>
              <label className="np-field-label">Breite (mm)</label>
              {istKombi ? (
                <input className="np-input" type="number" key={'eb' + activeId + '_' + Math.round(aktiv.breite)}
                       defaultValue={Math.round(aktiv.breite)}
                       onBlur={e => setElementBreite(activeId, e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} />
              ) : (
                <input className="np-input" type="number" value={aktiv.breite} onChange={e => setMainBreite(e.target.value)} />
              )}
            </div>
            <div>
              <label className="np-field-label">Höhe (mm)</label>
              {istKombi ? (
                <input className="np-input" type="number" key={'eh' + activeId + '_' + Math.round(aktiv.hoehe)}
                       defaultValue={Math.round(aktiv.hoehe)}
                       onBlur={e => setElementHoehe(activeId, e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} />
              ) : (
                <input className="np-input" type="number" value={aktiv.hoehe} onChange={e => setMainHoehe(e.target.value)} />
              )}
            </div>
          </div>
          <div className="np-row">
            <div>
              <label className="np-field-label">Stückzahl</label>
              <input className="np-input" type="number" min="1" value={stueckzahl} onChange={e => setStueckzahl(e.target.value)} />
            </div>
            {!istHaustuerAktiv && (
              <div>
                <label className="np-field-label">Standort</label>
                <input className="np-input" value={standort} onChange={e => setStandort(e.target.value)} placeholder="z. B. EG Küche" />
              </div>
            )}
          </div>

          <div className="np-group-label" style={{ marginTop: 24 }}>ANBAUTEN</div>
          <label className="np-field-label">Verbreiterung</label>
          <div className="np-segmented">
            <button className={!aktiv.verbreiterung ? 'active' : ''} onClick={() => updAktiv({ verbreiterung: false })}>nein</button>
            <button className={aktiv.verbreiterung ? 'active' : ''} onClick={() => updAktiv({ verbreiterung: true })}>ja</button>
          </div>
          {aktiv.verbreiterung && (
            <div className="np-verb">
              {[['oben', 'oben'], ['unten', 'unten'], ['links', 'links'], ['rechts', 'rechts']].map(([key, label]) => (
                <div key={key}>
                  <label className="np-field-label">{label} (mm)</label>
                  <input
                    className="np-input"
                    type="number"
                    min="0"
                    value={aktiv.verb[key]}
                    onChange={e => updAktiv({ verb: { ...aktiv.verb, [key]: e.target.value } })}
                  />
                </div>
              ))}
            </div>
          )}
          {!istHaustuerAktiv && (
          <>
          <label className="np-field-label">Aufsatzkasten</label>
          <div className="np-segmented">
            <button className={!aktiv.aufsatzkasten ? 'active' : ''} onClick={() => updAktiv({ aufsatzkasten: false })}>nein</button>
            <button className={aktiv.aufsatzkasten ? 'active' : ''} onClick={() => updAktiv({ aufsatzkasten: true })}>ja</button>
          </div>
          {aktiv.aufsatzkasten && (
            <div className="np-sub">
              <label className="np-field-label">Kastenhöhe (mm)</label>
              <input className="np-input" type="number" min="0" value={aktiv.kasten.kastenhoehe}
                     onChange={e => updAktiv({ kasten: { ...aktiv.kasten, kastenhoehe: e.target.value } })} />

              <label className="np-field-label">Bedienung</label>
              <div className="np-segmented">
                <button className={aktiv.kasten.bedienung === 'Gurt' ? 'active' : ''} onClick={() => updAktiv({ kasten: { ...aktiv.kasten, bedienung: 'Gurt' } })}>Gurt</button>
                <button className={aktiv.kasten.bedienung === 'Motor' ? 'active' : ''} onClick={() => updAktiv({ kasten: { ...aktiv.kasten, bedienung: 'Motor' } })}>Motor</button>
              </div>

              <label className="np-field-label">Bedienungsseite</label>
              <div className="np-segmented">
                <button className={aktiv.kasten.bedienungsseite === 'links' ? 'active' : ''} onClick={() => updAktiv({ kasten: { ...aktiv.kasten, bedienungsseite: 'links' } })}>links</button>
                <button className={aktiv.kasten.bedienungsseite === 'rechts' ? 'active' : ''} onClick={() => updAktiv({ kasten: { ...aktiv.kasten, bedienungsseite: 'rechts' } })}>rechts</button>
              </div>

              <label className="np-field-label">Lamellenfarbe</label>
              <input className="np-input" value={aktiv.kasten.lamellenfarbe}
                     onChange={e => updAktiv({ kasten: { ...aktiv.kasten, lamellenfarbe: e.target.value } })} />

              <label className="np-field-label">Lamellentyp</label>
              <input className="np-input" value={aktiv.kasten.lamellentyp}
                     onChange={e => updAktiv({ kasten: { ...aktiv.kasten, lamellentyp: e.target.value } })} />
            </div>
          )}
          {istBalkonTuer(geometrie, aktiv.panes) && (
            <>
              <label className="np-field-label">Schwelle</label>
              <div className="np-segmented">
                <button className={!aktiv.schwelle ? 'active' : ''} onClick={() => updAktiv({ schwelle: false })}>nein</button>
                <button className={aktiv.schwelle ? 'active' : ''} onClick={() => updAktiv({ schwelle: true })}>ja</button>
              </div>
            </>
          )}
          <label className="np-field-label">Rollladenführung</label>
          <input
            className="np-input"
            list="rollladen-liste"
            value={aktiv.rollladen}
            onChange={e => updAktiv({ rollladen: e.target.value })}
            placeholder="z.B. 42x42mm"
          />
          <datalist id="rollladen-liste">
            {ROLLLADEN.map(r => <option key={r} value={r} />)}
          </datalist>
          </>
          )}
        </aside>

        {/* Mitte: Zeichnung */}
        <section className="np-col np-col--center">
          <div className="np-chips">
            <label className="np-chip np-chip--select" title="System wechseln">
              <span className="np-dot" />
              <select className="np-chip-select" value={profilId ?? ''} onChange={e => setProfilId(Number(e.target.value))}>
                {profile.map(p => <option key={p.id} value={p.id}>{`${p.hersteller} ${p.system}`.trim()}</option>)}
              </select>
            </label>
            <span className="np-chip">Maß <b>{Math.round(breiteGes).toLocaleString('de-DE')} × {Math.round(hoeheGes).toLocaleString('de-DE')} mm</b></span>
            <span className="np-chip">Fläche <b>{flaeche.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²</b></span>
            {aktiv.verbunden ? (
              <div className="np-merge">
                <span className="np-merge-label">Trennen</span>
                <button className="np-merge-ja" onClick={trenne}>Ja</button>
              </div>
            ) : mergePartner ? (
              <div className="np-merge">
                <span className="np-merge-label">Verbinden</span>
                <button className="np-merge-ja" onClick={verbinde}>Ja</button>
              </div>
            ) : null}
          </div>
          {/* Mobiler In-Fluss-Knopf oben (Desktop nutzt den runden FAB in der Zeichnung) */}
          {!istAluSystem && (
            <button className="np-add-inline" onClick={() => setAddMenu(v => !v)}>+ Element hinzufügen</button>
          )}
          <div className="np-canvas">
            {istKombi ? (
              <KombinationsZeichnung elemente={elemente} activeId={activeId}
                onUnitClick={switchActive} onPaneClick={setSelectedPane} selectedPane={selectedPane}
                onDock={dockElement} onSlide={slideElement}
                onTotalBreite={setTotalBreite} onTotalHoehe={setTotalHoehe}
                onElementBreite={setElementBreite} onElementHoehe={setElementHoehe} />
            ) : (
              <FensterZeichnung geometrie={geometrie} breite={aktiv.breite} hoehe={aktiv.hoehe}
                verbreiterung={aktiv.verbreiterung ? aktiv.verb : null}
                aufsatzkasten={aktiv.aufsatzkasten ? aktiv.kasten : null}
                schwelle={aktiv.schwelle}
                oberlichtHoehe={aktiv.oberlichtHoehe}
                glasFarbe={aktiv.ornament ? '#7fb0cc' : undefined}
                onBreite={setMainBreite} onHoehe={setMainHoehe}
                onOberlichtHoehe={setOberlichtHoehe} onBottomHoehe={setBottomHoehe}
                panes={aktiv.panes} cols={aktiv.cols}
                colWidths={aktiv.colWidths} rowHeights={aktiv.rowHeights}
                onColWidth={setColWidth} onRowHeight={setRowHeight}
                onPaneClick={setSelectedPane} selectedPane={selectedPane} />
            )}

            {selectedPane != null && (
              <div className="pane-menu-backdrop" onClick={() => setSelectedPane(null)} />
            )}
            {selectedPane != null && (
              <div className="pane-menu">
                <div className="pane-menu-head">
                  <span>Feld {selectedPane + 1} – Öffnungsart</span>
                  <button className="pane-menu-close" onClick={() => setSelectedPane(null)}>✕</button>
                </div>
                {paneOptionenFuer(geometrieByCode(aktiv.code)).map(opt => {
                  const ja = JSON.stringify(aktiv.panes[selectedPane]) === JSON.stringify(opt.cfg);
                  return (
                    <button key={opt.label} className={'pane-option' + (ja ? ' aktiv' : '')} onClick={() => setzePane(opt.cfg)}>
                      <span className="pane-option-thumb">
                        <GeometrieThumb geometrie={opt.cfg.fest ? { open: 'fest' } : opt.cfg} />
                      </span>
                      <span className="pane-option-label">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="np-canvas-caption">
            <div className="np-canvas-title">
              {istKombi ? `Fensterkombination · ${elemente.length} Elemente` : fensterBezeichnung(geometrie, aktiv.panes, aktiv.cols)}
            </div>
            <span className="np-canvas-badge">{istKombi ? `aktiv: ${aktiv.code}` : aktiv.code}</span>
          </div>

          {/* + Element hinzufügen — Desktop: runder Knopf unten links in der Ecke */}
          {!istAluSystem && (
            <button className="np-add-fab" onClick={() => setAddMenu(v => !v)} title="Element hinzufügen">+</button>
          )}
          {addMenu && (
            <div className="pane-menu-backdrop" onClick={() => setAddMenu(false)} />
          )}
          {addMenu && (
            <div className="np-add-menu">
              <div className="pane-menu-head">
                <span>Element hinzufügen</span>
                <button className="pane-menu-close" onClick={() => setAddMenu(false)}>✕</button>
              </div>
              <button className="pane-option" onClick={() => addElement('fenster')}>
                <span className="pane-option-thumb"><GeometrieThumb geometrie={geometrieByCode('F01')} /></span>
                <span className="pane-option-label">Fenster hinzufügen</span>
              </button>
              <button className="pane-option" onClick={() => addElement('tuer')}>
                <span className="pane-option-thumb"><GeometrieThumb geometrie={geometrieByCode('T01')} /></span>
                <span className="pane-option-label">Tür hinzufügen</span>
              </button>
            </div>
          )}
        </section>

        {/* Rechte Spalte */}
        <aside className="np-col np-col--right">
          <div className="np-group-label">FARBEN</div>
          <label className="np-field-label">Innenfarbe</label>
          <select className="np-select np-select--block np-select--tall" value={aktiv.innenfarbe} onChange={e => waehleFarbe('innenfarbe', e.target.value)}>
            {aktiv.innenfarbe && !farbOptionen.some(o => o.value === aktiv.innenfarbe) && <option value={aktiv.innenfarbe}>{aktiv.innenfarbe}</option>}
            {farbOptionen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            <option value="__manuell__">✏️ Manuell eingeben…</option>
          </select>
          <label className="np-field-label">Außenfarbe</label>
          <select className="np-select np-select--block np-select--tall" value={aktiv.aussenfarbe} onChange={e => waehleFarbe('aussenfarbe', e.target.value)}>
            {aktiv.aussenfarbe && !farbOptionen.some(o => o.value === aktiv.aussenfarbe) && <option value={aktiv.aussenfarbe}>{aktiv.aussenfarbe}</option>}
            {farbOptionen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            <option value="__manuell__">✏️ Manuell eingeben…</option>
          </select>

          <div className="np-group-label" style={{ marginTop: 24 }}>VERGLASUNG</div>
          <label className="np-field-label">Verglasung</label>
          <select className="np-select np-select--block" value={aktiv.verglasung} onChange={e => updAktiv({ verglasung: e.target.value })}>
            {VERGLASUNGEN.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <label className="np-check"><input type="checkbox" checked={aktiv.vsg} onChange={e => updAktiv({ vsg: e.target.checked })} /> VSG-Sicherheitsverglasung</label>
          <label className="np-check"><input type="checkbox" checked={aktiv.ornament} onChange={e => updAktiv({ ornament: e.target.checked })} /> Ornament</label>
          {aktiv.ornament && (
            <>
              <label className="np-field-label">Art des Glases</label>
              <input
                className="np-input np-input--rot"
                value={aktiv.ornamentArt}
                onChange={e => updAktiv({ ornamentArt: e.target.value })}
                placeholder="z.B. Mastercarré, Chinchilla"
              />
            </>
          )}

          {!istHaustuerAktiv && (
          <>
          <div className="np-group-label" style={{ marginTop: 24 }}>DICHTUNGEN</div>
          <div className="np-row">
            <div>
              <label className="np-field-label">Dichtung innen</label>
              <select className="np-select np-select--block" value={aktiv.dichtungInnen} onChange={e => updAktiv({ dichtungInnen: e.target.value })}>
                {DICHTUNGEN.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="np-field-label">Dichtung außen</label>
              <select className="np-select np-select--block" value={aktiv.dichtungAussen} onChange={e => updAktiv({ dichtungAussen: e.target.value })}>
                {DICHTUNGEN.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          </>
          )}

          <div className="np-group-label" style={{ marginTop: 24 }}>PRODUKTIONSKOMMENTAR</div>
          <RichTextEditor key={activeId} initialHtml={aktiv.kommentar} onChange={html => updAktiv({ kommentar: html })} placeholder="Kommentar für die Produktion…" minHeight={110} />
        </aside>
      </div>

      {/* Fußzeile */}
      <footer className="np-footer">
        <div className="np-footer-kosten">
          <div className="np-kosten-feld">
            <label>MONTAGE</label>
            <div className="np-euro-input"><span>€</span><input type="number" value={montage} disabled={ohneMontage} onChange={e => setMontage(e.target.value)} /></div>
          </div>
          <div className="np-kosten-feld">
            <label>AUSBAU</label>
            <div className="np-euro-input"><span>€</span><input type="number" value={ausbau} disabled={ohneMontage} onChange={e => setAusbau(e.target.value)} /></div>
          </div>
          <div className="np-kosten-feld">
            <label>ENTSORGUNG</label>
            <div className="np-euro-input"><span>€</span><input type="number" value={entsorgung} disabled={ohneMontage} onChange={e => setEntsorgung(e.target.value)} /></div>
          </div>
          <label className="np-check np-check--inline"><input type="checkbox" checked={ohneMontage} onChange={e => setOhneMontage(e.target.checked)} /> Ohne Montage</label>
        </div>

        <div className="np-footer-preis">
          <div className="np-netto">
            <label>{istKombi ? `NETTO ${istMain ? 'HAUPTELEMENT' : 'ELEMENT ' + (elemente.findIndex(e => e.id === activeId) + 1)}` : 'NETTOPREIS JE STÜCK'}</label>
            <div className="np-euro-input np-euro-input--lg"><span>€</span>
              <input type="number" value={aktiv.nettoJeStueck} onChange={e => updAktiv({ nettoJeStueck: e.target.value })} />
            </div>
            {istKombi && <span className="np-netto-summe">Σ alle Elemente: {summeNetto.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>}
            <span className="np-netto-gesamt">
              Gesamt je Stück inkl. Montage, Ausbau &amp; Entsorgung: <b>{proStueck.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</b>
              {ohneMontage && <em> (ohne Montage)</em>}
            </span>
          </div>
          <div className="np-footer-actions">
            <button className="btn btn-outline" onClick={onClose}>Abbrechen</button>
            <button className="btn btn-primary btn-red" onClick={handleSave}>Speichern</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default NeuePositionEditor;
