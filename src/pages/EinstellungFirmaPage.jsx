import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ladeEinstellungen, speichereSektion, FIRMA_OWNER } from '../lib/einstellungen';
import { useView } from '../view/ViewContext';
import LeseHinweis from '../components/LeseHinweis';

const LEER = {
  firmenname: '', geschaeftsfuehrung: '',
  strasse: '', plz: '', ort: '',
  telefon: '', email: '', webseite: '',
  ap_name: '', ap_telefon: '', ap_email: '',
  steuernummer: '', ust_id: '', handelsregister: '', registergericht: '',
  iban: '', bic: '', bank: '',
};

function EinstellungFirmaPage() {
  const { istAdmin } = useView();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function laden() {
      // Firmendaten gelten firmenweit – immer vom Inhaber laden/speichern.
      const data = await ladeEinstellungen(FIRMA_OWNER);
      setForm({ ...LEER, ...(data.firma ?? {}) });
    }
    laden();
  }, []);

  function ch(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function speichern() {
    setSaving(true);
    await speichereSektion(FIRMA_OWNER, 'firma', form);
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

      {!istAdmin && <LeseHinweis />}

      <div className="einst-card">
       <fieldset className="einst-fieldset" disabled={!istAdmin}>
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

export default EinstellungFirmaPage;
