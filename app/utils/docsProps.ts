export type DocsProp = { name: string; type: 'boolean' | 'string' | string[] | unknown };

// Extract option literals from a DocsProp.type value
export function extractOptions(t: DocsProp['type']): string[] {
  // Already array of options
  if (Array.isArray(t)) return t as string[];
  // Union type expressed as string: "'solid' | 'outline' | 'soft'"
  if (typeof t === 'string' && t.includes('|')) {
    return t
      .split('|')
      .map(s => s.trim().replace(/^'+|"+|'+$|"+$/g, '').replace(/^'|["`{}()]/g, '').replace(/['"`]/g, ''))
      .filter(Boolean);
  }
  // Enum-like object: { options: [...] } or { enum: [...] } or { values: [...] }
  if (t && typeof t === 'object') {
    const anyT = t as any;
    const arr = anyT.options || anyT.enum || anyT.values;
    if (Array.isArray(arr)) return arr as string[];
  }
  return [];
}

export function filterDocsProps(docsProps: DocsProp[], opts?: { excludeNames?: string[] }) {
  const exclude = new Set((opts?.excludeNames || []).map(s => s.toLowerCase()));
  return docsProps.filter(p => !exclude.has(p.name.toLowerCase()));
}
