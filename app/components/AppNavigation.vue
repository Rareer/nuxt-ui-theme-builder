<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { useAppIcons } from '@/composables/useAppIcons';
// Composable controlling Theme Config slideover open state
const { open: openThemeConfig } = useThemeConfig();

const { availableComponents } = useComponentPreviewConfig();
const localePath = useLocalePath();
const { t } = useI18n();
const { icon: appIcon } = useAppIcons();
defineProps<{
	orientation: 'horizontal' | 'vertical';
}>();

const items = computed<NavigationMenuItem[][]>(() => [
	[
		{
			label: t('nav.home'),
			icon: appIcon('navHome'),
			to: localePath('/'),
		},
		{
			label: t('nav.cssVariables'),
			icon: appIcon('navCss'),
			to:'#',
			onSelect: () => openThemeConfig(),
		},
		{
			label: t('nav.customColors'),
			icon: appIcon('navColors'),
			to: localePath('/colors'),
		},
		{
			label: t('nav.preview'),
			icon: appIcon('navPreview'),
			to: localePath('/preview'),
		},
		{
			label: t('nav.components'),
			icon: appIcon('navComponents'),
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
			icon: appIcon('navGithub'),
			target: '_blank',
			to: 'https://github.com/Rareer/nuxt-ui-theme-builder',
		},
		{
			label: 'LinkedIn',
			icon: appIcon('navLinkedIn'),
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
