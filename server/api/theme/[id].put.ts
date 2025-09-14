import { defineEventHandler, readBody, createError } from 'h3';
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';
import { z } from 'zod';
import type { Database } from '../../../supabase/types/supabase';

// Reuse a permissive Json schema
const JsonSchema: z.ZodType<unknown> = z.lazy(() => z.union([
  z.string(), z.number(), z.boolean(), z.null(), z.array(JsonSchema), z.record(JsonSchema),
]));

const ThemeMappingsPerModeSchema = z.object({
  light: z.record(z.string(), z.string().nullable()),
  dark: z.record(z.string(), z.string().nullable()),
});
const CssVariableMappingsPerModeSchema = z.object({
  light: z.record(z.string(), JsonSchema),
  dark: z.record(z.string(), JsonSchema),
});

const SavedThemeSnapshotSchema = z.object({
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  colors: JsonSchema,
  componentUiConfigs: JsonSchema,
  theme: z.object({
    mappings: ThemeMappingsPerModeSchema,
    cssVariableMappings: CssVariableMappingsPerModeSchema,
  }),
});

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  version: z.number().int().optional(),
  snapshot: SavedThemeSnapshotSchema,
});

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  const id = event.context.params?.id as string | undefined;
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' });

  const body = await readBody(event);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return { ok: false, error: 'Invalid payload', issues: parsed.error.issues };

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

  const patch: any = {
    data: parsed.data.snapshot,
    updated_at: new Date().toISOString(),
  };
  if (typeof parsed.data.name === 'string') patch.name = parsed.data.name;
  if (typeof parsed.data.version === 'number') patch.version = parsed.data.version;
  if (typeof parsed.data.description !== 'undefined') patch.description = parsed.data.description;

  const { error: updateError } = await supabase
    .from('configurations')
    .update(patch)
    .eq('id', id);

  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true };
});
