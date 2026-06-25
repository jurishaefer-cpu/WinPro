import FensterZeichnung, { geometrieByCode, KombinationsZeichnung, RolloZeichnung } from './FensterZeichnung';
import { euro, datumDE, positionZeilen, montageZeile, BELEG_ART, zahlungText } from '../lib/belegHelfer';

const MWST = 0.19;
const ANZAHLUNG = 0.40;

function BelegDokument({ art, angebot, kunde, positionen, profileMap, einstellungen }) {
  const meta = BELEG_ART[art] ?? BELEG_ART.Angebot;
  const firma = einstellungen?.firma ?? {};
  const profil = einstellungen?.profil ?? {};
  const eb = einstellungen?.erscheinungsbild ?? {};
  const akzent = eb.akzentfarbe || '#c0152e';

  const nummer = angebot?.belegnummern?.[art] || angebot?.belegnummer || '—';
  const zahlung = zahlungText(einstellungen, art);
  const netto = positionen.reduce((s, p) => s + Number(p.nettopreis || 0) * Number(p.menge || 1), 0);
  const mwst = netto * MWST;
  const brutto = netto + mwst;
  // Schlussrechnung: standardmäßig 40 % Anzahlung; wurde sie nicht korrekt bezahlt,
  // wird der tatsächlich erhaltene Betrag abgezogen (in der Rechnung erfasst).
  const stdAnzahlung = brutto * ANZAHLUNG;
  const eigeneAnzahlung = angebot?.anzahlung_ok === false;
  const anzahlung = eigeneAnzahlung ? Number(angebot?.anzahlung_betrag || 0) : stdAnzahlung;

  const empfName = kunde?.firma || `${kunde?.vorname ?? ''} ${kunde?.nachname ?? ''}`.trim();
  const empfAP = kunde?.firma ? `${kunde?.vorname ?? ''} ${kunde?.nachname ?? ''}`.trim() : '';

  return (
    <div className="beleg" style={{ '--akzent': akzent }}>
      {/* Kopf */}
      <div className="beleg-kopf">
        <div className="beleg-logo">{eb.logo && <img src={eb.logo} alt="Logo" />}</div>
        <div className="beleg-firma">
          <strong>Ansprechpartner:</strong>
          {profil.name && <div>{profil.name}</div>}
          {profil.telefon && <div>Tel. {profil.telefon}</div>}
          {profil.email && <div>{profil.email}</div>}
        </div>
      </div>
      <div className="beleg-akzentlinie" />

      {/* Empfänger + Datum/Ansprechpartner */}
      <div className="beleg-adressen">
        <div className="beleg-empfaenger">
          {meta.empfaenger && (
            <>
              <div>{empfName}</div>
              {empfAP && <div>{empfAP}</div>}
              <div>{kunde?.strasse}</div>
              <div>{[kunde?.plz, kunde?.ort].filter(Boolean).join(' ')}</div>
            </>
          )}
        </div>
        <div className="beleg-meta">
          <div>{firma.ort ? `${firma.ort} , ` : ''}{datumDE(new Date())}</div>
          {meta.schluss && angebot?.ausfuehrungsdatum && (
            <div>Ausführungsdatum: {datumDE(angebot.ausfuehrungsdatum)}</div>
          )}
        </div>
      </div>

      {/* Titel + Anrede */}
      <h2 className="beleg-titel">{meta.titel} {nummer}</h2>
      <p className="beleg-anrede">Sehr geehrte Damen und Herren,</p>
      <p className="beleg-intro">{meta.intro}</p>

      {meta.bauvorhaben && angebot?.bezeichnung?.trim() && (
        <p className="beleg-bauvorhaben"><span className="beleg-bauvorhaben-label">Bauvorhaben:</span> <strong>{angebot.bezeichnung}</strong></p>
      )}

      {/* Positionen */}
      <table className="beleg-tabelle">
        <thead>
          <tr>
            <th className="pos-nr">Pos.</th>
            <th className="pos-skizze">Skizze</th>
            <th>Beschreibung</th>
            <th className="pos-menge">Menge</th>
            {meta.preise && <th className="pos-preis">Einzelpreis</th>}
            {meta.preise && <th className="pos-preis">Gesamtpreis</th>}
          </tr>
        </thead>
        <tbody>
          {positionen.map((p, i) => {
            const c = p.config;
            const istFenster = p.typ === 'fenster' && c;
            const menge = Number(p.menge || 1);
            const zeilen = istFenster ? positionZeilen(c, profileMap?.[c.profilId], false) : [];
            const montage = istFenster && meta.preise ? montageZeile(c) : null;
            return (
              <tr key={p.id}>
                <td className="pos-nr">{i + 1}</td>
                <td className="pos-skizze">
                  {istFenster && (
                    <div className="beleg-zeichnung">
                      {c.kategorie === 'rollo' ? (
                        <RolloZeichnung breite={c.breite} hoehe={c.hoehe} kastenhoehe={c.kastenhoeheRollo} bedienung={c.bedienung} bedienungsseite={c.bedienungsseiteRollo} panzerOnly={!!geometrieByCode(c.code)?.panzerOnly} beleg />
                      ) : c.elemente?.length > 1 ? (
                        <KombinationsZeichnung elemente={c.elemente} weissesGlas
                          rahmen={(Number(c.rahmenB) > 0 || Number(c.rahmenH) > 0) ? { w: Number(c.rahmenB) || 0, h: Number(c.rahmenH) || 0 } : undefined} />
                      ) : (
                        <FensterZeichnung
                          geometrie={geometrieByCode(c.code)} breite={c.breite} hoehe={c.hoehe}
                          panes={c.panes} cols={c.cols} colWidths={c.colWidths} rowHeights={c.rowHeights}
                          verbreiterung={c.verbreiterung ? c.verb : null}
                          aufsatzkasten={c.aufsatzkasten ? c.kasten : null}
                          schwelle={c.schwelle}
                          oberlichtHoehe={c.oberlichtHoehe}
                          teile={c.verbunden ? c._teile : null} dir={c._dir}
                          glasFarbe="#ffffff"
                        />
                      )}
                      <div className="beleg-zeichnung-untertitel">Innenansicht</div>
                    </div>
                  )}
                </td>
                <td className="pos-beschr">
                  {istFenster ? (
                    <>
                      {c.standort && <div className="pos-standort">{c.standort}</div>}
                      {zeilen.map((z, k) => <div key={k} dangerouslySetInnerHTML={{ __html: z }} />)}
                      {c.kommentar && (c.kommentar.replace(/<[^>]*>/g, '').trim()) && (
                        <div className="pos-kommentar" dangerouslySetInnerHTML={{ __html: c.kommentar }} />
                      )}
                      {montage && <div dangerouslySetInnerHTML={{ __html: montage }} />}
                    </>
                  ) : (
                    <div className="pos-manuell" dangerouslySetInnerHTML={{ __html: p.beschreibung || '' }} />
                  )}
                </td>
                <td className="pos-menge">{menge}</td>
                {meta.preise && <td className="pos-preis">{euro(p.nettopreis)}</td>}
                {meta.preise && <td className="pos-preis pos-preis--bold">{euro(Number(p.nettopreis || 0) * menge)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summen */}
      {meta.preise && (
        <div className="beleg-summen">
          <div className="beleg-summen-zeile"><span>Zwischensumme netto</span><span>{euro(netto)}</span></div>
          <div className="beleg-summen-zeile"><span>zzgl. MwSt. 19 %</span><span>{euro(mwst)}</span></div>
          <div className="beleg-summen-zeile beleg-summen-zeile--gesamt"><span>Gesamtbetrag brutto</span><span>{euro(brutto)}</span></div>
          {meta.schluss && anzahlung > 0 && (
            <>
              <div className="beleg-summen-zeile"><span>{eigeneAnzahlung ? 'abzüglich erhaltene Anzahlung' : 'abzüglich Anzahlung (40 %)'}</span><span>−{euro(anzahlung)}</span></div>
              <div className="beleg-summen-zeile beleg-summen-zeile--gesamt"><span>Rechnungsbetrag</span><span>{euro(brutto - anzahlung)}</span></div>
            </>
          )}
        </div>
      )}

      {/* Zahlungsbedingungen */}
      {zahlung && (
        <div className="beleg-zahlung">
          <strong>Zahlungsbedingungen</strong>
          <p>{zahlung}</p>
          {meta.anzahlung && <p>Anzahlung (40 %): <strong>{euro(stdAnzahlung)}</strong></p>}
        </div>
      )}

      {/* Fuß */}
      <div className="beleg-akzentlinie beleg-akzentlinie--fuss" />
      <div className="beleg-fuss">
        <div>
          <strong>{firma.firmenname}</strong>
          <div>{firma.strasse}</div>
          <div>{[firma.plz, firma.ort].filter(Boolean).join(' ')}</div>
          <div>{firma.telefon && `Tel. ${firma.telefon}`}</div>
          <div>{firma.email}</div>
        </div>
        <div>
          <div>{firma.bank}</div>
          <div>{firma.iban && `IBAN ${firma.iban}`}</div>
          <div>{firma.bic && `BIC ${firma.bic}`}</div>
        </div>
        <div>
          {firma.steuernummer && <div>Steuer-Nr. {firma.steuernummer}</div>}
          {firma.ust_id && <div>USt-IdNr. {firma.ust_id}</div>}
          {(firma.handelsregister || firma.registergericht) && <div>{[firma.handelsregister, firma.registergericht].filter(Boolean).join(' · ')}</div>}
          {firma.geschaeftsfuehrung && <div>GF: {firma.geschaeftsfuehrung}</div>}
        </div>
      </div>
    </div>
  );
}

export default BelegDokument;
