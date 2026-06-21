import { useState, useRef, useEffect } from 'react';
import { GeometrieThumb } from './FensterZeichnung';

function GeometrieSelect({ optionen, value, onChange }) {
  const [offen, setOffen] = useState(false);
  const ref = useRef(null);
  const aktiv = optionen.find(g => g.code === value);

  // nach Gruppe bündeln (Reihenfolge wie im Katalog)
  const gruppen = [];
  optionen.forEach(g => {
    const name = g.gruppe || 'Weitere';
    let eintrag = gruppen.find(e => e[0] === name);
    if (!eintrag) { eintrag = [name, []]; gruppen.push(eintrag); }
    eintrag[1].push(g);
  });

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOffen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function waehle(code) {
    onChange(code);
    setOffen(false);
  }

  return (
    <div className="geo-select" ref={ref}>
      <button type="button" className="geo-trigger" onClick={() => setOffen(o => !o)}>
        <span className="geo-thumb"><GeometrieThumb geometrie={aktiv} /></span>
        <span className="geo-text">
          <span className="geo-label">{aktiv?.label}</span>
          <span className="geo-code">{aktiv?.code}</span>
        </span>
        <svg className={'geo-caret' + (offen ? ' offen' : '')} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {offen && (
        <div className="geo-menu">
          {gruppen.map(([gruppe, items]) => (
            <div key={gruppe}>
              <div className="geo-gruppe">{gruppe}</div>
              {items.map(g => (
                <button
                  type="button"
                  key={g.code}
                  className={'geo-option' + (g.code === value ? ' aktiv' : '')}
                  onClick={() => waehle(g.code)}
                >
                  <span className="geo-thumb"><GeometrieThumb geometrie={g} /></span>
                  <span className="geo-text">
                    <span className="geo-label">{g.label}</span>
                    <span className="geo-code">{g.code}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GeometrieSelect;
