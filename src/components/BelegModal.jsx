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
      if (contentW <= 0) return;                            // Layout noch nicht bereit (iOS) → kein scale 0
      const scale = Math.min(1, contentW / A4_BREITE);
      const h = druckRef.current.offsetHeight;              // ungeskalierte A4-Höhe (Transform ignoriert offsetHeight)
      // WICHTIG: das INNERE Dokument skalieren und der Bühne die exakten skalierten
      // Maße geben (layout-korrekt). Die früher transformierte Bühne erzeugte einen
      // Box-/Visual-Mismatch, den iOS-Safari als leere Vorschau rendert.
      druckRef.current.style.transformOrigin = 'top left';
      druckRef.current.style.transform = `scale(${scale})`;
      buehneRef.current.style.width = `${A4_BREITE * scale}px`;
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
    // Safari/iOS: kein Popup (blob:-Navigation dort unzuverlässig) → später Download.
    const istSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
    // Chrome/Firefox: Druck-Tab sofort im Klick öffnen (sonst blockt der Popup-Blocker nach dem await)
    const druckFenster = istSafari ? null : window.open('', '_blank');
    if (druckFenster) druckFenster.document.write('<title>Beleg</title><p style="font-family:sans-serif;color:#555;padding:24px">Beleg wird vorbereitet…</p>');
    setBusy(true);
    let holder;
    try {
      const [{ jsPDF }, html2canvasMod] = await Promise.all([import('jspdf'), import('html2canvas')]);
      const html2canvas = html2canvasMod.default;
      const pxProMm = A4_BREITE / 210;

      holder = document.createElement('div');
      holder.style.cssText = `position:fixed; left:-10000px; top:0; width:${A4_BREITE}px; background:#fff;`;
      document.body.appendChild(holder);

      // Klon im Blockfluss (wie ein echtes A4-Blatt)
      const clone = druckRef.current.cloneNode(true);
      clone.removeAttribute('id');
      // Vorschau-Skalierung des Originals NICHT in den Export übernehmen (sonst winzige PDF).
      clone.style.transform = 'none';
      clone.style.transformOrigin = '';
      clone.style.width = `${A4_BREITE}px`;
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

      // Render-Maßstab dynamisch begrenzen: iOS-Safari erlaubt nur ~16,7 Mio px²
      // pro Canvas (und begrenzte Kantenlänge). Bei festem scale 6 lief die Body-
      // Canvas darüber und kam LEER zurück (nur die kleine Fuß-Canvas passte) →
      // PDF zeigte nur die Fußzeile. Hier so hoch wie möglich, aber unter dem Limit.
      const MAX_AREA = 16_000_000;     // Sicherheitsabstand zum iOS-Limit (16.777.216)
      const MAX_KANTE = 8192;          // konservative max. Canvas-Kantenlänge
      const bodyH = Math.max(clone.offsetHeight, 1);
      const scale = Math.max(1, Math.min(
        4,                               // Deckel 4 statt 6: kleinere, mobilfreundliche PDFs (scharf genug für A4-Druck)
        Math.sqrt(MAX_AREA / (A4_BREITE * bodyH)),
        MAX_KANTE / Math.max(A4_BREITE, bodyH),
      ));
      const opts = { scale, backgroundColor: '#ffffff', useCORS: true, windowWidth: A4_BREITE };

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
            c.width = w * scale; c.height = h * scale;
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
        pdf.addImage(teil.toDataURL('image/jpeg', 0.88), 'JPEG', 0, yMm, 210, (hpx / scale) / pxProMm);
      };

      // Erlaubte Umbruchstellen: nur GANZE Positionen/Blöcke. Eine Position (Tabellenzeile
      // mit Skizze + Text) wird NIE zerschnitten – passt sie nicht mehr aufs Blatt, rückt sie
      // komplett auf die nächste Seite. Dazu die Unterkanten der Zeilen/Blöcke messen und in
      // Scan-Einheiten umrechnen (Klon hängt noch im DOM, volle A4-Breite, kein Transform).
      const cloneTop = clone.getBoundingClientRect().top;
      const grenzeScanVon = el => (el.getBoundingClientRect().bottom - cloneTop) * scale / body.ratio;
      const grenzenRoh = [];
      clone.querySelectorAll('.beleg-tabelle tbody tr').forEach(tr => grenzenRoh.push(grenzeScanVon(tr)));
      clone.querySelectorAll('.beleg-tabelle, .beleg-summen, .beleg-zahlung').forEach(el => grenzenRoh.push(grenzeScanVon(el)));
      const grenzen = [...new Set(grenzenRoh.map(g => Math.round(g)))]
        .filter(g => g > body.oben && g <= body.unten)
        .sort((a, b) => a - b);

      // Body-Seiten ermitteln (Umbruch nur an Positions-/Blockgrenzen)
      const seiten = [];
      let start = body.oben;
      while (start < body.unten - 0.5) {
        const grenzeMax = start + nutzScan;
        if (grenzeMax >= body.unten) { seiten.push([start, body.unten]); break; }
        // größte erlaubte Grenze, die noch ganz auf die Seite passt
        let cut = -1;
        for (const g of grenzen) { if (g > start + 1 && g <= grenzeMax) cut = g; }
        // Keine Positionsgrenze passt (einzelne Position höher als eine ganze Seite) →
        // harter Schnitt unvermeidbar, damit es nicht endlos läuft.
        if (cut < 0) cut = grenzeMax;
        seiten.push([start, cut]);
        start = cut;
      }
      if (seiten.length === 0) seiten.push([body.oben, body.unten]);

      seiten.forEach(([s, c], i) => {
        if (i > 0) pdf.addPage();
        zeichne(bodyCanvas, body, s, c, RAND_MM);
        // Fuß verlustfrei als PNG -> kleine Schrift bleibt im Druck gestochen scharf (JPEG würde die Kanten verwaschen)
        if (i === seiten.length - 1 && hatFuss) pdf.addImage(fussCanvas.toDataURL('image/png'), 'PNG', 0, fussYmm, 210, fussHmm);
      });

      // Aufräumen vor der Ausgabe – ab hier ist die PDF fertig erzeugt.
      if (holder) { document.body.removeChild(holder); holder = null; }
      uebergebePdf(pdf, druckFenster);
    } catch (e) {
      console.error('PDF-Erzeugung fehlgeschlagen:', e);
      if (druckFenster) { try { druckFenster.close(); } catch { /* egal */ } }
      alert('PDF konnte nicht erstellt werden:\n' + (e?.message || e) + '\n\nBitte erneut versuchen.');
    } finally {
      if (holder) document.body.removeChild(holder);
      setBusy(false);
    }
  }

  // Gibt die fertige PDF aus. WICHTIG: Fehler hier dürfen NICHT als „Erstellung
  // fehlgeschlagen" erscheinen – die PDF existiert ja bereits. Auf Safari/iOS ist das
  // Navigieren eines Popups auf eine blob:-URL unzuverlässig, daher dort direkt Download.
  function uebergebePdf(pdf, druckFenster) {
    const name = dateiName(docProps.art, docProps.angebot?.belegnummern?.[docProps.art] ?? docProps.angebot?.belegnummer);
    const istSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
    let url;
    try { try { pdf.autoPrint(); } catch { /* autoPrint optional */ }
      url = URL.createObjectURL(pdf.output('blob'));
    } catch (e) {
      // Sollte praktisch nie passieren (Blob wurde oben schon erzeugt) – letzter Notnagel.
      console.error('PDF-Ausgabe (blob) fehlgeschlagen:', e);
      try { if (druckFenster) druckFenster.close(); } catch { /* egal */ }
      try { pdf.save(name); } catch { alert('PDF konnte nicht geöffnet werden: ' + (e?.message || e)); }
      return;
    }

    const download = () => {
      const a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
    };

    let geoeffnet = false;
    // Chrome/Firefox: PDF im vorab geöffneten Tab anzeigen (inkl. autoPrint-Dialog).
    if (!istSafari && druckFenster && !druckFenster.closed) {
      try { druckFenster.location.href = url; geoeffnet = true; } catch { geoeffnet = false; }
    }
    if (!geoeffnet) {
      // Safari/iOS oder Popup blockiert/fehlgeschlagen → zuverlässiger Download auf jedem Gerät.
      try { if (druckFenster && !druckFenster.closed) druckFenster.close(); } catch { /* egal */ }
      download();
    }
    setTimeout(() => { try { URL.revokeObjectURL(url); } catch { /* egal */ } }, 60000);
  }

  return (
    <div className="beleg-overlay">
      <div className="beleg-toolbar">
        <span className="beleg-toolbar-titel">{docProps.art} {docProps.angebot?.belegnummern?.[docProps.art] ?? docProps.angebot?.belegnummer}</span>
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
