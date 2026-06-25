import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ladeEinstellungen, speichereSektion } from '../lib/einstellungen';
import { DEFAULT_NUMMERN, BELEG_ART, formatBelegnummer } from '../lib/belegHelfer';

const ARTEN = [
  { key: 'Angebot', label: 'Angebot' },
  { key: 'Auftragsbestätigung', label: 'Auftragsbestätigung' },
  { key: 'Rechnung', label: 'Rechnung' },
];

function initForm(dok) {
  const nummern = {};
  const zahlung = {};
  ARTEN.forEach(({ key }) => {
    nummern[key] = { ...DEFAULT_NUMMERN[key], ...(dok?.nummern?.[key] ?? {}) };
    zahlung[key] = dok?.zahlung?.[key] ?? (BELEG_ART[key]?.zahlung ?? '');
  });
  return { nummern, zahlung };
}

function EinstellungDokumentePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function laden() {
      const data = await ladeEinstellungen(user.id);
      setForm(initForm(data.dokumente));
    }
    laden();
  }, [user]);

  function setNummer(key, feld, wert) {
    setForm(f => ({ ...f, nummern: { ...f.nummern, [key]: { ...f.nummern[key], [feld]: wert } } }));
  }
  function setZahlung(key, wert) {
    setForm(f => ({ ...f, zahlung: { ...f.zahlung, [key]: wert } }));
  }

  async function speichern() {
    setSaving(true);
    await speichereSektion(user.id, 'dokumente', form);
    navigate('/einstellungen');
  }

  if (!form) return <main className="app-main"><p>Laden…</p></main>;

  const jahr = new Date().getFullYear();

  return (
    <main className="app-main">
      <Link to="/einstellungen" className="back-link einst-back">‹ Zurück zu den Einstellungen</Link>
      <h1 className="form-title" style={{ marginBottom: 6 }}>Dokumente</h1>
      <p className="settings-subtitle">Angebots-, Auftrags- und Rechnungsnummern, Zahlungsbedingungen.</p>

      <div className="einst-card">
        <section className="einst-section">
          <h2 className="section-label">NUMMERNKREISE</h2>
          <p className="einst-hinweis">
            Jede Belegart zählt eigenständig hoch. Bereits vergebene Nummern bleiben unverändert –
            Änderungen wirken nur auf neu erstellte Belege.
          </p>

          {ARTEN.map(({ key, label }) => {
            const cfg = form.nummern[key];
            return (
              <div key={key} className="dok-nummer">
                <div className="dok-nummer-kopf">
                  <span className="dok-nummer-titel">{label}</span>
                  <span className="dok-nummer-vorschau">{formatBelegnummer(cfg, cfg.start ?? 1, jahr)}</span>
                </div>
                <div className="dok-nummer-felder">
                  <div className="form-field form-field--narrow">
                    <label>Nächste Nummer</label>
                    <input
                      type="number" min="1"
                      value={cfg.start ?? 1}
                      onChange={e => setNummer(key, 'start', Math.max(1, Number(e.target.value) || 1))}
                    />
                  </div>
                  <div className="form-field form-field--narrow">
                    <label>Stellen</label>
                    <input
                      type="number" min="1" max="8"
                      value={cfg.stellen}
                      onChange={e => setNummer(key, 'stellen', Math.min(8, Math.max(1, Number(e.target.value) || 1)))}
                    />
                  </div>
                  <label className="dok-checkbox">
                    <input
                      type="checkbox"
                      checked={!!cfg.jahr}
                      onChange={e => setNummer(key, 'jahr', e.target.checked)}
                    />
                    Jahr in der Nummer
                  </label>
                </div>
              </div>
            );
          })}
        </section>

        <section className="einst-section">
          <h2 className="section-label">ZAHLUNGSBEDINGUNGEN</h2>
          <p className="einst-hinweis">Dieser Text erscheint auf dem jeweiligen Beleg.</p>
          {ARTEN.map(({ key, label }) => (
            <div key={key} className="form-field">
              <label>{label}</label>
              <textarea
                rows={3}
                value={form.zahlung[key]}
                onChange={e => setZahlung(key, e.target.value)}
              />
            </div>
          ))}
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

export default EinstellungDokumentePage;
