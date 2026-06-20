import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import ManuellePositionModal from '../components/ManuellePositionModal';

const STUFEN = ['Entwurf', 'Angebot', 'Auftragsbestätigung', 'Bestellung', 'Rechnung'];
const SUBTITLE = {
  Entwurf: 'Positionen werden erfasst. Noch kein Beleg erstellt.',
  Angebot: 'Angebot erstellt — kann an den Kunden gesendet werden.',
  Auftragsbestätigung: 'Auftrag bestätigt.',
  Bestellung: 'Bestellung ausgelöst.',
  Rechnung: 'Rechnung erstellt.',
};

function euro(n) {
  return Number(n || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
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
  const [showManuell, setShowManuell] = useState(false);

  useEffect(() => {
    async function laden() {
      setLoading(true);
      const { data: a } = await supabase.from('angebote').select('*').eq('id', angebotId).single();
      if (!a) { navigate(`/kunden/${kundeId}`); return; }
      setAngebot(a);
      setBezeichnung(a.bezeichnung ?? '');
      const { data: k } = await supabase.from('kunden').select('*').eq('id', kundeId).single();
      setKunde(k);
      const { data: p } = await supabase
        .from('positionen').select('*').eq('angebot_id', angebotId)
        .order('sortierung', { ascending: true }).order('created_at', { ascending: true });
      setPositionen(p ?? []);
      setLoading(false);
    }
    laden();
  }, [angebotId, kundeId, navigate]);

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

  async function addManuellePosition({ beschreibung, nettopreis }) {
    const { data } = await supabase
      .from('positionen')
      .insert([{ angebot_id: angebotId, owner_id: user.id, typ: 'manuell', beschreibung, menge: 1, nettopreis, sortierung: positionen.length }])
      .select().single();
    const liste = data ? [...positionen, data] : positionen;
    setPositionen(liste);
    await syncBetrag(liste);
    setShowManuell(false);
  }

  async function loeschePosition(pid) {
    await supabase.from('positionen').delete().eq('id', pid);
    const liste = positionen.filter(p => p.id !== pid);
    setPositionen(liste);
    await syncBetrag(liste);
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
              <div className={'stepper-step' + (i === stufeIndex ? ' active' : i < stufeIndex ? ' done' : '')}>
                <div className="stepper-dot">{i + 1}</div>
                <div className="stepper-label">{stufe}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="stepper-belege"><b>BELEGE</b>Noch keine Belege erstellt.</div>
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
          <button className="btn btn-dark" onClick={() => setShowManuell(true)}>+ Position</button>
          <button className="btn btn-outline" onClick={() => setShowManuell(true)}>+ Manuelle Position</button>
        </div>
      </div>

      {positionen.length === 0 ? (
        <div className="pos-empty">
          <div className="pos-empty-text">Noch keine Positionen erfasst</div>
          <button className="btn btn-primary btn-red" onClick={() => setShowManuell(true)}>Erste Position erfassen</button>
        </div>
      ) : (
        <div className="pos-list">
          {positionen.map((p, i) => (
            <div key={p.id} className="pos-row">
              <div className="pos-row-main">
                <div className="pos-row-desc" dangerouslySetInnerHTML={{ __html: p.beschreibung || '<p>Position</p>' }} />
                <div className="pos-row-menge">{Number(p.menge || 1)} Stück</div>
              </div>
              <div className="pos-row-preis">{euro(Number(p.nettopreis || 0) * Number(p.menge || 1))}</div>
              <button className="icon-btn icon-btn--delete" title="Position löschen" onClick={() => loeschePosition(p.id)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          ))}
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
          <button className="btn btn-outline" disabled={stufeIndex === 0} onClick={() => setzeStufe(stufeIndex - 1)}>
            Stufe zurück
          </button>
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

      {showManuell && (
        <ManuellePositionModal onClose={() => setShowManuell(false)} onSave={addManuellePosition} />
      )}
    </main>
  );
}

export default AngebotEditorPage;
