import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function getInitials(p) {
  const h = (p.hersteller || '').trim();
  return h ? h.slice(0, 2).toUpperCase() : 'PR';
}

function ProfilePage() {
  const [profile, setProfile] = useState([]);
  const [suche, setSuche] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    async function laden() {
      const { data } = await supabase.from('profile').select('*').order('created_at', { ascending: false });
      setProfile(data ?? []);
      setLoading(false);
    }
    laden();
  }, []);

  async function confirmDelete() {
    const id = deleteTarget.id;
    await supabase.from('profile').delete().eq('id', id);
    setProfile(profile.filter(p => p.id !== id));
    setDeleteTarget(null);
  }

  const gefiltert = profile.filter(p => {
    const q = suche.toLowerCase();
    return (p.hersteller || '').toLowerCase().includes(q) || (p.system || '').toLowerCase().includes(q);
  });

  return (
    <main className="app-main">
      <div className="page-header">
        <h1>Profile <span className="kunden-count">{profile.length}</span></h1>
        <Link to="/profile/neu" className="btn btn-primary btn-red">Neues Profil</Link>
      </div>

      <div className="kunden-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Hersteller oder System"
            value={suche}
            onChange={e => setSuche(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Laden…</p></div>
      ) : gefiltert.length === 0 ? (
        <div className="empty-state">
          {profile.length === 0
            ? <><p>Noch keine Profile angelegt.</p>
                <Link to="/profile/neu" className="btn btn-primary btn-red" style={{ marginTop: 16, display: 'inline-block' }}>
                  Erstes Profil anlegen
                </Link></>
            : <p>Keine Profile gefunden.</p>
          }
        </div>
      ) : (
        <div className="kunden-list">
          {gefiltert.map(p => (
            <div key={p.id} className="kunden-card">
              <div className="kunde-avatar">{getInitials(p)}</div>
              <div className="kunde-info">
                <div className="kunde-name">
                  {[p.hersteller, p.system].filter(Boolean).join(' ') || '—'}
                  {p.material && <span className="firma-badge">{p.material}</span>}
                </div>
                <div className="kunde-ort">
                  {[p.bautiefe && `${p.bautiefe} mm`, p.farben?.length ? `${p.farben.length} Farben` : null]
                    .filter(Boolean).join(' · ') || '—'}
                </div>
              </div>
              <div className="kunde-actions">
                <Link to={`/profile/${p.id}/bearbeiten`} className="icon-btn" title="Bearbeiten">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </Link>
                <button className="icon-btn icon-btn--delete" onClick={() => setDeleteTarget(p)} title="Löschen">
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

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Profil löschen?</h2>
            <p className="modal-text">
              Möchtest du <strong>{deleteTarget.hersteller} {deleteTarget.system}</strong> wirklich
              unwiderruflich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Abbrechen</button>
              <button className="btn btn-danger" autoFocus onClick={confirmDelete}>Endgültig löschen</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProfilePage;
