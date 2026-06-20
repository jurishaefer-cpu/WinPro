import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import KundenPage from './pages/KundenPage';
import NeuerKundePage from './pages/NeuerKundePage';
import KundeBearbeitenPage from './pages/KundeBearbeitenPage';
import ProfilePage from './pages/ProfilePage';
import EinstellungenPage from './pages/EinstellungenPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/kunden" element={<KundenPage />} />
        <Route path="/kunden/neu" element={<NeuerKundePage />} />
        <Route path="/kunden/:id/bearbeiten" element={<KundeBearbeitenPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/einstellungen" element={<EinstellungenPage />} />
      </Routes>
    </div>
  );
}

export default App;
