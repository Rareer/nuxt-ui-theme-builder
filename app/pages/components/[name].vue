<template>
	<div class="p-6">
		<DynamicComponent :component="component.value" />

		{{ component }}
		{{ meta }}
	</div>
</template>

<script setup lang="ts">
const { availableComponents, getComponentMeta } = useComponentPreviewConfig();
const route = useRoute();
const name = route.params.name;
const component = availableComponents.find(component => component.value === name);
const meta = getComponentMeta(component?.value?.substring(1) ?? '');
console.log(meta);
if (!component) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Component not supported yet.',
	});
}
</script>
