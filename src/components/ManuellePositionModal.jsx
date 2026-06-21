import { useState } from 'react';
import RichTextEditor from './RichTextEditor';

function ManuellePositionModal({ onClose, onSave, initial }) {
  const [beschreibung, setBeschreibung] = useState(initial?.beschreibung ?? '');
  const [nettopreis, setNettopreis] = useState(
    initial && initial.nettopreis ? String(initial.nettopreis).replace('.', ',') : ''
  );
  const [saving, setSaving] = useState(false);

  async function handleOk() {
    const preis = parseFloat(String(nettopreis).replace(',', '.')) || 0;
    setSaving(true);
    await onSave({ beschreibung, nettopreis: preis });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{initial ? 'Position bearbeiten' : 'Manuelle Position'}</h2>

        <label className="editor-bezeichnung" style={{ marginBottom: 8 }}>
          <span style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#4a4f57', marginBottom: 8 }}>
            Beschreibung
          </span>
        </label>

        <div style={{ marginBottom: 20 }}>
          <RichTextEditor
            initialHtml={initial?.beschreibung}
            onChange={setBeschreibung}
            placeholder="Beschreibung der Position…"
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
