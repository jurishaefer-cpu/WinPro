import { supabase } from './supabase';

// Firmen-Inhaber: unter dieser ID liegen die firmenweiten Daten (Firmendaten,
// Logo/Erscheinungsbild, Dokumente/Nummernkreise & Zahlungsbedingungen). Diese
// gelten für ALLE Nutzer. Nur der Ansprechpartner (profil) ist pro Nutzer.
export const FIRMA_OWNER = '9a62f99e-d8e1-4574-9a5f-5df7842f8c91'; // Juri Schäfer

export async function ladeEinstellungen(ownerId) {
  const { data } = await supabase.from('einstellungen').select('*').eq('owner_id', ownerId).maybeSingle();
  return data ?? {};
}

// Für Belege/Anzeige: firmenweite Daten vom Inhaber, Ansprechpartner vom
// eingeloggten Nutzer. So erscheinen Logo + Fußzeile bei jedem Nutzer, während
// der Ansprechpartner individuell bleibt.
export async function ladeBelegEinstellungen(userId) {
  const firma = await ladeEinstellungen(FIRMA_OWNER);
  const eigen = userId === FIRMA_OWNER ? firma : await ladeEinstellungen(userId);
  return { ...firma, profil: eigen?.profil ?? {} };
}

export async function speichereSektion(ownerId, sektion, werte) {
  return supabase
    .from('einstellungen')
    .upsert({ owner_id: ownerId, [sektion]: werte }, { onConflict: 'owner_id' });
}
