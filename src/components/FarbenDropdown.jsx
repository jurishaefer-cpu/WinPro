import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function FarbenDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [confirmIndex, setConfirmIndex] = useState(null);
  const [katalog, setKatalog] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    supabase.from('farbe_katalog').select('*').order('id').then(({ data }) => setKatalog(data ?? []));
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setConfirmIndex(null);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Name → Code (für das Anzeigen des AP-Codes)
  const codeByName = {};
  katalog.forEach(k => { codeByName[k.name] = k.code; });

  function add() {
    const v = input.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setInput('');
  }
  function remove(i) {
    onChange(value.filter((_, idx) => idx !== i));
    setConfirmIndex(null);
  }
  function importieren() {
    const merged = [...value];
    katalog.forEach(k => { if (!merged.includes(k.name)) merged.push(k.name); });
    onChange(merged);
  }
  function onKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  }

  const label = value.length > 0 ? `Verfügbare Farben (${value.length})` : 'Verfügbare Farben';

  return (
    <div className="farben-dropdown" ref={ref}>
      <button type="button" className="farben-trigger" onClick={() => setOpen(o => !o)}>
        <span className="farben-trigger-text">{label}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 1l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <div className="farben-panel">
          {katalog.length > 0 && (
            <button type="button" className="farben-import-btn" onClick={importieren}>
              ↧ Alle {katalog.length} Farben aus Katalog übernehmen
            </button>
          )}

          <div className="farben-add-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Farbe manuell hinzufügen…"
              autoFocus
            />
            <button type="button" className="farben-add-btn" onClick={add}>Hinzufügen</button>
          </div>

          {value.length === 0 ? (
            <div className="farben-empty">Noch keine Farben.</div>
          ) : (
            <ul className="farben-list">
              {value.map((f, i) => (
                <li key={i} className="farben-list-item">
                  {confirmIndex === i ? (
                    <>
                      <span className="farben-confirm-text">„{f}" entfernen?</span>
                      <span className="farben-confirm-actions">
                        <button type="button" className="farben-confirm-yes" autoFocus onClick={() => remove(i)}>Ja</button>
                        <button type="button" className="farben-confirm-no" onClick={() => setConfirmIndex(null)}>Nein</button>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="farben-item-label">
                        {codeByName[f] && <span className="farben-code">{codeByName[f]}</span>}
                        {f}
                      </span>
                      <button type="button" onClick={() => setConfirmIndex(i)} title="Entfernen">✕</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default FarbenDropdown;
