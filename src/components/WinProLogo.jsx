// Animiertes WinPro-Logo für den Login: Fenster (zwei Flügel) + Schriftzug.
// Bei `active` (Anmeldung läuft) gehen die Flügel auf und „WinPro" wandert ins Fenster.
function WinProLogo({ active }) {
  return (
    <div className={'wp-logo' + (active ? ' wp-logo--anmelden' : '')} role="img" aria-label="WinPro – Smart Calkulation Software">
      <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wpGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e3eefb" />
            <stop offset="0.5" stopColor="#a9c6e4" />
            <stop offset="1" stopColor="#cfe0f0" />
          </linearGradient>
          <linearGradient id="wpText" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b1a1a" />
            <stop offset="0.5" stopColor="#c0152e" />
            <stop offset="1" stopColor="#e0533f" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="600" height="300" rx="20" fill="#eef1f4" />

        {/* Fenster */}
        <g className="wp-window">
          {/* Rahmen */}
          <rect x="378" y="72" width="168" height="156" rx="6" fill="#cdd6e2" stroke="#3b4a63" strokeWidth="3" />
          {/* Flügel links (Scharnier links) */}
          <g className="wp-sash wp-sash--l">
            <rect x="388" y="84" width="64" height="132" rx="3" fill="url(#wpGlass)" stroke="#3b4a63" strokeWidth="2" />
          </g>
          {/* Flügel rechts (Scharnier rechts) */}
          <g className="wp-sash wp-sash--r">
            <rect x="472" y="84" width="64" height="132" rx="3" fill="url(#wpGlass)" stroke="#3b4a63" strokeWidth="2" />
          </g>
          {/* Mittelpfosten */}
          <line x1="462" y1="76" x2="462" y2="224" stroke="#3b4a63" strokeWidth="3" />
        </g>

        {/* Schriftzug */}
        <g className="wp-text">
          <text x="36" y="170" fontFamily="'Segoe UI', system-ui, sans-serif" fontSize="78" fontWeight="800" fill="url(#wpText)">WinPro</text>
        </g>
        <text className="wp-sub" x="40" y="212" fontFamily="'Segoe UI', system-ui, sans-serif" fontSize="21" fontWeight="600" fill="#243b5e">Smart Calkulation Software</text>
      </svg>
    </div>
  );
}

export default WinProLogo;
