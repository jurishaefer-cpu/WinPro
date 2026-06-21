import { useRef, useEffect, useState } from 'react';
import BelegDokument from './BelegDokument';

const A4_BREITE = 794;          // A4-Breite in px (210 mm @ 96 dpi)
const A4_HOEHE = 1123;          // A4-Hoehe in px (297 mm @ 96 dpi)
const RAND_MM = 12;             // gleichmaessiger oberer/unterer Seitenrand je Seite

function dateiName(art, nummer) {
  return `${art || 'Beleg'} ${nummer || ''}`.trim().replace(/[\\/:*?"<>|]+/g, '-') + '.pdf';
}

// Findet auf einer verkleinerten Kopie die nicht-leeren Ränder (für sauberes Zuschneiden/Umbrechen).
function scanInfo(canvas) {
  const SW = 120;
  const SH = Math.max(1, Math.round(canvas.height * SW / canvas.width));
  const sc = document.createElement('canvas'); sc.width = SW; sc.height = SH;
  const sctx = sc.getContext('2d');
  sctx.fillStyle = '#fff'; sctx.fillRect(0, 0, SW, SH);
  sctx.drawImage(canvas, 0, 0, SW, SH);
  const sdata = sctx.getImageData(0, 0, SW, SH).data;
  const leer = (y) => {
    const b = y * SW * 4;
    for (let x = 0; x < SW; x++) { const i = b + x * 4; if (sdata[i] < 248 || sdata[i + 1] < 248 || sdata[i + 2] < 248) return false; }
    return true;
  };
  let oben = 0; while (oben < SH && leer(oben)) oben++;
  let unten = SH - 1; while (unten > oben && leer(unten)) unten--;
  oben = Math.max(0, oben - 1);
  unten = Math.min(SH, unten + 2);
  return { ratio: canvas.height / SH, leer, oben, unten };
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

  // Erzeugt die PDF selbst (ohne Browser-Druckdialog) und öffnet sie direkt zum Drucken.
  async function exportPdf() {
    if (busy || !druckRef.current) return;
    // Druck-Tab sofort im Klick öffnen (sonst blockt der Popup-Blocker nach dem await)
    const druckFenster = window.open('', '_blank');
    if (druckFenster) druckFenster.document.write('<title>Beleg</title><p style="font-family:sans-serif;color:#555;padding:24px">Beleg wird vorbereitet…</p>');
    setBusy(true);
    let holder;
    try {
      const [{ jsPDF }, html2canvasMod] = await Promise.all([import('jspdf'), import('html2canvas')]);
      const html2canvas = html2canvasMod.default;
      const scale = 3;
      const pxProMm = A4_BREITE / 210;
      const opts = { scale, backgroundColor: '#ffffff', useCORS: true, windowWidth: A4_BREITE };

      holder = document.createElement('div');
      holder.style.cssText = `position:fixed; left:-10000px; top:0; width:${A4_BREITE}px; background:#fff;`;
      document.body.appendChild(holder);

      // Klon im Blockfluss (wie ein echtes A4-Blatt)
      const clone = druckRef.current.cloneNode(true);
      clone.removeAttribute('id');
      const beleg = clone.querySelector('.beleg');
      Object.assign(beleg.style, { width: `${A4_BREITE}px`, minHeight: '0', display: 'block', boxShadow: 'none', padding: '0 54px' });

      // Fuß abtrennen -> wird immer ans untere Seitenende der letzten Seite gesetzt
      const fussLinie = clone.querySelector('.beleg-akzentlinie--fuss');
      const fussBlock = clone.querySelector('.beleg-fuss');
      const fussWrap = document.createElement('div');
      fussWrap.className = 'beleg';
      fussWrap.style.cssText = `width:${A4_BREITE}px; min-height:0; display:block; box-shadow:none; padding:0 54px; background:#fff;`;
      if (fussLinie) { fussLinie.style.marginTop = '0'; fussWrap.appendChild(fussLinie); }
      if (fussBlock) fussWrap.appendChild(fussBlock);
      const hatFuss = fussWrap.childElementCount > 0;

      holder.appendChild(clone);
      if (hatFuss) holder.appendChild(fussWrap);

      // Logo/Bilder fertig laden lassen
      await Promise.all(Array.from(holder.querySelectorAll('img')).map(img =>
        img.complete ? Promise.resolve() : new Promise(res => { img.onload = img.onerror = res; })));

      // Fenster-SVGs vorab in feste Pixelbilder umwandeln – html2canvas rendert inline-SVG
      // je nach Browser (v.a. Safari) falsch (riesig/leer), das beseitigt es zuverlässig.
      await Promise.all(Array.from(clone.querySelectorAll('svg')).map(svg => new Promise(resolve => {
        const r = svg.getBoundingClientRect();
        const w = Math.max(1, Math.round(r.width));
        const h = Math.max(1, Math.round(r.height));
        const masz = svg.cloneNode(true);
        masz.setAttribute('width', String(w));
        masz.setAttribute('height', String(h));
        const xml = new XMLSerializer().serializeToString(masz);
        const quelle = new Image();
        quelle.onload = () => {
          try {
            const c = document.createElement('canvas');
            c.width = w * 3; c.height = h * 3;
            c.getContext('2d').drawImage(quelle, 0, 0, c.width, c.height);
            const out = document.createElement('img');
            out.style.cssText = `width:${w}px;height:${h}px;display:block`;
            out.onload = out.onerror = () => resolve();
            out.src = c.toDataURL('image/png');
            svg.parentNode.replaceChild(out, svg);
          } catch { resolve(); }   // im Zweifel SVG belassen
        };
        quelle.onerror = () => resolve();
        quelle.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      })));

      const bodyCanvas = await html2canvas(clone, opts);
      const body = scanInfo(bodyCanvas);

      // Ganzen Fuß (inkl. roter Linie) erfassen – NICHT trimmen, sonst verschwindet die 2px-Linie
      let fussCanvas = null, fussHmm = 0;
      if (hatFuss) {
        fussCanvas = await html2canvas(fussWrap, opts);
        fussHmm = (fussCanvas.height / scale) / pxProMm;
      }

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const fussReserveMm = hatFuss ? fussHmm + 8 : 0;     // Platz für den Fuß auf jeder Seite freihalten
      const nutzScan = ((A4_HOEHE - (2 * RAND_MM + fussReserveMm) * pxProMm) * scale) / body.ratio;
      const fussYmm = 297 - RAND_MM - fussHmm;             // Fuß unten, mit unterem Rand

      const zeichne = (canvas, info, startScan, cutScan, yMm) => {
        const startFull = Math.round(startScan * info.ratio);
        const hpx = Math.round((cutScan - startScan) * info.ratio);
        if (hpx <= 0) return;
        const teil = document.createElement('canvas');
        teil.width = canvas.width; teil.height = hpx;
        teil.getContext('2d').drawImage(canvas, 0, startFull, canvas.width, hpx, 0, 0, canvas.width, hpx);
        pdf.addImage(teil.toDataURL('image/jpeg', 0.92), 'JPEG', 0, yMm, 210, (hpx / scale) / pxProMm);
      };

      // Body-Seiten ermitteln (Umbruch nur an weißen Lücken)
      const seiten = [];
      let start = body.oben;
      while (start < body.unten - 0.5) {
        const ziel = Math.min(start + nutzScan, body.unten);
        let cut = ziel;
        if (ziel < body.unten) {
          const limit = start + nutzScan * 0.6;
          let y = Math.floor(ziel);
          while (y > limit && !body.leer(y)) y--;
          if (y > limit) cut = y;
        }
        seiten.push([start, cut]);
        start = cut;
      }
      if (seiten.length === 0) seiten.push([body.oben, body.unten]);

      seiten.forEach(([s, c], i) => {
        if (i > 0) pdf.addPage();
        zeichne(bodyCanvas, body, s, c, RAND_MM);
        if (i === seiten.length - 1 && hatFuss) pdf.addImage(fussCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, fussYmm, 210, fussHmm);
      });

      // Direkt drucken: PDF im Tab öffnen (kein Download nötig)
      pdf.autoPrint();
      const url = pdf.output('bloburl');
      if (druckFenster) druckFenster.location.href = url;
      else pdf.save(dateiName(docProps.art, docProps.angebot?.belegnummer));   // Fallback bei Popup-Blocker
    } catch (e) {
      console.error(e);
      if (druckFenster) druckFenster.close();
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
