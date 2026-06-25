// Animiertes WinPro-Logo für den Login (HTML/CSS – läuft zuverlässig in allen Browsern).
// Bei `active` (Anmeldung läuft) schwingen die Fensterflügel in 3D auf und „WinPro" fliegt ins Fenster.
function WinProLogo({ active }) {
  return (
    <div className={'wp-logo' + (active ? ' wp-logo--anmelden' : '')} role="img" aria-label="WinPro – Smart Calkulation Software">
      <div className="wp-stage">
        <div className="wp-wordmark">
          <span className="wp-name">WinPro</span>
          <span className="wp-tagline">Smart Calkulation Software</span>
        </div>
        <div className="wp-window">
          <span className="wp-sash wp-sash--l" />
          <span className="wp-sash wp-sash--r" />
        </div>
      </div>
    </div>
  );
}

export default WinProLogo;
