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

// Beschreibungszeilen einer Fenster-Position für den Beleg (HTML-Strings)
export function positionZeilen(config, profil) {
  if (!config) return [];
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
  if (!config.ohneMontage && Number(config.montage) > 0) {
    z.push(`Im Positionspreis enthalten ist die Montage mit ${euro(config.montage)}.`);
  }
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
