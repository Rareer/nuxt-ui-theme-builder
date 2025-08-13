<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAIDesigner } from '~/composables/useAIDesigner'
import { useThemeImport } from '~/composables/useThemeImport'

const props = defineProps<{ model?: string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'imported'): void }>()

const open = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const prompt = ref('Design a modern, soft, accessible theme with a calming primary and vibrant accent.')
const apiKey = ref('')

const { generateThemeFromPrompt } = useAIDesigner()
const { importTheme } = useThemeImport()

function show() { open.value = true }
function hide() { open.value = false; error.value = null }

// Load stored API key once
onMounted(() => {
  try {
    const stored = localStorage.getItem('openai_api_key')
    if (stored) apiKey.value = stored
  } catch {}
})

function onApiKeyInput(val: string) {
  apiKey.value = val
  try { localStorage.setItem('openai_api_key', val) } catch {}
}

async function onGenerate() {
  error.value = null
  loading.value = true
  try {
    const res = await generateThemeFromPrompt(prompt.value, props.model, apiKey.value || undefined)
    if (res.error) {
      error.value = res.error
      return
    }

    const payload = res.data
    if (!payload) {
      error.value = 'Empty AI response'
      return
    }

    // Validate minimal surface before import
    if (
      !('colors' in payload) &&
      !('themeMappings' in payload) &&
      !('cssVariables' in payload)
    ) {
      error.value = 'Unexpected AI response format'
      return
    }

    // Import directly via our composable
    const summary = await importTheme(payload)
    emit('imported')
    hide()
  } catch (e: any) {
    error.value = e?.message || 'Unexpected error'
  } finally {
    loading.value = false
  }
}

// expose show for parent controls
defineExpose({ show, hide })
</script>

<template>
  <UModal v-model:open="open">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-base font-semibold">Generate Colors with AI</h3>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="hide" />
        </div>
      </template>
      <template #body> 
      <div class="space-y-3">
        <UFormField label="OpenAI API Key" help="Your key is stored only in your browser and sent with this request.">
          <UInput :model-value="apiKey" type="password" class="w-full" placeholder="sk-..." @update:model-value="onApiKeyInput" />
        </UFormField>

        <UFormField label="Prompt" help="Describe the desired style, mood, and constraints.">
          <UTextarea v-model="prompt" :rows="6" class="w-full" placeholder="e.g., A clean, minimalist theme with soft neutrals and a bold accent..." />
        </UFormField>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      </div>
      </template>
      <template #footer>
        <div class="flex justify-end w-full gap-2">
          <UButton color="neutral" variant="ghost" @click="hide">Cancel</UButton>
          <UButton :loading="loading" icon="i-lucide-sparkles" @click="onGenerate">
            Generate & Import
          </UButton>
        </div>
      </template>
  </UModal>
</template>
