<script setup lang="ts">
import ThemePreview from '../components/ThemePreview.vue';
import { useColorsStore } from '../store/colors';

const colorsStore = useColorsStore();
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">{{ $t('colors.title') }}</h1>
    
    <!-- Tabs für verschiedene Ansichten -->
    <div class="mt-6 py-4">
      <ColorListing />
    </div>
  </div>
</template>