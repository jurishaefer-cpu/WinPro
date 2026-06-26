import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useView } from '../view/ViewContext';
import { useAuth } from '../auth/AuthContext';
import DashboardCards from '../components/DashboardCards';

// Anrede-Name aus den Konto-Daten des eingeloggten Nutzers (Vorname, sonst E-Mail).
function getName(user) {
  const v = (user?.user_metadata?.first_name || '').trim();
  if (v) return v;
  const local = (user?.email || '').split('@')[0];
  return local || '';
}

function getGreeting(hour) {
  if (hour < 11) return 'Guten Morgen';
  if (hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function DashboardPage() {
  const [now, setNow] = useState(new Date());
  const [kundenCount, setKundenCount] = useState(null);
  const [profileCount, setProfileCount] = useState(null);
  const { selectedOwner } = useView();
  const { user } = useAuth();

  // Live-Uhr: jede Sekunde aktualisieren
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Anzahlen aus der Datenbank laden (passend zur gewählten Ansicht)
  useEffect(() => {
    if (!selectedOwner) return;
    async function laden() {
      let kq = supabase.from('kunden').select('*', { count: 'exact', head: true });
      if (selectedOwner !== 'alle') kq = kq.eq('owner_id', selectedOwner);
      const { count: kc } = await kq;
      setKundenCount(kc ?? 0);

      const { count: pc } = await supabase
        .from('profile')
        .select('*', { count: 'exact', head: true });
      setProfileCount(pc ?? 0);
    }
    laden();
  }, [selectedOwner]);

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
      <h1>{getGreeting(now.getHours())}, {getName(user)}!</h1>
      <p className="date-text">{datum} · {uhrzeit} Uhr</p>
      <DashboardCards kundenCount={kundenCount} profileCount={profileCount} />
    </main>
  );
}

export default DashboardPage;
