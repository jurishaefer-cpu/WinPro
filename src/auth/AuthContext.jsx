import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // undefined = noch am Laden, null = nicht eingeloggt, Objekt = eingeloggt
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // Beim Tab-/Fensterwechsel feuert Supabase einen Token-Refresh. Bleibt es dieselbe
      // Anmeldung, halten wir die Session-Referenz stabil – sonst laden abhängige
      // Komponenten (z.B. ein offener Editor) neu und ungespeicherte Eingaben gehen verloren.
      // Bei USER_UPDATED (z.B. Namens-Änderung) muss die Session aber aktualisiert werden.
      setSession(prev =>
        event !== 'USER_UPDATED' && prev && s && prev.user?.id === s.user?.id ? prev : (s ?? null));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    signOut: () => supabase.auth.signOut(),
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
