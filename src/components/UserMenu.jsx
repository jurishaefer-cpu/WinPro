import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

function getInitials(email) {
  if (!email) return '?';
  const name = email.split('@')[0];
  const parts = name.split(/[.\-_]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function UserMenu() {
  const { user, signOut } = useAuth();
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

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-avatar" onClick={() => setOpen(o => !o)} title={user.email}>
        {getInitials(user.email)}
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-email">{user.email}</div>
          <button className="user-dropdown-item" onClick={signOut}>
            Abmelden
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
