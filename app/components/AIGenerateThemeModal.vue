<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAIDesigner } from '~/composables/useAIDesigner'
import { useThemeImport } from '~/composables/useThemeImport'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ model?: string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'imported'): void }>()

const open = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const { t } = useI18n()
const prompt = ref(t('ai.defaultPrompt'))
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
      error.value = t('ai.errorEmpty')
      return
    }

    // Validate minimal surface before import
    if (
      !('colors' in payload) &&
      !('themeMappings' in payload) &&
      !('themeMappingsDark' in payload) &&
      !('cssVariables' in payload)
    ) {
      error.value = t('ai.errorFormat')
      return
    }

    // Import directly via our composable
    const summary = await importTheme(payload)
    emit('imported')
    hide()
  } catch (e: any) {
    error.value = e?.message || t('ai.errorUnexpected')
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
          <h3 class="text-base font-semibold">{{ $t('ai.title') }}</h3>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="hide" />
        </div>
      </template>
      <template #body> 
      <div class="space-y-3">
        <UFormField :label="$t('ai.apiKeyLabel')" :help="$t('ai.apiKeyHelp')">
          <UInput :model-value="apiKey" type="password" class="w-full" :placeholder="$t('ai.apiKeyPlaceholder')" @update:model-value="onApiKeyInput" />
        </UFormField>

        <UFormField :label="$t('ai.promptLabel')" :help="$t('ai.promptHelp')">
          <UTextarea v-model="prompt" :rows="6" class="w-full" :placeholder="$t('ai.promptPlaceholder')" />
        </UFormField>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      </div>
      </template>
      <template #footer>
        <div class="flex justify-end w-full gap-2">
          <UButton color="neutral" variant="ghost" @click="hide">{{ $t('ai.btnCancel') }}</UButton>
          <UButton :loading="loading" icon="i-lucide-sparkles" @click="onGenerate">
            {{ $t('ai.btnGenerate') }}
          </UButton>
        </div>
      </template>
  </UModal>
</template>
