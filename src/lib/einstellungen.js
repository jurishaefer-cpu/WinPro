import { supabase } from './supabase';

export async function ladeEinstellungen(ownerId) {
  const { data } = await supabase.from('einstellungen').select('*').eq('owner_id', ownerId).maybeSingle();
  return data ?? {};
}

export async function speichereSektion(ownerId, sektion, werte) {
  return supabase
    .from('einstellungen')
    .upsert({ owner_id: ownerId, [sektion]: werte }, { onConflict: 'owner_id' });
}
