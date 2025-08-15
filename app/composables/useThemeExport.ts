import { useThemeStore } from '../store/theme';
import { useColorsStore } from '../store/colors';
import { ref, computed } from 'vue';
import { useCodeHighlighter } from './useCodeHighlighter';

export function useThemeExport() {
	const themeStore = useThemeStore();
	const colorsStore = useColorsStore();
	const isExporting = ref(false);
	const exportError = ref<string | null>(null);
	const isExportModalOpen = ref(false);
	const cssContent = ref('');
	const appConfigContent = ref('');

	// Initialize code highlighter
	const { initHighlighter, highlightCode, isHighlighterReady } = useCodeHighlighter();
	initHighlighter(); // Start loading the highlighter

	// Highlighted code content
	const highlightedCssContent = computed(() => {
		if (!isHighlighterReady.value || !cssContent.value) return '';
		return highlightCode(cssContent.value, 'css');
	});

	const highlightedAppConfigContent = computed(() => {
		if (!isHighlighterReady.value || !appConfigContent.value) return '';
		return highlightCode(appConfigContent.value, 'typescript');
	});

	/**
	 * Export the current theme and show content in a modal
	 */
	const exportTheme = async (event?: MouseEvent): Promise<void> => {
		try {
			isExporting.value = true;
			exportError.value = null;

			// Get theme CSS variables per mode for CSS export
			const themeVariablesLight = themeStore.getThemeCssVariablesByMode('light');
			const themeVariablesDark = themeStore.getThemeCssVariablesByMode('dark');

			// Get all custom colors
			const customColors = colorsStore.getColors;

			// Get theme mappings (for app.config.ts)
			const themeMappings = themeStore.mappings;

			// Call the server API to get the theme content
			const response = await $fetch<{
				success: boolean;
				error?: string;
				cssContent?: string;
				appConfigContent?: string;
			}>('/api/export-theme', {
				method: 'POST',
				body: {
					// Keep single map for backward compatibility (use current mode)
					themeVariables: themeStore.getThemeCssVariables,
					// Provide both modes for CSS export
					themeVariablesByMode: {
						light: themeVariablesLight,
						dark: themeVariablesDark,
					},
					customColors,
					themeMappings,
					exportMode: themeStore.getEditMode,
				},
			});

			if (!response.success) {
				throw new Error(response.error || 'Failed to export theme');
			}

			// Store the content and open the modal
			if (response.cssContent && response.appConfigContent) {
				cssContent.value = response.cssContent;
				appConfigContent.value = response.appConfigContent;
				isExportModalOpen.value = true;
			}

			return;
		}
		catch (error: unknown) {
			console.error('Error exporting theme:', error);
			exportError.value = error instanceof Error ? error.message : 'An unknown error occurred';
			return;
		}
		finally {
			isExporting.value = false;
		}
	};

	/**
	 * Close the export modal
	 */
	const closeExportModal = () => {
		isExportModalOpen.value = false;
	};

	return {
		exportTheme,
		isExporting,
		exportError,
		isExportModalOpen,
		cssContent,
		appConfigContent,
		highlightedCssContent,
		highlightedAppConfigContent,
		isHighlighterReady,
		closeExportModal,
	};
}
