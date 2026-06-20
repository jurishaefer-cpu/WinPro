import { NavLink } from 'react-router-dom';

function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        <img src="/logo-white.png" alt="WinPro" className="logo-img" />
      </div>
      <nav className="header-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Dashboard
        </NavLink>
        <NavLink to="/kunden" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Kunden
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Profile
        </NavLink>
        <NavLink to="/einstellungen" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Einstellungen
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
