import { geometrieByCode, fensterBezeichnung } from '../components/FensterZeichnung';

export function euro(n) {
  return Number(n || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

export function datumDE(d) {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// Gesamt-Außenmaß einer Kombination (max. Breite je Spalte aufsummiert, max. Höhe je Zeile)
export function kombiMass(elemente) {
  const els = elemente || [];
  const colsSet = [...new Set(els.map(e => e.col ?? 0))];
  const rowsSet = [...new Set(els.map(e => e.row ?? 0))];
  const w = colsSet.reduce((a, cc) => a + Math.max(0, ...els.filter(e => (e.col ?? 0) === cc).map(e => Number(e.breite) || 0)), 0);
  const h = rowsSet.reduce((a, rr) => a + Math.max(0, ...els.filter(e => (e.row ?? 0) === rr).map(e => Number(e.hoehe) || 0)), 0);
  return { w, h };
}

// Montage-Hinweis: bei „Ohne Montage" entsprechend ausweisen, sonst Summe aus Montage, Ausbau, Entsorgung.
export function montageZeile(config) {
  if (config.ohneMontage) return 'Ohne Montage.';
  const summe = Number(config.montage || 0) + Number(config.ausbau || 0) + Number(config.entsorgung || 0);
  if (summe <= 0) return null;
  return `Im Positionspreis enthalten sind die Montagekosten mit ${euro(summe)}.`;
}

// Beschreibungszeilen einer Fenster-Position für den Beleg (HTML-Strings)
export function positionZeilen(config, profil, mitMontage = true) {
  if (!config) return [];
  if (config.kategorie === 'rollo') return rolloZeilen(config, profil, mitMontage);
  if (config.elemente?.length > 1) return kombiZeilen(config, profil, mitMontage);
  const z = [];
  if (profil?.material) z.push(`Material: ${esc(profil.material.toLowerCase())}`);
  const profilTeile = [profil?.hersteller, profil?.system].filter(Boolean).join(' ');
  if (profilTeile || profil?.bautiefe) {
    z.push(`Profil: ${esc(profilTeile)}${profil?.bautiefe ? ` · ${profil.bautiefe} mm Bautiefe` : ''}`);
  }
  // Ausführung immer ausweisen (auch beim Einzelfenster, z.B. „Drehkippfenster DIN Links")
  const bez = fensterBezeichnung(geometrieByCode(config.code), config.panes, config.cols);
  if (bez) z.push(`Ausführung: ${esc(bez)}`);
  z.push(`Maß: ${Math.round(config.breite)} × ${Math.round(config.hoehe)} mm`);
  if (config.innenfarbe && config.innenfarbe === config.aussenfarbe) {
    z.push(`Farbe: ${esc(config.innenfarbe)}`);
  } else if (config.innenfarbe || config.aussenfarbe) {
    z.push(`Farbe: innen ${esc(config.innenfarbe ?? '')} / außen ${esc(config.aussenfarbe ?? '')}`);
  }
  if (config.verglasung) {
    let w = `Wärmeschutz: ${esc(config.verglasung)}${config.vsg ? ', VSG' : ''}`;
    if (config.ornament) {
      w += ', Ornament';
      if (config.ornamentArt) w += ` (<span style="color:#8b1a1a">${esc(config.ornamentArt)}</span>)`;
    }
    z.push(w);
  }
  if (config.verbreiterung && config.verb) {
    const seiten = ['oben', 'unten', 'links', 'rechts']
      .filter(k => Number(config.verb[k]) > 0)
      .map(k => `${k} ${Number(config.verb[k])} mm`);
    if (seiten.length) z.push(`Verbreiterung: ${seiten.join(', ')}`);
  }
  if (config.aufsatzkasten && config.kasten) {
    z.push(`Aufsatzkasten: ${Number(config.kasten.kastenhoehe) || 0} mm, ${config.kasten.bedienung} (${config.kasten.bedienungsseite})`);
  }
  if (config.rollladen) z.push(`Rollladenführung: ${esc(config.rollladen)}`);
  if (mitMontage) { const mz = montageZeile(config); if (mz) z.push(mz); }
  return z;
}

// Lamellen-/Behangfarbe je Material; WEISS gibt es bei Rollladen nicht (mehr) → auf Standardfarbe ziehen.
function rolloLamellenFarbe(config) {
  const standard = config.behang === 'Kunststoff (PVC)' ? 'Hellgrau' : 'Samtgrau';
  const f = config.behangfarbe;
  return (!f || f === 'WEISS') ? standard : f;
}

// Beschreibungszeilen einer Rollladen-Position
function rolloZeilen(config, profil, mitMontage = true) {
  const z = [];
  const panzerOnly = geometrieByCode(config.code)?.panzerOnly;
  z.push('System: Rollladen');
  z.push(`Ausführung: ${panzerOnly ? 'Rollo Panzer' : 'Vorbau Rollladen'}`);
  z.push(`Maß: ${Math.round(config.breite)} × ${Math.round(config.hoehe)} mm`);
  if (!panzerOnly && config.kastenhoeheRollo) z.push(`Kastenhöhe: ${Math.round(config.kastenhoeheRollo)} mm`);
  if (config.behang) z.push(`Rollopanzer: ${esc(config.behang)}${config.lamelle ? `, ${esc(config.lamelle)}` : ''}`);
  if (!panzerOnly && config.bedienung) z.push(`Bedienung: ${esc(config.bedienung)}${config.bedienungsseiteRollo ? ` (${esc(config.bedienungsseiteRollo)})` : ''}`);
  const lamFarbe = rolloLamellenFarbe(config);
  if (panzerOnly) {
    z.push(`Farbe: Lamellen ${esc(lamFarbe)}`);
  } else {
    z.push(`Farbe: Kasten ${esc(config.kastenfarbe ?? '')} / Lamellen ${esc(lamFarbe)}`);
  }
  if (mitMontage) { const mz = montageZeile(config); if (mz) z.push(mz); }
  return z;
}

// Beschreibungszeilen einer Fensterkombination (mehrere gekoppelte Elemente)
function kombiZeilen(config, profil, mitMontage = true) {
  const z = [];
  if (profil?.material) z.push(`Material: ${esc(profil.material.toLowerCase())}`);
  const profilTeile = [profil?.hersteller, profil?.system].filter(Boolean).join(' ');
  if (profilTeile || profil?.bautiefe) {
    z.push(`Profil: ${esc(profilTeile)}${profil?.bautiefe ? ` · ${profil.bautiefe} mm Bautiefe` : ''}`);
  }
  const { w, h } = kombiMass(config.elemente);
  z.push(`Fensterkombination · Gesamtmaß ${Math.round(w)} × ${Math.round(h)} mm`);
  config.elemente.forEach((el, i) => {
    const geo = geometrieByCode(el.code);
    const bez = fensterBezeichnung(geo, el.panes, el.cols);
    let line = `Element ${i + 1}: ${esc(bez)} (${esc(el.code)}), ${Math.round(el.breite)} × ${Math.round(el.hoehe)} mm`;
    if (el.innenfarbe || el.aussenfarbe) {
      line += el.innenfarbe === el.aussenfarbe
        ? `, Farbe ${esc(el.innenfarbe)}`
        : `, Farbe innen ${esc(el.innenfarbe ?? '')} / außen ${esc(el.aussenfarbe ?? '')}`;
    }
    if (el.verglasung) {
      line += `, ${esc(el.verglasung)}${el.vsg ? ', VSG' : ''}`;
      if (el.ornament) {
        line += ', Ornament';
        if (el.ornamentArt) line += ` (<span style="color:#8b1a1a">${esc(el.ornamentArt)}</span>)`;
      }
    }
    z.push(line);
  });
  if (mitMontage) { const mz = montageZeile(config); if (mz) z.push(mz); }
  return z;
}

// Texte je Belegart
export const BELEG_ART = {
  Angebot: {
    titel: 'Angebot',
    intro: 'vielen Dank für Ihre Anfrage. Wir freuen uns, Ihnen das nachfolgende Angebot unterbreiten zu dürfen:',
    zahlung: 'Wir bitten um Ihre Zahlung innerhalb von 10 Tagen ab Rechnungsdatum, ohne Abzug.',
    preise: true, anzahlung: true, empfaenger: true, bauvorhaben: true,
  },
  'Auftragsbestätigung': {
    titel: 'Auftragsbestätigung',
    intro: 'vielen Dank für Ihren Auftrag. Wir bestätigen Ihnen hiermit die nachfolgenden Positionen:',
    zahlung: 'Bei Erteilung des Auftrags werden 40 % des Auftragswertes als Anzahlung fällig.',
    preise: true, anzahlung: true, empfaenger: true, bauvorhaben: true,
  },
  Bestellung: {
    titel: 'Bestellung',
    intro: 'hiermit bestellen wir die nachfolgenden Positionen:',
    zahlung: null,
    preise: false, anzahlung: false, empfaenger: false, bauvorhaben: false,
  },
  Rechnung: {
    titel: 'Rechnung',
    intro: 'vielen Dank für Ihren Auftrag. Wir berechnen Ihnen hiermit die nachfolgenden Positionen:',
    zahlung: 'Mit Erhalt dieser Schlussrechnung gilt das Werk als abgenommen, sofern Sie nicht innerhalb von 6 Werktagen nach Erhalt schriftlich wesentliche Mängel anzeigen (§ 640 Abs. 2 BGB).',
    preise: true, anzahlung: false, schluss: true, empfaenger: true, bauvorhaben: true,
  },
};

// ── Nummernkreise (Einstellungen → Dokumente) ───────────────────────────────
// Standard-Konfiguration je Belegart: (optional) Jahr + fortlaufende Nummer.
// `start` = die nächste zu vergebende laufende Nummer (manuell editierbar in den Einstellungen).
export const DEFAULT_NUMMERN = {
  Angebot: { jahr: true, stellen: 4, start: 1 },
  'Auftragsbestätigung': { jahr: true, stellen: 4, start: 1 },
  Rechnung: { jahr: true, stellen: 4, start: 1 },
};
// Fallback für Belegarten ohne eigene Konfiguration (z. B. Bestellung): nur Jahr-Nummer.
const FALLBACK_NUMMER = { jahr: true, stellen: 4, start: 1 };

// Effektive Nummern-Konfiguration einer Belegart (gespeicherte Werte überschreiben Standard).
export function nummernConfig(einstellungen, art) {
  const basis = DEFAULT_NUMMERN[art] ?? FALLBACK_NUMMER;
  const gespeichert = einstellungen?.dokumente?.nummern?.[art];
  return { ...basis, ...(gespeichert ?? {}) };
}

// Baut eine Belegnummer-Zeichenkette: Nummer zuerst, dann 2-stelliges Jahr, z. B. 0001-26
// (ohne Jahr: 0001).
export function formatBelegnummer(cfg, n, jahr = new Date().getFullYear()) {
  const seq = String(n).padStart(Math.max(1, Number(cfg.stellen) || 1), '0');
  if (!cfg.jahr) return seq;
  const jj = String(jahr).slice(-2);
  return `${seq}-${jj}`;
}

// Zerlegt eine gespeicherte Belegnummer in { seq, jahr }. Erkennt das aktuelle Format
// „0001-26" (Nummer-JJ) ebenso wie Altformate „2026-0001" / „AN-2026-0001" (JJJJ-Nummer).
export function parseBelegnummer(wert) {
  const s = String(wert ?? '').trim();
  let m = /(\d+)-(\d{2})\s*$/.exec(s);          // neu: Nummer-JJ
  if (m) return { seq: Number(m[1]), jahr: 2000 + Number(m[2]) };
  m = /(\d{4})-(\d+)\s*$/.exec(s);              // alt: JJJJ-Nummer
  if (m) return { seq: Number(m[2]), jahr: Number(m[1]) };
  m = /(\d+)\s*$/.exec(s);                       // nur Nummer
  if (m) return { seq: Number(m[1]), jahr: null };
  return null;
}

// Zahlungstext einer Belegart: eigener Text aus den Einstellungen, sonst Standard.
export function zahlungText(einstellungen, art, prozent = 40) {
  const eigen = einstellungen?.dokumente?.zahlung?.[art];
  let text = (eigen != null && String(eigen).trim() !== '') ? eigen : (BELEG_ART[art]?.zahlung ?? null);
  if (text == null) return null;
  // Auftragsbestätigung: den Anzahlungs-Prozentsatz im Text auf den am Angebot gewählten Wert setzen.
  if (art === 'Auftragsbestätigung') {
    const prozTxt = String(prozent).replace('.', ',');
    if (/\d+(?:[.,]\d+)?\s*%/.test(text)) {
      text = text.replace(/\d+(?:[.,]\d+)?\s*%/, `${prozTxt} %`);   // ersten Prozentwert ersetzen
    } else if (!(eigen != null && String(eigen).trim() !== '')) {
      text = `Bei Erteilung des Auftrags werden ${prozTxt} % des Auftragswertes als Anzahlung fällig.`;
    }
  }
  return text;
}
