import { defineStore } from 'pinia';
// Import the component preview config to access UI element names
import { useComponentPreviewConfig } from '~/composables/useComponentPreviewConfig';
import { THEME_VARIABLES, SIZES, type PropertyType } from '../constants/theme';

// Define the structure for component configuration
export interface ComponentClassConfig {
  base: string[];
}

export interface ComponentPropertyConfig {
  [key: string]: { // variant/color/size name (e.g., 'solid', 'primary', 'md')
    [key: string]: ComponentClassConfig; // ui element name (e.g., 'base')
  };
}

export interface ComponentConfig {
  variants?: ComponentPropertyConfig;
  colors?: ComponentPropertyConfig;
  sizes?: ComponentPropertyConfig;
  [key: string]: ComponentPropertyConfig | undefined; // For future properties
}

export interface ComponentsConfig {
  [componentName: string]: {
    config: ComponentConfig;
  };
}



export const useComponentConfigStore = defineStore('componentConfig', {
  state: () => ({
    componentsConfig: {} as ComponentsConfig,
  }),

  actions: {
    /**
     * Initialize a component configuration if it doesn't exist
     */
    initComponentConfig(componentName: string) {
      if (!this.componentsConfig[componentName]) {
        this.componentsConfig[componentName] = {
          config: {}
        };
      }
    },

    /**
     * Initialize a property configuration (variants, colors, sizes) if it doesn't exist
     */
    initPropertyConfig(componentName: string, propertyType: PropertyType) {
      this.initComponentConfig(componentName);
      
      if (this.componentsConfig[componentName]) {
        const componentConfig = this.componentsConfig[componentName].config;
        if (!componentConfig[propertyType]) {
          componentConfig[propertyType] = {} as ComponentPropertyConfig;
        }
      }
    },

    /**
     * Set classes for a specific component, property type, property value and UI element
     */
    setClasses(
      componentName: string, 
      propertyType: PropertyType, 
      propertyValue: string, 
      uiElement: string, 
      classes: string[]
    ) {
      this.initPropertyConfig(componentName, propertyType);
      
      if (!this.componentsConfig[componentName]) return;
      
      const propertyConfig = this.componentsConfig[componentName].config[propertyType] as ComponentPropertyConfig;
      
      // Initialize the property value object if it doesn't exist
      if (!propertyConfig[propertyValue]) {
        propertyConfig[propertyValue] = {};
      }
      
      // Set the classes
      propertyConfig[propertyValue][uiElement] = {
        base: classes
      };
    },

    /**
     * Get classes for a specific component, property type, property value and UI element
     */
    getClasses(
      componentName: string, 
      propertyType: PropertyType, 
      propertyValue: string, 
      uiElement: string
    ): string[] {
      if (
        !this.componentsConfig[componentName] || 
        !this.componentsConfig[componentName].config[propertyType]
      ) {
        return [];
      }
      
      const propertyConfig = this.componentsConfig[componentName].config[propertyType] as ComponentPropertyConfig;
      
      if (
        !propertyConfig[propertyValue] ||
        !propertyConfig[propertyValue][uiElement]
      ) {
        return [];
      }
      
      return propertyConfig[propertyValue][uiElement].base;
    },

    /**
     * Get all classes for a component by merging variant, color, and size classes
     */
    getAllClasses(
      componentName: string,
      variant: string,
      color: string,
      size: string,
      uiElement: string = 'base'
    ): string[] {
      const variantClasses = this.getClasses(componentName, 'variants', variant, uiElement);
      const colorClasses = this.getClasses(componentName, 'colors', color, uiElement);
      const sizeClasses = this.getClasses(componentName, 'sizes', size, uiElement);
      
      return [...variantClasses, ...colorClasses, ...sizeClasses];
    },

    /**
     * Clear all configurations for a component
     */
    clearComponentConfig(componentName: string) {
      if (this.componentsConfig[componentName]) {
        delete this.componentsConfig[componentName];
      }
    },

    /**
     * Import configuration from JSON
     */
    importConfig(config: ComponentsConfig) {
      this.componentsConfig = config;
    },

    /**
     * Export configuration to JSON
     */
    exportConfig(): ComponentsConfig {
      return this.componentsConfig;
    },

    /**
     * Initialize default classes for a component based on its UI property
     * This ensures that each component has at least empty configurations for all its UI elements
     */
    initComponentDefaults(componentName: string) {
      const componentConfigs = useComponentPreviewConfig().componentConfigs;
      const config = componentConfigs[componentName];
      
      if (!config || !config.ui) return;
      
      this.initComponentConfig(componentName);
      
      // Get the base UI element name (first element in the UI array)
      const baseElement = Array.isArray(config.ui) && config.ui.length > 0 ? config.ui[0] : 'base';
      
      // Initialize configurations for each customizable property
      if (Array.isArray(config.customizable)) {
        // Initialize variants
        if (config.customizable.includes('variants') && Array.isArray(config.variants)) {
          config.variants.forEach((variant: string) => {
            // Only initialize if no classes are set yet
            const existingClasses = this.getClasses(componentName, 'variants', variant, baseElement || 'base');
            if (existingClasses.length === 0) {
              this.setClasses(componentName, 'variants', variant, baseElement || 'base', []);
            }
          });
        }
        
        // Initialize colors
        if (Array.isArray(config.customizable) && config.customizable.includes('colors') && config.hasColors) {
          THEME_VARIABLES.forEach((color: string) => {
            // Only initialize if no classes are set yet
            const existingClasses = this.getClasses(componentName, 'colors', color, baseElement || 'base');
            if (existingClasses.length === 0) {
              this.setClasses(componentName, 'colors', color, baseElement || 'base', []);
            }
          });
        }
        
        // Initialize sizes
        if (Array.isArray(config.customizable) && config.customizable.includes('sizes') && config.hasSizes) {
          SIZES.forEach((size: string) => {
            // Only initialize if no classes are set yet
            const existingClasses = this.getClasses(componentName, 'sizes', size, baseElement || 'base');
            if (existingClasses.length === 0) {
              this.setClasses(componentName, 'sizes', size, baseElement || 'base', []);
            }
          });
        }
      }
    },

    // Persist the current store state to LocalStorage
    saveToLocalStorage() {
      if (typeof window === 'undefined') return;
      const key = `store:${this.$id}`;
      try {
        localStorage.setItem(key, JSON.stringify(this.$state));
      } catch (e) {
        console.warn(`[componentConfig] Failed to save state:`, e);
      }
    },

    // Load the store state from LocalStorage
    loadFromLocalStorage() {
      if (typeof window === 'undefined') return;
      const key = `store:${this.$id}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          this.$patch(JSON.parse(raw));
        }
      } catch (e) {
        console.warn(`[componentConfig] Failed to load state:`, e);
      }
    },

    // Remove any persisted state for this store
    clearLocalStorage() {
      if (typeof window === 'undefined') return;
      const key = `store:${this.$id}`;
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`[componentConfig] Failed to clear persisted state:`, e);
      }
    }
  }
});
