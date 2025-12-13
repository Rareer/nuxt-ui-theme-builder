<script setup lang="ts">
import type { ThemeVariable } from '../constants/theme';
import type { Color } from '../types/color';

import { useColorsStore } from '../store/colors';
import { useThemeStore, type CssVariableMapping } from '../store/theme';
import { ICON_PACK_PRESETS, useIconsStore } from '../store/icons';
import { useAppIcons } from '@/composables/useAppIcons';

// Type für Farbwerte mit String-Index
interface ColorValues {
	[key: string]: string;
}

const colorStore = useColorsStore();
const themeStore = useThemeStore();
const iconsStore = useIconsStore();
const { icon: appIcon } = useAppIcons();
const { t } = useI18n();

// Emit events to parent (AppHeader) to open Save/Load modals and Export modal
defineEmits(['request-save', 'request-load', 'request-export']);

// Aktueller Editiermodus aus dem Store
const currentMode = computed(() => themeStore.getEditMode);

// Nutze Nuxt Color Mode als globale Quelle
const colorMode = useColorMode();

// Verfügbare Theme-Variablen
const themeVariables = themeStore.getThemeVariables;

// Farbabstufungen
const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

// Hide these CSS variables from the generic list (dedicated UI below)
const fontVariableNames = ['font-sans', 'font-serif', 'font-mono'] as const;
type FontVariableName = typeof fontVariableNames[number];
const fontWeightVariableNames = [
	'font-weight-thin',
	'font-weight-extralight',
	'font-weight-light',
	'font-weight-normal',
	'font-weight-medium',
	'font-weight-semibold',
	'font-weight-bold',
	'font-weight-extrabold',
	'font-weight-black',
] as const;
type FontWeightVariableName = typeof fontWeightVariableNames[number];
const hiddenVariableNames = new Set<string>([...fontVariableNames]);

// Ausgewählte Farben für Theme-Variablen
const selectedColors = ref<Record<ThemeVariable, string>>({} as Record<ThemeVariable, string>);

const icons = computed(() => iconsStore.getIcons);
const iconEntries = computed(() => Object.entries(icons.value));
const iconPresetItems = ICON_PACK_PRESETS.map(pack => ({ label: pack, value: pack }));
const selectedIconPreset = computed({
	get: () => iconsStore.getSelectedPreset,
	set: (val: string) => {
		iconsStore.applyPreset(val);
	},
});

function updateIcon(key: string, value: string) {
	iconsStore.setIcon(key, value);
}

function resetIcons() {
	iconsStore.resetIcons();
}

// Initialisiere die ausgewählten Farben aus dem Store
onMounted(() => {
	ensureFontVariables(currentMode.value);
	// Initial aus aktuellem Modus laden
	hydrateSelectedColorsFromMode(currentMode.value);
});

// Wenn der Modus wechselt, UI-Auswahl aus dem entsprechenden Bucket laden
watch(currentMode, (mode) => {
	ensureFontVariables(mode);
	hydrateSelectedColorsFromMode(mode);
});

// Setzt den Light/Dark-Modus sowohl im Store (Editiermodus) als auch im globalen Nuxt Color Mode
function setMode(mode: 'light' | 'dark') {
	if (currentMode.value === mode) return;
	// Update store edit mode
	themeStore.setEditMode(mode);
	// Sync Nuxt color mode preference for global UI theme
	try {
		colorMode.preference = mode as any;
	}
	catch { }
}

function hydrateSelectedColorsFromMode(mode: 'light' | 'dark') {
	const bucket = themeStore.mappings?.[mode] || {};
	const next: Record<ThemeVariable, string> = {} as any;
	(themeVariables as ThemeVariable[]).forEach((v) => {
		next[v] = (bucket[v] || '') as string;
	});
	selectedColors.value = next;
}

// CSS-Variablen nach Kategorien gruppiert
const cssVariablesByCategory = computed(() => {
	const variables = themeStore.getCssVariables.filter(variable => !hiddenVariableNames.has(variable.name));
	const categories: Record<string, Array<CssVariableMapping & { selectedColor?: string }>> = {};

	variables.forEach((variable) => {
		const category = variable.category || 'Allgemein';
		if (!categories[category]) {
			categories[category] = [];
		}

		// Füge selectedColor hinzu, wenn es eine Farbreferenz ist
		const enhancedVariable = { ...variable };
		if (variable.type === 'color-reference' && variable.value) {
			const [colorName] = variable.value.split('-');
			enhancedVariable.selectedColor = colorName;
		}

		categories[category].push(enhancedVariable);
	});

	return categories;
});

// Farboptionen für die Dropdown-Menüs
const colorOptions = computed(() => {
	const options: Array<{ label: string; value: string; disabled?: boolean }> = [];
	// Eigene Farben Header
	if (colorStore.colors.length > 0) {
		options.push({
			label: `--- ${t('variableConfigurator.customColorsHeader')} ---`,
			value: 'separator-custom',
			disabled: true,
		});

		// Füge benutzerdefinierte Farben hinzu
		colorStore.colors.forEach((color) => {
			options.push({
				label: color.name,
				value: color.name,
			});
		});
	}

	// Tailwind Farben Header
	options.push({
		label: `--- ${t('variableConfigurator.tailwindColorsHeader')} ---`,
		value: 'separator-tailwind',
		disabled: true,
	});

	// Füge Tailwind-Farben hinzu
	const tailwindColors = getTailwindColorsAsColorObjects();
	tailwindColors.forEach((color) => {
		options.push({
			label: color.name,
			value: color.name,
		});
	});

	return options;
});

// Hilfsfunktion, um eine Farbe aus einer Referenz zu erhalten (z.B. 'neutral-500')
function getColorFromReference(reference: string): string {
	if (!reference) return 'transparent';

	const [colorName, shade] = reference.split('-');
	if (!colorName || !shade) return 'transparent';

	// Prüfe, ob es eine Tailwind-Farbe ist
	if (isTailwindColor(colorName)) {
		const color = getTailwindColorByName(colorName);
		const values = color?.values as ColorValues | undefined;
		return (values && shade in values && values[shade]) ? values[shade] : 'transparent';
	}
	else {
		// Sonst suche in den Store-Farben
		const color = colorStore.colors.find(c =>
			c.name.toLowerCase().replace(/\s+/g, '-') === colorName,
		);
		const values = color?.values as ColorValues | undefined;
		return (values && shade in values && values[shade]) ? values[shade] : 'transparent';
	}
}

// Funktion zum Aktualisieren einer CSS-Variable im Store
function updateCssVariable(variable: CssVariableMapping) {
	themeStore.updateCssVariable(variable);
}

// Funktion zum Aktualisieren der ausgewählten Farbe einer CSS-Variable
function updateSelectedColor(variable: CssVariableMapping & { selectedColor?: string }) {
	// Wenn eine Farbe ausgewählt wurde, aber noch kein Shade, setzen wir standardmäßig 500
	if (variable.selectedColor) {
		selectShade(variable, '500');
	}
	else {
		// Wenn keine Farbe ausgewählt wurde, setzen wir den Wert zurück
		variable.value = '';
		updateCssVariable(variable);
	}
}

// Funktion zum Auswählen eines Shades für eine CSS-Variable
function selectShade(variable: CssVariableMapping & { selectedColor?: string }, shade: string) {
	if (!variable.selectedColor) return;

	// Erstelle den Wert im Format 'colorname-shade'
	const colorName = variable.selectedColor.toLowerCase().replace(/\s+/g, '-');
	const isTailwind = isTailwindColor(variable.selectedColor);
	const value = isTailwind
		? `${colorName.toLowerCase()}-${shade}`
		: `${colorName.toLowerCase().replace(/\s+/g, '-')}-${shade}`;

	// Setze den Wert und aktualisiere die Variable
	variable.value = value;
	updateCssVariable(variable);
}

// Funktion zum Prüfen, ob ein bestimmter Shade für eine Variable ausgewählt ist
function isSelectedShade(variable: CssVariableMapping & { selectedColor?: string }, shade: string): boolean {
	if (!variable.value || !variable.selectedColor) return false;

	const [, selectedShade] = variable.value.split('-');
	return selectedShade === shade;
}

// Funktion zum Zurücksetzen aller CSS-Variablen auf Standardwerte
function resetCssVariables() {
	themeStore.resetCssVariables(currentMode.value);
	// Zusätzlich: Theme-Variablen-Zuweisungen zurücksetzen
	themeStore.clearAllMappings();
	// UI zurücksetzen: Auswahl der Farben leeren
	themeVariables.forEach((variable) => {
		selectedColors.value[variable] = '' as any;
	});
}

// Hilfsfunktion für die Anzeige der Variablennamen
function getVariableLabel(variable: ThemeVariable): string {
	const labels: Record<ThemeVariable, string> = {
		primary: 'Primary',
		secondary: 'Secondary',
		neutral: 'Neutral',
		success: 'Success',
		info: 'Info',
		warning: 'Warning',
		error: 'Error',
	};
	return labels[variable] || variable;
}

// Hilfsfunktion, um einen bestimmten Farbton einer Farbe zu erhalten
function getColorShade(colorName: string, shade: string): string {
	if (!colorName) return 'transparent';

	let color: Color | null = null;

	// Prüfe, ob es eine Tailwind-Farbe ist
	if (isTailwindColor(colorName)) {
		color = getTailwindColorByName(colorName);
	}
	else {
		// Sonst suche in den Store-Farben
		color = colorStore.colors.find(c => c.name === colorName) || null;
	}

	if (!color) return 'transparent';

	// Verwende einen sicheren Zugriff auf die Farben
	return (color.values as Record<string, string>)[shade] || 'transparent';
}

function ensureFontVariables(mode: 'light' | 'dark') {
	themeStore.ensureCssVariableDefaults(mode);
	[...fontVariableNames, ...fontWeightVariableNames].forEach((name) => {
		const current = themeStore.getCssVariable(name, mode);
		if (!current) {
			const fallback = themeStore.getDefaultCssVariable(name, mode) || {
				name,
				value: '',
				type: 'direct-value',
				label: name,
				category: 'Typography',
			};
			themeStore.updateCssVariable(fallback as CssVariableMapping, mode);
		}
	});
}

function updateFontVariable(name: FontVariableName, value: string) {
	const existing = themeStore.getCssVariable(name) || themeStore.getDefaultCssVariable(name, currentMode.value);
	if (existing) {
		themeStore.updateCssVariable({ ...existing, type: 'direct-value', value });
	}
}

const fontSans = computed({
	get: () => themeStore.getCssVariable('font-sans')?.value || themeStore.getDefaultCssVariable('font-sans', currentMode.value)?.value || '',
	set: value => updateFontVariable('font-sans', value),
});

const fontMono = computed({
	get: () => themeStore.getCssVariable('font-mono')?.value || themeStore.getDefaultCssVariable('font-mono', currentMode.value)?.value || '',
	set: value => updateFontVariable('font-mono', value),
});

const fontSerif = computed({
	get: () => themeStore.getCssVariable('font-serif')?.value || themeStore.getDefaultCssVariable('font-serif', currentMode.value)?.value || '',
	set: value => updateFontVariable('font-serif', value),
});

function resetFonts() {
	fontVariableNames.forEach((name) => {
		themeStore.resetCssVariable(name, currentMode.value);
	});
}

// Corner shape & radius helpers
const cornerShapeOptions = [
	{ label: 'square | superellipse(infinity)', value: 'square' },
	{ label: 'squircle | superellipse(2)', value: 'superellipse(2)' },
	{ label: 'round | superellipse(1)', value: 'round' },
	{ label: 'bevel | superellipse(0)', value: 'bevel' },
	{ label: 'scoop | superellipse(-1)', value: 'scoop' },
	{ label: 'notch | superellipse(-infinity)', value: 'notch' },
];

function trimTrailingZeros(val: number, decimals = 2): string {
	if (!Number.isFinite(val)) return '';
	const fixed = val.toFixed(decimals);
	return fixed.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
}


function getCssVariableValue(name: string): string {
	return themeStore.getCssVariable(name, currentMode.value)?.value
    || themeStore.getDefaultCssVariable(name, currentMode.value)?.value
    || '';
}

function updateDirectVariable(name: string, value: string) {
	const existing = themeStore.getCssVariable(name, currentMode.value)
    || themeStore.getDefaultCssVariable(name, currentMode.value);
	if (existing) {
		themeStore.updateCssVariable({ ...existing, type: 'direct-value', value }, currentMode.value);
	}
}

// Corner shape (superellipse) parsing/formatting
function normalizeCornerShapeValue(raw: string): string {
	if (!raw) return 'superellipse(1)';
	const trimmed = raw.trim().toLowerCase();
	const match = trimmed.match(/^superellipse\(([^)]+)\)$/);
	if (match) {
		const arg = match[1].replace(/\s+/g, '');
		if (/^-?inf(?:inity)?$/.test(arg)) return arg.startsWith('-') ? 'superellipse(-inf)' : 'superellipse(inf)';
		const num = Number(arg);
		if (Number.isFinite(num)) return `superellipse(${trimTrailingZeros(num)})`;
		return `superellipse(${arg})`;
	}
	return trimmed;
}

function parseCornerShapeNumeric(raw: string): number {
	const normalized = normalizeCornerShapeValue(raw);
	const keywords: Record<string, number> = {
		square: 4,
		squircle: 2,
		round: 1,
		bevel: 0,
		scoop: -1,
		notch: -4,
	};
	if (normalized in keywords) return keywords[normalized];

	const match = normalized.match(/^superellipse\(([^)]+)\)$/);
	if (match) {
		const arg = match[1];
		if (/^-?inf/.test(arg)) return arg.startsWith('-') ? -4 : 4;
		const num = Number(arg);
		if (Number.isFinite(num)) return num;
	}

	const fallback = Number(normalized);
	return Number.isFinite(fallback) ? fallback : 1;
}

function clampCornerShape(val: number): number {
	if (!Number.isFinite(val)) return 1;
	return Math.min(4, Math.max(-4, val));
}

function buildSuperellipse(val: number): string {
	return `superellipse(${trimTrailingZeros(clampCornerShape(val)) || '1'})`;
}

const cornerShapeRaw = computed(() => normalizeCornerShapeValue(getCssVariableValue('ui-corner-shape')));
const cornerShapeSelection = computed({
	get: () => cornerShapeRaw.value,
	set: (val: string) => {
		if (!val) return;
		updateDirectVariable('ui-corner-shape', normalizeCornerShapeValue(val));
	},
});
const cornerShapeValue = computed<number>({
	get: () => parseCornerShapeNumeric(cornerShapeRaw.value),
	set: (val: number) => updateDirectVariable('ui-corner-shape', buildSuperellipse(val)),
});
const cornerShapeInput = ref(trimTrailingZeros(cornerShapeValue.value));
watch(cornerShapeValue, (val) => {
	cornerShapeInput.value = trimTrailingZeros(val);
});
function handleCornerShapeInput(val?: string | number) {
	const num = Number(val);
	if (!Number.isFinite(num)) return;
	cornerShapeValue.value = clampCornerShape(num);
}
const cornerShapeDisplay = computed(() => cornerShapeRaw.value || 'superellipse(1)');

// Radius slider/input
function parseRadius(raw: string): number {
	if (!raw) return 0.25;
	const match = raw.trim().match(/^(-?\d+(?:\.\d+)?)(px|rem|%)?$/i);
	if (!match) return 0.25;
	const num = Number(match[1]);
	const unit = (match[2] || 'px').toLowerCase();
	if (!Number.isFinite(num)) return 0.25;
	if (unit === 'rem') return num;
	if (unit === 'px') return num / 16;
	return 0.25;
}
function clampRadius(val: number): number {
	if (!Number.isFinite(val)) return 0.25;
	return Math.min(3, Math.max(0, val));
}
const radiusValue = computed<number>({
	get: () => clampRadius(parseRadius(getCssVariableValue('ui-radius'))),
	set: (val: number) => updateDirectVariable('ui-radius', `${trimTrailingZeros(clampRadius(val), 3)}rem`),
});
const radiusInput = ref(trimTrailingZeros(radiusValue.value, 3));
watch(radiusValue, (val) => {
	radiusInput.value = trimTrailingZeros(val, 3);
});
function handleRadiusInput(val?: string | number) {
	const num = Number(val);
	if (!Number.isFinite(num)) return;
	radiusValue.value = clampRadius(num);
}

function randomizeTheme() {
	const availableColors = [
		...Object.keys(getTailwindColorsAsColorObjects().reduce((acc, color) => {
			acc[color.name] = true;
			return acc;
		}, {} as Record<string, boolean>)),
		...colorStore.colors.map(c => c.name.toLowerCase().replace(/\s+/g, '-')),
	].filter(Boolean);

	if (!availableColors.length) return;

	const pickRandomColor = () => availableColors[Math.floor(Math.random() * availableColors.length)];

	(['light', 'dark'] as const).forEach((mode) => {
		(themeVariables as ThemeVariable[]).forEach((variable) => {
			const colorName = pickRandomColor();
			themeStore.setMapping(variable, colorName, mode);
			if (mode === currentMode.value) {
				selectedColors.value[variable] = colorName as any;
			}
		});
	});
}

// Watch for changes in selected colors and update the theme store
watch(selectedColors, (newValues) => {
	Object.entries(newValues).forEach(([variable, colorName]) => {
		// Schreibt in den aktuell aktiven Modus (editMode)
		themeStore.setMapping(variable as ThemeVariable, (colorName as string) || null);
	});
}, { deep: true });
</script>

<template>
	<div class="space-y-8">
		<!-- Mode Toggle -->
		<div class="flex flex-col gap-4">
			<div class="flex items-center gap-2">
					<UButtonGroup>
						<UButton :color="currentMode === 'light' ? 'primary' : 'neutral'" variant="soft" size="sm"
							@click="setMode('light')" :icon="appIcon('sun')">
							Light
						</UButton>
						<UButton :color="currentMode === 'dark' ? 'primary' : 'neutral'" variant="soft" size="sm"
							@click="setMode('dark')" :icon="appIcon('moon')">
							Dark
						</UButton>
					</UButtonGroup>
				</div>
				<!-- Actions: Save, Load, Export -->
				<div class="flex items-center gap-2">
					<UButton :icon="appIcon('bookmark')" color="neutral" variant="soft" size="sm" @click="$emit('request-save')">
						{{ t('actions.save') }}
					</UButton>
					<UButton :icon="appIcon('folderOpen')" color="neutral" variant="soft" size="sm" @click="$emit('request-load')">
						{{ t('actions.load') }}
					</UButton>
					<UButton :icon="appIcon('download')" color="neutral" variant="soft" size="sm" @click="$emit('request-export')">
						{{ t('actions.export') }}
					</UButton>
					<UButton :icon="appIcon('dice5')" color="neutral" variant="soft" size="sm" @click="randomizeTheme">
						{{ t('actions.random') }}
					</UButton>
				</div>
		</div>
		<!-- Theme-Variablen Sektion -->
		<div class="grid grid-cols-1 gap-4">
			<div v-for="variable in themeVariables" :key="variable"
				class="border border-1 border-default rounded-lg p-4 space-y-3 flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<h3 class="font-medium">
						{{ getVariableLabel(variable) }}
					</h3>
					<UBadge :color="variable">
						{{ variable }}
					</UBadge>
				</div>

				<div class="flex items-center gap-2">
					<USelect v-model="selectedColors[variable]" class="w-full h-8 flex-1" :items="colorOptions"
						:placeholder="t('variableConfigurator.selectColor')">
						<template #item="{ item }">
							<div class="flex items-center gap-2">
							<span class="square-2 rounded p-2" :style="{ backgroundColor: isTailwindColor(item.value) ? getTailwindColorByName(item.value)?.values['500'] : (colorStore.colors.find(c => c.name === item.value)?.values['500'] || 'transparent') }" />
							<span :class="item.disabled ? 'text-neutral-500 italic' : ''">
								{{ item.label }}
							</span>
							</div>
						</template>
					</USelect>
						<UButton :icon="appIcon('rotateCcw')" color="neutral" variant="soft" title="Reset color" size="sm"
							@click="selectedColors[variable] = ''" />
				</div>

				<div v-if="selectedColors[variable]" class="flex flex-wrap gap-1">
					<div v-for="shade in shades" :key="shade" class="w-5 h-5 rounded-sm"
						:style="{ backgroundColor: getColorShade(selectedColors[variable], shade) }"
						:title="`${shade}: ${getColorShade(selectedColors[variable], shade)}`" />
				</div>
			</div>
		</div>

		<!-- Font Settings -->
		<div class="space-y-3">
			<h2 class="text-xl font-bold">
				{{ t('variableConfigurator.fontsTitle') }}
			</h2>
			<p class="text-sm text-neutral-500">
				{{ t('variableConfigurator.fontsDesc') }}
			</p>
			<div class="space-y-3">
				<UFormField :label="t('variableConfigurator.sansLabel')">
					<UInput v-model="fontSans" :placeholder="`'Inter', sans-serif`" class="w-full" />
				</UFormField>
				<UFormField :label="t('variableConfigurator.serifLabel')">
					<UInput v-model="fontSerif" :placeholder="`'Merriweather', serif`" class="w-full" />
				</UFormField>
				<UFormField :label="t('variableConfigurator.monoLabel')">
					<UInput v-model="fontMono" :placeholder="`'Geist Mono', ui-monospace, monospace`" class="w-full" />
				</UFormField>
				<div class="flex justify-end">
					<UButton size="sm" color="neutral" variant="soft" @click="resetFonts">
						{{ t('variableConfigurator.resetFonts') }}
					</UButton>
				</div>
			</div>
		</div>

		<!-- Icon Settings -->
		<div class="space-y-3">
			<h2 class="text-xl font-bold">
				{{ t('variableConfigurator.iconsTitle') }}
			</h2>
			<p class="text-sm text-neutral-500">
				{{ t('variableConfigurator.iconsDesc') }}
			</p>
			<div class="flex flex-wrap items-center gap-3">
				<UFormField :label="t('variableConfigurator.iconsPreset')">
					<USelect v-model="selectedIconPreset" :items="iconPresetItems" class="w-48" />
				</UFormField>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
				<UFormField v-for="[key, value] in iconEntries" :key="key" :label="key">
					<UInput :model-value="value" :icon="value" placeholder="pack:icon-name" class="w-full"
						@update:model-value="val => updateIcon(key, val || '')" />
				</UFormField>
			</div>
			<div class="flex justify-end">
				<UButton size="sm" color="neutral" variant="soft" @click="resetIcons">
					{{ t('variableConfigurator.resetIcons') }}
				</UButton>
			</div>
		</div>

		<!-- CSS-Variablen Sektion -->
		<div class="space-y-6">
			<h2 class="text-xl font-bold">
				{{ t('variableConfigurator.cssTitle') }}
			</h2>
			<p class="text-sm text-neutral-500">
				{{ t('variableConfigurator.cssDesc') }}
			</p>
			<div class="space-y-4">
				<UAccordion v-if="Object.keys(cssVariablesByCategory).length > 0" :items="Object.keys(cssVariablesByCategory).map(category => ({
					label: category,
					slot: category,
					defaultOpen: category === 'Text',
				}))">
					<template #default="{ item }">
						<div class="py-3">
							<div class="font-medium text-lg">
								{{ item.label }}
							</div>
						</div>
					</template>

					<template v-for="category in Object.keys(cssVariablesByCategory)" :key="category" #[category]>
						<div class="grid grid-cols-1 gap-4 py-4 px-1">
							<div v-for="variable in cssVariablesByCategory[category]" :key="variable.name"
								class="border border-1 border-default rounded-lg p-4 space-y-3">
								<div class="flex items-center justify-between">
									<h4 class="font-medium">
										{{ variable.label }}
									</h4>
									<UBadge color="neutral">
										--{{ variable.name }}
									</UBadge>
								</div>

								<div class="space-y-3">
									<template v-if="variable.name === 'ui-corner-shape'">
										<UFormField :label="t('variableConfigurator.cornerShapeLabel')">
											<div class="space-y-3">
												<USelect v-model="cornerShapeSelection" :items="cornerShapeOptions" class="w-full" />
												<div class="flex items-center gap-3">
													<USlider v-model="cornerShapeValue" :min="-4" :max="4" :step="0.1" class="flex-1" />
													<UInput v-model="cornerShapeInput" type="number" step="0.1" class="w-24"
														@update:model-value="handleCornerShapeInput" />
												</div>
											</div>
										</UFormField>
									</template>

									<template v-else-if="variable.name === 'ui-radius'">
										<UFormField :label="t('variableConfigurator.cornerRadiusLabel')">
											<div class="space-y-3">
												<div class="flex items-center gap-3">
													<USlider v-model="radiusValue" :min="0" :max="3" :step="0.05" class="flex-1" />
													<UInput v-model="radiusInput" type="number" step="0.05" class="w-24"
														@update:model-value="handleRadiusInput" />
												</div>
											</div>
										</UFormField>
									</template>

									<template v-else>
										<!-- Typ-Auswahl -->
										<URadioGroup v-model="variable.type"
											:items="[{ label: t('variableConfigurator.colorRef'), value: 'color-reference' }, { label: t('variableConfigurator.directValue'), value: 'direct-value' }]"
											@update:model-value="updateCssVariable(variable)" />

										<!-- Eingabefeld je nach Typ -->
										<div v-if="variable.type === 'color-reference'" class="mt-2">
											<UFormField>
												<USelect v-model="variable.selectedColor" :items="colorOptions"
													:placeholder="t('variableConfigurator.selectColor')" class="w-full"
													@update:model-value="updateSelectedColor(variable)" />
											</UFormField>

											<!-- Shade-Auswahl durch Klick -->
											<div v-if="variable.selectedColor" class="mt-3">
												<div class="text-xs text-neutral-500 mb-1">
													{{ t('variableConfigurator.selectShade') }}
												</div>
												<div class="flex flex-wrap gap-1">
													<div v-for="shade in shades" :key="shade"
														class="w-6 h-6 rounded-sm cursor-pointer transition-all hover:scale-110"
														:class="{ 'ring-2 ring-primary-500': isSelectedShade(variable, shade) }"
														:style="{ backgroundColor: getColorShade(variable.selectedColor, shade) }"
														@click="selectShade(variable, shade)" />
												</div>
											</div>

											<!-- Vorschau der ausgewählten Farbe -->
											<div v-if="variable.value" class="mt-2 flex items-center gap-2">
												<div class="w-6 h-6 rounded-sm"
													:style="{ backgroundColor: getColorFromReference(variable.value) }" />
												<span class="text-xs">{{ getColorFromReference(variable.value) }}</span>
											</div>
										</div>

										<div v-else class="mt-2">
											<UFormField>
												<UInput v-model="variable.value" type="text" class="w-full"
													@update:model-value="updateCssVariable(variable)">
													<template v-if="variable.value && variable.value.startsWith('#')" #trailing>
														<div class="w-4 h-4 rounded-sm" :style="{ backgroundColor: variable.value }" />
													</template>
												</UInput>
											</UFormField>
										</div>
									</template>
								</div>
							</div>
						</div>
					</template>
				</UAccordion>
			</div>

			<div class="mt-4 flex gap-2">
				<UButton color="neutral" @click="resetCssVariables">
					{{ t('variableConfigurator.resetAll') }} ({{ currentMode }})
				</UButton>
			</div>
		</div>
	</div>
</template>
