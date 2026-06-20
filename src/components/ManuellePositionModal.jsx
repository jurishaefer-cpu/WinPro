import { useRef, useState } from 'react';

const FARBEN = [
  { name: 'Schwarz', wert: '#1a1a1a' },
  { name: 'Rot', wert: '#8b1a1a' },
  { name: 'Grau', wert: '#888888' },
];
const GROESSEN = [8, 9, 12];

function ManuellePositionModal({ onClose, onSave }) {
  const editorRef = useRef(null);
  const [nettopreis, setNettopreis] = useState('');
  const [saving, setSaving] = useState(false);

  function exec(cmd, value) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  }

  function setGroesse(pt) {
    editorRef.current?.focus();
    document.execCommand('fontSize', false, '7');
    editorRef.current?.querySelectorAll('font[size="7"]').forEach(f => {
      f.removeAttribute('size');
      f.style.fontSize = pt + 'pt';
    });
  }

  async function handleOk() {
    const beschreibung = editorRef.current?.innerHTML ?? '';
    const preis = parseFloat(String(nettopreis).replace(',', '.')) || 0;
    setSaving(true);
    await onSave({ beschreibung, nettopreis: preis });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Manuelle Position</h2>

        <label className="editor-bezeichnung" style={{ marginBottom: 8 }}>
          <span style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#4a4f57', marginBottom: 8 }}>
            Beschreibung
          </span>
        </label>

        <div className="rte" style={{ marginBottom: 20 }}>
          <div className="rte-toolbar">
            <button type="button" className="rte-btn bold" title="Fett" onClick={() => exec('bold')}>F</button>
            <button type="button" className="rte-btn italic" title="Kursiv" onClick={() => exec('italic')}>K</button>
            <button type="button" className="rte-btn underline" title="Unterstrichen" onClick={() => exec('underline')}>U</button>
            <span className="rte-sep" />
            {FARBEN.map(f => (
              <button
                key={f.wert}
                type="button"
                className="rte-color"
                title={f.name}
                style={{ background: f.wert }}
                onClick={() => exec('foreColor', f.wert)}
              />
            ))}
            <span className="rte-sep" />
            {GROESSEN.map(g => (
              <button key={g} type="button" className="rte-btn" title={`Schriftgröße ${g}`} onClick={() => setGroesse(g)}>
                {g}
              </button>
            ))}
          </div>
          <div
            ref={editorRef}
            className="rte-area"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Beschreibung der Position…"
          />
        </div>

        <label className="editor-bezeichnung">
          <span style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#4a4f57', marginBottom: 8 }}>
            Nettopreis (€)
          </span>
          <input
            inputMode="decimal"
            value={nettopreis}
            onChange={e => setNettopreis(e.target.value)}
            placeholder="0,00"
          />
        </label>

        <div className="modal-actions" style={{ marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-danger" onClick={handleOk} disabled={saving}>
            {saving ? 'Speichern…' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManuellePositionModal;
