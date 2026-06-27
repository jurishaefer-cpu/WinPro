import { useNavigate } from 'react-router-dom';
import { useView } from '../view/ViewContext';

const ICONS = {
  mitarbeiter: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  profil: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  firma: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M6 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M16 21V9h3a2 2 0 0 1 2 2v10" />
      <path d="M9 7h2M9 11h2M9 15h2" />
    </svg>
  ),
  dokumente: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  erscheinungsbild: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M12 2a10 10 0 1 0 0 20c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c2.954 0 5.563-2.41 5.563-5.375C23 6.012 18.06 2 12 2z" />
    </svg>
  ),
};

const BEREICHE = [
  { key: 'profil', to: '/einstellungen/profil', title: 'Mein Profil', text: 'Dein Name, Telefon und E-Mail als Ansprechpartner auf deinen Belegen.' },
  { key: 'firma', to: '/einstellungen/firma', title: 'Firmendaten', text: 'Name, Anschrift, Steuernummer und Bankverbindung für Belege.' },
  { key: 'dokumente', to: '/einstellungen/dokumente', title: 'Dokumente', text: 'Angebots-, Auftrags- und Rechnungsnummern, Zahlungsbedingungen.' },
  { key: 'erscheinungsbild', to: '/einstellungen/erscheinungsbild', title: 'Erscheinungsbild', text: 'Logo und Akzentfarbe für das eigene Unternehmen.' },
];

// Nur für den Administrator sichtbar.
const ADMIN_BEREICHE = [
  { key: 'mitarbeiter', to: '/einstellungen/mitarbeiter', title: 'Mitarbeiter', text: 'Nutzer und ihre Rollen verwalten. Mitarbeiter können Einstellungen ansehen, aber nicht ändern.' },
];

function EinstellungenPage() {
  const navigate = useNavigate();
  const { istAdmin } = useView();
  const bereiche = istAdmin ? [...BEREICHE, ...ADMIN_BEREICHE] : BEREICHE;

  return (
    <main className="app-main">
      <h1 className="form-title" style={{ marginBottom: 6 }}>Einstellungen</h1>
      <p className="settings-subtitle">Firmendaten, Dokumente und Erscheinungsbild verwalten.</p>

      <div className="settings-list">
        {bereiche.map(b => (
          <button
            key={b.key}
            className={'settings-card' + (b.badge ? ' settings-card--disabled' : '')}
            onClick={() => !b.badge && navigate(b.to)}
            disabled={!!b.badge}
          >
            <span className="settings-icon">{ICONS[b.key]}</span>
            <span className="settings-text">
              <span className="settings-title">
                {b.title}
                {b.badge && <span className="settings-badge">{b.badge}</span>}
              </span>
              <span className="settings-desc">{b.text}</span>
            </span>
            <svg className="settings-chevron" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>
    </main>
  );
}

export default EinstellungenPage;
