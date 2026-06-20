// Katalog der Fenster-/Tür-Geometrien.
// open: Öffnungsart, din: Anschlag (Bänder), apex = Griffseite (gegenüber den Bändern).
export const GEOMETRIEN = [
  { code: 'F01', kategorie: 'fenster', label: 'Drehkippfenster DIN Links', open: 'drehkipp', din: 'links' },
  { code: 'F02', kategorie: 'fenster', label: 'Drehkippfenster DIN Rechts', open: 'drehkipp', din: 'rechts' },
  { code: 'F03', kategorie: 'fenster', label: 'Drehfenster DIN Links', open: 'dreh', din: 'links' },
  { code: 'F04', kategorie: 'fenster', label: 'Drehfenster DIN Rechts', open: 'dreh', din: 'rechts' },
  { code: 'F05', kategorie: 'fenster', label: 'Kippfenster', open: 'kipp' },
  { code: 'F06', kategorie: 'fenster', label: 'Festverglasung', open: 'fest' },
  { code: 'T01', kategorie: 'tuer', label: 'Haustür DIN Links', open: 'tuer', din: 'links' },
  { code: 'T02', kategorie: 'tuer', label: 'Haustür DIN Rechts', open: 'tuer', din: 'rechts' },
  { code: 'T03', kategorie: 'tuer', label: 'Balkontür Dreh-Kipp DIN Links', open: 'drehkipp', din: 'links', tuer: true },
  { code: 'T04', kategorie: 'tuer', label: 'Balkontür Dreh-Kipp DIN Rechts', open: 'drehkipp', din: 'rechts', tuer: true },
];

export function geometrieByCode(code) {
  return GEOMETRIEN.find(g => g.code === code);
}

// Liefert die Öffnungs-Symbollinien innerhalb des Flügel-Rechtecks.
function oeffnungsLinien(g, r) {
  const { x, y, w, h } = r;
  const TL = [x, y], TR = [x + w, y], BR = [x + w, y + h], BL = [x, y + h];
  const midL = [x, y + h / 2], midR = [x + w, y + h / 2];
  const midT = [x + w / 2, y];
  const linien = [];
  const dreh = (din) => {
    // apex = Griffseite (gegenüber den Bändern)
    if (din === 'links') { linien.push([TL, midR], [BL, midR]); } // Bänder links → Griff rechts
    else { linien.push([TR, midL], [BR, midL]); }
  };
  // Kippstellung: Bänder unten, Dreieck-Spitze zeigt nach oben
  const kipp = () => { linien.push([BL, midT], [BR, midT]); };
  if (g.open === 'dreh' || g.open === 'tuer') dreh(g.din || 'links');
  else if (g.open === 'kipp') kipp();
  else if (g.open === 'drehkipp') { dreh(g.din || 'links'); kipp(); }
  return linien;
}

// Rechteck nach innen einrücken
function inset(r, d) {
  return { x: r.x + d, y: r.y + d, w: r.w - 2 * d, h: r.h - 2 * d };
}
// 45°-Gehrungslinien: verbindet die Ecken des äußeren mit dem inneren Rahmen
function gehrung(o, i) {
  return [
    [[o.x, o.y], [i.x, i.y]],
    [[o.x + o.w, o.y], [i.x + i.w, i.y]],
    [[o.x + o.w, o.y + o.h], [i.x + i.w, i.y + i.h]],
    [[o.x, o.y + o.h], [i.x, i.y + i.h]],
  ];
}

// Kleine Vorschau ohne Maßlinien (für das Geometrie-Dropdown)
export function GeometrieThumb({ geometrie, glasFarbe = '#cfe3ef' }) {
  const g = geometrie;
  const W = 120, H = 92, m = 7;
  const r0 = { x: m, y: m, w: W - 2 * m, h: H - 2 * m };
  const blendIn = inset(r0, 6);           // Blendrahmen breit (äußerer Rahmen)
  const sashOut = inset(r0, 8);           // schmaler Zwischenraum → Flügelrahmen außen
  const glas = inset(sashOut, 4.5);       // Glas
  const linien = g ? oeffnungsLinien(g, glas) : [];
  const miterBlend = gehrung(r0, blendIn);
  const miterSash = gehrung(sashOut, glas);
  const istTuer = g?.open === 'tuer';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <rect x={r0.x} y={r0.y} width={r0.w} height={r0.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
      <rect x={blendIn.x} y={blendIn.y} width={blendIn.w} height={blendIn.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.1" />
      {miterBlend.map((l, i) => <line key={'mb' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="0.8" />)}
      <rect x={sashOut.x} y={sashOut.y} width={sashOut.w} height={sashOut.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.1" />
      {miterSash.map((l, i) => <line key={'ms' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="0.8" />)}
      <rect x={glas.x} y={glas.y} width={glas.w} height={glas.h} fill={istTuer ? '#e7edf2' : glasFarbe} stroke="#0f1f3d" strokeWidth="0.9" />
      {linien.map((l, i) => (
        <line key={i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="0.9" />
      ))}
    </svg>
  );
}

function FensterZeichnung({ geometrie, breite, hoehe, verbreiterung, aufsatzkasten, glasFarbe = '#cfe3ef' }) {
  const g = geometrie;
  const b = Math.max(200, Number(breite) || 1000);
  const hh = Math.max(200, Number(hoehe) || 1200);

  // Zeichenfläche
  const VB_W = 760, VB_H = 660;
  const maxW = 360, maxH = 430;
  const scale = Math.min(maxW / b, maxH / hh);
  const rw = b * scale, rh = hh * scale;
  const cx = VB_W / 2 + 20, cy = VB_H / 2 + 10;
  const x = cx - rw / 2, y = cy - rh / 2;

  // Verbreiterungen (mm) als Streifen außen am Fenster, innerhalb des Gesamtmaßes
  const vo = Math.max(0, Number(verbreiterung?.oben) || 0) * scale;
  const vu = Math.max(0, Number(verbreiterung?.unten) || 0) * scale;
  const vl = Math.max(0, Number(verbreiterung?.links) || 0) * scale;
  const vr = Math.max(0, Number(verbreiterung?.rechts) || 0) * scale;
  // Aufsatzkasten (Rollladenkasten oben), Höhe innerhalb des Gesamtmaßes
  const kh = aufsatzkasten ? Math.max(0, Number(aufsatzkasten.kastenhoehe) || 0) * scale : 0;
  const hatKasten = !!aufsatzkasten && kh > 0;

  const hatVerb = vo || vu || vl || vr;
  const r0 = { x, y, w: rw, h: rh };                            // Gesamtmaß (mit Verbreiterung/Kasten)
  const kasten = { x, y, w: rw, h: kh };
  const win = { x: x + vl, y: y + vo + kh, w: rw - vl - vr, h: rh - vo - vu - kh }; // eigentliches Fenster

  const u = Math.min(win.w, win.h);
  const blendW = Math.max(12, u * 0.052);              // Blendrahmen-Breite (äußerer Rahmen)
  const gap = Math.max(2.5, u * 0.011);                // schmaler Zwischenraum Blend ↔ Flügel
  const sashW = Math.max(10, u * 0.045);               // Flügelrahmen-Breite
  const blendIn = inset(win, blendW);                  // Blendrahmen-Innenkante
  const sashOut = inset(win, blendW + gap);            // Flügelrahmen außen
  const glas = inset(sashOut, sashW);                  // Glas / Flügelrahmen innen

  const miterBlend = gehrung(win, blendIn);            // 45°-Gehrung am Blendrahmen
  const miterSash = gehrung(sashOut, glas);            // 45°-Gehrung am Flügelrahmen
  const linien = g ? oeffnungsLinien(g, glas) : [];
  const istTuer = g?.open === 'tuer';

  // Lamellen (Rollladen) im oberen Drittel der Glasfläche
  const lamellen = [];
  if (hatKasten) {
    const anz = 7;
    const bereich = glas.h * 0.32;
    for (let i = 1; i <= anz; i++) {
      const ly = glas.y + (bereich / anz) * i;
      lamellen.push(ly);
    }
  }
  // Bedien-Badge (G = Gurt, M = Motor) an der Bedienungsseite
  const badge = hatKasten ? {
    cx: aufsatzkasten.bedienungsseite === 'rechts' ? win.x + win.w : win.x,
    cy: win.y,
    r: Math.max(16, u * 0.05),
    text: aufsatzkasten.bedienung === 'Motor' ? 'M' : 'G',
  } : null;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet" className="fz-svg">
      {/* Maßlinie oben */}
      <line x1={x} y1={y - 34} x2={x + rw} y2={y - 34} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={x} y1={y - 40} x2={x} y2={y - 14} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={x + rw} y1={y - 40} x2={x + rw} y2={y - 14} stroke="#0f1f3d" strokeWidth="1.2" />
      <text x={cx} y={y - 44} textAnchor="middle" fontSize="22" fill="#0f1f3d" fontWeight="600">{Math.round(b)}</text>

      {/* Maßlinie links */}
      <line x1={x - 34} y1={y} x2={x - 34} y2={y + rh} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={x - 40} y1={y} x2={x - 14} y2={y} stroke="#0f1f3d" strokeWidth="1.2" />
      <line x1={x - 40} y1={y + rh} x2={x - 14} y2={y + rh} stroke="#0f1f3d" strokeWidth="1.2" />
      <text x={x - 44} y={cy} textAnchor="middle" fontSize="22" fill="#0f1f3d" fontWeight="600"
            transform={`rotate(-90 ${x - 44} ${cy})`}>{Math.round(hh)}</text>

      {/* Gesamtmaß-Rahmen außen herum (bei Verbreiterung/Aufsatzkasten) */}
      {(hatVerb || hatKasten) && (
        <rect x={r0.x} y={r0.y} width={r0.w} height={r0.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" />
      )}

      {/* Aufsatzkasten oben */}
      {hatKasten && (
        <rect x={kasten.x} y={kasten.y} width={kasten.w} height={kasten.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" />
      )}

      {/* Blendrahmen (Außenring) + Zwischenrahmen mit 45°-Gehrung */}
      <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" />
      <rect x={blendIn.x} y={blendIn.y} width={blendIn.w} height={blendIn.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
      {miterBlend.map((l, i) => (
        <line key={'mb' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />
      ))}

      {/* Flügelrahmen + Glas, ebenfalls mit 45°-Gehrung */}
      <rect x={sashOut.x} y={sashOut.y} width={sashOut.w} height={sashOut.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2" />
      {miterSash.map((l, i) => (
        <line key={'ms' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />
      ))}
      <rect x={glas.x} y={glas.y} width={glas.w} height={glas.h}
            fill={istTuer ? '#e7edf2' : glasFarbe} stroke="#0f1f3d" strokeWidth="1.4" opacity="0.95" />

      {/* Rollladen-Lamellen im oberen Glasbereich */}
      {lamellen.map((ly, i) => (
        <line key={'lam' + i} x1={glas.x} y1={ly} x2={glas.x + glas.w} y2={ly} stroke="#0f1f3d" strokeWidth="1" opacity="0.7" />
      ))}

      {/* Öffnungssymbole */}
      {linien.map((l, i) => (
        <line key={i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]}
              stroke="#0f1f3d" strokeWidth="1.4" />
      ))}

      {/* Bedien-Badge (Gurt/Motor) */}
      {badge && (
        <g>
          <circle cx={badge.cx} cy={badge.cy} r={badge.r} fill="#fff" stroke="#0f1f3d" strokeWidth="2" />
          <text x={badge.cx} y={badge.cy} textAnchor="middle" dominantBaseline="central"
                fontSize={badge.r * 1.1} fontWeight="700" fill="#0f1f3d">{badge.text}</text>
        </g>
      )}

      {/* Türgriff-Andeutung */}
      {istTuer && (
        <rect
          x={g.din === 'links' ? glas.x + glas.w - 12 : glas.x + 6}
          y={glas.y + glas.h / 2 - 18} width="6" height="36" rx="3" fill="#0f1f3d" />
      )}
    </svg>
  );
}

export default FensterZeichnung;
