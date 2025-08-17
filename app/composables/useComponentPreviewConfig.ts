import type { ComponentPreviewConfig } from '~/types/componentPreviewConfig';

export const useComponentPreviewConfig = () => {
	const componentConfigs: { [key: string]: ComponentPreviewConfig } = {
		UAccordion: {
			name: 'Accordion',
			staticProps: {
				items: [
					{
						label: 'Item 1',
						content: 'Content 1',
						icon: 'i-heroicons-exclamation-triangle',
					},
					{
						label: 'Item 2',
						content: 'Content 2',
						icon: 'i-heroicons-exclamation-triangle',
					},
					{
						label: 'Item 3',
						content: 'Content 3',
						icon: 'i-heroicons-exclamation-triangle',
					},
				],
			},
			previewProp: 'variants',
			customizable: ['variants'],
			variants: ['default'],
			ui: ['root', 'label', 'leadingIcon', 'leadingAvatar', 'leadingAvatarSize', 'trailingIcon'],
		},
		UAlert: {
			name: 'Alert',
			staticProps: {
				title: 'Alert',
				description: 'This is an alert',
				icon: 'i-heroicons-exclamation-triangle',
			},
			previewProp: 'variants',
			customizable: ['variants', 'colors'],
			variants: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'],
			hasColors: true,
			ui: ['root', 'wrapper', 'title', 'description', 'icon', 'avatar', 'avatarSize', 'actions'],
		},
		UBadge: {
			name: 'Badge',
			staticProps: {
				label: 'Badge',
			},
			previewProp: 'variants',
			customizable: ['variants', 'colors', 'sizes'],
			variants: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'],
			hasColors: true,
			hasSizes: true,
			hasIcon: true,
			hasTrailingIcon: true,
			ui: ['base', 'label', 'leadingIcon', 'leadingAvatar', 'leadingAvatarSize', 'trailingIcon'],
		},
		UButton: {
			name: 'Button',
			staticProps: {
				label: 'Button',
			},
			previewProp: 'variants',
			customizable: ['variants', 'colors', 'sizes'],
			variants: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'],
			hasColors: true,
			hasSizes: true,
			hasLoading: true,
			hasIcon: true,
			hasTrailingIcon: true,
			ui: ['base', 'label', 'leadingIcon', 'leadingAvatar', 'leadingAvatarSize', 'trailingIcon'],
		},
		UCard: {
			name: 'Card',
			staticProps: {
				label: 'Button',
				class: 'w-full',
			},
			previewProp: 'variants',
			customizable: ['variants'],
			variants: ['solid', 'outline', 'soft', 'subtle'],
			hasHeader: true,
			hasContent: true,
			hasFooter: true,
			ui: ['root', 'header', 'body', 'footer'],
		},
	};
	const availableComponents = Object.entries(componentConfigs).map(([key, value]) => {
		return {
			label: value.name,
			value: key,
		};
	});

	return {
		componentConfigs,
		availableComponents,
	};
};
