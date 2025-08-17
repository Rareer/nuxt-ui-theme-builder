import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import ts from 'typescript';

// Config
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const componentsDir = path.resolve(projectRoot, 'node_modules', '@nuxt', 'ui', 'dist', 'runtime', 'components');
const outputDir = path.resolve(projectRoot, 'app', 'generated');
const outputFile = path.resolve(outputDir, 'nuxt-ui-types.json');
const perComponentDir = path.resolve(outputDir, 'nuxt-ui', 'components');
const componentsIndexFile = path.resolve(outputDir, 'nuxt-ui', 'components.index.json');

/**
 * Utility: Read all .d.ts files in a directory (non-recursive by default)
 */
function readDtsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.d.ts'))
    .map((f) => path.join(dir, f));
}

/** Recursively collect .d.ts files */
function readDtsFilesRecursive(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...readDtsFilesRecursive(p));
    else if (entry.isFile() && p.endsWith('.d.ts')) out.push(p);
  }
  return out;
}

/**
 * Resolve a Type from an IndexedAccessTypeNode chain like A['b']['c'] by
 * walking the object type and picking property types for literal indices.
 */
function resolveIndexedAccessNodeType(checker, node) {
  if (!node || !ts.isIndexedAccessTypeNode(node)) return undefined;

  // Resolve object type first (itself may be another indexed access)
  let objType;
  if (ts.isIndexedAccessTypeNode(node.objectType)) {
    objType = resolveIndexedAccessNodeType(checker, node.objectType);
  } else {
    objType = resolveTypeFromTypeNode(checker, node.objectType);
  }
  if (!objType) return undefined;

  // Determine property name from literal index
  let propName;
  const idx = node.indexType;
  if (ts.isLiteralTypeNode(idx) && ts.isStringLiteral(idx.literal)) {
    propName = idx.literal.text;
  }

  try {
    if (propName) {
      const sym = (objType.getProperty?.(propName)) || checker.getPropertyOfType(objType, propName);
      if (sym) {
        return checker.getTypeOfSymbolAtLocation(sym, idx);
      }
    }
  } catch {}

  // Fallback: let TS compute it
  try { return checker.getTypeAtLocation(node); } catch { return undefined; }
}

/**
 * Get property names (keys) from a type, merging unions/intersections.
 */
function getTypeKeys(checker, type) {
  if (!type) return [];
  const tsAny = ts;
  const keys = new Set();
  try {
    // Direct properties
    for (const p of checker.getPropertiesOfType(type) || []) keys.add(p.getName());
    // Union: merge
    if (type.isUnion && type.isUnion()) {
      for (const t of type.types) for (const p of checker.getPropertiesOfType(t) || []) keys.add(p.getName());
    }
    // Intersection: merge
    if (type.isIntersection && type.isIntersection()) {
      for (const t of type.types) for (const p of checker.getPropertiesOfType(t) || []) keys.add(p.getName());
    }
  } catch {}
  return Array.from(keys);
}

/**
 * Resolve a ts.Type from a ts.TypeNode, supporting typeof queries.
 */
function resolveTypeFromTypeNode(checker, node) {
  try {
    if (!node) return undefined;
    if (ts.isTypeQueryNode(node) && node.exprName) {
      const sym = checker.getSymbolAtLocation(node.exprName);
      if (sym) return checker.getTypeOfSymbolAtLocation(sym, node);
    }
    // Fallback: ask checker at the node
    return checker.getTypeAtLocation(node);
  } catch {
    return undefined;
  }
}

/**
 * Attempt to extract allowed values for a type when it is a union of string literals
 * or resolves to such a union through aliases.
 */
function extractAllowedValues(checker, type) {
  const tsAny = ts; // keep ts namespace nearby
  if (!type) return undefined;

  // Resolve alias target type if any (e.g., type Variant = 'solid'|'ghost')
  let t = type;
  if (t.aliasSymbol) {
    try {
      const aliasTarget = checker.getDeclaredTypeOfSymbol(t.aliasSymbol);
      if (aliasTarget) t = aliasTarget;
    } catch {}
  }

  // Get union constituents
  const types = (t.isUnion && t.isUnion()) ? t.types : (t.types || []);
  if (!types || types.length === 0) return undefined;

  // Collect string literal values
  const values = [];
  for (const ct of types) {
    if (ct.flags & tsAny.TypeFlags.StringLiteral) {
      // @ts-ignore - value available on StringLiteral type
      values.push(ct.value);
      continue;
    }
    // Template literal types resolved to strings
    if (ct.flags & tsAny.TypeFlags.TemplateLiteral) {
      const text = checker.typeToString(ct);
      // best-effort: template literals often show as quoted strings
      if (text.startsWith("'") || text.startsWith('"')) {
        values.push(text.slice(1, -1));
      } else {
        return undefined; // not safe to guess
      }
      continue;
    }

    // If constituent is an alias to a string literal, try one level deeper
    if (ct.aliasSymbol) {
      try {
        const aliasT = checker.getDeclaredTypeOfSymbol(ct.aliasSymbol);
        if (aliasT && (aliasT.flags & tsAny.TypeFlags.StringLiteral)) {
          // @ts-ignore
          values.push(aliasT.value);
          continue;
        }
      } catch {}
    }

    // Non-string constituent: bail out (mixed union)
    return undefined;
  }

  // Ensure uniqueness and stable order
  return Array.from(new Set(values));
}

/**
 * Build a richer type string. Attempts to:
 * - Render Array<T> as T[]
 * - If T is a type parameter, annotate with its constraint if present
 */
function typeToDisplay(checker, type, node) {
  // Default text
  const baseText = typeToString(checker, type, node);

  // Handle Array<T> reference
  if (type && (type.flags & ts.TypeFlags.Object)) {
    const tRef = /** @type {any} */ (type);
    const typeArgs = tRef.typeArguments || tRef.aliasTypeArguments || [];
    const isArrayRef = type.symbol?.escapedName === 'Array' && typeArgs.length === 1;
    if (isArrayRef) {
      const elem = typeArgs[0];
      const elemText = typeToString(checker, elem, node);
      let annotated = `${elemText}[]`;
      if (elem.flags & ts.TypeFlags.TypeParameter) {
        const constraint = checker.getBaseConstraintOfType(elem);
        if (constraint) {
          const cText = typeToString(checker, constraint, node);
          annotated += ` /* ${elemText} extends ${cText} */`;
        }
      }
      return annotated;
    }
  }

  // Handle direct type parameter T with constraint
  if (type.flags & ts.TypeFlags.TypeParameter) {
    const constraint = checker.getBaseConstraintOfType(type);
    if (constraint) {
      const cText = typeToString(checker, constraint, node);
      return `${baseText} /* ${baseText} extends ${cText} */`;
    }
  }

  return baseText;
}

/**
 * Extract JSDoc description and tags for a node
 */
function getJsDoc(node) {
  const docs = ts.getJSDocCommentsAndTags(node) || [];
  let description = '';
  const tags = {};
  for (const d of docs) {
    if (d.kind === ts.SyntaxKind.JSDocComment) {
      description = (d.comment ?? '').toString();
    } else if (ts.isJSDocTag(d)) {
      const tagName = d.tagName?.getText() ?? '';
      const comment = (d.comment ?? '').toString();
      tags[tagName] = comment;
    }
  }
  // Also capture @defaultValue from JSDoc nodes that may be grouped
  const jsDocs = node.jsDoc || [];
  for (const j of jsDocs) {
    if (j.comment && !description) description = j.comment.toString();
    const tagArr = j.tags || [];
    for (const t of tagArr) {
      const tagName = t.tagName?.getText() ?? '';
      const comment = (t.comment ?? '').toString();
      tags[tagName] = comment;
    }
  }
  return { description, tags };
}

/**
 * Convert a TS Type to a string representation, safely.
 */
function typeToString(checker, type, node) {
  try {
    return checker.typeToString(
      type,
      node,
      ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
        ts.TypeFormatFlags.NoTruncation |
        ts.TypeFormatFlags.WriteArrayAsGenericType |
        ts.TypeFormatFlags.UseSingleQuotes |
        ts.TypeFormatFlags.AddUndefined |
        ts.TypeFormatFlags.InTypeAlias
    );
  } catch {
    return 'unknown';
  }
}

/**
 * Extract members from an interface declaration
 */
function extractInterfaceMembers(checker, ifaceDecl, ifaceKind /** 'props'|'slots'|'emits' */) {
  const result = {};
  for (const member of ifaceDecl.members) {
    if (!member.name) continue;
    const name = member.name.getText();

    // Properties
    if (ts.isPropertySignature(member)) {
      // Special handling for emits interfaces where member type is a tuple
      if (
        ifaceKind === 'emits' &&
        member.type &&
        ts.isTupleTypeNode(member.type)
      ) {
        const t = checker.getTypeAtLocation(member.type);
        result[name] = {
          kind: 'emit',
          args: typeToString(checker, t, member.type),
        };
        continue;
      }

      const type = checker.getTypeAtLocation(member);
      const typeStr = typeToDisplay(checker, type, member);
      let allowedValues = extractAllowedValues(checker, type);
      // If not found, try to derive from IndexedAccess (e.g., Button['variants']['color'])
      try {
        // @ts-ignore
        const tNode = member.type;
        if (!allowedValues && tNode && ts.isIndexedAccessTypeNode(tNode)) {
          const finalType = resolveIndexedAccessNodeType(checker, tNode);
          if (finalType) {
            allowedValues = extractAllowedValues(checker, finalType);
            if (!allowedValues) {
              // maybe it's a keyof on the final type; collect keys
              const names = getTypeKeys(checker, finalType).filter(Boolean);
              if (names.length > 0 && names.length <= 64) allowedValues = Array.from(new Set(names));
            }
          }
        }
      } catch {}

      // If not found, try to derive from `keyof` operator on the syntax node
      try {
        // @ts-ignore - member.type may be undefined on some nodes
        const tNode = member.type;
        if (!allowedValues && tNode && ts.isTypeOperatorNode(tNode) && tNode.operator === ts.SyntaxKind.KeyOfKeyword && tNode.type) {
          const targetType = resolveTypeFromTypeNode(checker, tNode.type);
          const names = getTypeKeys(checker, targetType).filter(Boolean);
          if (names.length > 0 && names.length <= 64) {
            allowedValues = Array.from(new Set(names));
          }
        }
      } catch {}

      // If the prop type is a type parameter, attempt from its constraint
      if (!allowedValues && (type.flags & ts.TypeFlags.TypeParameter)) {
        try {
          const constraint = checker.getBaseConstraintOfType(type);
          if (constraint) {
            allowedValues = extractAllowedValues(checker, constraint);
            if (!allowedValues) {
              const names = getTypeKeys(checker, constraint).filter(Boolean);
              if (names.length > 0 && names.length <= 64) allowedValues = Array.from(new Set(names));
            }
          }
        } catch {}
      }
      const optional = !!member.questionToken;
      const { description, tags } = getJsDoc(member);
      const def = tags['defaultValue'] ?? undefined;
      result[name] = {
        kind: 'prop',
        type: typeStr,
        allowedValues,
        optional,
        default: def,
        description: description || undefined,
        tags,
      };
      continue;
    }

    // Call signature-like for slots: method signatures title(props): any;
    if (ts.isMethodSignature(member)) {
      const { description, tags } = getJsDoc(member);
      // Collect first parameter type (props)
      let paramTypeStr = 'void';
      if (member.parameters?.[0]) {
        const pType = checker.getTypeAtLocation(member.parameters[0]);
        paramTypeStr = typeToString(checker, pType, member.parameters[0]);
      }
      result[name] = {
        kind: 'slot',
        props: paramTypeStr,
        description: description || undefined,
        tags,
      };
      continue;
    }

    // Other member kinds ignored for now
  }
  return result;
}

/**
 * From a source file, find exported interfaces that follow the pattern
 * <Name>Props, <Name>Slots, <Name>Emits
 */
function extractFromSourceFile(checker, sf) {
  const out = {};
  // Debug: count statements
  // console.log('[scan]', path.basename(sf.fileName));

  for (const stmt of sf.statements) {
    // Interface form: export interface AlertProps { ... }
    if (ts.isInterfaceDeclaration(stmt)) {
      const name = stmt.name.getText();
      if (!/^(.*?)(Props|Slots|Emits)$/.test(name)) continue;
      // console.log('  interface', name, 'in', path.basename(sf.fileName));

      const baseName = name.replace(/(Props|Slots|Emits)$/, '');
      const kind = name.endsWith('Props') ? 'props' : name.endsWith('Slots') ? 'slots' : 'emits';
      out[baseName] ||= { file: sf.fileName, props: {}, slots: {}, emits: {} };
      const members = extractInterfaceMembers(checker, stmt, kind);
      if (kind === 'props') out[baseName].props = members;
      else if (kind === 'slots') out[baseName].slots = members;
      else out[baseName].emits = members;
      continue;
    }

    // Type alias form: export type AlertProps = { ... }
    if (ts.isTypeAliasDeclaration(stmt)) {
      const name = stmt.name.getText();
      if (!/^(.*?)(Props|Slots|Emits)$/.test(name)) continue;
      // console.log('  type', name, 'in', path.basename(sf.fileName));
      const baseName = name.replace(/(Props|Slots|Emits)$/, '');
      const kind = name.endsWith('Props') ? 'props' : name.endsWith('Slots') ? 'slots' : 'emits';
      out[baseName] ||= { file: sf.fileName, props: {}, slots: {}, emits: {} };
      const typeNode = stmt.type;
      if (ts.isTypeLiteralNode(typeNode)) {
        // Build a faux interface decl-like wrapper to reuse extractor
        const fakeIface = { members: typeNode.members };
        const members = extractInterfaceMembers(checker, fakeIface, kind);
        if (kind === 'props') out[baseName].props = members;
        else if (kind === 'slots') out[baseName].slots = members;
        else out[baseName].emits = members;
      }
      continue;
    }
  }

  return out;
}

/**
 * Merge component maps from multiple source files
 */
function mergeComponentMaps(into, add) {
  for (const [k, v] of Object.entries(add)) {
    if (!into[k]) into[k] = v;
    else {
      into[k] = {
        ...into[k],
        props: { ...(into[k].props || {}), ...(v.props || {}) },
        slots: { ...(into[k].slots || {}), ...(v.slots || {}) },
        emits: { ...(into[k].emits || {}), ...(v.emits || {}) },
      };
    }
  }
  return into;
}

function buildProgram(entryFiles) {
  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    allowJs: true,
    checkJs: false,
    declaration: false,
    skipLibCheck: true,
    noResolve: false,
    types: [],
  };
  const host = ts.createCompilerHost(options, true);
  return ts.createProgram(entryFiles, options, host);
}

function run() {
  if (!fs.existsSync(componentsDir)) {
    console.error(`Components directory not found: ${componentsDir}`);
    process.exit(1);
  }

  const files = readDtsFiles(componentsDir);
  // Include Nuxt's generated .d.ts to resolve '#build/*' modules if present
  const nuxtTypesDir = path.resolve(projectRoot, '.nuxt');
  const nuxtDts = readDtsFilesRecursive(nuxtTypesDir);
  const entryFiles = [...files, ...nuxtDts];
  if (files.length === 0) {
    console.error('No .d.ts component files found.');
    process.exit(1);
  }

  const program = buildProgram(entryFiles);
  const checker = program.getTypeChecker();

  let result = {};
  console.log(`Scanning ${files.length} entry files...`);
  for (const sf of program.getSourceFiles()) {
    const rel = path.relative(componentsDir, sf.fileName);
    if (rel.startsWith('..') || path.isAbsolute(rel)) continue;
    // Diagnostics
    // eslint-disable-next-line no-console
    console.log('Parse:', path.basename(sf.fileName));
    const extracted = extractFromSourceFile(checker, sf);
    result = mergeComponentMaps(result, extracted);
  }

  // Post-process: transform maps to arrays and clean up shapes
  const normalized = Object.entries(result).map(([name, meta]) => {
    const props = Object.entries(meta.props || {})
      .filter(([, v]) => v.kind === 'prop')
      .map(([propName, v]) => ({
        name: propName,
        type: v.type,
        optional: v.optional,
        default: v.default,
        description: v.description,
      }));

    const slots = Object.entries(meta.slots || {})
      .filter(([, v]) => v.kind === 'slot')
      .map(([slotName, v]) => ({
        name: slotName,
        props: v.props,
        description: v.description,
      }));

    // Emits: if an interface exists, members are props; otherwise, attempt from default export not handled here
    const emits = Object.entries(meta.emits || {})
      .map(([evtName, v]) => ({ name: evtName, args: v.args }));

    return {
      component: name,
      file: path.relative(projectRoot, meta.file),
      props,
      slots,
      emits,
    };
  });

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(perComponentDir)) fs.mkdirSync(perComponentDir, { recursive: true });

  // Write per-component files
  for (const comp of normalized) {
    const perFile = path.resolve(perComponentDir, `${comp.component}.json`);
    fs.writeFileSync(perFile, JSON.stringify(comp, null, 2), 'utf-8');
  }

  // Write combined index as well
  fs.writeFileSync(outputFile, JSON.stringify(normalized, null, 2), 'utf-8');
  // Build and write simple index with preview heuristic
  const index = normalized.map((c) => {
    const propNames = new Set((c.props || []).map((p) => p.name));
    const hasVariant = propNames.has('variant');
    const hasColor = propNames.has('color');
    const hasSize = propNames.has('size');
    return {
      component: c.component,
      file: c.file,
      props: Array.from(propNames),
      hasVariant,
      hasColor,
      hasSize,
      previewProp: hasVariant ? 'variant' : null,
    };
  });
  fs.writeFileSync(componentsIndexFile, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`Extracted ${normalized.length} components to ${path.relative(projectRoot, outputFile)} and ${path.relative(projectRoot, perComponentDir)}; index at ${path.relative(projectRoot, componentsIndexFile)}`);
}

run();
