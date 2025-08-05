type Variants = 'default' | 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ComponentPreviewConfig {
    name: string;
    sizes?: Sizes[];
    variants?: Variants[];
    previewProp: 'variants',
    hasLoading?: boolean;
    hasTrailingIcon?: boolean;
    hasHeader?: boolean;
    hasContent?: boolean;
    hasFooter?: boolean;
    ui?: string[];
    hasColors?: boolean;
    hasSizes?: boolean;
    staticProps?: {
        label?: string;
        title?: string;
        description?: string;
        icon?: string;
        items?: Record<string, string>[]
    };
}
