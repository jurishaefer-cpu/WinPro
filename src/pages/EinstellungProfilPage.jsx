import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ladeEinstellungen, speichereSektion } from '../lib/einstellungen';

function EinstellungProfilPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function laden() {
      const data = await ladeEinstellungen(user.id);
      const p = data.profil ?? {};
      const meta = user.user_metadata ?? {};
      setForm({
        name: p.name ?? `${meta.first_name ?? ''} ${meta.last_name ?? ''}`.trim(),
        email: p.email ?? user.email ?? '',
        telefon: p.telefon ?? '',
      });
    }
    laden();
  }, [user]);

  function ch(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function speichern() {
    setSaving(true);
    await speichereSektion(user.id, 'profil', form);
    navigate('/einstellungen');
  }

  if (!form) return <main className="app-main"><p>Laden…</p></main>;

  return (
    <main className="app-main">
      <Link to="/einstellungen" className="back-link einst-back">‹ Zurück zu den Einstellungen</Link>
      <h1 className="form-title" style={{ marginBottom: 6 }}>Mein Profil</h1>
      <p className="settings-subtitle">Diese Daten erscheinen automatisch als Ansprechpartner auf den Belegen, die du erstellst.</p>

      <div className="einst-card">
        <section className="einst-section">
          <h2 className="section-label">ANSPRECHPARTNER</h2>
          <div className="form-field">
            <label>Name</label>
            <input name="name" value={form.name} onChange={ch} />
          </div>
          <div className="form-field">
            <label>E-Mail</label>
            <input name="email" type="email" value={form.email} onChange={ch} />
          </div>
          <div className="form-field">
            <label>Telefon</label>
            <input name="telefon" value={form.telefon} onChange={ch} />
            <span className="field-hint">Ohne Telefonnummer fehlt sie auf deinen Belegen.</span>
          </div>
        </section>
        <div className="einst-footer">
          <Link to="/einstellungen" className="btn btn-secondary">Abbrechen</Link>
          <button className="btn btn-danger" onClick={speichern} disabled={saving}>
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default EinstellungProfilPage;
