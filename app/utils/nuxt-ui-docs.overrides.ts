// Centralized container for Nuxt UI overrides.
// Move your overrides here to avoid JSON globs at runtime. For now, we re-export the JSON to keep behavior.

export type Overrides = Record<string, {
	disable?: string[];
	set?: Record<string, any>;
	previewProp?: string;
	configProps?: string[];
	slots?: Record<string, any>;
	child?: any;
}>;

// Inlined overrides migrated from JSON. Keys are PascalCase component names.
const overrides: Overrides = {
	Alert: {
		set: {
			title: 'Alert',
			icon: 'i-lucide-square-code',
			description: 'Description text',
			closeIcon: 'i-lucide-x',
			close: true,
		},
		previewProp: 'variant',
		configProps: ['variant', 'color', 'orientation'],
		disable: [],
	},
	Avatar: {
		set: {
			label: 'Avatar',
			src: 'https://github.com/benjamincanac.png',
			icon: 'i-lucide-square-code',
		},
		previewProp: 'size',
		configProps: ['size'],
		disable: ['alt', 'text'],
	},
	Badge: {
		set: {
			label: 'Badge',
			icon: 'i-lucide-square-code',
			color: 'primary',
		},
		previewProp: 'variant',
		configProps: ['variant', 'color', 'size'],
		disable: ['type', 'label', 'leadingIcon', 'trailingIcon', 'loadingIcon'],
	},
	Breadcrumb: {
		set: {
			items: [
				{
					label: 'Home',
					icon: 'i-lucide-house',
				},
				{
					label: 'Components',
					icon: 'i-lucide-box',
				},
				{
					label: 'Breadcrumb',
					icon: 'i-lucide-link',
				},
			],
		},
		disable: ['labelKey'],
	},
	Button: {
		set: {
			label: 'Button',
			icon: 'i-lucide-square-code',
			color: 'primary',
		},
		previewProp: 'variant',
		configProps: ['variant', 'color', 'size'],
		disable: ['type', 'label', 'leadingIcon', 'trailingIcon', 'loadingIcon', 'leading', 'loadingAuto', 'block'],
	},
	Calendar: {
		set: {
			color: 'primary',
		},
		// Note: Calendar has no 'variant' prop in the scraped dataset, but we keep this per original config
		configProps: ['color', 'size'],
		// Corrected prop names to match dataset: allowNonContiguousRanges, initialFocus
		disable: ['allowNonContiguousRanges', 'pagedNavigation', 'preventDeselect', 'fixedWeeks', 'initialFocus', 'disableDaysOutsideCurrentView', 'fixedDate'],
	},
	Card: {
		set: {
			header: 'Header',
			content: 'Content',
			footer: 'Footer',
		},
		previewProp: 'variant',
		configProps: ['variant'],
		slots: {
			header: 'Header',
			default: 'Content',
			footer: 'Footer',
		},
		disable: [],
	},
	Checkbox: {
		set: {
			color: 'primary',
			size: 'md',
			label: 'Checkbox',
			description: 'Description text',
			icon: 'i-lucide-check',
		},
		previewProp: 'variant',
		configProps: ['variant', 'color', 'size'],
		disable: ['name', 'id', 'indeterminateIcon'],
	},
	Chip: {
		set: {
			color: 'primary',
			size: 'md',
			show: true,
			inset: true,
		},
		previewProp: 'position',
		configProps: ['position', 'color', 'size'],
		child: {
			is: 'UButton',
			props: { label: 'Button' },
		},
		disable: [],
	},
	DropdownMenu: {
		set: {
			color: 'primary',
			modal: false,
			defaultOpen: true,
			ui: { content: 'w-48' },
			items: [
				{
					label: 'Profile',
					icon: 'i-lucide-user',
					check: true,
				},
				{
					label: 'Billing',
					icon: 'i-lucide-credit-card',
				},
				{
					label: 'Settings',
					icon: 'i-lucide-cog',
					kbds: [','],
				},
				{
					label: 'Keyboard shortcuts',
					icon: 'i-lucide-monitor',
				},
			],
		},
		child: {
			is: 'UButton',
			props: { icon: 'i-lucide-menu', label: 'Open' },
		},
		previewProp: 'variant',
		configProps: ['variant', 'color', 'size'],
		disable: ['modal', 'defaultOpen', 'open'],
	},
	Input: {
		set: {
			color: 'primary',
			size: 'md',
			label: 'Input',
			placeholder: 'Placeholder',
			icon: 'i-lucide-search',
		},
		previewProp: 'variant',
		configProps: ['variant', 'color', 'size'],
		disable: ['id', 'name', 'autocomplete', 'leading', 'autofocus'],
	},
	Modal: {
		set: {
			overlay: true,
			modal: true,
			title: 'Modal title',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			close: {
				color: 'primary',
				variant: 'outline',
				class: 'rounded-full',
			},
		},
		child: {
			is: 'UButton',
			props: { icon: 'i-lucide-menu', label: 'Open' },
		},
		previewProp: 'variant',
		slots: {
			body: 'Modal content',
		},
		configProps: [],
		disable: ['open'],
	},
	Progress: {
		set: {
			max: 100,
			color: 'primary',
			size: 'md',
			class: 'w-48 h-48',
		},
		previewProp: 'orientation',
		configProps: ['orientation', 'color', 'size'],
		disable: ['status', 'inverted'],
	},
	Select: {
		set: {
			modelValue: 'backlog',
			color: 'primary',
			size: 'md',
			items: [
				{
					label: 'Backlog',
					value: 'backlog',
				},
				{
					label: 'Todo',
					value: 'todo',
				},
				{
					label: 'In Progress',
					value: 'in_progress',
				},
				{
					label: 'Done',
					value: 'done',
				},
			],
		},
		previewProp: 'variant',
		configProps: ['variant', 'color', 'size'],
		disable: ['autofocus', 'leading', 'name', 'id', 'placeholder', 'autocomplete', 'defaultOpen', 'required', 'multiple', 'open'],
	},
	Switch: {
		set: {
			color: 'primary',
			size: 'md',
			label: 'Switch',
			description: 'Description text',
		},
		previewProp: 'size',
		configProps: ['color', 'size'],
		disable: ['defaultValue', 'modelValue', 'id', 'name', 'value'],
	},
	Tabs: {
		set: {
			color: 'primary',
			size: 'md',
			items: [
				{
					label: 'Account',
					icon: 'i-lucide-user',
					content: 'This is the account content.',
				},
				{
					label: 'Password',
					icon: 'i-lucide-lock',
					content: 'This is the password content.',
				},
			],
		},
		previewProp: 'variant',
		configProps: ['variant', 'color', 'size', 'orientation'],
		disable: ['unmountOnHide', 'activationMode', 'labelKey'],
	},
	Tooltip: {
		set: {
			color: 'primary',
			size: 'md',
			text: 'Tooltip text example',
		},
		child: {
			is: 'UButton',
			props: { label: 'Please hover me' },
		},
		previewProp: 'variant',
		configProps: [],
		disable: ['open', 'defaultOpen', 'disableHoverableContent', 'disableClosingTrigger', 'ignoreNonKeyboardFocus', 'disabled'],
	},
};

export default overrides;
