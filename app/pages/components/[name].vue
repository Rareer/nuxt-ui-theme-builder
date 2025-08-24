<template>
	<h1 class="text-2xl font-bold mb-6">
		U{{ component.label }}
	</h1>
	<ClientOnly>
		<DynamicComponent :component="component.value" />
	</ClientOnly>
</template>

<script setup lang="ts">
const { availableComponents } = useComponentPreviewConfig();
const route = useRoute();
const name = route.params.name;
const component = availableComponents.find(component => component.value === name);
if (!component) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Component not supported yet.',
	});
}
</script>
