import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useView } from '../view/ViewContext';
import { supabase } from '../lib/supabase';

function EinstellungMitarbeiterPage() {
  const { user } = useAuth();
  const { users, istAdmin, refreshUsers } = useView();
  const [busy, setBusy] = useState(null); // id, dessen Übertragung gerade läuft
  const [fehler, setFehler] = useState('');

  // Nur der Administrator darf diese Seite sehen.
  if (!istAdmin) return <Navigate to="/einstellungen" replace />;

  // Eingeloggter Nutzer zuoberst, Rest alphabetisch.
  const liste = [...users].sort((a, b) => {
    if (a.id === user.id) return -1;
    if (b.id === user.id) return 1;
    return (a.vorname || '').localeCompare(b.vorname || '', 'de');
  });

  async function uebertrageAdmin(ziel) {
    const name = `${ziel.vorname ?? ''} ${ziel.nachname ?? ''}`.trim() || 'diesen Nutzer';
    const ok = window.confirm(
      `Administrator-Rechte an ${name} übertragen?\n\n` +
      `Danach kannst du selbst die Einstellungen nur noch ansehen, aber nicht mehr ändern. ` +
      `Es gibt immer nur einen Administrator.`
    );
    if (!ok) return;
    setBusy(ziel.id);
    setFehler('');
    const { error } = await supabase.rpc('set_admin', { target: ziel.id });
    if (error) {
      setFehler('Übertragung fehlgeschlagen: ' + error.message);
    } else {
      await refreshUsers();
    }
    setBusy(null);
  }

  return (
    <main className="app-main">
      <Link to="/einstellungen" className="back-link einst-back">‹ Zurück zu den Einstellungen</Link>
      <h1 className="form-title" style={{ marginBottom: 6 }}>Mitarbeiter</h1>
      <p className="settings-subtitle">
        Alle Nutzer und ihre Rollen. Der Administrator verwaltet Firmendaten, Dokumente und
        Erscheinungsbild – Mitarbeiter können diese nur ansehen.
      </p>

      <div className="einst-card">
        <ul className="mitarbeiter-liste">
          {liste.map(u => {
            const adminRolle = u.rolle === 'admin';
            const name = `${u.vorname ?? ''} ${u.nachname ?? ''}`.trim();
            return (
              <li key={u.id} className="mitarbeiter-row">
                <span className="mitarbeiter-name">
                  {name || 'Ohne Namen'}{u.id === user.id ? ' (Du)' : ''}
                </span>
                <span className={'rollen-badge' + (adminRolle ? ' rollen-badge--admin' : '')}>
                  {adminRolle ? 'Administrator' : 'Mitarbeiter'}
                </span>
                {!adminRolle && (
                  <button
                    className="btn btn-secondary btn-klein"
                    onClick={() => uebertrageAdmin(u)}
                    disabled={busy !== null}
                  >
                    {busy === u.id ? 'Übertrage…' : 'Zum Administrator machen'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {fehler && <p className="mitarbeiter-fehler">{fehler}</p>}
      </div>

      <div className="einst-card mitarbeiter-info">
        <h2 className="section-label">NEUEN MITARBEITER HINZUFÜGEN</h2>
        <p className="einst-hinweis">
          Neue Konten legst du im Supabase-Dashboard an (E-Mail + Passwort, „Auto Confirm User“
          aktivieren). Nach der ersten Anmeldung erscheint der Mitarbeiter hier automatisch mit der
          Rolle „Mitarbeiter“.
        </p>
      </div>
    </main>
  );
}

export default EinstellungMitarbeiterPage;
