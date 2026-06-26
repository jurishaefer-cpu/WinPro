import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

function getInitials(k) {
  if (k.firma) {
    const teile = k.firma.trim().split(/\s+/);
    const a = teile[0]?.[0] ?? '';
    const b = teile.length > 1 ? teile[teile.length - 1][0] : (teile[0]?.[1] ?? '');
    return (a + b).toUpperCase();
  }
  const v = k.vorname?.[0] ?? '';
  const n = k.nachname?.[0] ?? '';
  return (v + n).toUpperCase() || '?';
}

function euro(betrag) {
  return Number(betrag || 0).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  });
}

function datum(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function KundeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kunde, setKunde] = useState(null);
  const [angebote, setAngebote] = useState([]);
  const [posCounts, setPosCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteAngebot, setDeleteAngebot] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function laden() {
      setLoading(true);
      const { data: k } = await supabase.from('kunden').select('*').eq('id', id).single();
      if (!k) {
        navigate('/kunden');
        return;
      }
      setKunde(k);
      const { data: a } = await supabase
        .from('angebote')
        .select('*')
        .eq('kunde_id', id)
        .order('created_at', { ascending: false });
      const liste = a ?? [];
      setAngebote(liste);
      if (liste.length) {
        const { data: pos } = await supabase
          .from('positionen')
          .select('angebot_id')
          .in('angebot_id', liste.map(x => x.id));
        const counts = {};
        (pos ?? []).forEach(p => { counts[p.angebot_id] = (counts[p.angebot_id] ?? 0) + 1; });
        setPosCounts(counts);
      }
      setLoading(false);
    }
    laden();
  }, [id, navigate]);

  async function handleNeuesAngebot() {
    setCreating(true);
    const { data } = await supabase
      .from('angebote')
      .insert([{ kunde_id: Number(id), owner_id: user.id, status: 'Angebot', betrag: 0 }])
      .select()
      .single();
    if (data) navigate(`/kunden/${id}/angebote/${data.id}`);
    else setCreating(false);
  }

  async function handleDeleteKunde() {
    await supabase.from('kunden').delete().eq('id', id);
    navigate('/kunden');
  }

  async function handleDeleteAngebot() {
    await supabase.from('angebote').delete().eq('id', deleteAngebot.id);
    setAngebote(angebote.filter(a => a.id !== deleteAngebot.id));
    setDeleteAngebot(null);
  }

  if (loading || !kunde) return <main className="app-main"><p>Laden…</p></main>;

  const name = kunde.firma || `${kunde.vorname ?? ''} ${kunde.nachname ?? ''}`.trim();
  const ansprechpartner = `${kunde.vorname ?? ''} ${kunde.nachname ?? ''}`.trim();
  const adresse = [kunde.strasse, [kunde.plz, kunde.ort].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' , ');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([kunde.strasse, kunde.plz, kunde.ort].filter(Boolean).join(', '))}`;
  const gesamt = angebote.reduce((s, a) => s + Number(a.betrag || 0), 0);
  const letztes = angebote[0]?.created_at;

  // Fortlaufende Nummer pro Kunde (älteste = 1), unabhängig von der Anzeige-Reihenfolge
  const nummerMap = {};
  [...angebote]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .forEach((a, i) => { nummerMap[a.id] = i + 1; });

  const statusSlug = s => ({
    'Angebot': 'angebot',
    'Auftragsbestätigung': 'ab',
    'Bestellung': 'bestellung',
    'Rechnung': 'rechnung',
  }[s] || 'angebot');

  return (
    <main className="app-main kunde-detail">
      <Link to="/kunden" className="back-link">‹ Zurück zur Liste</Link>

      {/* Kunden-Karte */}
      <div className="detail-card">
        <div className="detail-card-head">
          <div className="detail-avatar">{getInitials(kunde)}</div>
          <div className="detail-headline">
            <div className="detail-name">
              {name}
              {kunde.firma && <span className="firma-badge">FIRMA</span>}
            </div>
            {kunde.firma && ansprechpartner && (
              <div className="detail-zhd">z.Hd. {ansprechpartner}</div>
            )}
          </div>
          <div className="detail-head-actions">
            <Link to={`/kunden/${id}/bearbeiten`} className="icon-btn" title="Bearbeiten">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </Link>
            <button className="icon-btn icon-btn--delete" title="Löschen" onClick={() => setShowDelete(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="detail-contact">
          {adresse && (
            <a className="detail-contact-item detail-contact-link" href={mapsUrl} target="_blank" rel="noopener noreferrer" title="In Google Maps öffnen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{adresse}</span>
            </a>
          )}
          {kunde.telefon && (
            <div className="detail-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <a href={`tel:${kunde.telefon}`}>{kunde.telefon}</a>
            </div>
          )}
          {kunde.email && (
            <div className="detail-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <a href={`mailto:${kunde.email}`}>{kunde.email}</a>
            </div>
          )}
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="detail-stats">
        <div className="stat-card">
          <div className="stat-label">ANGEBOTE</div>
          <div className="stat-value">{angebote.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">GESAMTVOLUMEN</div>
          <div className="stat-value">{euro(gesamt)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">LETZTES ANGEBOT</div>
          <div className="stat-value">{letztes ? datum(letztes) : '–'}</div>
        </div>
      </div>

      {/* Angebote */}
      <div className="angebote-header">
        <h2>Angebote</h2>
        <button className="btn btn-primary btn-red" onClick={handleNeuesAngebot} disabled={creating}>
          {creating ? 'Wird angelegt…' : 'Neues Angebot'}
        </button>
      </div>

      {angebote.length === 0 ? (
        <div className="angebote-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
          <div className="angebote-empty-title">Noch keine Angebote</div>
          <div className="angebote-empty-text">Lege das erste Angebot für diesen Kunden an.</div>
        </div>
      ) : (
        <div className="angebote-list">
          {angebote.map(a => {
            const anzahl = posCounts[a.id] ?? 0;
            return (
              <div key={a.id} className="angebot-row">
                <div
                  className={'angebot-card angebot-card--' + statusSlug(a.status)}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/kunden/${id}/angebote/${a.id}`)}
                >
                  <div className="angebot-main">
                    <div className="angebot-titelzeile">
                      <span className="angebot-bez">{a.bezeichnung?.trim() || `Angebot ${nummerMap[a.id]}`}</span>
                      <span className={'angebot-status angebot-status--' + statusSlug(a.status)}>{a.status}</span>
                    </div>
                    <div className="angebot-meta">
                      vom {datum(a.created_at)} · {anzahl} {anzahl === 1 ? 'Position' : 'Positionen'}
                    </div>
                  </div>
                  <div className="angebot-betrag">{euro(a.betrag)}</div>
                  <svg className="angebot-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
                <button className="angebot-delete" title="Angebot löschen" onClick={() => setDeleteAngebot(a)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Kunde-löschen-Dialog */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Kunde löschen?</h2>
            <p className="modal-text">
              Möchtest du <strong>{name}</strong> wirklich unwiderruflich löschen? Alle zugehörigen
              Angebote werden ebenfalls entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>Abbrechen</button>
              <button className="btn btn-danger" onClick={handleDeleteKunde}>Endgültig löschen</button>
            </div>
          </div>
        </div>
      )}

      {/* Angebot-löschen-Dialog */}
      {deleteAngebot && (
        <div className="modal-overlay" onClick={() => setDeleteAngebot(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Angebot löschen?</h2>
            <p className="modal-text">
              Möchtest du <strong>{deleteAngebot.bezeichnung?.trim() || `Angebot ${nummerMap[deleteAngebot.id]}`}</strong> wirklich
              unwiderruflich löschen? Alle erfassten Positionen werden ebenfalls entfernt.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteAngebot(null)}>Abbrechen</button>
              <button className="btn btn-danger" onClick={handleDeleteAngebot}>Endgültig löschen</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default KundeDetailPage;
