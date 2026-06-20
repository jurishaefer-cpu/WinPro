import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function KundeBearbeitenPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function laden() {
      const { data } = await supabase.from('kunden').select('*').eq('id', id).single();
      if (data) setForm(data);
      else navigate('/kunden');
    }
    laden();
  }, [id, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const { vorname, nachname, firma, strasse, plz, ort, telefon, email } = form;
    await supabase.from('kunden').update({ vorname, nachname, firma, strasse, plz, ort, telefon, email }).eq('id', id);
    navigate('/kunden');
  }

  if (!form) return <main className="app-main"><p>Laden…</p></main>;

  return (
    <main className="app-main">
      <Link to="/kunden" className="back-link">← Zurück zur Kundenliste</Link>
      <h1 className="form-title">Kunde bearbeiten</h1>

      <form className="kunden-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2 className="section-label">PERSON</h2>
          <div className="form-row">
            <div className="form-field">
              <label>Vorname</label>
              <input name="vorname" value={form.vorname ?? ''} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Nachname</label>
              <input name="nachname" value={form.nachname ?? ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-field">
            <label>Firma <span className="optional">(optional)</span></label>
            <input name="firma" value={form.firma ?? ''} onChange={handleChange} />
            <span className="field-hint">Wenn gesetzt, gehen Briefe an die Firma — der Name oben wird zu z.Hd.</span>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-label">ADRESSE</h2>
          <div className="form-field">
            <label>Strasse + Hausnummer</label>
            <input name="strasse" value={form.strasse ?? ''} onChange={handleChange} />
            <span className="field-hint">Z.B. Hauptstrasse 12.</span>
          </div>
          <div className="form-row">
            <div className="form-field form-field--narrow">
              <label>PLZ</label>
              <input name="plz" value={form.plz ?? ''} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Ort</label>
              <input name="ort" value={form.ort ?? ''} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-label">KONTAKT</h2>
          <div className="form-row">
            <div className="form-field">
              <label>Telefon</label>
              <input name="telefon" value={form.telefon ?? ''} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>E-Mail</label>
              <input name="email" type="email" value={form.email ?? ''} onChange={handleChange} />
            </div>
          </div>
        </section>

        <div className="form-actions">
          <Link to="/kunden" className="btn btn-secondary">Abbrechen</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Speichern…' : 'Änderungen speichern'}
          </button>
        </div>
      </form>
    </main>
  );
}

export default KundeBearbeitenPage;
