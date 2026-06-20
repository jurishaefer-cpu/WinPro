import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DashboardCards from '../components/DashboardCards';

// TODO: später aus den Einstellungen (Firmen-/Benutzername) laden
const NAME = 'Juri';

function getGreeting(hour) {
  if (hour < 11) return 'Guten Morgen';
  if (hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function DashboardPage() {
  const [now, setNow] = useState(new Date());
  const [kundenCount, setKundenCount] = useState(null);
  const [profileCount, setProfileCount] = useState(null);

  // Live-Uhr: jede Sekunde aktualisieren
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Anzahlen aus der Datenbank laden
  useEffect(() => {
    async function laden() {
      const { count: kc } = await supabase
        .from('kunden')
        .select('*', { count: 'exact', head: true });
      setKundenCount(kc ?? 0);

      const { count: pc } = await supabase
        .from('profile')
        .select('*', { count: 'exact', head: true });
      setProfileCount(pc ?? 0);
    }
    laden();
  }, []);

  const datum = now.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const uhrzeit = now.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main className="app-main">
      <h1>{getGreeting(now.getHours())}, {NAME}!</h1>
      <p className="date-text">{datum} · {uhrzeit} Uhr</p>
      <DashboardCards kundenCount={kundenCount} profileCount={profileCount} />
    </main>
  );
}

export default DashboardPage;
