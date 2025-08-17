<script setup lang="ts">
const props = defineProps({
	component: {
		type: String,
		required: true,
	},
});
</script>

<template>
    <div>
        <component :is="props.component" />
    </div>
</template>