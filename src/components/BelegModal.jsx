import BelegDokument from './BelegDokument';

function BelegModal({ onClose, ...docProps }) {
  return (
    <div className="beleg-overlay">
      <div className="beleg-toolbar">
        <span className="beleg-toolbar-titel">{docProps.art} {docProps.angebot?.belegnummer}</span>
        <div className="beleg-toolbar-actions">
          <button className="btn btn-outline" onClick={onClose}>Schließen</button>
          <button className="btn btn-primary btn-red" onClick={() => window.print()}>Drucken / Als PDF speichern</button>
        </div>
      </div>
      <div className="beleg-scroll">
        <div id="beleg-druck">
          <BelegDokument {...docProps} />
        </div>
      </div>
    </div>
  );
}

export default BelegModal;
