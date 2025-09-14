import { defineEventHandler } from 'h3';
import { serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '../../supabase/types/supabase';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseServiceRole<Database>(event);
    const { data, error } = await supabase
      .from('configurations')
      .select('id, name, description, is_public, is_active, version, created_at, updated_at, owner')
      .eq('is_public', true)
      .eq('kind', 'theme')
      .order('updated_at', { ascending: false });

    if (error) return { ok: false, error: error.message };
    const items = data || [];
    // Lookup owner display names (prefer profiles.nickname, then auth.users.email)
    const ownerIds = Array.from(new Set(items.map(i => i.owner).filter(Boolean))) as string[];
    let ownerMap: Record<string, string> = {};
    if (ownerIds.length > 0) {
      // 1) Try profiles.nickname
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles' as any)
        .select('id, nickname')
        .in('id', ownerIds);
      if (!profilesError && Array.isArray(profiles)) {
        for (const p of profiles as any[]) {
          if (p?.id && p?.nickname) ownerMap[p.id] = p.nickname as string;
        }
      }
      // 2) Fill missing with auth.users.email
      const missingIds = ownerIds.filter(id => !ownerMap[id]);
      if (missingIds.length > 0) {
        const { data: users, error: usersError } = await (supabase as any)
          .from('auth.users' as any)
          .select('id, email, user_metadata')
          .in('id', missingIds);
        if (!usersError && Array.isArray(users)) {
          for (const u of users as any[]) {
            const meta = (u.user_metadata || {}) as any;
            const display = meta?.full_name || meta?.name || u.email || undefined;
            if (u?.id) ownerMap[u.id] = display || 'Unbekannt';
          }
        }
      }
    }

    const enriched = items.map(i => ({ ...i, owner_name: ownerMap[i.owner] || 'Unbekannt' }));
    return { ok: true, items: enriched };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unexpected error' };
  }
});
