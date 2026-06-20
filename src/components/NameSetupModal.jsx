import { useState } from 'react';
import { supabase } from '../lib/supabase';

function NameSetupModal() {
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await supabase.auth.updateUser({
      data: { first_name: vorname.trim(), last_name: nachname.trim() },
    });
    // onAuthStateChange (USER_UPDATED) aktualisiert den Nutzer → Modal verschwindet automatisch
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Willkommen!</h2>
        <p className="modal-text">
          Bitte gib einmalig deinen Namen ein – daraus werden deine Initialen oben rechts erzeugt.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label>Vorname</label>
              <input value={vorname} onChange={e => setVorname(e.target.value)} required autoFocus />
            </div>
            <div className="form-field">
              <label>Nachname</label>
              <input value={nachname} onChange={e => setNachname(e.target.value)} required />
            </div>
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Speichern…' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NameSetupModal;
