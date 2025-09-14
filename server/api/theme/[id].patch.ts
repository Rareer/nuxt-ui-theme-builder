import { defineEventHandler, readBody, createError } from 'h3';
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';
import { z } from 'zod';
import type { Database } from '../../../supabase/types/supabase';

const PatchSchema = z.object({
  is_public: z.boolean(),
});

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  const id = event.context.params?.id as string | undefined;
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' });

  const body = await readBody(event);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return { ok: false, error: 'Invalid payload', issues: parsed.error.issues };

  try {
    const supabase = await serverSupabaseServiceRole<Database>(event);

    // Ensure ownership
    const { data: existing, error: fetchError } = await supabase
      .from('configurations')
      .select('id, owner')
      .eq('id', id)
      .single();

    if (fetchError) return { ok: false, error: fetchError.message };
    if (!existing) return { ok: false, error: 'Not found' };
    if (existing.owner !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' });

    const { error: updError } = await supabase
      .from('configurations')
      .update({ is_public: parsed.data.is_public, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updError) return { ok: false, error: updError.message };

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unexpected error' };
  }
});
