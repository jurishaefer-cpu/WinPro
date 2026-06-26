import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Intro-Video beim Öffnen der Login-Seite. Datei liegt unter /public (=> /intro.mp4).
// Fehlt die Datei oder lässt sie sich nicht abspielen, wird sofort die Login-Karte gezeigt.
const INTRO_SRC = '/intro.mp4';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const failTimer = useRef(null);

  // Sicherheitsnetz: Startet das Video nicht innerhalb weniger Sekunden (fehlt/blockiert),
  // direkt zur Login-Karte wechseln – die Seite bleibt so nie hängen.
  useEffect(() => {
    failTimer.current = setTimeout(() => setShowIntro(false), 5000);
    return () => clearTimeout(failTimer.current);
  }, []);

  function beendeIntro() { clearTimeout(failTimer.current); setShowIntro(false); }
  function videoLaeuft() { clearTimeout(failTimer.current); }

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
      {showIntro && (
        <div className="login-intro" onClick={beendeIntro}>
          <video
            className="login-intro-video"
            src={INTRO_SRC}
            autoPlay
            muted
            playsInline
            preload="auto"
            onPlaying={videoLaeuft}
            onEnded={beendeIntro}
            onError={beendeIntro}
          />
          <button
            type="button"
            className="login-intro-skip"
            onClick={(e) => { e.stopPropagation(); beendeIntro(); }}
          >
            Überspringen ›
          </button>
        </div>
      )}

      <div className="login-card">
        <img src="/logo-hero-v2.png" alt="WinPro – Smart Calculation Software" className="login-logo" />
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
