<template>
  <div class="container mx-auto p-4">
    <ThemePreview>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Theme Preview</h1>
    </div>
    
    <div class="grid grid-cols-1 gap-8">
      <!-- Buttons Section -->
      <section class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Buttons</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentPreview component="UButton" />
        </div>
      </section>

      <!-- Badges Section -->
      <section class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Badges</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentPreview component="UBadge" />
        </div>
      </section>

      <!-- Alerts Section -->
      <section class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Alerts</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentPreview component="UAlert" />
        </div>
      </section>

      <!-- Cards Section -->
      <section class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Cards</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentPreview component="UCard" />
        </div>
      </section>

      <!-- Accordions Section -->
      <section class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Accordions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentPreview component="UAccordion" />
        </div>
      </section>
    </div>
    </ThemePreview>
  </div>
</template>

<script setup lang="ts">
</script>
