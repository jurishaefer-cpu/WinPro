import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ladeEinstellungen, speichereSektion } from '../lib/einstellungen';

const LEER = {
  firmenname: '', geschaeftsfuehrung: '',
  strasse: '', plz: '', ort: '',
  telefon: '', email: '', webseite: '',
  ap_name: '', ap_telefon: '', ap_email: '',
  steuernummer: '', ust_id: '', handelsregister: '', registergericht: '',
  iban: '', bic: '', bank: '',
};

function EinstellungFirmaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function laden() {
      const data = await ladeEinstellungen(user.id);
      setForm({ ...LEER, ...(data.firma ?? {}) });
    }
    laden();
  }, [user]);

  function ch(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function speichern() {
    setSaving(true);
    await speichereSektion(user.id, 'firma', form);
    navigate('/einstellungen');
  }

  if (!form) return <main className="app-main"><p>Laden…</p></main>;

  const F = (name, label, props = {}) => (
    <div className="form-field">
      <label>{label}</label>
      <input name={name} value={form[name]} onChange={ch} {...props} />
    </div>
  );

  return (
    <main className="app-main">
      <Link to="/einstellungen" className="back-link einst-back">‹ Zurück zu den Einstellungen</Link>
      <h1 className="form-title" style={{ marginBottom: 6 }}>Firmendaten</h1>
      <p className="settings-subtitle">Name, Anschrift, Steuernummer und Bankverbindung für Belege.</p>

      <div className="einst-card">
        <section className="einst-section">
          <h2 className="section-label">UNTERNEHMEN</h2>
          {F('firmenname', 'Firmenname')}
          {F('geschaeftsfuehrung', 'Geschäftsführung')}
        </section>

        <section className="einst-section">
          <h2 className="section-label">ANSCHRIFT</h2>
          {F('strasse', 'Straße und Hausnummer')}
          {F('plz', 'Postleitzahl')}
          {F('ort', 'Ort')}
        </section>

        <section className="einst-section">
          <h2 className="section-label">KONTAKT</h2>
          {F('telefon', 'Telefon')}
          {F('email', 'E-Mail', { type: 'email' })}
          {F('webseite', 'Webseite')}
        </section>

        <section className="einst-section">
          <h2 className="section-label">ANSPRECHPARTNER (FALLBACK)</h2>
          {F('ap_name', 'Name')}
          {F('ap_telefon', 'Telefon')}
          {F('ap_email', 'E-Mail', { type: 'email' })}
        </section>

        <section className="einst-section">
          <h2 className="section-label">REGISTER UND STEUER</h2>
          {F('steuernummer', 'Steuernummer')}
          {F('ust_id', 'Umsatzsteuer-ID')}
          {F('handelsregister', 'Handelsregisternummer')}
          {F('registergericht', 'Registergericht')}
        </section>

        <section className="einst-section">
          <h2 className="section-label">BANKVERBINDUNG</h2>
          {F('iban', 'IBAN')}
          {F('bic', 'BIC')}
          {F('bank', 'Bank')}
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

export default EinstellungFirmaPage;
