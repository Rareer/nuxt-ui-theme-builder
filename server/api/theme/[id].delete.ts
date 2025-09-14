import { defineEventHandler, createError } from 'h3';
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';
import type { Database } from '../../../supabase/types/supabase';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const id = event.context.params?.id as string | undefined;
  if (!user?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' });

  try {
    const supabase = await serverSupabaseServiceRole<Database>(event);

    // Ensure the configuration belongs to the current user
    const { data: item, error: fetchError } = await supabase
      .from('configurations')
      .select('id, owner')
      .eq('id', id)
      .single();

    if (fetchError) return { ok: false, error: fetchError.message };
    if (!item) return { ok: false, error: 'Not found' };
    if (item.owner !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' });

    const { error: delError } = await supabase
      .from('configurations')
      .delete()
      .eq('id', id);

    if (delError) return { ok: false, error: delError.message };

    return { ok: true };
  } catch (e: any) {
    if (e?.statusCode) throw e;
    return { ok: false, error: e?.message || 'Unexpected error' };
  }
});
