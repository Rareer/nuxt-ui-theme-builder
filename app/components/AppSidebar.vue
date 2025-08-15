<template>
	<aside class="h-full flex flex-col">
		<!-- Sidebar Header -->
		<NuxtLink
			to="/"
			class="h-16 px-4 flex items-center border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
		>
			<UIcon
				name="i-heroicons-swatch-20-solid"
				class="text-primary-500 mr-2 text-xl"
			/>
			<h2 class="font-bold text-lg">{{ $t('app.name') }}</h2> <UBadge
				class="ml-2"
				color="error"
				size="xs"
			>Alpha</UBadge>
		</NuxtLink>
		<span class="px-4 text-xs text-gray-500">No official partner of Nuxt</span>

		<!-- Navigation Menu -->
		<div class="flex-1 p-2">
			<UNavigationMenu
				:items="items"
				orientation="vertical"
			/>
		</div>

		<!-- External Links -->
		<div class="p-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<a
					href="https://github.com/Rareer/nuxt-ui-theme-builder"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
					class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
				>
					<UIcon
						name="i-simple-icons-github"
						class="text-gray-700 dark:text-gray-300"
					/>
					<span class="sr-only">GitHub</span>
				</a>
				<a
					href="https://www.linkedin.com/in/toni-kritz-5528a5184/"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="LinkedIn"
					class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
				>
					<UIcon
						name="i-simple-icons-linkedin"
						class="text-gray-700 dark:text-gray-300"
					/>
					<span class="sr-only">LinkedIn</span>
				</a>
			</div>
		</div>
	</aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NavigationMenuItem } from '@nuxt/ui';
import { useI18n } from 'vue-i18n';

const { availableComponents } = useComponentPreviewConfig();
const localePath = useLocalePath();
const { t } = useI18n();

const items = computed<NavigationMenuItem[][]>(() => [
	[
		{
			label: t('nav.navigation'),
			type: 'label',
		},
		{
			label: t('nav.home'),
			icon: 'i-lucide-home',
			to: localePath('/'),
		},
		{
			label: t('nav.globals'),
			type: 'label',
		},
		{
			label: t('nav.customColors'),
			icon: 'i-lucide-palette',
			to: localePath('/colors'),
		},
		{
			label: t('nav.preview'),
			icon: 'i-lucide-eye',
			to: localePath('/preview'),
		},
		{
			label: t('nav.components'),
			icon: 'i-lucide-square-code',
			children: availableComponents.map(component => ({
				label: component.label,
				to: localePath(`/components/${component.value}`),
			})),
		},
	],
]);
</script>
