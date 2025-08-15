export default defineNuxtConfig({

	modules: [
		'@nuxt/ui',
		'@nuxt/eslint',
		'@pinia/nuxt',
		'@nuxtjs/i18n',
	],

	components: {
		dirs: [
			'~/components',
		],
		global: true,
	},
	devtools: {
		enabled: true,
	},

	css: ['~/assets/css/main.css'],

	compatibilityDate: '2025-07-16',

	eslint: {
		config: {
			tooling: true,

			stylistic: {
				indent: 'tab',
				semi: true,
			},
		},
	},

	i18n: {
		locales: [
			{
				code: 'de',
				name: 'Deutsch',
				file: 'de.json',
			},
			{
				code: 'en',
				name: 'English',
				file: 'en.json',
			},
		],

		defaultLocale: 'en',

		strategy: 'prefix_except_default',

		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'i18n_redirected',
			alwaysRedirect: false,
			fallbackLocale: 'de',
		},

		langDir: 'locales',
	},
});
