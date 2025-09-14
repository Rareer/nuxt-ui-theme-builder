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
    // Resolve owner display names exclusively via Admin API to avoid API schema exposure issues
    const ownerIds = Array.from(new Set(items.map(i => i.owner).filter(Boolean))) as string[];
    console.log('ownerIds', ownerIds);
    const ownerMap: Record<string, string> = {};
    if (ownerIds.length > 0) {
      const admin = (supabase as any)?.auth?.admin;
      if (!admin?.getUserById) {
        console.warn('Supabase admin API not available');
      } else {
        const results = await Promise.all(
          ownerIds.map(async (id) => {
            try {
              const { data: userData, error: adminErr } = await admin.getUserById(id);
              if (adminErr) return { id, display: undefined };
              const userAny = (userData?.user as any);
              const metaUser = userAny?.user_metadata as any;
              const metaRaw = userAny?.raw_user_meta_data as any;
              const display = (
                metaRaw?.display_name ?? metaUser?.display_name ??
                metaRaw?.nickname ?? metaUser?.nickname ??
                metaRaw?.name ?? metaUser?.name ??
                metaRaw?.full_name ?? metaUser?.full_name
              ) as string | undefined;
              return { id, display };
            } catch {
              return { id, display: undefined };
            }
          })
        );
        for (const r of results) {
          if (r?.id && r.display) ownerMap[r.id] = r.display;
        }
        console.log('admin resolved owners', Object.keys(ownerMap).length);
      }
    }
    console.log('ownermap', ownerMap);
    const enriched = items.map(i => ({ ...i, display_name: ownerMap[i.owner] || 'Unbekannt' }));
    return { ok: true, items: enriched };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unexpected error' };
  }
});
