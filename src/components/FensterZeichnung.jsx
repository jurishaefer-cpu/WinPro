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
  const midB = [x + w / 2, y + h];
  const linien = [];
  const dreh = (din) => {
    // apex = Griffseite (gegenüber den Bändern)
    if (din === 'links') { linien.push([TL, midR], [BL, midR]); } // Bänder links → Griff rechts
    else { linien.push([TR, midL], [BR, midL]); }
  };
  const kipp = () => { linien.push([TL, midB], [TR, midB]); };
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
  const blendIn = inset(r0, 5);           // Blendrahmen-Innenkante (Zwischenrahmen)
  const sashOut = inset(r0, 10);          // Flügelrahmen außen
  const glas = inset(sashOut, 5);         // Glas
  const linien = g ? oeffnungsLinien(g, glas) : [];
  const miter = gehrung(r0, blendIn);
  const istTuer = g?.open === 'tuer';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <rect x={r0.x} y={r0.y} width={r0.w} height={r0.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
      <rect x={blendIn.x} y={blendIn.y} width={blendIn.w} height={blendIn.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.1" />
      {miter.map((l, i) => <line key={'m' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="0.8" />)}
      <rect x={sashOut.x} y={sashOut.y} width={sashOut.w} height={sashOut.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.1" />
      <rect x={glas.x} y={glas.y} width={glas.w} height={glas.h} fill={istTuer ? '#e7edf2' : glasFarbe} stroke="#0f1f3d" strokeWidth="0.9" />
      {linien.map((l, i) => (
        <line key={i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="0.9" />
      ))}
    </svg>
  );
}

function FensterZeichnung({ geometrie, breite, hoehe, glasFarbe = '#cfe3ef' }) {
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

  const u = Math.min(rw, rh);
  const r0 = { x, y, w: rw, h: rh };
  const blendIn = inset(r0, Math.max(8, u * 0.028));   // Blendrahmen-Innenkante → schmaler Außenring (Zwischenrahmen)
  const sashOut = inset(r0, Math.max(20, u * 0.075));  // Flügelrahmen außen
  const glas = inset(sashOut, Math.max(10, u * 0.04)); // Glas / Flügelrahmen innen

  const miter = gehrung(r0, blendIn);                  // 45°-Gehrung am Blendrahmen
  const linien = g ? oeffnungsLinien(g, glas) : [];
  const istTuer = g?.open === 'tuer';

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" style={{ maxHeight: '60vh' }}>
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

      {/* Blendrahmen (Außenring) + Zwischenrahmen mit 45°-Gehrung */}
      <rect x={r0.x} y={r0.y} width={r0.w} height={r0.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2.5" />
      <rect x={blendIn.x} y={blendIn.y} width={blendIn.w} height={blendIn.h} fill="#fff" stroke="#0f1f3d" strokeWidth="1.6" />
      {miter.map((l, i) => (
        <line key={'m' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="#0f1f3d" strokeWidth="1.4" />
      ))}

      {/* Flügelrahmen + Glas */}
      <rect x={sashOut.x} y={sashOut.y} width={sashOut.w} height={sashOut.h} fill="#fff" stroke="#0f1f3d" strokeWidth="2" />
      <rect x={glas.x} y={glas.y} width={glas.w} height={glas.h}
            fill={istTuer ? '#e7edf2' : glasFarbe} stroke="#0f1f3d" strokeWidth="1.4" opacity="0.95" />

      {/* Öffnungssymbole */}
      {linien.map((l, i) => (
        <line key={i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]}
              stroke="#0f1f3d" strokeWidth="1.4" />
      ))}

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
