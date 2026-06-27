// Hinweisbanner für Mitarbeiter: Einstellungen sind nur lesbar, nicht änderbar.
function LeseHinweis() {
  return (
    <div className="lese-hinweis">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <span>Nur der Administrator kann diese Einstellungen ändern. Du hast hier Leserechte.</span>
    </div>
  );
}

export default LeseHinweis;
