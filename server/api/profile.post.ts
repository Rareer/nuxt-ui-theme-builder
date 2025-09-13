import { defineEventHandler, readBody } from 'h3';
import { z } from 'zod';
import { serverSupabaseServiceRole } from '#supabase/server';

const BodySchema = z.object({
  userId: z.string().uuid(),
  nickname: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid payload' };
  }

  const { userId, nickname } = parsed.data;
  const normalized = nickname.trim().toLowerCase();

  try {
    const supabase = await serverSupabaseServiceRole(event);
    // Upsert profile with normalized nickname
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, nickname: normalized }, { onConflict: 'id' });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unexpected error' };
  }
});
