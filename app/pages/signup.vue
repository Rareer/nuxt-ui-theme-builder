<template>
  <div class="container mx-auto max-w-md py-10">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold">Signup</h1>
          <NuxtLink class="text-primary hover:underline" to="/login">Schon ein Konto?</NuxtLink>
        </div>
      </template>

      <UForm :state="state" :validate="validate" @submit="onSubmit">
        <UFormGroup label="E-Mail" name="email" class="mb-4">
          <UInput v-model="state.email" type="email" autocomplete="email" placeholder="you@example.com" />
        </UFormGroup>
        <UFormGroup label="Passwort" name="password" class="mb-2">
          <UInput v-model="state.password" type="password" autocomplete="new-password" placeholder="Mind. 6 Zeichen" />
        </UFormGroup>
        <UFormGroup label="Passwort bestätigen" name="confirm" class="mb-6">
          <UInput v-model="state.confirm" type="password" autocomplete="new-password" placeholder="Wiederholen" />
        </UFormGroup>
        <div class="flex items-center justify-between">
          <UButton type="submit" :loading="loading" icon="i-lucide-user-plus">Registrieren</UButton>
          <UButton variant="ghost" color="gray" @click="signUpWithGithub" icon="i-lucide-github">GitHub</UButton>
        </div>
      </UForm>

      <div v-if="message" class="mt-4">
        <UAlert color="green" icon="i-lucide-check-circle-2" :title="message" />
      </div>
      <div v-if="error" class="mt-4">
        <UAlert color="red" icon="i-lucide-alert-triangle" :title="error" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

watchEffect(() => {
  if (user.value) router.replace('/mythemes');
});

const loading = ref(false);
const message = ref<string | null>(null);
const error = ref<string | null>(null);

const state = reactive({
  email: '',
  password: '',
  confirm: '',
});

function validate() {
  const errors: Array<{ path: string; message: string }> = [];
  if (!state.email) errors.push({ path: 'email', message: 'E-Mail ist erforderlich' });
  if (!state.password) errors.push({ path: 'password', message: 'Passwort ist erforderlich' });
  if (state.password && state.password.length < 6) errors.push({ path: 'password', message: 'Mindestens 6 Zeichen' });
  if (state.password !== state.confirm) errors.push({ path: 'confirm', message: 'Passwörter stimmen nicht überein' });
  return errors;
}

async function onSubmit() {
  message.value = null;
  error.value = null;
  loading.value = true;
  try {
    const { error: authError } = await client.auth.signUp({
      email: state.email.trim(),
      password: state.password,
    });
    if (authError) throw authError;
    message.value = 'Registrierung erfolgreich. Bitte bestätige deine E-Mail.';
  } catch (e: any) {
    error.value = e?.message ?? 'Registrierung fehlgeschlagen';
  } finally {
    loading.value = false;
  }
}

async function signUpWithGithub() {
  try {
    const { error: authError } = await client.auth.signInWithOAuth({ provider: 'github' });
    if (authError) throw authError;
  } catch (e: any) {
    error.value = e?.message ?? 'OAuth-Registrierung fehlgeschlagen';
  }
}
</script>
