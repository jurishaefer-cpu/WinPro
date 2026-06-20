import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function getInitials(k) {
  const v = k.vorname?.[0] ?? '';
  const n = k.nachname?.[0] ?? '';
  return (v + n).toUpperCase() || '?';
}

function KundenPage() {
  const [kunden, setKunden] = useState([]);
  const [suche, setSuche] = useState('');
  const [filter, setFilter] = useState('Alle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function laden() {
      const { data } = await supabase.from('kunden').select('*').order('created_at', { ascending: false });
      setKunden(data ?? []);
      setLoading(false);
    }
    laden();
  }, []);

  async function handleDelete(id) {
    await supabase.from('kunden').delete().eq('id', id);
    setKunden(kunden.filter(k => k.id !== id));
  }

  const gefiltert = kunden.filter(k => {
    const matchSuche = k.nachname?.toLowerCase().includes(suche.toLowerCase());
    const matchFilter =
      filter === 'Alle' ||
      (filter === 'Firma' && k.firma) ||
      (filter === 'Privat' && !k.firma);
    return matchSuche && matchFilter;
  });

  return (
    <main className="app-main">
      <div className="page-header">
        <h1>Kunden <span className="kunden-count">{kunden.length}</span></h1>
        <Link to="/kunden/neu" className="btn btn-primary btn-red">Neuer Kunde</Link>
      </div>

      <div className="kunden-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Nachname"
            value={suche}
            onChange={e => setSuche(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option>Alle</option>
          <option>Firma</option>
          <option>Privat</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state"><p>Laden…</p></div>
      ) : gefiltert.length === 0 ? (
        <div className="empty-state">
          {kunden.length === 0
            ? <><p>Noch keine Kunden angelegt.</p>
                <Link to="/kunden/neu" className="btn btn-primary btn-red" style={{ marginTop: 16, display: 'inline-block' }}>
                  Ersten Kunden anlegen
                </Link></>
            : <p>Keine Kunden gefunden.</p>
          }
        </div>
      ) : (
        <div className="kunden-list">
          {gefiltert.map(k => (
            <div key={k.id} className="kunden-card">
              <div className="kunde-avatar">{getInitials(k)}</div>
              <div className="kunde-info">
                <div className="kunde-name">
                  {k.vorname} {k.nachname}
                  {k.firma && <span className="firma-badge">FIRMA</span>}
                </div>
                {(k.ort || k.plz) && (
                  <div className="kunde-ort">
                    <span className="ort-icon">⊙</span>
                    {[k.plz, k.ort].filter(Boolean).join(' ')}
                  </div>
                )}
              </div>
              <div className="kunde-actions">
                <Link to={`/kunden/${k.id}/bearbeiten`} className="icon-btn" title="Bearbeiten">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </Link>
                <button className="icon-btn icon-btn--delete" onClick={() => handleDelete(k.id)} title="Löschen">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default KundenPage;
