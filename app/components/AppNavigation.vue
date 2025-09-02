<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
// Composable controlling Theme Config slideover open state
const { open: openThemeConfig } = useThemeConfig();

const { availableComponents } = useComponentPreviewConfig();
const localePath = useLocalePath();
const { t } = useI18n();
defineProps<{
	orientation: 'horizontal' | 'vertical';
}>();

const items = computed<NavigationMenuItem[][]>(() => [
	[
		{
			label: t('nav.home'),
			icon: 'i-lucide-home',
			to: localePath('/'),
		},
		{
			label: t('nav.cssVariables'),
			icon: 'i-lucide-brush',
			to:'#',
			onSelect: () => openThemeConfig(),
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
		{
			label: t('nav.follow'),
			type: 'label',
		},
		{
			label: 'GitHub',
			icon: 'i-lucide-github',
			target: '_blank',
			to: 'https://github.com/Rareer/nuxt-ui-theme-builder',
		},
		{
			label: 'LinkedIn',
			icon: 'i-lucide-linkedin',
			target: '_blank',
			to: 'https://www.linkedin.com/in/toni-kritz-5528a5184/',
		},
	],
]);
</script>

<template>
	<UNavigationMenu
		:items="items"
		:orientation="orientation"
	/>
</template>
