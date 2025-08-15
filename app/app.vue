<script setup lang="ts">
import * as locales from '@nuxt/ui/locale';

import { Analytics } from '@vercel/analytics/nuxt';
import { useThemeStore } from './store/theme';

const { locale } = useI18n();

const lang = computed(() => locales[locale.value].code);
const dir = computed(() => locales[locale.value].dir);

// Initialize global CSS variables
useThemeCss();

// Keep theme store's editMode in sync with global color mode
const themeStore = useThemeStore();
const colorMode = useColorMode();

useHead({
	htmlAttrs: {
		lang,
		dir,
	},
});

if (import.meta.client) {
	watch(() => colorMode.value, (val) => {
		themeStore.setEditMode(val === 'dark' ? 'dark' : 'light');
	}, { immediate: true });
}
</script>

<template>
	<UApp :locale="locales[locale]">
		<div class="flex h-screen">
			<AppSidebar class="w-64 border-r border-gray-200 dark:border-gray-800" />

			<!-- Main Content -->
			<div class="flex flex-col flex-1 overflow-hidden">
				<!-- Header -->
				<AppHeader class="border-b border-gray-200 dark:border-gray-800" />

				<!-- Page Content -->
				<main class="flex-1 overflow-auto p-4">
					<NuxtPage />
				</main>
			</div>
		</div>

		<!-- Global Loading Overlay -->
		<GlobalLoadingOverlay />
		<Analytics />
	</UApp>
</template>
