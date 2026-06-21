import { useRef, useEffect } from 'react';
import BelegDokument from './BelegDokument';

const A4_BREITE = 794;

function BelegModal({ onClose, ...docProps }) {
  const scrollRef = useRef(null);
  const buehneRef = useRef(null);
  const druckRef = useRef(null);

  useEffect(() => {
    function fit() {
      if (!scrollRef.current || !buehneRef.current || !druckRef.current) return;
      const contentW = scrollRef.current.clientWidth - 24; // 2 × 12px Innenabstand
      const scale = Math.min(1, contentW / A4_BREITE);
      const tx = Math.max(0, (contentW - A4_BREITE * scale) / 2);
      const h = druckRef.current.offsetHeight;
      buehneRef.current.style.transform = `translateX(${tx}px) scale(${scale})`;
      buehneRef.current.style.height = `${h * scale}px`;
    }
    fit();
    const ro = new ResizeObserver(fit);
    if (druckRef.current) ro.observe(druckRef.current);
    window.addEventListener('resize', fit);
    const t = setTimeout(fit, 400); // nach Logo-Laden nachjustieren
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); clearTimeout(t); };
  }, []);

  return (
    <div className="beleg-overlay">
      <div className="beleg-toolbar">
        <span className="beleg-toolbar-titel">{docProps.art} {docProps.angebot?.belegnummer}</span>
        <div className="beleg-toolbar-actions">
          <button className="btn btn-outline" onClick={onClose}>Schließen</button>
          <button className="btn btn-primary btn-red" onClick={() => window.print()}>Drucken / PDF</button>
        </div>
      </div>
      <div className="beleg-scroll" ref={scrollRef}>
        <div className="beleg-buehne" ref={buehneRef}>
          <div id="beleg-druck" ref={druckRef}>
            <BelegDokument {...docProps} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BelegModal;
