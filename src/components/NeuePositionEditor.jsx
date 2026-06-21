import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import FensterZeichnung, { GEOMETRIEN, geometrieByCode, GeometrieThumb, fensterBezeichnung } from './FensterZeichnung';
import GeometrieSelect from './GeometrieSelect';
import RichTextEditor from './RichTextEditor';

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

function euro(n) {
  return Number(n || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function NeuePositionEditor({ kundeName, onClose, onSave, initial }) {
  const [profile, setProfile] = useState([]);
  const [katalog, setKatalog] = useState({}); // name -> code
  const [profilId, setProfilId] = useState(initial?.profilId ?? null);

  const [kategorie, setKategorie] = useState(initial?.kategorie ?? 'fenster');
  const [code, setCode] = useState(initial?.code ?? 'F01');
  const initGeo = geometrieByCode(initial?.code ?? 'F01');
  const initPanes = initial?.panes ?? panesFromGeo(initGeo);
  const initCols = initial?.cols ?? (initGeo?.cols || initPanes.length);
  const initRows = Math.ceil(initPanes.length / initCols);
  const initBreite = initial?.breite ?? 1000;
  const initHoehe = initial?.hoehe ?? 1200;
  const [panes, setPanes] = useState(initPanes);
  const [cols, setCols] = useState(initCols);
  const [selectedPane, setSelectedPane] = useState(null);
  const [breite, setBreite] = useState(initBreite);
  const [hoehe, setHoehe] = useState(initHoehe);
  const [colWidths, setColWidths] = useState(initial?.colWidths ?? Array(initCols).fill(Math.round(initBreite / initCols)));
  const [rowHeights, setRowHeights] = useState(initial?.rowHeights ?? Array(initRows).fill(Math.round(initHoehe / initRows)));
  const [stueckzahl, setStueckzahl] = useState(initial?.stueckzahl ?? 1);
  const [standort, setStandort] = useState(initial?.standort ?? '');

  const [verbreiterung, setVerbreiterung] = useState(initial?.verbreiterung ?? false);
  const [verb, setVerb] = useState(initial?.verb ?? { oben: 0, unten: 0, links: 0, rechts: 0 });
  const [aufsatzkasten, setAufsatzkasten] = useState(initial?.aufsatzkasten ?? false);
  const [kasten, setKasten] = useState(initial?.kasten ?? {
    kastenhoehe: 165, bedienung: 'Gurt', bedienungsseite: 'rechts', lamellenfarbe: '', lamellentyp: 'Alulamelle',
  });
  const [rollladen, setRollladen] = useState(initial?.rollladen && initial.rollladen !== 'ohne' ? initial.rollladen : '');

  const [innenfarbe, setInnenfarbe] = useState(initial?.innenfarbe ?? 'WEISS');
  const [aussenfarbe, setAussenfarbe] = useState(initial?.aussenfarbe ?? 'WEISS');
  const [verglasung, setVerglasung] = useState(initial?.verglasung ?? VERGLASUNGEN[0]);
  const [vsg, setVsg] = useState(initial?.vsg ?? false);
  const [ornament, setOrnament] = useState(initial?.ornament ?? false);
  const [ornamentArt, setOrnamentArt] = useState(initial?.ornamentArt ?? '');
  const [dichtungInnen, setDichtungInnen] = useState(initial?.dichtungInnen ?? 'Grau');
  const [dichtungAussen, setDichtungAussen] = useState(initial?.dichtungAussen ?? 'Grau');
  const [kommentar, setKommentar] = useState(initial?.kommentar ?? '');

  const [montage, setMontage] = useState(initial?.montage ?? 140);
  const [ausbau, setAusbau] = useState(initial?.ausbau ?? 30);
  const [entsorgung, setEntsorgung] = useState(initial?.entsorgung ?? 15);
  const [ohneMontage, setOhneMontage] = useState(initial?.ohneMontage ?? false);
  const [nettoJeStueck, setNettoJeStueck] = useState(initial?.nettoJeStueck ?? 0);

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
  const geometrie = geometrieByCode(code);
  const geomOptionen = GEOMETRIEN.filter(g => g.kategorie === kategorie);

  // Farboptionen aus dem gewählten Profil
  const farbOptionen = useMemo(() => {
    const namen = profil?.farben ?? [];
    return namen.map(name => ({ value: name, label: katalog[name] ? `${katalog[name]} -- ${name}` : name }));
  }, [profil, katalog]);

  function waehleGeometrie(neuCode) {
    setCode(neuCode);
    const geo = geometrieByCode(neuCode);
    const np = panesFromGeo(geo);
    const c = geo?.cols || np.length;
    const r = Math.ceil(np.length / c);
    setPanes(np);
    setCols(c);
    setColWidths(Array(c).fill(Math.round((Number(breite) || 1000) / c)));
    setRowHeights(Array(r).fill(Math.round((Number(hoehe) || 1200) / r)));
    setSelectedPane(null);
  }

  function setMainBreite(val) {
    setBreite(val);
    const n = cols;
    setColWidths(Array(n).fill(Math.round((Number(val) || 0) / n)));
  }
  function setMainHoehe(val) {
    setHoehe(val);
    const n = Math.ceil(panes.length / cols);
    setRowHeights(Array(n).fill(Math.round((Number(val) || 0) / n)));
  }
  function setColWidth(i, val) {
    const next = colWidths.map((c, idx) => (idx === i ? (Number(val) || 0) : c));
    setColWidths(next);
    setBreite(next.reduce((a, c) => a + c, 0));
  }
  function setRowHeight(i, val) {
    const next = rowHeights.map((rr, idx) => (idx === i ? (Number(val) || 0) : rr));
    setRowHeights(next);
    setHoehe(next.reduce((a, c) => a + c, 0));
  }

  function wechselKategorie(k) {
    setKategorie(k);
    const erste = GEOMETRIEN.find(g => g.kategorie === k);
    if (erste) waehleGeometrie(erste.code);
  }

  function setzePane(cfg) {
    if (selectedPane == null) return;
    setPanes(panes.map((p, i) => (i === selectedPane ? { ...cfg } : p)));
    setSelectedPane(null);
  }

  const flaeche = (Number(breite) * Number(hoehe)) / 1_000_000; // m²
  const zuschlag = ohneMontage ? 0 : Number(montage) + Number(ausbau) + Number(entsorgung);
  const proStueck = Number(nettoJeStueck) + zuschlag;
  const gesamt = proStueck * Number(stueckzahl || 1);
  const systemLabel = profil ? `${profil.hersteller} ${profil.system}`.trim() : '—';

  function buildBeschreibung() {
    const farbe = (name) => katalog[name] ? `${katalog[name]} ${name}` : name;
    const teile = [
      `<strong>${fensterBezeichnung(geometrie, panes, cols)} (${code})</strong>`,
      `${Math.round(breite)} × ${Math.round(hoehe)} mm · ${flaeche.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`,
      systemLabel,
      `Innen ${farbe(innenfarbe)} / Außen ${farbe(aussenfarbe)}`,
      verglasung + (vsg ? ', VSG' : '') + (ornament ? `, Ornament${ornamentArt ? ` (${ornamentArt})` : ''}` : ''),
      `Dichtung innen/außen: ${dichtungInnen}/${dichtungAussen}`,
    ];
    if (verbreiterung) {
      const seiten = ['oben', 'unten', 'links', 'rechts']
        .filter(k => Number(verb[k]) > 0)
        .map(k => `${k} ${Number(verb[k])} mm`);
      teile.push('Verbreiterung' + (seiten.length ? ': ' + seiten.join(', ') : ''));
    }
    if (aufsatzkasten) {
      teile.push(`Aufsatzkasten ${Number(kasten.kastenhoehe) || 0} mm, ${kasten.bedienung} (${kasten.bedienungsseite})`
        + (kasten.lamellentyp ? `, ${kasten.lamellentyp}` : '')
        + (kasten.lamellenfarbe ? ` ${kasten.lamellenfarbe}` : ''));
    }
    if (rollladen && rollladen !== 'ohne') teile.push(`Rollladenführung ${rollladen}`);
    if (standort) teile.push(`Standort: ${standort}`);
    if (ohneMontage) teile.push('ohne Montage');
    const komText = (kommentar || '').replace(/<[^>]*>/g, '').trim();
    if (komText) teile.push(`Kommentar: ${kommentar}`);
    return `<div>${teile.join('<br>')}</div>`;
  }

  function handleSave() {
    const config = {
      profilId, kategorie, code, panes, cols, colWidths, rowHeights, breite: Number(breite), hoehe: Number(hoehe),
      stueckzahl: Number(stueckzahl), standort, verbreiterung, verb, aufsatzkasten, kasten, rollladen,
      innenfarbe, aussenfarbe, verglasung, vsg, ornament, ornamentArt, dichtungInnen, dichtungAussen,
      kommentar, montage: Number(montage), ausbau: Number(ausbau), entsorgung: Number(entsorgung),
      ohneMontage, nettoJeStueck: Number(nettoJeStueck),
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
          <div className="np-group-label">TYP &amp; GEOMETRIE</div>

          <label className="np-field-label">Kategorie</label>
          <div className="np-segmented">
            <button className={kategorie === 'fenster' ? 'active' : ''} onClick={() => wechselKategorie('fenster')}>Fenster</button>
            <button className={kategorie === 'tuer' ? 'active' : ''} onClick={() => wechselKategorie('tuer')}>Tür</button>
          </div>

          <label className="np-field-label">Geometrie</label>
          <GeometrieSelect optionen={geomOptionen} value={code} onChange={waehleGeometrie} panes={panes} cols={cols} />

          <div className="np-group-label" style={{ marginTop: 24 }}>MASSE</div>
          <div className="np-row">
            <div>
              <label className="np-field-label">Breite (mm)</label>
              <input className="np-input" type="number" value={breite} onChange={e => setMainBreite(e.target.value)} />
            </div>
            <div>
              <label className="np-field-label">Höhe (mm)</label>
              <input className="np-input" type="number" value={hoehe} onChange={e => setMainHoehe(e.target.value)} />
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
            <button className={!verbreiterung ? 'active' : ''} onClick={() => setVerbreiterung(false)}>nein</button>
            <button className={verbreiterung ? 'active' : ''} onClick={() => setVerbreiterung(true)}>ja</button>
          </div>
          {verbreiterung && (
            <div className="np-verb">
              {[['oben', 'oben'], ['unten', 'unten'], ['links', 'links'], ['rechts', 'rechts']].map(([key, label]) => (
                <div key={key}>
                  <label className="np-field-label">{label} (mm)</label>
                  <input
                    className="np-input"
                    type="number"
                    min="0"
                    value={verb[key]}
                    onChange={e => setVerb({ ...verb, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}
          <label className="np-field-label">Aufsatzkasten</label>
          <div className="np-segmented">
            <button className={!aufsatzkasten ? 'active' : ''} onClick={() => setAufsatzkasten(false)}>nein</button>
            <button className={aufsatzkasten ? 'active' : ''} onClick={() => setAufsatzkasten(true)}>ja</button>
          </div>
          {aufsatzkasten && (
            <div className="np-sub">
              <label className="np-field-label">Kastenhöhe (mm)</label>
              <input className="np-input" type="number" min="0" value={kasten.kastenhoehe}
                     onChange={e => setKasten({ ...kasten, kastenhoehe: e.target.value })} />

              <label className="np-field-label">Bedienung</label>
              <div className="np-segmented">
                <button className={kasten.bedienung === 'Gurt' ? 'active' : ''} onClick={() => setKasten({ ...kasten, bedienung: 'Gurt' })}>Gurt</button>
                <button className={kasten.bedienung === 'Motor' ? 'active' : ''} onClick={() => setKasten({ ...kasten, bedienung: 'Motor' })}>Motor</button>
              </div>

              <label className="np-field-label">Bedienungsseite</label>
              <div className="np-segmented">
                <button className={kasten.bedienungsseite === 'links' ? 'active' : ''} onClick={() => setKasten({ ...kasten, bedienungsseite: 'links' })}>links</button>
                <button className={kasten.bedienungsseite === 'rechts' ? 'active' : ''} onClick={() => setKasten({ ...kasten, bedienungsseite: 'rechts' })}>rechts</button>
              </div>

              <label className="np-field-label">Lamellenfarbe</label>
              <input className="np-input" value={kasten.lamellenfarbe}
                     onChange={e => setKasten({ ...kasten, lamellenfarbe: e.target.value })} />

              <label className="np-field-label">Lamellentyp</label>
              <input className="np-input" value={kasten.lamellentyp}
                     onChange={e => setKasten({ ...kasten, lamellentyp: e.target.value })} />
            </div>
          )}
          <label className="np-field-label">Rollladenführung</label>
          <input
            className="np-input"
            list="rollladen-liste"
            value={rollladen}
            onChange={e => setRollladen(e.target.value)}
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
            <span className="np-chip">Maß <b>{Number(breite).toLocaleString('de-DE')} × {Number(hoehe).toLocaleString('de-DE')} mm</b></span>
            <span className="np-chip">Fläche <b>{flaeche.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²</b></span>
          </div>
          <div className="np-canvas">
            <FensterZeichnung geometrie={geometrie} breite={breite} hoehe={hoehe}
              verbreiterung={verbreiterung ? verb : null}
              aufsatzkasten={aufsatzkasten ? kasten : null}
              glasFarbe={ornament ? '#7fb0cc' : undefined}
              onBreite={setMainBreite} onHoehe={setMainHoehe}
              panes={panes} cols={cols}
              colWidths={colWidths} rowHeights={rowHeights}
              onColWidth={setColWidth} onRowHeight={setRowHeight}
              onPaneClick={setSelectedPane} selectedPane={selectedPane} />

            {selectedPane != null && (
              <div className="pane-menu">
                <div className="pane-menu-head">
                  <span>Feld {selectedPane + 1} – Öffnungsart</span>
                  <button className="pane-menu-close" onClick={() => setSelectedPane(null)}>✕</button>
                </div>
                {PANE_OPTIONEN.map(opt => {
                  const aktiv = JSON.stringify(panes[selectedPane]) === JSON.stringify(opt.cfg);
                  return (
                    <button key={opt.label} className={'pane-option' + (aktiv ? ' aktiv' : '')} onClick={() => setzePane(opt.cfg)}>
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
            <div className="np-canvas-title">{fensterBezeichnung(geometrie, panes, cols)}</div>
            <span className="np-canvas-badge">{code}</span>
          </div>
        </section>

        {/* Rechte Spalte */}
        <aside className="np-col np-col--right">
          <div className="np-group-label">FARBEN</div>
          <label className="np-field-label">Innenfarbe</label>
          <select className="np-select np-select--block np-select--tall" value={innenfarbe} onChange={e => setInnenfarbe(e.target.value)}>
            {farbOptionen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label className="np-field-label">Außenfarbe</label>
          <select className="np-select np-select--block np-select--tall" value={aussenfarbe} onChange={e => setAussenfarbe(e.target.value)}>
            {farbOptionen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="np-group-label" style={{ marginTop: 24 }}>VERGLASUNG</div>
          <label className="np-field-label">Verglasung</label>
          <select className="np-select np-select--block" value={verglasung} onChange={e => setVerglasung(e.target.value)}>
            {VERGLASUNGEN.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <label className="np-check"><input type="checkbox" checked={vsg} onChange={e => setVsg(e.target.checked)} /> VSG-Sicherheitsverglasung</label>
          <label className="np-check"><input type="checkbox" checked={ornament} onChange={e => setOrnament(e.target.checked)} /> Ornament</label>
          {ornament && (
            <>
              <label className="np-field-label">Art des Glases</label>
              <input
                className="np-input np-input--rot"
                value={ornamentArt}
                onChange={e => setOrnamentArt(e.target.value)}
                placeholder="z.B. Mastercarré, Chinchilla"
              />
            </>
          )}

          <div className="np-group-label" style={{ marginTop: 24 }}>DICHTUNGEN</div>
          <div className="np-row">
            <div>
              <label className="np-field-label">Dichtung innen</label>
              <select className="np-select np-select--block" value={dichtungInnen} onChange={e => setDichtungInnen(e.target.value)}>
                {DICHTUNGEN.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="np-field-label">Dichtung außen</label>
              <select className="np-select np-select--block" value={dichtungAussen} onChange={e => setDichtungAussen(e.target.value)}>
                {DICHTUNGEN.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="np-group-label" style={{ marginTop: 24 }}>PRODUKTIONSKOMMENTAR</div>
          <RichTextEditor initialHtml={initial?.kommentar} onChange={setKommentar} placeholder="Kommentar für die Produktion…" minHeight={110} />
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
            <label>NETTOPREIS JE STÜCK</label>
            <div className="np-euro-input np-euro-input--lg"><span>€</span>
              <input type="number" value={nettoJeStueck} onChange={e => setNettoJeStueck(e.target.value)} />
            </div>
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
