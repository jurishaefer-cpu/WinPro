import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PROFIL_FARBEN } from '../constants/profilFarben';

const MATERIALIEN = ['PVC', 'Holz', 'Aluminium', 'Holz-Alu'];

const emptyForm = {
  hersteller: '', system: '', material: 'PVC',
  bautiefe: '', anzahl_kammern: '', dichtungsebenen: '', farben: [], notizen: '',
};

function toPayload(form) {
  const num = v => (v === '' ? null : Number(v));
  return {
    hersteller: form.hersteller,
    system: form.system,
    material: form.material,
    bautiefe: num(form.bautiefe),
    anzahl_kammern: num(form.anzahl_kammern),
    dichtungsebenen: num(form.dichtungsebenen),
    farben: form.farben.map(f => f.trim()).filter(Boolean),
    notizen: form.notizen,
  };
}

function NeuesProfilPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addFarbe() {
    setForm({ ...form, farben: [...form.farben, ''] });
  }
  function updateFarbe(i, value) {
    const farben = [...form.farben];
    farben[i] = value;
    setForm({ ...form, farben });
  }
  function removeFarbe(i) {
    setForm({ ...form, farben: form.farben.filter((_, idx) => idx !== i) });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profile').insert([toPayload(form)]);
    navigate('/profile');
  }

  return (
    <main className="app-main">
      <Link to="/profile" className="back-link">← Zurück zu Profilen</Link>
      <h1 className="form-title">Neues Profil</h1>

      <form className="kunden-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2 className="section-label">SYSTEM</h2>

          <div className="form-field">
            <label>Hersteller</label>
            <input name="hersteller" value={form.hersteller} onChange={handleChange} />
            <span className="field-hint">Z.B. Rehau, Aluplast, Schüco.</span>
          </div>

          <div className="form-field">
            <label>System</label>
            <input name="system" value={form.system} onChange={handleChange} />
            <span className="field-hint">Z.B. Synego 80, Ideal 4000.</span>
          </div>

          <div className="form-field">
            <label>Material</label>
            <div className="segmented">
              {MATERIALIEN.map(m => (
                <button
                  type="button"
                  key={m}
                  className={'segmented-option' + (form.material === m ? ' is-active' : '')}
                  onClick={() => setForm({ ...form, material: m })}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Bautiefe in mm</label>
            <input type="number" name="bautiefe" value={form.bautiefe} onChange={handleChange} />
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-label">AUFBAU</h2>
          <div className="form-row">
            <div className="form-field">
              <label>Anzahl Kammern <span className="optional">(optional)</span></label>
              <input type="number" name="anzahl_kammern" value={form.anzahl_kammern} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Dichtungsebenen <span className="optional">(optional)</span></label>
              <input type="number" name="dichtungsebenen" value={form.dichtungsebenen} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-label">FARBEN</h2>
          {form.farben.length === 0 && (
            <p className="farbe-empty">Noch keine Farben hinzugefügt.</p>
          )}
          {form.farben.map((farbe, i) => (
            <div className="farbe-row" key={i}>
              <select
                className="farbe-select"
                value={farbe}
                onChange={e => updateFarbe(i, e.target.value)}
              >
                <option value="">Farbe wählen…</option>
                {(PROFIL_FARBEN.includes(farbe) || !farbe ? PROFIL_FARBEN : [farbe, ...PROFIL_FARBEN]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button type="button" className="farbe-remove" onClick={() => removeFarbe(i)} title="Entfernen">
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="farbe-add" onClick={addFarbe}>
            + Farbe hinzufügen
          </button>
        </section>

        <section className="form-section">
          <h2 className="section-label">NOTIZEN</h2>
          <div className="form-field">
            <label>Interne Notizen <span className="optional">(optional)</span></label>
            <textarea name="notizen" rows="4" value={form.notizen} onChange={handleChange} />
            <span className="field-hint">Nur für dich.</span>
          </div>
        </section>

        <div className="form-actions">
          <Link to="/profile" className="btn btn-secondary">Abbrechen</Link>
          <button type="submit" className="btn btn-primary btn-red" disabled={saving}>
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </form>
    </main>
  );
}

export default NeuesProfilPage;
