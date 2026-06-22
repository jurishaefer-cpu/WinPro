import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import FensterZeichnung, { GEOMETRIEN, geometrieByCode, GeometrieThumb, fensterBezeichnung, KombinationsZeichnung } from './FensterZeichnung';
import GeometrieSelect from './GeometrieSelect';
import RichTextEditor from './RichTextEditor';
import { kombiMass } from '../lib/belegHelfer';

const VERGLASUNGEN = [
  '2-fach Verglasung, Ug 1,1 mit warmer Kante',
  '3-fach Verglasung, Ug 0,7 mit warmer Kante',
];
const DICHTUNGEN = ['Grau', 'Schwarz'];
const ROLLLADEN = ['42x42mm'];

// Öffnungsarten je Flügel (Auswahlmenü)
const PANE_OPTIONEN = [
  { label: 'Drehkipp DIN Links', cfg: { open: 'drehkipp', din: 'links' } },
  { label: 'Drehkipp DIN Rechts', cfg: { open: 'drehkipp', din: 'rechts' } },
  { label: 'Dreh DIN Links', cfg: { open: 'dreh', din: 'links' } },
  { label: 'Dreh DIN Rechts', cfg: { open: 'dreh', din: 'rechts' } },
  { label: 'Kippfenster', cfg: { open: 'kipp' } },
  { label: 'Festverglasung', cfg: { fest: true } },
];

function panesFromGeo(geo) {
  if (!geo) return [{ open: 'drehkipp', din: 'links' }];
  if (geo.panes) return geo.panes.map(p => ({ ...p }));
  if (geo.open === 'fest') return [{ fest: true }];
  if (geo.open === 'tuer') return [{ open: 'tuer', din: geo.din }];
  return [{ open: geo.open, din: geo.din }];
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
    colWidths: src?.colWidths ?? Array(cols).fill(Math.round(breite / cols)),
    rowHeights: src?.rowHeights ?? Array(rows).fill(Math.round(hoehe / rows)),
    breite,
    hoehe,
    verbreiterung: src?.verbreiterung ?? false,
    verb: src?.verb ?? { oben: 0, unten: 0, links: 0, rechts: 0 },
    aufsatzkasten: src?.aufsatzkasten ?? false,
    kasten: src?.kasten ?? { ...DEFAULT_KASTEN },
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
  };
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
  const istMain = aktiv && aktiv.id === elemente[0].id;
  const geometrie = geometrieByCode(aktiv.code);
  const geomOptionen = GEOMETRIEN.filter(g => g.kategorie === aktiv.kategorie);
  const istKombi = elemente.length > 1;

  // Farboptionen aus dem gewählten Profil
  const farbOptionen = useMemo(() => {
    const namen = profil?.farben ?? [];
    return namen.map(name => ({ value: name, label: katalog[name] ? `${katalog[name]} -- ${name}` : name }));
  }, [profil, katalog]);

  // --- aktives Element ändern ---
  function updAktiv(patch) {
    setElemente(prev => prev.map(e => (e.id === activeId ? { ...e, ...patch } : e)));
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
    updAktiv({
      code: neuCode,
      panes: np,
      cols: c,
      colWidths: Array(c).fill(Math.round((Number(aktiv.breite) || 1000) / c)),
      rowHeights: Array(r).fill(Math.round((Number(aktiv.hoehe) || 1200) / r)),
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
    const breite = isT ? 1000 : 600;
    const hoehe = Number(main.hoehe) || 1200;           // gleiche Höhe → kein Spalt (eine Zeile)
    const maxCol = Math.max(...elemente.map(e => e.col ?? 0));
    const neu = makeElement({
      kategorie: kat, code, breite, hoehe, row: 0, col: maxCol + 1,
      innenfarbe: main.innenfarbe, aussenfarbe: main.aussenfarbe,
      verglasung: main.verglasung, dichtungInnen: main.dichtungInnen, dichtungAussen: main.dichtungAussen,
    }, id);
    setElemente(prev => [...prev, neu]);
    setActiveId(id);
    setSelectedPane(null);
    setAddMenu(false);
  }
  function removeElement(id) {
    if (id === elemente[0].id) return;                  // Hauptelement bleibt
    const rest = elemente.filter(e => e.id !== id);
    setElemente(rest);
    if (activeId === id) setActiveId(rest[0].id);
    setSelectedPane(null);
  }
  // Element an eine Seite des Hauptfensters andocken (Drag im Canvas)
  function dockElement(id, side, targetId) {
    setElemente(prev => {
      // An die freie Kante des Ziel-Elements docken (Fallback: Hauptelement).
      const target = (targetId != null && prev.find(e => e.id === targetId)) || prev[0];
      let row = target.row ?? 0, col = target.col ?? 0;
      if (side === 'rechts') col = (target.col ?? 0) + 1;
      else if (side === 'links') col = (target.col ?? 0) - 1;
      else if (side === 'unten') row = (target.row ?? 0) + 1;
      else if (side === 'oben') row = (target.row ?? 0) - 1;
      // Maße bleiben unabhängig – nur die Rasterposition ändert sich; Versatz zurücksetzen.
      let next = prev.map(e => (e.id === id ? { ...e, row, col, offset: undefined } : e));
      const minR = Math.min(...next.map(e => e.row ?? 0));
      const minC = Math.min(...next.map(e => e.col ?? 0));
      next = next.map(e => ({ ...e, row: (e.row ?? 0) - minR, col: (e.col ?? 0) - minC }));
      return next;
    });
  }
  // Element entlang seiner Andock-Kante verschieben (Versatz in mm)
  function slideElement(id, offsetMm) {
    setElemente(prev => prev.map(e => (e.id === id ? { ...e, offset: offsetMm } : e)));
  }
  // Maße in der Kombi-Zeichnung editieren
  function setColBreite(col, val) {
    setElemente(prev => prev.map(e => {
      if ((e.col ?? 0) !== col) return e;
      const n = e.cols || 1;
      return { ...e, breite: val, colWidths: Array(n).fill(Math.round((Number(val) || 0) / n)) };
    }));
  }
  function setElementHoehe(id, val) {
    setElemente(prev => prev.map(e => {
      if (e.id !== id) return e;
      const r = Math.ceil(e.panes.length / e.cols);
      return { ...e, hoehe: val, rowHeights: Array(r).fill(Math.round((Number(val) || 0) / r)) };
    }));
  }
  function setTotalBreite(val) {
    const v = Number(val);
    setElemente(prev => {
      const cur = kombiMass(prev).w;
      if (!Number.isFinite(v) || v <= 0 || cur <= 0) return prev;
      const f = v / cur;
      return prev.map(e => {
        const nb = Math.max(200, Math.round((Number(e.breite) || 1000) * f));
        const n = e.cols || 1;
        return { ...e, breite: nb, colWidths: Array(n).fill(Math.round(nb / n)) };
      });
    });
  }
  function setTotalHoehe(val) {
    const v = Number(val);
    setElemente(prev => {
      if (!Number.isFinite(v) || v <= 0) return prev;
      // Gesamthöhe = höchstes Element → dieses (bzw. die gleichhohen) auf den neuen Wert setzen,
      // niedrigere Elemente behalten ihre eigene Höhe.
      const maxH = Math.max(...prev.map(e => Number(e.hoehe) || 0));
      return prev.map(e => {
        if ((Number(e.hoehe) || 0) !== maxH) return e;
        const r = Math.ceil(e.panes.length / e.cols);
        return { ...e, hoehe: v, rowHeights: Array(r).fill(Math.round(v / r)) };
      });
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
      teile.push(`Dichtung innen/außen: ${el.dichtungInnen}/${el.dichtungAussen}`);
      if (el.verbreiterung) {
        const seiten = ['oben', 'unten', 'links', 'rechts'].filter(k => Number(el.verb[k]) > 0).map(k => `${k} ${Number(el.verb[k])} mm`);
        teile.push('Verbreiterung' + (seiten.length ? ': ' + seiten.join(', ') : ''));
      }
      if (el.aufsatzkasten) {
        teile.push(`Aufsatzkasten ${Number(el.kasten.kastenhoehe) || 0} mm, ${el.kasten.bedienung} (${el.kasten.bedienungsseite})`
          + (el.kasten.lamellentyp ? `, ${el.kasten.lamellentyp}` : '')
          + (el.kasten.lamellenfarbe ? ` ${el.kasten.lamellenfarbe}` : ''));
      }
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
      aufsatzkasten: main.aufsatzkasten, kasten: main.kasten, rollladen: main.rollladen,
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
              {istMain ? 'Hauptelement' : `Element ${elemente.findIndex(e => e.id === activeId) + 1}`} wird bearbeitet
              {!istMain && (
                <button className="np-aktiv-remove" onClick={() => removeElement(activeId)} title="Dieses Element entfernen">Entfernen</button>
              )}
            </div>
          )}
          <div className="np-group-label">TYP &amp; GEOMETRIE</div>

          <label className="np-field-label">Kategorie</label>
          <div className="np-segmented">
            <button className={aktiv.kategorie === 'fenster' ? 'active' : ''} onClick={() => wechselKategorie('fenster')}>Fenster</button>
            <button className={aktiv.kategorie === 'tuer' ? 'active' : ''} onClick={() => wechselKategorie('tuer')}>Tür</button>
          </div>

          <label className="np-field-label">Geometrie</label>
          <GeometrieSelect optionen={geomOptionen} value={aktiv.code} onChange={waehleGeometrie} panes={aktiv.panes} cols={aktiv.cols} />

          <div className="np-group-label" style={{ marginTop: 24 }}>MASSE</div>
          <div className="np-row">
            <div>
              <label className="np-field-label">Breite (mm)</label>
              <input className="np-input" type="number" value={aktiv.breite} onChange={e => setMainBreite(e.target.value)} />
            </div>
            <div>
              <label className="np-field-label">Höhe (mm)</label>
              <input className="np-input" type="number" value={aktiv.hoehe} onChange={e => setMainHoehe(e.target.value)} />
            </div>
          </div>
          <div className="np-row">
            <div>
              <label className="np-field-label">Stückzahl</label>
              <input className="np-input" type="number" min="1" value={stueckzahl} onChange={e => setStueckzahl(e.target.value)} />
            </div>
            <div>
              <label className="np-field-label">Standort</label>
              <input className="np-input" value={standort} onChange={e => setStandort(e.target.value)} placeholder="z. B. EG Küche" />
            </div>
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
        </aside>

        {/* Mitte: Zeichnung */}
        <section className="np-col np-col--center">
          <div className="np-chips">
            <span className="np-chip"><span className="np-dot" /> {systemLabel}</span>
            <span className="np-chip">Maß <b>{Math.round(breiteGes).toLocaleString('de-DE')} × {Math.round(hoeheGes).toLocaleString('de-DE')} mm</b></span>
            <span className="np-chip">Fläche <b>{flaeche.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²</b></span>
          </div>
          {/* Mobiler In-Fluss-Knopf oben (Desktop nutzt den runden FAB in der Zeichnung) */}
          <button className="np-add-inline" onClick={() => setAddMenu(v => !v)}>+ Element hinzufügen</button>
          <div className="np-canvas">
            {istKombi ? (
              <KombinationsZeichnung elemente={elemente} activeId={activeId}
                onUnitClick={switchActive} onPaneClick={setSelectedPane} selectedPane={selectedPane}
                onDock={dockElement} onSlide={slideElement}
                onTotalBreite={setTotalBreite} onTotalHoehe={setTotalHoehe}
                onColBreite={setColBreite} onElementHoehe={setElementHoehe} />
            ) : (
              <FensterZeichnung geometrie={geometrie} breite={aktiv.breite} hoehe={aktiv.hoehe}
                verbreiterung={aktiv.verbreiterung ? aktiv.verb : null}
                aufsatzkasten={aktiv.aufsatzkasten ? aktiv.kasten : null}
                glasFarbe={aktiv.ornament ? '#7fb0cc' : undefined}
                onBreite={setMainBreite} onHoehe={setMainHoehe}
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
                {PANE_OPTIONEN.map(opt => {
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
          <button className="np-add-fab" onClick={() => setAddMenu(v => !v)} title="Element hinzufügen">+</button>
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
          <select className="np-select np-select--block np-select--tall" value={aktiv.innenfarbe} onChange={e => updAktiv({ innenfarbe: e.target.value })}>
            {farbOptionen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label className="np-field-label">Außenfarbe</label>
          <select className="np-select np-select--block np-select--tall" value={aktiv.aussenfarbe} onChange={e => updAktiv({ aussenfarbe: e.target.value })}>
            {farbOptionen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
