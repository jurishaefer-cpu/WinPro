import { useParams, Link } from 'react-router-dom';

const TITEL = {
  profil: 'Mein Profil',
  firma: 'Firmendaten',
  erscheinungsbild: 'Erscheinungsbild',
};

function EinstellungDetailPage() {
  const { bereich } = useParams();
  const titel = TITEL[bereich] ?? 'Einstellungen';

  return (
    <main className="app-main">
      <Link to="/einstellungen" className="back-link">← Zurück zu Einstellungen</Link>
      <h1 className="form-title">{titel}</h1>
      <div className="form-section">
        <p className="settings-desc">Dieser Bereich wird als Nächstes eingerichtet.</p>
      </div>
    </main>
  );
}

export default EinstellungDetailPage;
