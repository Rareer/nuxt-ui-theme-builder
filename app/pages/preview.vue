<template>
  <ThemePreview>
    <UContainer class="space-y-24 py-16">

<!-- Hinweis / Alert -->
<UAlert
  color="info"
  variant="soft"
  icon="i-heroicons-information-circle"
  title="Neu in Version 1.5"
  description="Jetzt mit integriertem Dark Mode, neuen Komponenten und verbesserter Performance!"
/>

<!-- Hero Section -->
<section class="text-center space-y-6">
  <h1 class="text-4xl font-bold">Willkommen bei Nuxtlify <UBadge color="primary">Beta</UBadge></h1>
  <p class="text-gray-500 text-lg max-w-2xl mx-auto">
    Die moderne Lösung für deine Webprojekte – schnell, schön und modular dank Nuxt UI.
  </p>
  <div class="flex justify-center gap-4">
    <UButton color="primary" variant="solid" size="lg" icon="i-heroicons-play-circle">
      Jetzt starten
    </UButton>
    <UButton color="neutral" size="lg" variant="soft">Mehr erfahren</UButton>
  </div>
</section>

<USeparator />

<!-- Feature Section -->
<section>
  <h2 class="text-2xl font-semibold mb-6 text-center">Unsere Features</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-lightning-bolt" />
          <span>Schnell</span>
        </div>
      </template>
      <p>Blitzschnelle Performance durch SSR und Vite.</p>
    </UCard>
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-device-mobile" />
          <span>Responsiv</span>
        </div>
      </template>
      <p>Sieht auf jedem Gerät fantastisch aus – dank Tailwind & Nuxt UI.</p>
    </UCard>
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-cube" />
          <span>Modular</span>
        </div>
      </template>
      <p>Baue deine App mit wiederverwendbaren Komponenten und klarer Struktur.</p>
    </UCard>
  </div>
</section>

<USeparator />

<!-- FAQ Section -->
<section>
  <h2 class="text-2xl font-semibold mb-6 text-center">Häufige Fragen</h2>
  <UAccordion :items="faqItems" />
</section>

<USeparator />

<!-- Testimonials -->
<section>
  <h2 class="text-2xl font-semibold mb-6 text-center">Was sagen unsere Nutzer?</h2>
  <div class="grid md:grid-cols-2 gap-6">
    <UCard>
      <p class="mb-4">„Nuxtify hat unsere Entwickler-Experience komplett verändert. Schneller, schöner, besser!“</p>
      <div class="flex items-center gap-4">
        <UAvatar src="https://i.pravatar.cc/100?img=1" alt="User 1" />
        <div>
          <p class="font-semibold">Laura S. <UBadge color="blue">Pro-User</UBadge></p>
          <p class="text-sm text-gray-500">Frontend Lead</p>
        </div>
      </div>
    </UCard>
    <UCard>
      <p class="mb-4">„Ich liebe das Designsystem von Nuxt UI – endlich keine Custom-UI-Bibliothek mehr nötig.“</p>
      <div class="flex items-center gap-4">
        <UAvatar src="https://i.pravatar.cc/100?img=3" alt="User 2" />
        <div>
          <p class="font-semibold">Mark T. <UBadge color="purple" variant="soft">Early Adopter</UBadge></p>
          <p class="text-sm text-gray-500">Fullstack Entwickler</p>
        </div>
      </div>
    </UCard>
  </div>
</section>

<USeparator />

<!-- Kontaktformular -->
<section>
  <h2 class="text-2xl font-semibold mb-6 text-center">Kontakt aufnehmen</h2>
  <UCard class="max-w-2xl mx-auto space-y-4">
    <UInput v-model="form.name" placeholder="Dein Name" />
    <UInput v-model="form.email" type="email" placeholder="E-Mail-Adresse" />
    <UTextarea v-model="form.message" placeholder="Deine Nachricht" />
    <UButton color="primary" block icon="i-heroicons-paper-airplane" @click="submitForm">
      Absenden
    </UButton>
  </UCard>
</section>

<USeparator />

<!-- Footer -->
<footer class="text-center pt-12 border-t mt-12">
  <div class="flex justify-center mb-4">
    <UAvatar src="https://i.pravatar.cc/100?img=5" size="lg" />
  </div>
  <p class="text-sm text-gray-500">© 2025 Nuxtify. Alle Rechte vorbehalten.</p>
  <div class="flex justify-center gap-2 mt-2 flex-wrap">
    <UBadge color="primary">Nuxt 3</UBadge>
    <UBadge color="secondary">Tailwind CSS</UBadge>
    <UBadge color="success">Nuxt UI</UBadge>
    <UBadge color="warning">Composable Design</UBadge>
  </div>
</footer>
</UContainer>
  </ThemePreview>
</template>

<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  message: '',
})

const faqItems = [
  {
    label: 'Was ist Nuxtify?',
    content: 'Nuxtify ist eine Beispielseite, die zeigt, wie man Nuxt UI effektiv nutzt.',
  },
  {
    label: 'Ist Nuxtify Open Source?',
    content: 'Diese Demo ist vollständig offen und dient Lern- und Demo-Zwecken.',
  },
  {
    label: 'Kann ich die Komponenten anpassen?',
    content: 'Ja! Alle Komponenten lassen sich via Props, Slots und Tailwind anpassen.',
  },
]

function submitForm() {
  console.log('Form submitted:', { ...form })
}
</script>