import { useState } from 'react';
import { supabase } from '../lib/supabase';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.');
      setLoading(false);
    }
    // Bei Erfolg übernimmt der AuthProvider automatisch (onAuthStateChange)
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <img src="/logo.png" alt="WinPro" className="login-logo" />
        <h1 className="login-title">Anmelden</h1>
        <p className="login-subtitle">Bitte melde dich mit deinem Konto an.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-field">
            <label>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
