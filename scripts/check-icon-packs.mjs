import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsFile = path.resolve(__dirname, '../app/store/icons.ts');

function extractDefaults(content) {
	const match = content.match(/export const DEFAULT_ICONS[^=]*=\s*({[\s\S]*?})/);
	if (!match) throw new Error('Could not find DEFAULT_ICONS in icons.ts');
	// eslint-disable-next-line no-new-func
	return new Function(`return ${match[1]}`)();
}

function extractPacks(content) {
	const match = content.match(/export const ICON_PACK_PRESETS[^=]*=\s*\[([\s\S]*?)\]\s*as const/);
	if (!match) throw new Error('Could not find ICON_PACK_PRESETS in icons.ts');
	// eslint-disable-next-line no-new-func
	return new Function(`return [${match[1]}]`)();
}

function extractPresetMaps(content, defaults) {
	const match = content.match(/const PRESET_MAPS[^=]*=\s*({[\s\S]*?});/);
	if (!match) throw new Error('Could not find PRESET_MAPS in icons.ts');
	// Evaluate with DEFAULT_ICONS in scope so spreads work
	// eslint-disable-next-line no-new-func
	return new Function('DEFAULT_ICONS', `return ${match[1]}`)(
		defaults,
	);
}

function toPack(icon, pack) {
	if (!icon) return '';
	if (icon.includes(':')) {
		const [, name] = icon.split(':');
		return `${pack}:${name}`;
	}
	const trimmed = icon.replace(/^i-/, '');
	const name = trimmed.split('-').slice(1).join('-');
	return `${pack}:${name}`;
}

function toIconParts(value, fallbackPack) {
	if (!value) return { prefix: fallbackPack, name: '' };
	if (value.includes(':')) {
		const [prefix, name] = value.split(':');
		return { prefix, name };
	}
	const trimmed = value.replace(/^i-/, '');
	const name = trimmed.split('-').slice(1).join('-');
	return { prefix: fallbackPack, name };
}

async function checkPack(pack, defaults, presetMaps) {
	const preset = presetMaps[pack];
	const defaultKeys = Object.keys(defaults);
	const missingFromPreset = preset
		? defaultKeys.filter(key => !(key in preset))
		: [];

	const requested = defaultKeys.map((key) => {
		const value = preset?.[key] ?? toPack(defaults[key], pack);
		const { prefix, name } = toIconParts(value, pack);
		return { key, prefix, name };
	});

	const groups = requested.reduce((acc, entry) => {
		acc[entry.prefix] ||= new Set();
		if (entry.name) acc[entry.prefix].add(entry.name);
		return acc;
	}, /** @type {Record<string, Set<string>>} */ ({}));

	const missingIcons = new Set(missingFromPreset);

	for (const [prefix, namesSet] of Object.entries(groups)) {
		if (!namesSet.size) continue;
		const names = Array.from(namesSet).join(',');
		const url = `https://api.iconify.design/${prefix}.json?icons=${names}`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Iconify API returned ${res.status} for ${prefix}`);
		const json = await res.json();
		const notFound = new Set(json.not_found || []);
		requested
			.filter(entry => entry.prefix === prefix && notFound.has(entry.name))
			.forEach(entry => missingIcons.add(entry.key));
	}

	return {
		pack,
		missingPresetKeys: missingFromPreset,
		missingIcons: Array.from(missingIcons),
	};
}

async function main() {
	const content = fs.readFileSync(iconsFile, 'utf8');
	const defaults = extractDefaults(content);
	const packs = extractPacks(content);
	const presetMaps = extractPresetMaps(content, defaults);

	console.log(`Checking ${packs.length} packs against ${Object.keys(defaults).length} default keys...`);
	let exitCode = 0;

	for (const pack of packs) {
		try {
			const { missingIcons, missingPresetKeys } = await checkPack(pack, defaults, presetMaps);
			if (missingIcons.length) {
				exitCode = 1;
				const presetNote = missingPresetKeys.length ? ` (preset missing keys: ${missingPresetKeys.join(', ')})` : '';
				console.log(`- ${pack}: missing ${missingIcons.length} -> ${missingIcons.join(', ')}${presetNote}`);
			}
			else {
				console.log(`- ${pack}: all icons available`);
			}
		}
		catch (err) {
			exitCode = 1;
			console.error(`- ${pack}: ${err.message}`);
		}
	}

	process.exit(exitCode);
}

main();
