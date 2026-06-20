import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const MATERIALIEN = ['PVC', 'Holz', 'Aluminium', 'Holz-Alu'];

function ProfilBearbeitenPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function laden() {
      const { data } = await supabase.from('profile').select('*').eq('id', id).single();
      if (data) setForm(data);
      else navigate('/profile');
    }
    laden();
  }, [id, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const num = v => (v === '' || v === null ? null : Number(v));
    await supabase.from('profile').update({
      hersteller: form.hersteller,
      system: form.system,
      material: form.material,
      bautiefe: num(form.bautiefe),
      anzahl_kammern: num(form.anzahl_kammern),
      dichtungsebenen: num(form.dichtungsebenen),
      notizen: form.notizen,
    }).eq('id', id);
    navigate('/profile');
  }

  if (!form) return <main className="app-main"><p>Laden…</p></main>;

  return (
    <main className="app-main">
      <Link to="/profile" className="back-link">← Zurück zu Profilen</Link>
      <h1 className="form-title">Profil bearbeiten</h1>

      <form className="kunden-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2 className="section-label">SYSTEM</h2>

          <div className="form-field">
            <label>Hersteller</label>
            <input name="hersteller" value={form.hersteller ?? ''} onChange={handleChange} />
            <span className="field-hint">Z.B. Rehau, Aluplast, Schüco.</span>
          </div>

          <div className="form-field">
            <label>System</label>
            <input name="system" value={form.system ?? ''} onChange={handleChange} />
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
            <input type="number" name="bautiefe" value={form.bautiefe ?? ''} onChange={handleChange} />
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-label">AUFBAU</h2>
          <div className="form-row">
            <div className="form-field">
              <label>Anzahl Kammern <span className="optional">(optional)</span></label>
              <input type="number" name="anzahl_kammern" value={form.anzahl_kammern ?? ''} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Dichtungsebenen <span className="optional">(optional)</span></label>
              <input type="number" name="dichtungsebenen" value={form.dichtungsebenen ?? ''} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-label">NOTIZEN</h2>
          <div className="form-field">
            <label>Interne Notizen <span className="optional">(optional)</span></label>
            <textarea name="notizen" rows="4" value={form.notizen ?? ''} onChange={handleChange} />
            <span className="field-hint">Nur für dich.</span>
          </div>
        </section>

        <div className="form-actions">
          <Link to="/profile" className="btn btn-secondary">Abbrechen</Link>
          <button type="submit" className="btn btn-primary btn-red" disabled={saving}>
            {saving ? 'Speichern…' : 'Änderungen speichern'}
          </button>
        </div>
      </form>
    </main>
  );
}

export default ProfilBearbeitenPage;
