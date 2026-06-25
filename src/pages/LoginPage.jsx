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

  const fenster = [
    { width: 150, height: 190, left: '8%', top: '14%', animationDuration: '7s', animationDelay: '0s' },
    { width: 90, height: 120, left: '20%', top: '64%', animationDuration: '9s', animationDelay: '1.2s' },
    { width: 120, height: 150, left: '70%', top: '12%', animationDuration: '8s', animationDelay: '0.6s' },
    { width: 200, height: 240, left: '82%', top: '52%', animationDuration: '11s', animationDelay: '2s' },
    { width: 70, height: 95, left: '46%', top: '8%', animationDuration: '6.5s', animationDelay: '1.8s' },
    { width: 110, height: 140, left: '54%', top: '74%', animationDuration: '10s', animationDelay: '0.3s' },
  ];

  return (
    <div className="login-screen">
      <div className="login-bg" aria-hidden="true">
        {fenster.map((f, i) => <span key={i} className="login-window" style={f} />)}
      </div>
      <div className="login-card">
        <img src="/logo-hero.png" alt="WinPro – Smart Calkulation Software" className="login-logo" />
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
