import docsData from '@/utils/nuxt-ui-docs.data';
import { eventHandler } from 'h3';

// Build list of component route paths: /components/U{Label}
function pascalCase(s: string): string {
	return s
		.split(/[-_\s]/)
		.filter(Boolean)
		.map(p => p.charAt(0).toUpperCase() + p.slice(1))
		.join('');
}

export default eventHandler(() => {
	const names = Object.keys(docsData || {});
	const routes = names
		.map(n => pascalCase(n))
		.map(label => `/components/U${label}`)
		.sort((a, b) => a.localeCompare(b));

	// @nuxtjs/sitemap can accept an array of strings from sources.
	return routes;
});
