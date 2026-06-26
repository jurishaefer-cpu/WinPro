import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import ManuellePositionModal from '../components/ManuellePositionModal';
import NeuePositionEditor from '../components/NeuePositionEditor';
import FensterZeichnung, { geometrieByCode, KombinationsZeichnung, RolloZeichnung } from '../components/FensterZeichnung';
import BelegModal from '../components/BelegModal';
import { ladeBelegEinstellungen } from '../lib/einstellungen';
import { nummernConfig, formatBelegnummer, parseBelegnummer } from '../lib/belegHelfer';

const STUFEN = ['Angebot', 'Auftragsbestätigung', 'Bestellung', 'Rechnung'];
const SUBTITLE = {
  Angebot: 'Positionen werden erfasst. Angebot kann an den Kunden gesendet werden.',
  Auftragsbestätigung: 'Auftrag bestätigt.',
  Bestellung: 'Bestellung ausgelöst.',
  Rechnung: 'Rechnung erstellt.',
};

function euro(n) {
  return Number(n || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

const MWST_SATZ = 0.19;

// Euro-Eingabe (deutsches Format „1.500,50") in Zahl umwandeln.
function parseEuro(s) {
  const n = parseFloat(String(s ?? '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

// Kategorie einer Position für die Bestellung: 'rollo' | 'fenster' | 'manuell'.
function positionKategorie(p) {
  if (p?.typ === 'fenster') return p.config?.kategorie === 'rollo' ? 'rollo' : 'fenster';
  return 'manuell';
}

function getInitials(k) {
  if (!k) return '?';
  if (k.firma) {
    const t = k.firma.trim().split(/\s+/);
    return ((t[0]?.[0] ?? '') + (t.length > 1 ? t[t.length - 1][0] : (t[0]?.[1] ?? ''))).toUpperCase();
  }
  return ((k.vorname?.[0] ?? '') + (k.nachname?.[0] ?? '')).toUpperCase() || '?';
}

function AngebotEditorPage() {
  const { id: kundeId, angebotId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kunde, setKunde] = useState(null);
  const [angebot, setAngebot] = useState(null);
  const [positionen, setPositionen] = useState([]);
  const [bezeichnung, setBezeichnung] = useState('');
  const [loading, setLoading] = useState(true);
  const [editPos, setEditPos] = useState(null); // manuelle Position: 'neu' oder Positionsobjekt
  const [strukturPos, setStrukturPos] = useState(null); // Fenster/Tür-Editor: 'neu' oder Positionsobjekt
  const [deletePos, setDeletePos] = useState(null);
  const [einstellungen, setEinstellungen] = useState({});
  const [profileMap, setProfileMap] = useState({});
  const [zeigeBeleg, setZeigeBeleg] = useState(null); // Belegart oder null
  const [bestellPrompt, setBestellPrompt] = useState(false); // Auswahl-Dialog vor der Bestellung
  const [bestellFilter, setBestellFilter] = useState([]);    // gewählte Kategorien: ('fenster'|'rollo'|'manuell')[]
  const [angebotPrompt, setAngebotPrompt] = useState(false); // Anzahlungssatz-Abfrage vor dem Angebot
  const [anzahlungProzent, setAnzahlungProzent] = useState('40'); // Anzahlungssatz in %
  const [rechnungPrompt, setRechnungPrompt] = useState(false);
  const [ausfDatum, setAusfDatum] = useState('');
  const [rechnungNr, setRechnungNr] = useState('');      // manuell eingegebene Rechnungs-Nummer (Sequenz)
  const [rechnungBelegt, setRechnungBelegt] = useState(new Set()); // bereits vergebene Rechnungs-Nummern (Jahr)
  const [anzahlungOk, setAnzahlungOk] = useState(true);  // Anzahlung korrekt bezahlt?
  const [anzahlungBetrag, setAnzahlungBetrag] = useState(''); // tatsächlich erhaltene Anzahlung (wenn nicht korrekt)

  useEffect(() => {
    async function laden() {
      setLoading(true);
      const { data: a } = await supabase.from('angebote').select('*').eq('id', angebotId).single();
      if (!a) { navigate(`/kunden/${kundeId}`); return; }
      setAngebot(a);
      setBezeichnung(a.bezeichnung ?? '');
      setAusfDatum(a.ausfuehrungsdatum ?? '');
      const { data: k } = await supabase.from('kunden').select('*').eq('id', kundeId).single();
      setKunde(k);
      const { data: p } = await supabase
        .from('positionen').select('*').eq('angebot_id', angebotId)
        .order('sortierung', { ascending: true }).order('created_at', { ascending: true });
      setPositionen(p ?? []);
      setEinstellungen(await ladeBelegEinstellungen(user.id));
      const { data: prof } = await supabase.from('profile').select('*');
      const map = {}; (prof ?? []).forEach(pr => { map[pr.id] = pr; });
      setProfileMap(map);
      setLoading(false);
    }
    laden();
  }, [angebotId, kundeId, navigate, user?.id]);

  // Belegnummer je Belegart einmalig vergeben (Nummernkreis aus den Einstellungen).
  // seqOverride = manuell gewählte laufende Nummer (z. B. bei Rechnungen); sonst automatisch hochgezählt.
  async function sichereBelegnummer(art, seqOverride = null) {
    // Ohne manuellen Wert nur einmalig vergeben; ein manueller Wert (Rechnung) überschreibt bewusst.
    if (seqOverride == null && angebot.belegnummern?.[art]) return angebot.belegnummern[art];
    const cfg = nummernConfig(einstellungen, art);
    const jahr = new Date().getFullYear();
    let naechste;
    if (seqOverride != null) {
      naechste = Math.max(1, Number(seqOverride) || 1);
    } else {
      const { data: alle } = await supabase.from('angebote').select('belegnummern');
      let max = 0;
      (alle ?? []).forEach(r => {
        const wert = r.belegnummern?.[art];
        if (!wert) return;
        const p = parseBelegnummer(wert);
        if (!p) return;
        if (cfg.jahr && p.jahr != null && p.jahr !== jahr) return;
        max = Math.max(max, p.seq);
      });
      // Automatisch hochgezählt, aber mindestens die in den Einstellungen vorgegebene Startnummer.
      const start = Math.max(1, Number(cfg.start) || 1);
      naechste = Math.max(max + 1, start);
    }
    const nummer = formatBelegnummer(cfg, naechste, jahr);
    const neu = { ...(angebot.belegnummern ?? {}), [art]: nummer };
    await supabase.from('angebote').update({ belegnummern: neu }).eq('id', angebotId);
    setAngebot(a => ({ ...a, belegnummern: neu }));
    return nummer;
  }

  // Rechnung: Dialog zum (Neu-)Erstellen bzw. Ändern der Rechnung öffnen.
  // Auch eine bereits erstellte Rechnung lässt sich so erneut bearbeiten – die vorhandene
  // Nummer wird vorbelegt; sonst die nächste freie Nummer.
  async function starteRechnung() {
    const cfg = nummernConfig(einstellungen, 'Rechnung');
    const jahr = new Date().getFullYear();
    const { data: alle } = await supabase.from('angebote').select('id, belegnummern');
    const belegt = new Set();
    let max = 0;
    (alle ?? []).forEach(r => {
      if (r.id === angebotId) return; // eigene Rechnungsnummer nicht als Kollision werten
      const p = parseBelegnummer(r.belegnummern?.Rechnung);
      if (!p) return;
      if (cfg.jahr && p.jahr != null && p.jahr !== jahr) return;
      belegt.add(p.seq);
      max = Math.max(max, p.seq);
    });
    const eigen = parseBelegnummer(angebot.belegnummern?.Rechnung);
    const start = Math.max(1, Number(cfg.start) || 1);
    setRechnungBelegt(belegt);
    setRechnungNr(String(eigen ? eigen.seq : Math.max(max + 1, start)));
    setAusfDatum(angebot.ausfuehrungsdatum ?? '');
    // Anzahlung: Standard „korrekt bezahlt"; Feld mit der erwarteten Anzahlung (Satz des Angebots) vorbelegen.
    const netto = positionen.reduce((s, p) => s + Number(p.nettopreis || 0) * Number(p.menge || 1), 0);
    const anzSatz = (Number(angebot.anzahlung_prozent ?? 40)) / 100;
    const stdAnz = netto * (1 + MWST_SATZ) * anzSatz;
    setAnzahlungOk(angebot.anzahlung_ok !== false);
    setAnzahlungBetrag(
      angebot.anzahlung_betrag != null
        ? String(angebot.anzahlung_betrag).replace('.', ',')
        : stdAnz.toFixed(2).replace('.', ',')
    );
    setRechnungPrompt(true);
  }

  async function oeffneBeleg(art) {
    if (art === 'Angebot') {
      starteAngebot();
      return;
    }
    if (art === 'Rechnung') {
      await starteRechnung();
      return;
    }
    if (art === 'Bestellung') {
      starteBestellung();
      return;
    }
    await sichereBelegnummer(art);
    setZeigeBeleg(art);
  }

  // Angebot: Anzahlungssatz bestätigen – Voreinstellung immer 40 % (editierbar) – gilt für alle Belege.
  function starteAngebot() {
    setAnzahlungProzent('40');
    setAngebotPrompt(true);
  }

  async function bestaetigeAngebot() {
    const proz = parseEuro(anzahlungProzent);
    const wert = proz > 0 && proz <= 100 ? proz : 40;
    await supabase.from('angebote').update({ anzahlung_prozent: wert }).eq('id', angebotId);
    setAngebot(a => ({ ...a, anzahlung_prozent: wert }));
    setAngebotPrompt(false);
    await sichereBelegnummer('Angebot');
    setZeigeBeleg('Angebot');
  }

  // Bestellung: Auswahl-Dialog öffnen, standardmäßig alle vorhandenen Kategorien vorausgewählt.
  function starteBestellung() {
    const verfuegbar = ['fenster', 'rollo', 'manuell'].filter(k => positionen.some(p => positionKategorie(p) === k));
    setBestellFilter(verfuegbar);
    setBestellPrompt(true);
  }

  function toggleBestell(key) {
    setBestellFilter(f => (f.includes(key) ? f.filter(k => k !== key) : [...f, key]));
  }

  // Bestellung mit den Positionen der ausgewählten Kategorien erzeugen.
  async function bestaetigeBestellung() {
    if (!bestellFilter.length) return;
    setBestellPrompt(false);
    await sichereBelegnummer('Bestellung');
    setZeigeBeleg('Bestellung');
  }

  async function bestaetigeRechnung() {
    const seq = parseInt(String(rechnungNr).replace(/\D/g, ''), 10);
    if (!ausfDatum || !Number.isFinite(seq) || seq < 1) return;
    const updates = {
      anzahlung_ok: anzahlungOk,
      anzahlung_betrag: anzahlungOk ? null : parseEuro(anzahlungBetrag),
    };
    if (ausfDatum !== angebot.ausfuehrungsdatum) updates.ausfuehrungsdatum = ausfDatum;
    await supabase.from('angebote').update(updates).eq('id', angebotId);
    setAngebot(a => ({ ...a, ...updates }));
    await sichereBelegnummer('Rechnung', seq);
    setRechnungPrompt(false);
    setZeigeBeleg('Rechnung');
  }

  // Klick auf eine Stufe im Stepper: Stufe setzen UND passenden Beleg erzeugen/öffnen
  async function klickStufe(index) {
    const art = STUFEN[index];
    if (art !== angebot.status) {
      await supabase.from('angebote').update({ status: art }).eq('id', angebotId);
      setAngebot(a => ({ ...a, status: art }));
    }
    if (art === 'Angebot') {
      starteAngebot();
      return;
    }
    if (art === 'Rechnung') {
      await starteRechnung();
      return;
    }
    if (art === 'Bestellung') {
      starteBestellung();
      return;
    }
    await sichereBelegnummer(art);
    setZeigeBeleg(art);
  }

  const summe = positionen.reduce((s, p) => s + Number(p.nettopreis || 0) * Number(p.menge || 1), 0);
  const stueck = positionen.reduce((s, p) => s + Number(p.menge || 1), 0);
  const stufeIndex = angebot ? Math.max(0, STUFEN.indexOf(angebot.status)) : 0;

  const syncBetrag = useCallback(async (liste) => {
    const betrag = liste.reduce((s, p) => s + Number(p.nettopreis || 0) * Number(p.menge || 1), 0);
    await supabase.from('angebote').update({ betrag }).eq('id', angebotId);
  }, [angebotId]);

  async function speicherBezeichnung() {
    if (bezeichnung === (angebot?.bezeichnung ?? '')) return;
    await supabase.from('angebote').update({ bezeichnung }).eq('id', angebotId);
    setAngebot({ ...angebot, bezeichnung });
  }

  async function persistPosition(data, existing) {
    let liste;
    if (existing && existing !== 'neu') {
      await supabase.from('positionen').update(data).eq('id', existing.id);
      liste = positionen.map(p => (p.id === existing.id ? { ...p, ...data } : p));
    } else {
      const { data: row } = await supabase
        .from('positionen')
        .insert([{ angebot_id: angebotId, owner_id: user.id, sortierung: positionen.length, ...data }])
        .select().single();
      liste = row ? [...positionen, row] : positionen;
    }
    setPositionen(liste);
    await syncBetrag(liste);
  }

  async function speichereManuell({ beschreibung, nettopreis }) {
    await persistPosition({ typ: 'manuell', beschreibung, menge: 1, nettopreis }, editPos);
    setEditPos(null);
  }

  async function speichereStruktur(data) {
    await persistPosition(data, strukturPos);
    setStrukturPos(null);
  }

  async function dupliziere(p) {
    await persistPosition({
      typ: p.typ, beschreibung: p.beschreibung, menge: p.menge, nettopreis: p.nettopreis, config: p.config,
    }, null);
  }

  async function loeschePosition() {
    const pid = deletePos.id;
    await supabase.from('positionen').delete().eq('id', pid);
    const liste = positionen.filter(p => p.id !== pid);
    setPositionen(liste);
    await syncBetrag(liste);
    setDeletePos(null);
  }

  async function setzeStufe(index) {
    const status = STUFEN[index];
    await supabase.from('angebote').update({ status }).eq('id', angebotId);
    setAngebot({ ...angebot, status });
  }

  if (loading || !angebot) return <main className="app-main"><p>Laden…</p></main>;

  const kundeName = kunde?.firma || `${kunde?.vorname ?? ''} ${kunde?.nachname ?? ''}`.trim() || 'Kunde';
  const naechste = STUFEN[stufeIndex + 1];

  return (
    <main className="app-main angebot-editor">
      <Link to={`/kunden/${kundeId}`} className="back-link">Zurück zum Kunden</Link>

      <div className="editor-kunde">
        <div className="editor-kunde-avatar">{getInitials(kunde)}</div>
        <div className="editor-kunde-name">Angebot für <strong>{kundeName}</strong></div>
      </div>

      {/* Status / Stepper */}
      <div className="stepper-card">
        <div className="stepper-head">
          <span className="status-pill">{angebot.status}</span>
          <span className="stepper-subtitle">{SUBTITLE[angebot.status] ?? ''}</span>
        </div>
        <div className="stepper">
          {STUFEN.map((stufe, i) => (
            <div key={stufe} style={{ display: 'contents' }}>
              {i > 0 && <div className={'stepper-line' + (i <= stufeIndex ? ' done' : '')} />}
              <button
                type="button"
                className={'stepper-step stepper-step--klick' + (i === stufeIndex ? ' active' : i < stufeIndex ? ' done' : '')}
                onClick={() => klickStufe(i)}
                title={`${stufe} erstellen`}
              >
                <div className="stepper-dot">
                  {i <= stufeIndex && (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="stepper-label">{stufe}</div>
              </button>
            </div>
          ))}
        </div>
        <div className="stepper-belege">
          <b>BELEGE</b>
          {(angebot.belegnummern?.[angebot.status] ?? angebot.belegnummer) ? (
            <button className="beleg-chip" onClick={() => oeffneBeleg(angebot.status)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              {angebot.status} {angebot.belegnummern?.[angebot.status] ?? angebot.belegnummer}
            </button>
          ) : (
            <button className="beleg-erstellen" onClick={() => oeffneBeleg(angebot.status)}>
              {angebot.status} erstellen
            </button>
          )}
        </div>
      </div>

      {/* Bearbeiten */}
      <h1 className="editor-title">Angebot bearbeiten</h1>
      <div className="editor-count">{positionen.length} {positionen.length === 1 ? 'Position' : 'Positionen'}</div>

      <div className="editor-toolbar">
        <div className="editor-bezeichnung">
          <label>Bezeichnung / Bauvorhaben</label>
          <input
            value={bezeichnung}
            onChange={e => setBezeichnung(e.target.value)}
            onBlur={speicherBezeichnung}
            placeholder="z. B. Auftrag Hoffmann"
          />
        </div>
        <div className="editor-pos-buttons">
          <button className="btn btn-primary btn-red" onClick={() => setStrukturPos('neu')}>+ Position</button>
          <button className="btn btn-outline" onClick={() => setEditPos('neu')}>+ Manuelle Position</button>
        </div>
      </div>

      {positionen.length === 0 ? (
        <div className="pos-empty">
          <div className="pos-empty-text">Noch keine Positionen erfasst</div>
          <button className="btn btn-primary btn-red" onClick={() => setStrukturPos('neu')}>Erste Position erfassen</button>
        </div>
      ) : (
        <div className="pos-list">
          {positionen.map((p, i) => {
            const menge = Number(p.menge || 1);
            const preis = euro(Number(p.nettopreis || 0) * menge);
            const istFenster = p.typ === 'fenster' && p.config;
            const oeffne = () => (istFenster ? setStrukturPos(p) : setEditPos(p));
            const pencil = (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            );
            const copy = (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            );
            const trash = (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            );

            const foot = (
              <div className="pos-card-foot">
                <button className="icon-btn" title="Bearbeiten" onClick={oeffne}>{pencil}</button>
                <button className="icon-btn" title="Duplizieren" onClick={() => dupliziere(p)}>{copy}</button>
                <button className="icon-btn icon-btn--delete" title="Position löschen" onClick={() => setDeletePos(p)}>{trash}</button>
                <span className="pos-card-preis">{preis}</span>
              </div>
            );

            if (istFenster) {
              const c = p.config;
              return (
                <div key={p.id} className="pos-card">
                  <div className="pos-card-head">
                    <span className="pos-card-num">{i + 1}</span>
                    <span className="pos-card-titel">{c.standort?.trim() || (c.kategorie === 'rollo' ? (geometrieByCode(c.code)?.label || 'Rollladen') : '—')}</span>
                    <span className="pos-card-menge">{menge}×</span>
                  </div>
                  <div className="pos-card-canvas" onClick={oeffne} title="Zum Bearbeiten klicken">
                    {c.kategorie === 'rollo' ? (
                      <RolloZeichnung breite={c.breite} hoehe={c.hoehe} kastenhoehe={c.kastenhoeheRollo}
                        bedienung={c.bedienung} bedienungsseite={c.bedienungsseiteRollo}
                        panzerOnly={!!geometrieByCode(c.code)?.panzerOnly} kompakt />
                    ) : c.elemente?.length > 1 ? (
                      <KombinationsZeichnung elemente={c.elemente} />
                    ) : (() => {
                      // Verbund-Infos (Bogen über Fenster, durchgehendes Glas) liegen in elemente[0],
                      // nicht in den flachen Feldern – sonst wird die Sonderform falsch gezeichnet.
                      const m = c.elemente?.[0] || c;
                      return (
                        <FensterZeichnung
                          geometrie={geometrieByCode(c.code)}
                          breite={c.breite}
                          hoehe={c.hoehe}
                          panes={c.panes}
                          cols={c.cols}
                          colWidths={c.colWidths}
                          rowHeights={c.rowHeights}
                          verbreiterung={c.verbreiterung ? c.verb : null}
                          aufsatzkasten={c.aufsatzkasten ? c.kasten : null}
                          teile={m.verbunden ? m._teile : null} dir={m._dir} durchgehend={m.durchgehend}
                          glasFarbe={c.ornament ? '#7fb0cc' : undefined}
                        />
                      );
                    })()}
                  </div>
                  {foot}
                </div>
              );
            }

            return (
              <div key={p.id} className="pos-card">
                <div className="pos-card-head">
                  <span className="pos-card-num">{i + 1}</span>
                  <span className="pos-card-titel">Manuelle Position</span>
                </div>
                <div className="pos-card-text" onClick={oeffne} title="Zum Bearbeiten klicken"
                     dangerouslySetInnerHTML={{ __html: p.beschreibung || '<p>Manuelle Position</p>' }} />
                {foot}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="editor-footer">
        <div className="footer-summe">
          <span className="footer-summe-label">Angebotssumme netto</span>
          <span className="footer-summe-wert">{euro(summe)}</span>
          <span className="footer-summe-stk">{stueck} Stück gesamt</span>
        </div>
        <div className="footer-actions">
          <button className="btn btn-outline" onClick={() => navigate(`/kunden/${kundeId}`)}>Fertig</button>
          {naechste && (
            <button className="btn btn-primary btn-red" onClick={() => setzeStufe(stufeIndex + 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-2px', marginRight: 8 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              {naechste}
            </button>
          )}
        </div>
      </div>

      {editPos && (
        <ManuellePositionModal
          onClose={() => setEditPos(null)}
          onSave={speichereManuell}
          initial={editPos !== 'neu' ? { beschreibung: editPos.beschreibung, nettopreis: editPos.nettopreis } : null}
        />
      )}

      {strukturPos && (
        <NeuePositionEditor
          kundeName={kundeName}
          onClose={() => setStrukturPos(null)}
          onSave={speichereStruktur}
          initial={strukturPos !== 'neu' ? strukturPos.config : null}
        />
      )}

      {deletePos && (
        <div className="modal-overlay" onClick={() => setDeletePos(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Position löschen?</h2>
            <p className="modal-text">Möchtest du diese Position wirklich aus dem Angebot entfernen?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeletePos(null)}>Abbrechen</button>
              <button className="btn btn-danger" onClick={loeschePosition}>Löschen</button>
            </div>
          </div>
        </div>
      )}

      {/* Rechnung: Ausführungsdatum + manuelle Rechnungsnummer */}
      {rechnungPrompt && (() => {
        const cfg = nummernConfig(einstellungen, 'Rechnung');
        const jahrSuffix = cfg.jahr ? `-${String(new Date().getFullYear()).slice(-2)}` : '';
        const seq = parseInt(String(rechnungNr).replace(/\D/g, ''), 10);
        const seqOk = Number.isFinite(seq) && seq >= 1;
        const dup = seqOk && rechnungBelegt.has(seq);
        const netto = positionen.reduce((s, p) => s + Number(p.nettopreis || 0) * Number(p.menge || 1), 0);
        const brutto = netto * (1 + MWST_SATZ);
        const anzWert = anzahlungOk ? brutto * (Number(angebot.anzahlung_prozent ?? 40) / 100) : parseEuro(anzahlungBetrag);
        const restbetrag = brutto - anzWert;
        return (
          <div className="modal-overlay" onClick={() => setRechnungPrompt(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">{angebot.belegnummern?.Rechnung ? 'Rechnung ändern' : 'Rechnung erstellen'}</h2>
              <div className="form-field" style={{ marginBottom: 12 }}>
                <label>Ausführungsdatum</label>
                <input type="date" value={ausfDatum || ''} onChange={e => setAusfDatum(e.target.value)} />
              </div>
              <div className="form-field" style={{ marginBottom: 4 }}>
                <label>Rechnungsnummer</label>
                <div className="rechnung-nr-eingabe">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={rechnungNr}
                    onChange={e => setRechnungNr(e.target.value.replace(/\D/g, ''))}
                    placeholder="z. B. 42"
                    autoFocus
                  />
                  {jahrSuffix && <span className="rechnung-nr-suffix">{jahrSuffix}</span>}
                </div>
              </div>
              {dup
                ? <p className="rechnung-nr-warnung">Diese Rechnungsnummer ist dieses Jahr bereits vergeben.</p>
                : <p className="modal-text" style={{ marginTop: 4, marginBottom: 0 }}>Das Jahr ({jahrSuffix.replace('-', '')}) wird automatisch angehängt.</p>}

              <div className="form-field" style={{ marginTop: 16, marginBottom: 4 }}>
                <label>Anzahlung korrekt bezahlt?</label>
                <div className="anzahlung-toggle">
                  <label><input type="radio" name="anzahlung-ok" checked={anzahlungOk} onChange={() => setAnzahlungOk(true)} /> Ja</label>
                  <label><input type="radio" name="anzahlung-ok" checked={!anzahlungOk} onChange={() => setAnzahlungOk(false)} /> Nein</label>
                </div>
              </div>
              {!anzahlungOk && (
                <div className="form-field" style={{ marginBottom: 4 }}>
                  <label>Tatsächlich erhaltene Anzahlung (€)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={anzahlungBetrag}
                    onChange={e => setAnzahlungBetrag(e.target.value)}
                    placeholder="z. B. 0,00"
                  />
                  <p className="modal-text" style={{ marginTop: 6, marginBottom: 0 }}>
                    Neuer Rechnungsbetrag: <strong>{euro(restbetrag)}</strong>
                  </p>
                </div>
              )}
              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setRechnungPrompt(false)}>Abbrechen</button>
                <button className="btn btn-primary btn-red" onClick={bestaetigeRechnung} disabled={!ausfDatum || !seqOk}>
                  {angebot.belegnummern?.Rechnung ? 'Rechnung aktualisieren' : 'Rechnung erstellen'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {angebotPrompt && (() => {
        const proz = parseEuro(anzahlungProzent);
        const ok = proz > 0 && proz <= 100;
        const netto = positionen.reduce((s, p) => s + Number(p.nettopreis || 0) * Number(p.menge || 1), 0);
        const anzBetrag = netto * (1 + MWST_SATZ) * (ok ? proz : 40) / 100;
        return (
          <div className="modal-overlay" onClick={() => setAngebotPrompt(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Angebot erstellen</h2>
              <p className="modal-text" style={{ marginBottom: 16 }}>Anzahlung bestätigen. Der Satz gilt für alle Belege (Angebot, Auftragsbestätigung, Rechnung).</p>
              <div className="form-field" style={{ marginBottom: 4 }}>
                <label>Anzahlung (%)</label>
                <div className="rechnung-nr-eingabe">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={anzahlungProzent}
                    onChange={e => setAnzahlungProzent(e.target.value)}
                    placeholder="z. B. 40"
                    autoFocus
                  />
                  <span className="rechnung-nr-suffix">%</span>
                </div>
              </div>
              <p className="modal-text" style={{ marginTop: 6, marginBottom: 0 }}>
                Anzahlungsbetrag: <strong>{euro(anzBetrag)}</strong>
              </p>
              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setAngebotPrompt(false)}>Abbrechen</button>
                <button className="btn btn-primary btn-red" onClick={bestaetigeAngebot} disabled={!ok}>Angebot erstellen</button>
              </div>
            </div>
          </div>
        );
      })()}

      {bestellPrompt && (() => {
        const optionen = [
          { key: 'fenster', label: 'Fenster' },
          { key: 'rollo', label: 'Rollos' },
          { key: 'manuell', label: 'Manuelle Positionen' },
        ];
        return (
          <div className="modal-overlay" onClick={() => setBestellPrompt(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Bestellung erstellen</h2>
              <p className="modal-text" style={{ marginBottom: 16 }}>Welche Positionen sollen auf die Bestellung? (Mehrfachauswahl möglich)</p>
              <div className="bestell-optionen">
                {optionen.map(({ key, label }) => {
                  const anzahl = positionen.filter(p => positionKategorie(p) === key).length;
                  return (
                    <label key={key} className={'bestell-option' + (anzahl === 0 ? ' bestell-option--leer' : '')}>
                      <input
                        type="checkbox"
                        checked={bestellFilter.includes(key)}
                        disabled={anzahl === 0}
                        onChange={() => toggleBestell(key)}
                      />
                      <span>{label} <span className="bestell-option-zahl">({anzahl})</span></span>
                    </label>
                  );
                })}
              </div>
              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setBestellPrompt(false)}>Abbrechen</button>
                <button className="btn btn-primary btn-red" onClick={bestaetigeBestellung} disabled={!bestellFilter.length}>
                  Bestellung erstellen
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {zeigeBeleg && (
        <BelegModal
          art={zeigeBeleg}
          angebot={angebot}
          kunde={kunde}
          positionen={zeigeBeleg === 'Bestellung' && bestellFilter.length
            ? positionen.filter(p => bestellFilter.includes(positionKategorie(p)))
            : positionen}
          profileMap={profileMap}
          einstellungen={einstellungen}
          onClose={() => setZeigeBeleg(null)}
        />
      )}
    </main>
  );
}

export default AngebotEditorPage;
