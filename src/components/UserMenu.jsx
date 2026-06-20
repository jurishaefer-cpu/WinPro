import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useView } from '../view/ViewContext';

function getInitials(user) {
  const m = user?.user_metadata ?? {};
  const v = (m.first_name || '').trim();
  const n = (m.last_name || '').trim();
  if (v || n) return ((v[0] || '') + (n[0] || '')).toUpperCase();
  const full = (m.full_name || m.name || '').trim();
  if (full.includes(' ')) {
    const p = full.split(/\s+/);
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }
  const email = user?.email || '';
  return email.slice(0, 2).toUpperCase() || '?';
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const { users, selectedOwner, setSelectedOwner } = useView();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) return null;

  function choose(value) {
    setSelectedOwner(value);
    setOpen(false);
  }

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-avatar" onClick={() => setOpen(o => !o)} title={user.email}>
        {getInitials(user)}
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-email">{user.email}</div>

          <div className="user-dropdown-label">Kunden anzeigen von</div>
          {users.map(u => (
            <button
              key={u.id}
              className={'user-dropdown-item' + (selectedOwner === u.id ? ' is-active' : '')}
              onClick={() => choose(u.id)}
            >
              {u.vorname} {u.nachname}{u.id === user.id ? ' (Du)' : ''}
            </button>
          ))}
          <button
            className={'user-dropdown-item' + (selectedOwner === 'alle' ? ' is-active' : '')}
            onClick={() => choose('alle')}
          >
            Alle Kunden
          </button>

          <div className="user-dropdown-divider" />
          <button className="user-dropdown-item" onClick={signOut}>
            Abmelden
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
