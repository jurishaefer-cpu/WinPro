import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import KundenPage from './pages/KundenPage';
import NeuerKundePage from './pages/NeuerKundePage';
import KundeBearbeitenPage from './pages/KundeBearbeitenPage';
import ProfilePage from './pages/ProfilePage';
import NeuesProfilPage from './pages/NeuesProfilPage';
import ProfilBearbeitenPage from './pages/ProfilBearbeitenPage';
import EinstellungenPage from './pages/EinstellungenPage';
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
        <Route path="/kunden/:id/bearbeiten" element={<KundeBearbeitenPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/neu" element={<NeuesProfilPage />} />
        <Route path="/profile/:id/bearbeiten" element={<ProfilBearbeitenPage />} />
        <Route path="/einstellungen" element={<EinstellungenPage />} />
      </Routes>
      {nameFehlt && <NameSetupModal />}
    </div>
  );
}

export default App;
