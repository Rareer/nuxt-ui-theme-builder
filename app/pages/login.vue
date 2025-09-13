<template>
  <div class="container mx-auto max-w-md py-10">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold">{{ $t('auth.loginTitle') }}</h1>
          <NuxtLink class="text-primary hover:underline" to="/signup">{{ $t('auth.noAccount') }}</NuxtLink>
        </div>
      </template>

      <UForm :state="state" :validate="validate" @submit="onSubmit">
        <div class="space-y-4">
          <UFormField :label="$t('auth.email')" name="email">
            <UInput v-model="state.email" type="email" autocomplete="email" placeholder="you@example.com" />
          </UFormField>
          <UFormField :label="$t('auth.password')" name="password">
            <UInput v-model="state.password" type="password" autocomplete="current-password" placeholder="••••••••" />
          </UFormField>
          <div class="flex items-center justify-between pt-2">
            <UButton type="submit" :loading="loading" icon="i-lucide-log-in">{{ $t('auth.login') }}</UButton>
            <UButton variant="ghost" color="neutral" @click="signInWithGithub" icon="i-lucide-github">{{ $t('auth.github') }}</UButton>
          </div>
        </div>
      </UForm>

      <div v-if="error" class="mt-4">
        <UAlert color="error" icon="i-lucide-alert-triangle" :title="error" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient();
const user = useSupabaseUser();
const route = useRoute();
const router = useRouter();

const redirect = computed(() => (route.query.redirect as string) || '/mythemes');

watchEffect(() => {
  if (user.value) {
    router.replace(redirect.value);
  }
});

const loading = ref(false);
const error = ref<string | null>(null);

const state = reactive({
  email: '',
  password: '',
});

function validate() {
  const errors: Array<{ path: string; message: string }> = [];
  if (!state.email) errors.push({ path: 'email', message: 'E-Mail ist erforderlich' });
  if (!state.password) errors.push({ path: 'password', message: 'Passwort ist erforderlich' });
  return errors;
}

async function onSubmit() {
  error.value = null;
  loading.value = true;
  try {
    const { error: authError } = await client.auth.signInWithPassword({
      email: state.email.trim(),
      password: state.password,
    });
    if (authError) throw authError;
    router.replace(redirect.value);
  } catch (e: any) {
    error.value = e?.message ?? 'Anmeldung fehlgeschlagen';
  } finally {
    loading.value = false;
  }
}

async function signInWithGithub() {
  try {
    const { error: authError } = await client.auth.signInWithOAuth({ provider: 'github' });
    if (authError) throw authError;
  } catch (e: any) {
    error.value = e?.message ?? 'OAuth-Anmeldung fehlgeschlagen';
  }
}
</script>
