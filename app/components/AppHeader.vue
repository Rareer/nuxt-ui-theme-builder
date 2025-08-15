<template>
	<header class="h-16 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 relative z-40">
		<div class="flex items-center" />
		<div class="flex items-center">
			<UNavigationMenu
				:items="items"
				orientation="horizontal"
			/>
		</div>
		<div class="flex items-center gap-4 ml-auto relative z-40">
			<!-- Generate Theme with AI Button -->
			<UButton
				icon="i-lucide-sparkles"
				color="primary"
				variant="soft"
				:aria-label="$t('header.generateWithAI')"
				@click="openAIModal"
			/>
			<!-- Theme Configuration Button -->
			<UButton
				icon="i-lucide-palette"
				color="primary"
				variant="soft"
				:aria-label="$t('header.themeConfig')"
				@click="isThemeConfigOpen = true"
			/>
			<!-- Dark Mode Toggle -->
			<UButton
				icon="i-heroicons-moon-20-solid"
				color="neutral"
				variant="soft"
				:aria-label="$t('header.toggleDark')"
				@click="toggleDark"
			/>
			<!-- Actions Dropdown: Export, Speichern, Laden -->
			<UDropdownMenu
				:items="actionItems"
				:popper="{ placement: 'bottom-end', strategy: 'fixed' }"
				:teleport="true"
				@select="onActionSelect"
			>
				<UButton
					class="z-50"
					icon="i-heroicons-ellipsis-vertical"
					color="neutral"
					variant="soft"
					:aria-label="$t('actions.actions')"
				/>
			</UDropdownMenu>
		</div>
	</header>

	<!-- Theme Configuration Slideover -->
	<USlideover
		v-model:open="isThemeConfigOpen"
		side="right"
		:width="500"
	>
		<template #header>
			<div class="flex items-center justify-between w-full">
				<h3 class="text-xl font-medium">
					{{ $t('header.themeConfig') }}
				</h3>
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-lucide-x"
					@click="isThemeConfigOpen = false"
				/>
			</div>
		</template>

		<template #content>
			<div class="overflow-auto h-full">
				<VariableConfigurator />
			</div>
		</template>
	</USlideover>

	<!-- Theme Export Modal -->
	<UModal
		v-model:open="isExportModalOpen"
		size="xl"
		class="max-w-4xl"
	>
		<template #header>
			<div class="flex items-center justify-between w-full">
				<h3 class="text-xl font-medium">
					{{ $t('header.exportTitle') }}
				</h3>
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-lucide-x"
					@click="closeExportModal"
				/>
			</div>
		</template>

		<template #body>
			<div class="space-y-6 p-2">
				<!-- app.config.ts -->
				<div>
					<div class="flex items-center align-center justify-between mb-2">
						<label
							for="app-config"
							class="block text-sm font-medium"
						>{{ $t('header.appConfig') }}</label>
						<UButton
							icon="i-heroicons-clipboard"
							color="primary"
							variant="soft"
							size="sm"
							@click="copyToClipboard(appConfigContent)"
						/>
					</div>
					<div class="relative">
						<!-- Highlighted code -->
						<div
							v-if="isHighlighterReady"
							class="rounded-md overflow-auto max-h-64"
							v-html="highlightedAppConfigContent"
						/>

						<!-- Fallback textarea while highlighter loads -->
						<UTextarea
							v-else
							id="app-config"
							v-model="appConfigContent"
							:rows="8"
							class="font-mono text-sm w-full"
							readonly
						/>
					</div>
				</div>

				<!-- main.css -->
				<div>
					<div class="flex items-center align-center justify-between mb-2">
						<label
							for="main-css"
							class="block text-sm font-medium"
						>{{ $t('header.mainCss') }}</label>
						<UButton
							icon="i-heroicons-clipboard"
							color="primary"
							variant="soft"
							size="sm"
							@click="copyToClipboard(cssContent)"
						/>
					</div>
					<div class="relative">
						<!-- Highlighted code -->
						<div
							v-if="isHighlighterReady"
							class="rounded-md overflow-auto max-h-64"
							v-html="highlightedCssContent"
						/>

						<!-- Fallback textarea while highlighter loads -->
						<UTextarea
							v-else
							id="main-css"
							v-model="cssContent"
							:rows="12"
							class="font-mono text-sm w-full"
							readonly
						/>
					</div>
				</div>
			</div>
		</template>

		<template #footer>
			<div class="flex justify-end">
				<UButton
					color="neutral"
					@click="closeExportModal"
				>
					{{ $t('actions.close') }}
				</UButton>
			</div>
		</template>
	</UModal>

	<!-- Save Theme Modal -->
	<UModal
		v-model:open="isSaveModalOpen"
		size="md"
	>
		<template #header>
			<div class="flex items-center justify-between w-full">
				<h3 class="text-xl font-medium">
					{{ $t('header.saveTitle') }}
				</h3>
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-lucide-x"
					@click="isSaveModalOpen = false"
				/>
			</div>
		</template>
		<template #body>
			<div class="space-y-4 p-2">
				<UFormField :label="$t('actions.save')">
					<UInput
						v-model="saveName"
						:placeholder="$t('actions.themeName')"
					/>
				</UFormField>
			</div>
		</template>
		<template #footer>
			<div class="flex justify-end gap-2">
				<UButton
					color="neutral"
					variant="soft"
					@click="isSaveModalOpen = false"
				>
					{{ $t('actions.close') }}
				</UButton>
				<UButton
					color="primary"
					:disabled="!saveName.trim()"
					@click="handleSaveTheme"
				>
					{{ $t('actions.save') }}
				</UButton>
			</div>
		</template>
	</UModal>

	<!-- Load Theme Modal -->
	<UModal
		v-model:open="isLoadModalOpen"
		size="md"
	>
		<template #header>
			<div class="flex items-center justify-between w-full">
				<h3 class="text-xl font-medium">
					{{ $t('header.loadTitle') }}
				</h3>
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-lucide-x"
					@click="isLoadModalOpen = false"
				/>
			</div>
		</template>
		<template #body>
			<div class="p-2">
				<div
					v-if="savedNames.length === 0"
					class="text-sm text-gray-500"
				>
					{{ $t('header.noThemes') }}
				</div>
				<ul
					v-else
					class="divide-y divide-gray-200 dark:divide-gray-800"
				>
					<li
						v-for="name in savedNames"
						:key="name"
						class="flex items-center justify-between py-2"
					>
						<div class="flex flex-col">
							<span class="font-medium">{{ name }}</span>
							<span class="text-xs text-gray-500">{{ savedThemesStore.themes[name]?.updatedAt }}</span>
						</div>
						<div class="flex items-center gap-2">
							<UButton
								size="sm"
								color="primary"
								variant="soft"
								icon="i-heroicons-arrow-down-tray"
								@click="handleLoadTheme(name)"
							>
								{{ $t('actions.load') }}
							</UButton>
							<UButton
								size="sm"
								color="error"
								variant="ghost"
								icon="i-heroicons-trash"
								@click="handleDeleteTheme(name)"
							/>
						</div>
					</li>
				</ul>
			</div>
		</template>
		<template #footer>
			<div class="flex justify-end">
				<UButton
					color="neutral"
					@click="isLoadModalOpen = false"
				>
					{{ $t('actions.close') }}
				</UButton>
			</div>
		</template>
	</UModal>

	<!-- AI Generate Theme Modal -->
	<AIGenerateThemeModal ref="aiModal" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import VariableConfigurator from './VariableConfigurator.vue';
import AIGenerateThemeModal from './AIGenerateThemeModal.vue';
import { useThemeExport } from '../composables/useThemeExport';
import { useSavedThemesStore } from '../store/savedThemes';
import { useI18n } from 'vue-i18n';

const colorMode = useColorMode();
const isThemeConfigOpen = ref(false);
const {
	exportTheme,
	isExporting,
	isExportModalOpen,
	cssContent,
	appConfigContent,
	highlightedCssContent,
	highlightedAppConfigContent,
	isHighlighterReady,
	closeExportModal,
} = useThemeExport();

const aiModal = ref<InstanceType<typeof AIGenerateThemeModal> | null>(null);

// Save/Load state
const isSaveModalOpen = ref(false);
const isLoadModalOpen = ref(false);
const saveName = ref('');
const savedThemesStore = useSavedThemesStore();
const savedNames = computed(() => savedThemesStore.listNames);

const { t, availableLocales, setLocale } = useI18n();

// Locale switch items: set the locale directly to ensure immediate update
const localeItems = computed(() => (
	((availableLocales as unknown as string[]) || []).map(l => ({
		label: t(`locale.${l}` as any),
		key: `locale-${l}`,
		onSelect: () => setLocale(l as any),
	}))
));

// Dropdown items with onSelect handlers and keys
const actionItems = computed(() => ([
	[
		{ label: t('actions.save'), icon: 'i-heroicons-bookmark', key: 'save', onSelect: () => { isSaveModalOpen.value = true; } },
		{ label: t('actions.load'), icon: 'i-heroicons-folder-open', key: 'load', onSelect: () => { isLoadModalOpen.value = true; } },
		{ label: t('actions.export'), icon: 'i-heroicons-arrow-down-tray', key: 'export', onSelect: () => { exportTheme(); } },
	],
	[
		{ label: t('locale.language'), icon: 'i-heroicons-globe-alt', disabled: true },
		...localeItems.value,
	],
]));

function onActionSelect(item: any) {
	if (item?.onSelect && typeof item.onSelect === 'function') {
		item.onSelect();
		return;
	}
	switch (item?.key) {
		case 'save':
			isSaveModalOpen.value = true;
			break;
		case 'load':
			isLoadModalOpen.value = true;
			break;
		case 'export':
			exportTheme();
			break;
	}
}

const items = computed(() => ([
]));
function toggleDark() {
	colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
}

function openAIModal() {
	aiModal.value?.show();
}

function handleSaveTheme() {
	const name = saveName.value.trim();
	if (!name) return;
	if (savedThemesStore.themes[name]) {
		if (!confirm(t('header.overwriteConfirm', { name }))) return;
	}
	savedThemesStore.saveTheme(name);
	saveName.value = '';
	isSaveModalOpen.value = false;
}

async function handleLoadTheme(name: string) {
	await savedThemesStore.loadTheme(name);
	isLoadModalOpen.value = false;
}

function handleDeleteTheme(name: string) {
	if (!confirm(t('header.deleteConfirm', { name }))) return;
	savedThemesStore.deleteTheme(name);
}

// Copy text to clipboard
function copyToClipboard(text: string) {
	if (import.meta.client) {
		navigator.clipboard.writeText(text)
			.then(() => {
				// Could add a toast notification here if desired
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
			});
	}
}
</script>
