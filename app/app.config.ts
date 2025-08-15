export default defineAppConfig({
	// https://ui.nuxt.com/getting-started/theme#design-system
	ui: {
		colors: {
			primary: 'amber',
			neutral: 'slate',
		},
		button: {
			slots: {
				base: 'hover:cursor-pointer',
			},
		},
	},
});
