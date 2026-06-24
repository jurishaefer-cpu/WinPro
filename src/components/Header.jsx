import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import UserMenu from './UserMenu';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/kunden', label: 'Kunden' },
  { to: '/profile', label: 'Profile' },
  { to: '/einstellungen', label: 'Einstellungen' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Menü öffnen">
        <span />
        <span />
        <span />
      </button>

      <div className="header-left">
        <Link to="/" className="logo-link" aria-label="Zum Dashboard">
          <img src="/logo-white.png" alt="WinPro" className="logo-img" />
        </Link>
      </div>

      <div className="header-right">
        <nav className="header-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <UserMenu />
      </div>

      {menuOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />
          <nav className="drawer">
            <div className="drawer-head">
              <img src="/logo-white.png" alt="WinPro" className="drawer-logo" />
              <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Menü schließen">
                ✕
              </button>
            </div>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => (isActive ? 'drawer-link active' : 'drawer-link')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}

export default Header;
