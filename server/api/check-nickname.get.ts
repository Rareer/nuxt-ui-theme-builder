import { defineEventHandler, getQuery } from 'h3';
import { serverSupabaseServiceRole } from '#supabase/server';

// Simple validation: 3-20 chars, letters, numbers, hyphen, underscore
const NICK_RE = /^[a-zA-Z0-9_-]{3,20}$/;

export default defineEventHandler(async (event) => {
  const { nickname } = getQuery(event) as { nickname?: string };
  const raw = (nickname || '').toString().trim();
  const normalized = raw.toLowerCase();

  if (!raw || !NICK_RE.test(raw)) {
    return { available: false, invalid: true, message: 'Invalid nickname' };
  }

  try {
    // Use service role to bypass RLS for existence check
    const supabase = await serverSupabaseServiceRole(event);
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('nickname', normalized);

    if (error) {
      return { available: false, message: error.message };
    }

    return { available: (count ?? 0) === 0 };
  } catch (e: any) {
    return { available: false, message: e?.message || 'Unexpected error' };
  }
});
