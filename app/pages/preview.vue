<template>
  <ThemePreview>
    <UContainer class="space-y-24 py-16">
      <!-- Komponenten-Vorschau Grid -->
      <section>
        <h2 class="text-2xl font-semibold mb-6 text-center">Komponenten Vorschau</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Buttons -->
          <UCard>
            <template #header>
              <div class="font-medium">Buttons</div>
            </template>
            <div class="flex flex-wrap gap-3">
              <UButton color="primary">Primary</UButton>
              <UButton variant="soft">Soft</UButton>
              <UButton variant="outline">Outline</UButton>
              <UButton color="success" icon="i-heroicons-check-circle">Success</UButton>
              <UButton color="warning" icon="i-heroicons-exclamation-triangle">Warn</UButton>
            </div>
          </UCard>

          <!-- Badges -->
          <UCard>
            <template #header>
              <div class="font-medium">Badges</div>
            </template>
            <div class="flex flex-wrap gap-2">
              <UBadge color="primary">Primary</UBadge>
              <UBadge color="neutral">Neutral</UBadge>
              <UBadge color="success">Success</UBadge>
              <UBadge color="warning">Warning</UBadge>
              <UBadge color="error" variant="soft">Soft</UBadge>
            </div>
          </UCard>

          <!-- Alert -->
          <UCard>
            <template #header>
              <div class="font-medium">Alert</div>
            </template>
            <UAlert
              color="info"
              variant="soft"
              icon="i-heroicons-information-circle"
              title="Theming Vorschau"
              description="Passe Variablen an und sehe hier sofort die Wirkung."
            />
          </UCard>

          <!-- Avatars -->
          <UCard>
            <template #header>
              <div class="font-medium">Avatars</div>
            </template>
            <div class="flex items-center gap-4">
              <UAvatar src="https://i.pravatar.cc/100?img=11" />
              <UAvatar src="https://i.pravatar.cc/100?img=12" size="lg" />
              <UAvatar src="https://i.pravatar.cc/100?img=13" size="sm" />
            </div>
          </UCard>

          <!-- Inputs -->
          <UCard>
            <template #header>
              <div class="font-medium">Inputs</div>
            </template>
            <div class="space-y-3">
              <UInput v-model="inputText" placeholder="Text eingeben" class="w-full" />
              <USelect v-model="selectedItem" :items="selectItems" placeholder="Auswahl" class="w-full" />
              <UTextarea v-model="textareaText" placeholder="Mehrzeiliger Text" class="w-full" />
            </div>
          </UCard>

          <!-- Switch, Checkbox & Radio -->
          <UCard>
            <template #header>
              <div class="font-medium">Switch, Checkbox & Radio</div>
            </template>
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <USwitch v-model="isOn" />
                <span class="text-sm text-gray-600">{{ isOn ? 'An' : 'Aus' }}</span>
              </div>
              <div class="flex flex-col gap-2">
                <UCheckbox v-model="checkA" label="Newsletter abonnieren" />
                <UCheckbox v-model="checkB" label="AGB akzeptieren" />
              </div>
              <URadioGroup v-model="selectedOption" :options="radioOptions" />
            </div>
          </UCard>

          <!-- Tabs -->
          <UCard>
            <template #header>
              <div class="font-medium">Tabs</div>
            </template>
            <UTabs v-model="activeTab" :items="tabItems" color="neutral" />
          </UCard>

          <!-- Accordion -->
          <UCard>
            <template #header>
              <div class="font-medium">Accordion</div>
            </template>
            <UAccordion :items="accordionDemo" />
          </UCard>

          <!-- Modal -->
          <UCard>
            <template #header>
              <div class="font-medium">Modal</div>
            </template>
            <div class="flex items-center gap-3">
              <UButton @click="isModalOpen = true" icon="i-heroicons-rectangle-stack">Öffnen</UButton>
              <span class="text-sm text-gray-600">Dialog mit Theme-Stilen</span>
            </div>
            <UModal v-model:open="isModalOpen">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-sparkles" />
                  <span>Beispiel Modal</span>
                </div>
              </template>
              <template #body>
                <p class="text-sm text-gray-600">Hier siehst du Typografie, Abstände und Farben im Kontext.</p>
              </template>
              <template #footer>
                <div class="flex justify-end gap-2">
                  <UButton variant="soft" @click="isModalOpen = false">Schließen</UButton>
                  <UButton color="primary" @click="isModalOpen = false">Okay</UButton>
                </div>
              </template>
            </UModal>
          </UCard>

          <!-- Separator -->
          <UCard>
            <template #header>
              <div class="font-medium">Separator</div>
            </template>
            <div>
              <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Oben</span>
                <span>Unten</span>
              </div>
              <USeparator />
              <p class="text-sm text-gray-600 mt-2">Trennt Inhalte visuell.</p>
            </div>
          </UCard>

          <!-- Tooltip -->
          <UCard>
            <template #header>
              <div class="font-medium">Tooltip</div>
            </template>
            <div class="flex gap-3">
              <UTooltip text="Weitere Infos">
                <UButton variant="outline" icon="i-heroicons-question-mark-circle">Hover</UButton>
              </UTooltip>
            </div>
          </UCard>

          <!-- Popover -->
          <UCard>
            <template #header>
              <div class="font-medium">Popover</div>
            </template>
            <UPopover>
              <UButton variant="soft" icon="i-heroicons-chevron-down">Öffnen</UButton>
              <template #content>
                <div class="p-3 text-sm text-gray-600 w-56">
                  Dies ist ein Popover-Inhalt mit Text und Links.
                </div>
              </template>
            </UPopover>
          </UCard>

          <!-- Dropdown -->
          <UCard>
            <template #header>
              <div class="font-medium">Dropdown</div>
            </template>
            <UDropdown :items="dropdownItems">
              <UButton icon="i-heroicons-ellipsis-vertical" variant="outline">Aktionen</UButton>
            </UDropdown>
          </UCard>

          <!-- Pagination -->
          <UCard>
            <template #header>
              <div class="font-medium">Pagination</div>
            </template>
            <div class="flex justify-center">
              <UPagination v-model:page="page" :page-count="10" />
            </div>
          </UCard>

          <!-- Table -->
          <UCard>
            <template #header>
              <div class="font-medium">Table</div>
            </template>
            <UTable :columns="tableColumns" :rows="tableRows" class="max-w-full overflow-auto" />
          </UCard>

          <!-- Progress -->
          <UCard>
            <template #header>
              <div class="font-medium">Progress</div>
            </template>
            <div class="space-y-3">
              <UProgress :value="progress" />
              <UButton size="sm" variant="soft" @click="progress = (progress + 10) % 110">Increase</UButton>
            </div>
          </UCard>

          <!-- Skeleton -->
          <UCard>
            <template #header>
              <div class="font-medium">Skeleton</div>
            </template>
            <div class="space-y-2">
              <USkeleton class="h-6 w-1/3" />
              <USkeleton class="h-4 w-2/3" />
              <USkeleton class="h-4 w-1/2" />
            </div>
          </UCard>

          <!-- Chips -->
          <UCard>
            <template #header>
              <div class="font-medium">Chips</div>
            </template>
            <div class="flex flex-wrap gap-2">
              <UChip color="primary">Primary</UChip>
              <UChip color="neutral">Neutral</UChip>
              <UChip color="success">Success</UChip>
              <UChip color="warning">Warning</UChip>
              <UChip color="info" variant="soft">Info</UChip>
            </div>
          </UCard>

          <!-- Slider -->
          <UCard>
            <template #header>
              <div class="font-medium">Slider</div>
            </template>
            <div class="space-y-3">
              <USlider v-model="slider" :max="100" />
              <div class="text-sm text-gray-600">Wert: {{ slider }}</div>
            </div>
          </UCard>

          <!-- Notification (Toast) -->
          <UCard>
            <template #header>
              <div class="font-medium">Toast</div>
            </template>
            <div class="flex gap-2">
              <UButton @click="notify('Info', 'Dies ist eine Information.', 'info')" variant="soft">Info</UButton>
              <UButton @click="notify('Erfolg', 'Aktion war erfolgreich!', 'success')" color="success" variant="soft">Success</UButton>
              <UButton @click="notify('Fehler', 'Etwas ist schief gelaufen.', 'error')" color="error" variant="soft">Error</UButton>
            </div>
          </UCard>

          <!-- Breadcrumbs -->
          <UCard>
            <template #header>
              <div class="font-medium">Breadcrumbs</div>
            </template>
            <UBreadcrumbs :links="breadcrumbLinks" />
          </UCard>

          <!-- Spinner -->
          <UCard>
            <template #header>
              <div class="font-medium">Spinner</div>
            </template>
            <div class="flex items-center gap-4">
              <USpinner size="sm" />
              <USpinner size="md" />
              <USpinner size="lg" />
            </div>
          </UCard>

          <!-- Avatar Group -->
          <UCard>
            <template #header>
              <div class="font-medium">Avatar Group</div>
            </template>
            <UAvatarGroup>
              <UAvatar src="https://github.com/nuxt.png" alt="Nuxt" />
              <UAvatar src="https://github.com/nuxtlabs.png" alt="Nuxt Labs" />
              <UAvatar src="https://github.com/unjs.png" alt="unjs" />
            </UAvatarGroup>
          </UCard>
        </div>
      </section>

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
          <p class="font-semibold">Laura S. <UBadge color="info">Pro-User</UBadge></p>
          <p class="text-sm text-gray-500">Frontend Lead</p>
        </div>
      </div>
    </UCard>
    <UCard>
      <p class="mb-4">„Ich liebe das Designsystem von Nuxt UI – endlich keine Custom-UI-Bibliothek mehr nötig.“</p>
      <div class="flex items-center gap-4">
        <UAvatar src="https://i.pravatar.cc/100?img=3" alt="User 2" />
        <div>
          <p class="font-semibold">Mark T. <UBadge color="secondary" variant="soft">Early Adopter</UBadge></p>
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

// State für Komponenten-Vorschau
const inputText = ref('')
const textareaText = ref('')
const isOn = ref(true)
const isModalOpen = ref(false)
const checkA = ref(false)
const checkB = ref(true)

const selectItems = ['Apple', 'Banana', 'Cherry']
const selectedItem = ref<string | undefined>(selectItems[0])

const radioOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]
const selectedOption = ref('a')

const tabItems = [
  { label: 'Übersicht', content: 'Inhalt Tab 1' },
  { label: 'Details', content: 'Inhalt Tab 2' },
  { label: 'Einstellungen', content: 'Inhalt Tab 3' },
]
const activeTab = ref(0)

const accordionDemo = [
  { label: 'Abschnitt A', content: 'Beschreibung für A' },
  { label: 'Abschnitt B', content: 'Beschreibung für B' },
]

// Extra Komponenten: Dropdown, Pagination, Table, Progress, Slider
const dropdownItems = [
  [
    { label: 'Bearbeiten', icon: 'i-heroicons-pencil-square', click: () => console.log('Bearbeiten') },
    { label: 'Teilen', icon: 'i-heroicons-share', click: () => console.log('Teilen') },
  ],
  [
    { label: 'Löschen', icon: 'i-heroicons-trash', color: 'error', click: () => console.log('Löschen') },
  ],
]

const page = ref(1)

type TableRow = { name: string; email: string; role: string }
const tableColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'E-Mail' },
  { accessorKey: 'role', header: 'Rolle' },
]
const tableRows: TableRow[] = [
  { name: 'Max Mustermann', email: 'max@example.com', role: 'Admin' },
  { name: 'Erika Beispiel', email: 'erika@example.com', role: 'User' },
  { name: 'Hans Müller', email: 'hans@example.com', role: 'Editor' },
]

const progress = ref(30)
const slider = ref(25)

// Toast notifications
const toast = useToast()
function notify(title: string, description: string, color: 'info' | 'success' | 'error' | 'warning' | 'primary' | 'neutral' = 'info') {
  const icon =
    color === 'success'
      ? 'i-heroicons-check-circle'
      : color === 'error'
        ? 'i-heroicons-exclamation-triangle'
        : 'i-heroicons-information-circle'
  toast.add({ title, description, color, icon })
}

// Breadcrumbs
const breadcrumbLinks = [
  { label: 'Home', to: '#' },
  { label: 'Library', to: '#' },
  { label: 'Data' },
]

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