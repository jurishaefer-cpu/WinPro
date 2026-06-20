import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

const ViewContext = createContext(null);

export function useView() {
  return useContext(ViewContext);
}

export function ViewProvider({ children }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);            // Verzeichnis aller Nutzer (app_users)
  const [selectedOwner, setSelectedOwner] = useState(null); // uuid eines Nutzers oder 'alle'

  // Standardansicht = eigene Kunden, sobald der Nutzer bekannt ist
  useEffect(() => {
    if (user && selectedOwner === null) setSelectedOwner(user.id);
  }, [user, selectedOwner]);

  // Eigenen Eintrag ins Verzeichnis schreiben + Liste laden
  useEffect(() => {
    if (!user) return;

    async function sync() {
      const m = user.user_metadata ?? {};
      if (m.first_name || m.last_name) {
        await supabase.from('app_users').upsert({
          id: user.id,
          vorname: m.first_name ?? '',
          nachname: m.last_name ?? '',
        });
      }
      const { data } = await supabase.from('app_users').select('*').order('vorname');
      setUsers(data ?? []);
    }
    sync();
  }, [user]);

  return (
    <ViewContext.Provider value={{ users, selectedOwner, setSelectedOwner }}>
      {children}
    </ViewContext.Provider>
  );
}
