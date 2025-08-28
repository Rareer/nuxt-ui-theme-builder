<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useUiClasses, buildUiObject } from '@/composables/useUiClasses';
import { usePreviewSchema } from '@/composables/usePreviewSchema';
import { useBoundProps } from '@/composables/useBoundProps';
import { useUiConfiguratorModels } from '@/composables/useUiConfiguratorModels';
import { useChildRenderer } from '@/composables/useChildRenderer';
import RenderFn from '@/components/RenderFn.vue';

const props = defineProps<{ component: string }>();

// Centralized schema for the selected component
const {
  booleanProps,
  optionProps,
  stringProps,
  configPropNames,
  optionsByProp,
  uiSlots,
  previewPropName,
  previewPropLower,
  previewPropOptions,
  slotsContent,
  childSpec,
  childModelCfg,
  preset,
} = usePreviewSchema(computed(() => props.component));

// Bound props derived from preset/booleans/options
const { bound } = useBoundProps({
  booleanProps: () => booleanProps.value as any,
  optionProps: () => optionProps.value as any,
  preset: () => preset.value,
});

// UI config store bindings and path ensure helpers
const models = useUiConfiguratorModels({
  componentName: computed(() => props.component),
  configPropNames,
  uiSlots,
  optionsByProp,
});

// expose helpers for template
const { uiModel, defaultUiModel } = models;

// Ensure store paths exist for all prop/option/slot combinations
watchEffect(() => {
  models.ensureAllPaths();
});

// Build merged ui object from defaults + selected options
const uiObject = useUiClasses({
  component: computed(() => props.component),
  configPropNames,
  uiSlots,
  getPropValue: (propName: string) => bound[propName] as string | undefined,
});

// Build per-item UI object for preview (override previewProp with current opt)
function uiForPreviewOption(opt: string): Record<string, string> {
  const selections: Record<string, string | undefined> = {};
  for (const name of configPropNames.value) {
    selections[name] = (name.toLowerCase() === previewPropLower.value)
      ? opt
      : (bound[name] as string | undefined);
  }
  return buildUiObject(props.component, selections, uiSlots.value);
}

// Child renderer (for optional declarative child)
const { renderedChildFn } = useChildRenderer({ childSpec, childModelCfg });

// Indicators and reset handlers for collapsibles
const hasAnyDefault = computed(() => models.hasAnyDefault());
const hasAnyForOption = (propName: string, opt: string) => models.hasAnyForOption(propName, opt);
function resetDefault() { models.resetDefault(); }
function resetOption(propName: string, opt: string) { models.resetOption(propName, opt); }
</script>

<template>
	<div class="flex-1 w-full shadow-lg border border-gray-200 dark:border-gray-800 rounded-lg py-10 px-6 mb-10">
		<template v-if="previewPropOptions.length">
			<div class="flex flex-wrap gap-8">
				<UFormField
					v-for="opt in previewPropOptions"
					:key="opt"
					class="space-y-2"
					:label="opt"
				>
					<component
						:is="props.component"
						:key="opt"
						v-bind="{ ...bound, [previewPropName as string]: opt }"
						:ui="uiForPreviewOption(opt)"
					>
						<RenderFn
							v-if="renderedChildFn"
							:render="renderedChildFn"
						/>
						<template
							v-for="(content, slotName) in slotsContent"
							:key="slotName"
							#[slotName]
						>
							{{ content }}
						</template>
					</component>
				</UFormField>
			</div>
		</template>
		<template v-else>
			<component
				:is="props.component"
				v-bind="bound"
				:ui="uiObject"
			>
				<RenderFn
					v-if="renderedChildFn"
					:render="renderedChildFn"
				/>
				<template
					v-for="(content, slotName) in slotsContent"
					:key="slotName"
					#[slotName]
				>
					{{ content }}
				</template>
			</component>
		</template>
	</div>
	<div
		v-if="booleanProps.length || optionProps.length || stringProps.length"
		class="flex-1 w-full"
	>
		<h2 class="text-lg font-semibold my-8">Preview Options</h2>
		<PreviewControls
			:boolean-props="booleanProps as any"
			:option-props="optionProps as any"
			:string-props="stringProps as any"
			:bound="bound"
		/>
	</div>

	<!-- Default classes per UI slot (component-wide) -->
	<UiSlotDefaults
		:ui-slots="uiSlots as any"
		:has-any-default="hasAnyDefault as any"
		:reset-default="resetDefault"
		:default-ui-model="defaultUiModel as any"
	/>

	<!-- Config tabs for configProps: per option -> Combobox per ui slot -->
	<UiOptionSlots
		:config-prop-names="configPropNames as any"
		:ui-slots="uiSlots as any"
		:options-by-prop="optionsByProp as any"
		:has-any-for-option="hasAnyForOption"
		:reset-option="resetOption"
		:ui-model="uiModel as any"
	/>
</template>
