function DashboardCards({ kundenCount, profileCount }) {
  return (
    <div className="dashboard-cards">
      <div className="card card-highlight">
        <div className="card-icon">👥</div>
        <div className="card-number">{kundenCount ?? '–'}</div>
        <div className="card-title">Kunden</div>
        <div className="card-subtitle">Kontakte und Angebote</div>
      </div>

      <div className="card">
        <div className="card-icon">📋</div>
        <div className="card-number">{profileCount ?? '–'}</div>
        <div className="card-title">Profile</div>
        <div className="card-subtitle">Fenster- und Türsysteme</div>
      </div>

      <div className="card">
        <div className="card-icon">⚙️</div>
        <div className="card-title">Einstellungen</div>
        <div className="card-subtitle">Firma, PDF-Vorlage</div>
      </div>
    </div>
  );
}

export default DashboardCards;
