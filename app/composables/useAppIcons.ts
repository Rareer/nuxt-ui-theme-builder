import { APP_ICON_PRESETS, DEFAULT_APP_ICONS, type AppIconKey } from '@/config/appIcons';
import { useIconsStore } from '@/store/icons';

export const useAppIcons = () => {
	const iconsStore = useIconsStore();
	const currentPack = computed(() => iconsStore.getSelectedPreset);

	const icon = (key: AppIconKey) => {
		const overrides = APP_ICON_PRESETS[currentPack.value] || {};
		return overrides[key] || DEFAULT_APP_ICONS[key];
	};

	return {
		icon,
		currentPack,
	};
};
