import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import KundenPage from './pages/KundenPage';
import NeuerKundePage from './pages/NeuerKundePage';
import KundeBearbeitenPage from './pages/KundeBearbeitenPage';
import KundeDetailPage from './pages/KundeDetailPage';
import AngebotEditorPage from './pages/AngebotEditorPage';
import ProfilePage from './pages/ProfilePage';
import NeuesProfilPage from './pages/NeuesProfilPage';
import ProfilBearbeitenPage from './pages/ProfilBearbeitenPage';
import EinstellungenPage from './pages/EinstellungenPage';
import EinstellungProfilPage from './pages/EinstellungProfilPage';
import EinstellungFirmaPage from './pages/EinstellungFirmaPage';
import EinstellungDokumentePage from './pages/EinstellungDokumentePage';
import EinstellungErscheinungsbildPage from './pages/EinstellungErscheinungsbildPage';
import EinstellungMitarbeiterPage from './pages/EinstellungMitarbeiterPage';
import LoginPage from './pages/LoginPage';
import NameSetupModal from './components/NameSetupModal';
import { useAuth } from './auth/AuthContext';
import './App.css';

function App() {
  const { session, user } = useAuth();

  if (session === undefined) {
    return <div className="app-loading">Laden…</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  const meta = user?.user_metadata ?? {};
  const nameFehlt = !meta.first_name && !meta.last_name;

  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/kunden" element={<KundenPage />} />
        <Route path="/kunden/neu" element={<NeuerKundePage />} />
        <Route path="/kunden/:id" element={<KundeDetailPage />} />
        <Route path="/kunden/:id/angebote/:angebotId" element={<AngebotEditorPage />} />
        <Route path="/kunden/:id/bearbeiten" element={<KundeBearbeitenPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/neu" element={<NeuesProfilPage />} />
        <Route path="/profile/:id/bearbeiten" element={<ProfilBearbeitenPage />} />
        <Route path="/einstellungen" element={<EinstellungenPage />} />
        <Route path="/einstellungen/profil" element={<EinstellungProfilPage />} />
        <Route path="/einstellungen/firma" element={<EinstellungFirmaPage />} />
        <Route path="/einstellungen/dokumente" element={<EinstellungDokumentePage />} />
        <Route path="/einstellungen/erscheinungsbild" element={<EinstellungErscheinungsbildPage />} />
        <Route path="/einstellungen/mitarbeiter" element={<EinstellungMitarbeiterPage />} />
      </Routes>
      {nameFehlt && <NameSetupModal />}
    </div>
  );
}

export default App;
