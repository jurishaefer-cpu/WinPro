import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { FIRMA_OWNER } from '../lib/einstellungen';

const ViewContext = createContext(null);

export function useView() {
  return useContext(ViewContext);
}

export function ViewProvider({ children }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);            // Verzeichnis aller Nutzer (app_users)
  const [rolle, setRolle] = useState(null);          // Rolle des eingeloggten Nutzers ('admin'|'mitarbeiter')
  const [selectedOwner, setSelectedOwner] = useState(null); // uuid eines Nutzers oder 'alle'

  // Standardansicht = eigene Kunden. WICHTIG: auch beim Benutzerwechsel (Ab-/Anmelden
  // ohne Seiten-Reload) auf den NEUEN Nutzer zurücksetzen – sonst behält der Filter die ID
  // des vorherigen Nutzers und man sieht dessen Kunden. Manuelle Auswahl bleibt innerhalb
  // derselben Anmeldung erhalten (Token-Refresh ändert die ID nicht).
  const lastUserId = useRef(null);
  useEffect(() => {
    if (!user) { lastUserId.current = null; setSelectedOwner(null); return; }
    if (user.id !== lastUserId.current) {
      lastUserId.current = user.id;
      setSelectedOwner(user.id);
    }
  }, [user]);

  // Eigenen Eintrag ins Verzeichnis schreiben + Liste + eigene Rolle laden.
  // Als Funktion, damit die Mitarbeiter-Verwaltung nach einer Rollenänderung neu laden kann.
  const refreshUsers = useCallback(async () => {
    if (!user) return;
    const m = user.user_metadata ?? {};
    if (m.first_name || m.last_name) {
      // Nur Name aktualisieren – die Spalte rolle bleibt unangetastet (kein Self-Upgrade).
      await supabase.from('app_users').upsert({
        id: user.id,
        vorname: m.first_name ?? '',
        nachname: m.last_name ?? '',
      });
    }
    const { data } = await supabase.from('app_users').select('*').order('vorname');
    setUsers(data ?? []);
    const me = (data ?? []).find(u => u.id === user.id);
    setRolle(me?.rolle ?? 'mitarbeiter');
  }, [user]);

  useEffect(() => {
    if (!user) { setUsers([]); setRolle(null); return; }
    refreshUsers();
  }, [user, refreshUsers]);

  // Der Firmen-Inhaber ist immer Admin (Fallback, schützt vor Aussperren, falls die
  // Rolle in der DB noch nicht gesetzt ist).
  const istAdmin = rolle === 'admin' || user?.id === FIRMA_OWNER;

  return (
    <ViewContext.Provider value={{ users, rolle, istAdmin, refreshUsers, selectedOwner, setSelectedOwner }}>
      {children}
    </ViewContext.Provider>
  );
}
