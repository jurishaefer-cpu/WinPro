import { useRef, useEffect, useState } from 'react';
import BelegDokument from './BelegDokument';

const A4_BREITE = 794;          // A4-Breite in px (210 mm @ 96 dpi)
const A4_HOEHE = 1123;          // A4-Hoehe in px (297 mm @ 96 dpi)
const RAND_MM = 12;             // gleichmaessiger oberer/unterer Seitenrand je Seite

function dateiName(art, nummer) {
  return `${art || 'Beleg'} ${nummer || ''}`.trim().replace(/[\\/:*?"<>|]+/g, '-') + '.pdf';
}

function BelegModal({ onClose, ...docProps }) {
  const scrollRef = useRef(null);
  const buehneRef = useRef(null);
  const druckRef = useRef(null);
  const [busy, setBusy] = useState(false);

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

  // Erzeugt die PDF selbst (ohne Browser-Druckdialog) -> nie Browser-Kopf-/Fusszeilen.
  async function exportPdf() {
    if (busy || !druckRef.current) return;
    setBusy(true);
    let holder;
    try {
      const [{ jsPDF }, html2canvasMod] = await Promise.all([import('jspdf'), import('html2canvas')]);
      const html2canvas = html2canvasMod.default;

      // Sauberer Klon mit Blockfluss (wie ein echtes A4-Blatt), abseits des Bildschirms
      const clone = druckRef.current.cloneNode(true);
      clone.removeAttribute('id');
      const beleg = clone.querySelector('.beleg');
      if (beleg) {
        beleg.style.width = `${A4_BREITE}px`;
        beleg.style.minHeight = '0';
        beleg.style.display = 'block';
        beleg.style.boxShadow = 'none';
        beleg.style.padding = '0 54px';           // Seitenrand links/rechts (oben/unten ueber RAND_MM)
        const fussLinie = clone.querySelector('.beleg-akzentlinie--fuss');
        if (fussLinie) fussLinie.style.marginTop = '30px';
      }
      holder = document.createElement('div');
      holder.style.cssText = `position:fixed; left:-10000px; top:0; width:${A4_BREITE}px; background:#fff;`;
      holder.appendChild(clone);
      document.body.appendChild(holder);

      // Logo/Bilder fertig laden lassen
      await Promise.all(Array.from(clone.querySelectorAll('img')).map(img =>
        img.complete ? Promise.resolve() : new Promise(res => { img.onload = img.onerror = res; })));

      // Sinnvolle Schnittkanten: zwischen Tabellenzeilen und Hauptblöcken, nie mitten durch
      const belEl = clone.querySelector('.beleg');
      const top = belEl.getBoundingClientRect().top;
      const atome = belEl.querySelectorAll(
        '.beleg-kopf, .beleg-adressen, .beleg-titel, .beleg-anrede, .beleg-intro, .beleg-bauvorhaben, .beleg-tabelle thead, .beleg-tabelle tbody tr, .beleg-summen, .beleg-zahlung, .beleg-fuss');
      const schnitte = Array.from(atome).map(el => el.getBoundingClientRect().bottom - top);

      const scale = 3;
      const canvas = await html2canvas(clone, { scale, backgroundColor: '#ffffff', useCORS: true, windowWidth: A4_BREITE });
      const gesamtCss = canvas.height / scale;     // Dokumenthöhe in CSS-px

      const pxProMm = A4_BREITE / 210;
      const nutzHoeheCss = A4_HOEHE - 2 * RAND_MM * pxProMm;   // nutzbare Höhe je Seite (mit Rand)

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      let startCss = 0;
      let erste = true;
      while (startCss < gesamtCss - 1) {
        const zielEnde = startCss + nutzHoeheCss;
        // letzte Schnittkante, die noch auf die Seite passt
        let endeCss = schnitte.filter(s => s > startCss + 1 && s <= zielEnde).pop();
        if (endeCss == null) endeCss = Math.min(zielEnde, gesamtCss); // Notfall: harter Schnitt
        if (endeCss >= gesamtCss - 1) endeCss = gesamtCss;

        const sliceTopPx = Math.round(startCss * scale);
        const sliceHpx = Math.round((endeCss - startCss) * scale);
        const teil = document.createElement('canvas');
        teil.width = canvas.width;
        teil.height = sliceHpx;
        teil.getContext('2d').drawImage(canvas, 0, sliceTopPx, canvas.width, sliceHpx, 0, 0, canvas.width, sliceHpx);

        const bildHmm = (sliceHpx / scale) / pxProMm;
        if (!erste) pdf.addPage();
        pdf.addImage(teil.toDataURL('image/jpeg', 0.92), 'JPEG', 0, RAND_MM, 210, bildHmm);
        erste = false;
        startCss = endeCss;
      }

      pdf.save(dateiName(docProps.art, docProps.angebot?.belegnummer));
    } catch (e) {
      console.error(e);
      alert('PDF konnte nicht erstellt werden. Bitte erneut versuchen.');
    } finally {
      if (holder) document.body.removeChild(holder);
      setBusy(false);
    }
  }

  return (
    <div className="beleg-overlay">
      <div className="beleg-toolbar">
        <span className="beleg-toolbar-titel">{docProps.art} {docProps.angebot?.belegnummer}</span>
        <div className="beleg-toolbar-actions">
          <button className="btn btn-outline" onClick={onClose} disabled={busy}>Schließen</button>
          <button className="btn btn-primary btn-red" onClick={exportPdf} disabled={busy}>
            {busy ? 'PDF wird erstellt…' : 'Drucken / PDF'}
          </button>
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
