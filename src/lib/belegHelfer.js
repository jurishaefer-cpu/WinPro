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

// Zeile „Im Positionspreis enthalten sind die Montagekosten mit € X" – Summe aus Montage, Ausbau, Entsorgung.
function montageZeile(config) {
  if (config.ohneMontage) return null;
  const summe = Number(config.montage || 0) + Number(config.ausbau || 0) + Number(config.entsorgung || 0);
  if (summe <= 0) return null;
  return `Im Positionspreis enthalten sind die Montagekosten mit ${euro(summe)}.`;
}

// Beschreibungszeilen einer Fenster-Position für den Beleg (HTML-Strings)
export function positionZeilen(config, profil, mitMontage = true) {
  if (!config) return [];
  if (config.elemente?.length > 1) return kombiZeilen(config, profil, mitMontage);
  const z = [];
  if (profil?.material) z.push(`Material: ${esc(profil.material.toLowerCase())}`);
  const profilTeile = [profil?.hersteller, profil?.system].filter(Boolean).join(' ');
  if (profilTeile || profil?.bautiefe) {
    z.push(`Profil: ${esc(profilTeile)}${profil?.bautiefe ? ` · ${profil.bautiefe} mm Bautiefe` : ''}`);
  }
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
      if (config.ornamentArt) w += ` (<span style="color:#c0152e">${esc(config.ornamentArt)}</span>)`;
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
    if (el.verglasung) line += `, ${esc(el.verglasung)}${el.vsg ? ', VSG' : ''}${el.ornament ? ', Ornament' : ''}`;
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
