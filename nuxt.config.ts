export default defineNuxtConfig({
	app: {
		head: {
			link: [
			{ rel: 'icon', type: 'image/svg+xml', href: '/nuxtlify-icon.svg' },
			]
		}
	},
	modules: [
		'@nuxt/ui',
		'@nuxt/eslint',
		'@pinia/nuxt',
		'@nuxtjs/i18n',
		'@nuxtjs/seo',
		'@nuxtjs/sitemap',
	],

	ssr: true,

	components: {
		dirs: [
			'~/components',
		],
		global: true,
	},

	// Configure sitemap to include dynamic component routes from our API source
	sitemap: {
		// Existing routes are automatically discovered; add our dynamic URLs source
		sources: ['/api/sitemap-dynamic'],
	},

	devtools: {
		enabled: true,
	},

	css: ['~/assets/css/main.css'],

	site: {
		url: 'https://www.nuxtlify.com',
		name: 'Theme Builder for Nuxt UI',
	},

	compatibilityDate: '2025-07-16',

	nitro: {
		prerender: {
			autoSubfolderIndex: false,
			crawlLinks: true,
			routes: [
				'/',
			],
		},
	},

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
			fallbackLocale: 'en',
		},

		experimental: {
			localeDetector: 'localeDetector.ts',
		},
	},

	icon: {
		customCollections: [{
			prefix: 'custom',
			dir: './app/assets/icons',
		}],
	},

});
