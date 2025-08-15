import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
	state: () => ({
		isLoading: false as boolean,
		loadingMessage: '' as string,
	}),
	actions: {
		showLoading(message: string = 'Lade Theme...') {
			this.loadingMessage = message;
			this.isLoading = true;
		},
		hideLoading() {
			this.isLoading = false;
			this.loadingMessage = '';
		},
	},
});
