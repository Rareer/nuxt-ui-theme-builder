import { ref } from 'vue';
import { createHighlighter, bundledLanguages, bundledThemes } from 'shiki';

export function useCodeHighlighter() {
	const isHighlighterReady = ref(false);
	const highlighter = ref<any>(null);

	// Initialize the highlighter
	const initHighlighter = async (theme: string = 'nord') => {
		if (highlighter.value) return;

		try {
			highlighter.value = await createHighlighter({
				themes: [theme],
				langs: ['typescript', 'css'],
			});
			isHighlighterReady.value = true;
		}
		catch (error) {
			console.error('Failed to initialize code highlighter:', error);
		}
	};

	// Highlight code with specified language
	const highlightCode = (code: string, lang: 'typescript' | 'css') => {
		if (!highlighter.value || !isHighlighterReady.value) {
			return code;
		}

		try {
			return highlighter.value.codeToHtml(code, {
				lang: lang,
				theme: 'nord',
			});
		}
		catch (error) {
			console.error(`Error highlighting ${lang} code:`, error);
			return code;
		}
	};

	return {
		initHighlighter,
		highlightCode,
		isHighlighterReady,
	};
}
