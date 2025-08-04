<script setup lang="ts">
import ThemePreview from '../components/ThemePreview.vue';
import ThemeMapping from '../components/ThemeMapping.vue';
import { useColorsStore } from '../store/colors';

const colorsStore = useColorsStore();
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">Custom Colors</h1>
    
    <!-- Tabs für verschiedene Ansichten -->
    <div class="mt-6">
      <div class="py-4">
        <ColorListing />
      </div>
    </div>
  </div>
</template>