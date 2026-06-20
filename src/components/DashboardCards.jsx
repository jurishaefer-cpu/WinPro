import { Link } from 'react-router-dom';

function DashboardCards({ kundenCount, profileCount }) {
  return (
    <div className="dashboard-cards">
      <Link to="/kunden" className="card card-highlight">
        <div className="card-icon">👥</div>
        <div className="card-number">{kundenCount ?? '–'}</div>
        <div className="card-title">Kunden</div>
        <div className="card-subtitle">Kontakte und Angebote</div>
      </Link>

      <Link to="/profile" className="card">
        <div className="card-icon">📋</div>
        <div className="card-number">{profileCount ?? '–'}</div>
        <div className="card-title">Profile</div>
        <div className="card-subtitle">Fenster- und Türsysteme</div>
      </Link>

      <Link to="/einstellungen" className="card">
        <div className="card-icon">⚙️</div>
        <div className="card-title">Einstellungen</div>
        <div className="card-subtitle">Firma, PDF-Vorlage</div>
      </Link>
    </div>
  );
}

export default DashboardCards;
