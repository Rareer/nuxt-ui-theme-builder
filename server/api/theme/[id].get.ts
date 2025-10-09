import { defineEventHandler, createError } from 'h3';
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';
import type { Database } from '../../../supabase/types/supabase';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const id = event.context.params?.id as string | undefined;
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' });

  try {
    const supabase = await serverSupabaseServiceRole<Database>(event);
    const { data, error } = await supabase
      .from('configurations')
      .select('id, owner, name, description, is_public, is_active, version, created_at, updated_at, data, preview')
      .eq('id', id)
      .single();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: 'Not found' };

    // Access control: owner or public
    if (!(data.is_public || (user && data.owner === user.id))) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    return { ok: true, item: data };
  } catch (e: any) {
    if (e?.statusCode) throw e;
    return { ok: false, error: e?.message || 'Unexpected error' };
  }
});
