import type { ComponentPreviewConfig } from "~/types/componentPreviewConfig";

export const useComponentPreviewConfig = () => {
    const componentConfigs: { [key: string]: ComponentPreviewConfig } = {
        'UButton': {
            name: 'Button',
            staticProps: {
                label: 'Button'
            },
            previewProp: 'variants',
            variants: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'],
            hasColors: true,
            hasSizes: true,
            hasLoading: true,
            hasTrailingIcon: true,
            ui: ['base', 'label', 'leadingIcon', 'leadingAvatar', 'leadingAvatarSize', 'trailingIcon']
        },
        'UAlert': {
            name: 'Alert',
            staticProps: {
                title: 'Alert',
                description: 'This is an alert',
                icon: 'i-heroicons-exclamation-triangle',
            },
            previewProp: 'variants',
            variants: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'],
            hasColors: true,
            ui: ['base', 'label', 'leadingIcon', 'leadingAvatar', 'leadingAvatarSize', 'trailingIcon']
        }   
    }
    const availableComponents  = Object.entries(componentConfigs).map(([key, value]) => {
        return {
            label: value.name,
            value: key
        }
    })

    return {
        componentConfigs, 
        availableComponents
    }
}
