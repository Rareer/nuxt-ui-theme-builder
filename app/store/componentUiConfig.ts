import { defineStore } from 'pinia'

// Store for Combobox-driven UI config per component
// Shape: component -> propName -> option -> slotName -> string[] (classes)
export type SlotClasses = string[]
export type OptionSlots = Record<string, SlotClasses> // slot -> classes
export type PropOptions = Record<string, OptionSlots> // option -> slots
export type ComponentUiConfig = Record<string, PropOptions> // propName -> options

export interface UiConfigsState {
  byComponent: Record<string, ComponentUiConfig>
}

export const useComponentUiConfigStore = defineStore('componentUiConfig', {
  state: (): UiConfigsState => ({
    byComponent: {},
  }),

  actions: {
    // Ensure component entry exists
    initComponent(componentName: string) {
      if (!this.byComponent[componentName]) this.byComponent[componentName] = {}
    },

    // Ensure nested path exists and return the current SlotClasses array reference
    ensurePath(
      componentName: string,
      propName: string,
      option: string,
      slot: string,
    ): SlotClasses {
      // In-place init to satisfy TS
      const comp = (this.byComponent[componentName] ??= {})
      const byProp = (comp[propName] ??= {})
      const byOption = (byProp[option] ??= {})
      const bySlot = (byOption[slot] ??= [])
      return bySlot
    },

    // Set (replace) classes for a given path
    setClasses(
      componentName: string,
      propName: string,
      option: string,
      slot: string,
      classes: string[],
    ) {
      const comp = (this.byComponent[componentName] ??= {})
      const byProp = (comp[propName] ??= {})
      const byOption = (byProp[option] ??= {})
      // Replace with a new array to keep reactivity straightforward
      byOption[slot] = Array.isArray(classes) ? [...classes] : []
    },

    // Get classes for a given path (returns empty array if missing)
    getClasses(
      componentName: string,
      propName: string,
      option: string,
      slot: string,
    ): string[] {
      const comp = this.byComponent[componentName]
      if (!comp) return []
      const byProp = comp[propName]
      if (!byProp) return []
      const byOption = byProp[option]
      if (!byOption) return []
      const bySlot = byOption[slot]
      return Array.isArray(bySlot) ? bySlot : []
    },

    // Bulk set/replace the entire config for a component
    replaceComponentConfig(componentName: string, config: ComponentUiConfig) {
      this.byComponent[componentName] = JSON.parse(JSON.stringify(config || {}))
    },

    // Read-only view of a component config
    getComponentConfig(componentName: string): ComponentUiConfig {
      return this.byComponent[componentName] || {}
    },

    // Clear a single component config
    clearComponent(componentName: string) {
      if (this.byComponent[componentName]) delete this.byComponent[componentName]
    },

    // Import full store state
    importAll(state: UiConfigsState) {
      this.byComponent = state?.byComponent || {}
    },

    // Export full store state
    exportAll(): UiConfigsState {
      return { byComponent: this.byComponent }
    },

    // Persistence helpers (localStorage)
    saveToLocalStorage() {
      if (typeof window === 'undefined') return
      const key = `store:${this.$id}`
      try {
        localStorage.setItem(key, JSON.stringify(this.$state))
      } catch (e) {
        console.warn('[componentUiConfig] Failed to save state:', e)
      }
    },

    loadFromLocalStorage() {
      if (typeof window === 'undefined') return
      const key = `store:${this.$id}`
      try {
        const raw = localStorage.getItem(key)
        if (raw) this.$patch(JSON.parse(raw))
      } catch (e) {
        console.warn('[componentUiConfig] Failed to load state:', e)
      }
    },

    clearLocalStorage() {
      if (typeof window === 'undefined') return
      const key = `store:${this.$id}`
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.warn('[componentUiConfig] Failed to clear persisted state:', e)
      }
    },
  },
})
