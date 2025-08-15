type Variants = 'default' | 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ComponentPreviewConfig {
	name: string;
	sizes?: Sizes[];
	variants: Variants[];
	customizable: string[];
	previewProp: 'variants';
	hasLoading?: boolean;
	hasTrailingIcon?: boolean;
	hasHeader?: boolean;
	hasContent?: boolean;
	hasFooter?: boolean;
	ui?: string[];
	hasColors?: boolean;
	hasSizes?: boolean;
	hasIcon?: boolean;
	staticProps?: {
		label?: string;
		title?: string;
		description?: string;
		items?: Record<string, string>[];
	};
}
