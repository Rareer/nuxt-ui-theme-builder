#!/usr/bin/env node
/**
 * Scrape Nuxt UI docs props table.
 * Usage:
 *   node scripts/scrape-nuxt-ui-props.mjs <URL|targets.json> [--out path/to/output.json] [--outDir dir]
 *
 * Behavior:
 * - Finds the first <h3 id="props"> heading, then the next table element.
 * - Parses rows as: { name, type }.
 * - Writes JSON array to stdout or to --out file.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function parseArgs(argv) {
  const args = [...argv]
  const input = args.shift()
  let out = null
  let outDir = null
  while (args.length) {
    const a = args.shift()
    if (a === '--out') out = args.shift() || null
    else if (a === '--outDir') outDir = args.shift() || null
  }
  return { input, out, outDir }
}

function usage() {
  console.error('Usage: node scripts/scrape-nuxt-ui-props.mjs <URL|targets.json> [--out output.json] [--outDir dir]')
}

async function main() {
  const [, , ...rest] = process.argv
  const { input, out, outDir } = parseArgs(rest)
  if (!input) {
    usage()
    process.exit(1)
  }

  async function fetchHtml(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return await res.text()
  }

  function extractProps(html) {
    const $ = load(html)
    const heading = $('h2#props, h3#props, [id="props"]').first()
    if (!heading.length) return []

    // Find the first table that appears after the heading in DOM order
    const allNodes = $('*')
    const headingIdx = allNodes.index(heading)
    let table = null
    $('table').each((_, el) => {
      if (table) return
      const idx = allNodes.index(el)
      if (idx > headingIdx) table = $(el)
    })
    if (!table) return []

    // Rows: support with/without tbody
    const rows = table.find('tbody tr').length ? table.find('tbody tr') : table.find('tr').slice(1) // skip header if present
    const props = []
    rows.each((_, tr) => {
      const $tr = $(tr)
      const tds = $tr.find('td')
      if (!tds.length) return

      const clean = (s) => s.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim()

      // Name is first column; prefer <code> content
      let name = $(tds[0]).find('code').first().text()
      if (!name) name = $(tds[0]).text()
      name = clean(name)

      // Type extraction: only consider the FIRST <code class="material-theme"> token
      const typeCell = $(tds[tds.length - 1])
      const firstToken = typeCell.find('code.material-theme').first().text()
      const first = clean(firstToken)

      // Determine canonical type from FIRST token only (strict)
      // valid if:
      //  - exactly 'boolean'
      //  - exactly 'string'
      //  - union of quoted string literals: 'a' | "b" | 'c'
      let canonical = null
      const isBoolean = /^\s*boolean\s*$/i.test(first)
      const isStringOnly = /^\s*string\s*$/i.test(first)
      const isStringLiteralUnion = /^\s*(?:'(?:[^']+)'|"(?:[^"]+)")(?:\s*\|\s*(?:'(?:[^']+)'|"(?:[^"]+)"))*\s*$/.test(first)

      if (isBoolean) canonical = 'boolean'
      else if (isStringOnly) canonical = 'string'
      else if (isStringLiteralUnion) {
        const literals = (first.match(/'(?:[^']+)'|"(?:[^"]+)"/g) || [])
          .map(m => m.replace(/^['\"]/,'').replace(/['\"]$/,''))
        canonical = [...new Set(literals)]
      }

      // Keep only when valid AND not the 'ui' property (exception)
      if (!name) return
      const valid = canonical === 'boolean' || canonical === 'string' || Array.isArray(canonical)
      if (name !== 'ui' && !valid) return

      // Filter: except for 'ui', only allow boolean, string, or array of strings
      if (name !== 'ui') {
        // Normalize output type (boolean | string | string[])
        let outType = canonical
        if (Array.isArray(outType)) {
          // unique & stable
          outType = [...new Set(outType)]
        }
        props.push({ name, type: outType })
      }
    })
    return props
  }

  const isUrl = /^https?:\/\//i.test(input)
  if (isUrl) {
    try {
      const html = await fetchHtml(input)
      const props = extractProps(html)
      const json = JSON.stringify(props, null, 2)
      if (out) {
        const outPath = path.isAbsolute(out) ? out : path.join(process.cwd(), out)
        await fs.mkdir(path.dirname(outPath), { recursive: true })
        await fs.writeFile(outPath, json, 'utf8')
        console.log(`Wrote ${props.length} props to ${outPath}`)
      } else {
        console.log(json)
      }
    } catch (err) {
      console.error('Failed:', err.message)
      process.exit(1)
    }
    return
  }

  // Batch mode: read a JSON file with an array of URLs
  const targetsPath = path.isAbsolute(input) ? input : path.join(process.cwd(), input)
  let targets
  try {
    const raw = await fs.readFile(targetsPath, 'utf8')
    targets = JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read/parse targets file:', err.message)
    process.exit(1)
  }
  if (!Array.isArray(targets)) {
    console.error('Targets JSON must be an array of URLs')
    process.exit(1)
  }

  const results = {}
  for (const url of targets) {
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) continue
    try {
      const html = await fetchHtml(url)
      const props = extractProps(html)
      const key = url.split('?')[0].replace(/\/$/, '').split('/').pop() || 'component'
      results[key] = { url, props }
      if (outDir) {
        const dir = path.isAbsolute(outDir) ? outDir : path.join(process.cwd(), outDir)
        await fs.mkdir(dir, { recursive: true })
        const filePath = path.join(dir, `${key}.json`)
        await fs.writeFile(filePath, JSON.stringify(props, null, 2), 'utf8')
        console.log(`Wrote ${props.length} props for ${key} -> ${filePath}`)
      }
    } catch (err) {
      console.error(`Error scraping ${url}:`, err.message)
    }
  }

  if (!outDir) {
    const json = JSON.stringify(results, null, 2)
    if (out) {
      const outPath = path.isAbsolute(out) ? out : path.join(process.cwd(), out)
      await fs.mkdir(path.dirname(outPath), { recursive: true })
      await fs.writeFile(outPath, json, 'utf8')
      console.log(`Wrote aggregated results for ${Object.keys(results).length} components -> ${outPath}`)
    } else {
      console.log(json)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(99)
})
