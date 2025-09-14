import { defineEventHandler, readBody, createError } from 'h3';
import { z } from 'zod';
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';
import type { Database, TablesInsert } from '../../supabase/types/supabase';

// Generic JSON schema (recursive)
const JsonSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(JsonSchema), z.record(JsonSchema)])
);

// SavedThemeSnapshot shape from app/store/savedThemes.ts (kept permissive for forward-compat)
// The theme store uses per-mode structures for mappings and cssVariableMappings
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
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  colors: JsonSchema, // store state object
  componentUiConfigs: JsonSchema, // UI config export
  theme: z.object({
    mappings: ThemeMappingsPerModeSchema,
    cssVariableMappings: CssVariableMappingsPerModeSchema,
  }),
});

// Insert shape for public.configurations based on supabase/types/supabase.ts
const ConfigurationsInsertSchema = z.object({
  // created_at is set by DB default, allow override for testing
  created_at: z.string().optional(),
  data: JsonSchema, // the JSON payload
  description: z.string().nullable().optional(),
  id: z.string().optional(),
  is_active: z.boolean().optional(),
  is_public: z.boolean().optional(),
  kind: z.string().optional().default('theme'),
  name: z.string(),
  owner: z.string(), // user id
  updated_at: z.string().optional(),
  version: z.number().int().optional().default(1),
});

// Request payload accepted by this endpoint
const SaveThemeRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  kind: z.string().optional().default('theme'),
  version: z.number().int().optional().default(1),
  snapshot: SavedThemeSnapshotSchema,
});

export default defineEventHandler(async (event) => {
  // require authenticated user (id used as owner)
  const user = await serverSupabaseUser(event);
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const body = await readBody(event);
  const parsed = SaveThemeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid payload', issues: parsed.error.issues };
  }

  const { name, description, isPublic, kind, version, snapshot } = parsed.data;

  // Normalize fields
  const owner = user.id;
  const insertCandidate = {
    name,
    description: description ?? null,
    is_public: !!isPublic,
    is_active: true,
    kind: kind || 'theme',
    owner,
    version: version ?? 1,
    data: snapshot as unknown,
  };

  const insertParsed = ConfigurationsInsertSchema.safeParse(insertCandidate);
  if (!insertParsed.success) {
    return { ok: false, error: 'Insert validation failed', issues: insertParsed.error.issues };
  }

  try {
    const supabase = await serverSupabaseServiceRole<Database>(event);
    const payload = insertParsed.data as TablesInsert<'configurations'>;
    const { data, error } = await supabase
      .from('configurations')
      .insert(payload)
      .select('id, created_at, updated_at')
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id, created_at: data?.created_at, updated_at: data?.updated_at };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unexpected error' };
  }
});
