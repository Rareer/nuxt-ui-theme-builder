import { defineEventHandler, createError } from 'h3';
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';
import type { Database } from '../../supabase/types/supabase';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    const supabase = await serverSupabaseServiceRole<Database>(event);
    const { data, error } = await supabase
      .from('configurations')
      .select('id, name, description, is_public, is_active, version, created_at, updated_at')
      .eq('owner', user.id)
      .eq('kind', 'theme')
      .order('updated_at', { ascending: false });

    if (error) return { ok: false, error: error.message };

    return { ok: true, items: data || [] };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unexpected error' };
  }
});
