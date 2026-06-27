import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ladeEinstellungen, speichereSektion, FIRMA_OWNER } from '../lib/einstellungen';
import { useView } from '../view/ViewContext';
import LeseHinweis from '../components/LeseHinweis';

function EinstellungErscheinungsbildPage() {
  const { istAdmin } = useView();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function laden() {
      // Logo & Akzentfarbe gelten firmenweit – immer vom Inhaber.
      const data = await ladeEinstellungen(FIRMA_OWNER);
      const e = data.erscheinungsbild ?? {};
      setForm({ logo: e.logo ?? null, akzentfarbe: e.akzentfarbe ?? '#8b1a1a' });
    }
    laden();
  }, []);

  function waehleLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, logo: reader.result }));
    reader.readAsDataURL(file);
  }

  function entferneLogo() {
    setForm(f => ({ ...f, logo: null }));
    if (fileRef.current) fileRef.current.value = '';
  }

  async function speichern() {
    setSaving(true);
    await speichereSektion(FIRMA_OWNER, 'erscheinungsbild', form);
    navigate('/einstellungen');
  }

  if (!form) return <main className="app-main"><p>Laden…</p></main>;

  return (
    <main className="app-main">
      <Link to="/einstellungen" className="back-link einst-back">‹ Zurück zu den Einstellungen</Link>
      <h1 className="form-title" style={{ marginBottom: 6 }}>Erscheinungsbild</h1>
      <p className="settings-subtitle">Logo und Akzentfarbe für das eigene Unternehmen.</p>

      {!istAdmin && <LeseHinweis />}

      <div className="einst-card">
       <fieldset className="einst-fieldset" disabled={!istAdmin}>
        <section className="einst-section">
          <h2 className="section-label">LOGO UND FARBE</h2>

          <div className="form-field">
            <label>Logo</label>
            {form.logo && (
              <div className="logo-vorschau">
                <img src={form.logo} alt="Logo" />
                <button type="button" className="btn btn-secondary" onClick={entferneLogo}>Entfernen</button>
              </div>
            )}
            <div className="logo-upload">
              <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
                Datei auswählen
              </button>
              <span className="logo-dateiname">{form.logo ? 'Logo gewählt' : 'Keine Datei ausgewählt'}</span>
              <input ref={fileRef} type="file" accept="image/*" onChange={waehleLogo} style={{ display: 'none' }} />
            </div>
          </div>

          <div className="form-field">
            <label>Akzentfarbe</label>
            <div className="farbe-wahl">
              <input type="color" value={form.akzentfarbe} onChange={e => setForm({ ...form, akzentfarbe: e.target.value })} />
              <input
                className="farbe-hex"
                value={form.akzentfarbe}
                onChange={e => setForm({ ...form, akzentfarbe: e.target.value })}
              />
            </div>
          </div>
        </section>
       </fieldset>

        <div className="einst-footer">
          <Link to="/einstellungen" className="btn btn-secondary">{istAdmin ? 'Abbrechen' : 'Zurück'}</Link>
          {istAdmin && (
            <button className="btn btn-danger" onClick={speichern} disabled={saving}>
              {saving ? 'Speichern…' : 'Speichern'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default EinstellungErscheinungsbildPage;
