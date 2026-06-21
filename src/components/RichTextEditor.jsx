import { useRef, useEffect } from 'react';

const FARBEN = [
  { name: 'Schwarz', wert: '#1a1a1a' },
  { name: 'Rot', wert: '#8b1a1a' },
  { name: 'Grau', wert: '#888888' },
];
const GROESSEN = [8, 9, 12];

function RichTextEditor({ initialHtml, onChange, placeholder, minHeight = 150 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && initialHtml != null) ref.current.innerHTML = initialHtml;
    // nur einmal beim Mounten
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fire() {
    onChange?.(ref.current?.innerHTML ?? '');
  }

  function exec(cmd, value) {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    fire();
  }

  function setGroesse(pt) {
    ref.current?.focus();
    document.execCommand('fontSize', false, '7');
    ref.current?.querySelectorAll('font[size="7"]').forEach(f => {
      f.removeAttribute('size');
      f.style.fontSize = pt + 'pt';
    });
    fire();
  }

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <button type="button" className="rte-btn bold" title="Fett" onClick={() => exec('bold')}>F</button>
        <button type="button" className="rte-btn italic" title="Kursiv" onClick={() => exec('italic')}>K</button>
        <button type="button" className="rte-btn underline" title="Unterstrichen" onClick={() => exec('underline')}>U</button>
        <span className="rte-sep" />
        {FARBEN.map(f => (
          <button key={f.wert} type="button" className="rte-color" title={f.name}
                  style={{ background: f.wert }} onClick={() => exec('foreColor', f.wert)} />
        ))}
        <span className="rte-sep" />
        {GROESSEN.map(g => (
          <button key={g} type="button" className="rte-btn" title={`Schriftgröße ${g}`} onClick={() => setGroesse(g)}>{g}</button>
        ))}
      </div>
      <div
        ref={ref}
        className="rte-area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={fire}
        style={{ minHeight }}
      />
    </div>
  );
}

export default RichTextEditor;
