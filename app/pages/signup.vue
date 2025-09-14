<template>
  <div class="container mx-auto max-w-md py-10">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold">{{ $t('auth.signupTitle') }}</h1>
          <NuxtLink class="text-primary hover:underline" to="/login">{{ $t('auth.haveAccount') }}</NuxtLink>
        </div>
      </template>

      <UForm :state="state" :validate="validate" @submit="onSubmit">
        <div class="space-y-4">
          <UFormField :label="$t('auth.nickname')" name="nickname">
            <UInput
              v-model="state.nickname"
              type="text"
              autocomplete="nickname"
              placeholder="john_doe"
              class="w-full"
              @blur="triggerNicknameCheck()"
            />
            <div class="mt-1 text-sm text-gray-500">{{ $t('auth.nicknameHelp') }}</div>
            <div class="mt-1 text-sm">
              <span v-if="nicknameChecking" class="text-gray-500">{{ $t('auth.nicknameChecking') }}</span>
              <span v-else-if="nicknameAvailable === true" class="text-success-600">{{ $t('auth.nicknameAvailable') }}</span>
              <span v-else-if="nicknameAvailable === false" class="text-error-600">{{ $t('auth.nicknameTaken') }}</span>
            </div>
          </UFormField>
          <UFormField :label="$t('auth.email')" name="email">
            <UInput class="w-full" v-model="state.email" type="email" autocomplete="email" placeholder="you@example.com" />
          </UFormField>
          <UFormField :label="$t('auth.password')" name="password">
            <UInput class="w-full" v-model="state.password" type="password" autocomplete="new-password" placeholder="Mind. 6 Zeichen" />
          </UFormField>
          <UFormField :label="$t('auth.confirmPassword')" name="confirm">
            <UInput v-model="state.confirm" class="w-full" type="password" autocomplete="new-password" placeholder="Wiederholen" />
          </UFormField>
          <div class="flex items-center justify-between pt-2">
            <UButton type="submit" :loading="loading" icon="i-lucide-user-plus">{{ $t('auth.signup') }}</UButton>
          </div>
        </div>
      </UForm>

      <div v-if="message" class="mt-4">
        <UAlert color="success" icon="i-lucide-check-circle-2" :title="message" />
      </div>
      <div v-if="error" class="mt-4">
        <UAlert color="error" icon="i-lucide-alert-triangle" :title="error" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';
const { t } = useI18n();
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
  nickname: '',
  email: '',
  password: '',
  confirm: '',
});

function validate() {
  const errors: Array<{ path: string; message: string }> = [];

  const SignupSchema = z
    .object({
      nickname: z
        .string({ required_error: t('auth.nicknameRequired') })
        .min(3, t('auth.nicknameInvalid'))
        .max(20, t('auth.nicknameInvalid'))
        .regex(/^[a-zA-Z0-9_-]+$/, t('auth.nicknameInvalid')),
      email: z
        .string({ required_error: t('auth.emailRequired') })
        .email(t('auth.emailInvalid')),
      password: z
        .string({ required_error: t('auth.passwordRequired') })
        .min(6, t('auth.passwordMin')),
      confirm: z.string({ required_error: t('auth.confirmRequired') }),
    })
    .refine((data) => data.password === data.confirm, {
      message: t('auth.passwordsMismatch'),
      path: ['confirm'],
    });

  const parsed = SignupSchema.safeParse({
    nickname: state.nickname,
    email: state.email,
    password: state.password,
    confirm: state.confirm,
  });

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = (issue.path?.[0] as string) || 'form';
      errors.push({ path, message: issue.message });
    }
  }

  // Append async-related nickname constraints
  if (state.nickname && !/^[a-zA-Z0-9_-]{3,20}$/.test(state.nickname)) {
    // Already covered by Zod, skip
  } else {
    if (nicknameChecking.value) {
      errors.push({ path: 'nickname', message: t('auth.waitAvailability') });
    } else if (nicknameAvailable.value === false) {
      errors.push({ path: 'nickname', message: t('auth.nicknameTaken') });
    }
  }

  return errors;
}

async function onSubmit() {
  message.value = null;
  error.value = null;
  loading.value = true;
  try {
    const { data, error: authError } = await client.auth.signUp({
      email: state.email.trim(),
      password: state.password,
      options: {
        data: {
          display_name: state.nickname.trim(),
        },
      },
    });
    if (authError) throw authError;

    // Persist nickname in profiles (service role endpoint) if we have a user id
    const userId = data?.user?.id;
    if (userId && state.nickname) {
      try {
        await $fetch('/api/profile', {
          method: 'POST',
          body: { userId, nickname: state.nickname.trim() },
        });
      } catch (e) {
        // Non-blocking: ignore profile persistence errors for now
      }
    }

    message.value = 'Registrierung erfolgreich. Bitte bestätige deine E-Mail.';
  } catch (e: any) {
    error.value = e?.message ?? 'Registrierung fehlgeschlagen';
  } finally {
    loading.value = false;
  }
}

// Nickname availability check
const nicknameChecking = ref(false);
const nicknameAvailable = ref<boolean | null>(null);
let nicknameDebounce: any = null;

function triggerNicknameCheck() {
  if (!state.nickname || !/^[a-zA-Z0-9_-]{3,20}$/.test(state.nickname)) {
    nicknameAvailable.value = null;
    nicknameChecking.value = false;
    return;
  }
  nicknameChecking.value = true;
  clearTimeout(nicknameDebounce);
  nicknameDebounce = setTimeout(checkNickname, 350);
}

async function checkNickname() {
  try {
    const res = await $fetch<{ available: boolean; invalid?: boolean }>('/api/check-nickname', {
      method: 'GET',
      params: { nickname: state.nickname.trim() },
    });
    if (res.invalid) {
      nicknameAvailable.value = null;
    } else {
      nicknameAvailable.value = !!res.available;
    }
  } catch (e) {
    nicknameAvailable.value = null;
  } finally {
    nicknameChecking.value = false;
  }
}

watch(() => state.nickname, () => {
  triggerNicknameCheck();
});
</script>
