<template>
  <div class="max-w-6xl mx-auto px-4 py-12">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
        NuxtUI Theme Builder
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
        Erstellen Sie wunderschöne, anpassbare Themes für Ihre NuxtUI Komponenten. 
        Definieren Sie eigene Farben und customizen Sie alle Varianten nach Ihren Wünschen.
      </p>
      <div class="flex gap-4 justify-center flex-wrap">
        <UButton to="/colors" size="lg" icon="i-lucide-palette">
          Farben verwalten
        </UButton>
        <UButton to="/components" variant="outline" size="lg" icon="i-lucide-square-code">
          Komponenten anpassen
        </UButton>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      <!-- Custom Colors -->
      <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div class="flex items-center mb-4">
          <UIcon name="i-lucide-palette" class="text-primary-500 text-2xl mr-3" />
          <h3 class="text-xl font-semibold">Eigene Farben</h3>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Erstellen und verwalten Sie Ihre eigenen Farbpaletten mit allen Schattierungen von 50 bis 950.
        </p>
        <UButton to="/colors" variant="soft" size="sm">
          Farben erkunden
        </UButton>
      </div>

      <!-- Component Variants -->
      <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div class="flex items-center mb-4">
          <UIcon name="i-lucide-square-code" class="text-primary-500 text-2xl mr-3" />
          <h3 class="text-xl font-semibold">Varianten anpassen</h3>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Customizen Sie alle Komponenten-Varianten wie solid, outline, soft und viele mehr.
        </p>
        <UButton to="/components" variant="soft" size="sm">
          Komponenten entdecken
        </UButton>
      </div>

      <!-- Live Preview -->
      <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div class="flex items-center mb-4">
          <UIcon name="i-lucide-eye" class="text-primary-500 text-2xl mr-3" />
          <h3 class="text-xl font-semibold">Live Vorschau</h3>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Sehen Sie Ihre Änderungen in Echtzeit und testen Sie verschiedene Kombinationen.
        </p>
        <UButton to="/preview" variant="soft" size="sm">
          Vorschau öffnen
        </UButton>
      </div>
    </div>

    <!-- Getting Started Section -->
    <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center">
      <h2 class="text-3xl font-bold mb-4">Erste Schritte</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
        Beginnen Sie mit der Erstellung Ihrer eigenen Farbpalette oder erkunden Sie die verfügbaren Komponenten.
      </p>
      <div class="flex gap-4 justify-center flex-wrap">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-check-circle" class="text-green-500" />
          <span>Unbegrenzte Farben</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-check-circle" class="text-green-500" />
          <span>Alle NuxtUI Komponenten</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-check-circle" class="text-green-500" />
          <span>Live Vorschau</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page meta
useHead({
  title: 'NuxtUI Theme Builder - Startseite',
  meta: [
    { name: 'description', content: 'Erstellen Sie wunderschöne, anpassbare Themes für Ihre NuxtUI Komponenten.' }
  ]
})
</script>
