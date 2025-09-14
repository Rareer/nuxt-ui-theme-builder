<!-- Navigation moved to AppSidebarNavigation.vue -->

<template>
	<aside class="h-full flex flex-col">
		<!-- Sidebar Header -->
		<NuxtLink
			to="/"
			class="h-16 px-4 flex items-center border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
		>
			<UIcon
				name="i-custom-nuxtlify"
				class="text-primary-500 mr-2 text-xl"
				color="primary"
			/>
			<h2 class="font-bold text-lg">{{ $t('app.name') }}</h2> <UBadge
				class="ml-2"
				color="warning"
				size="xs"
			>Beta</UBadge>
		</NuxtLink>
		<span class="px-4 text-xs text-gray-500">No official partner of Nuxt</span>

		<!-- Navigation Menu -->
		<div class="flex-1 p-2">
			<AppNavigation orientation="vertical" />
		</div>

		<!-- Footer: Login/Logout -->
		<div class="border-t border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between">
			<div class="text-xs text-gray-500">
				<span v-if="user">{{ user.email }}</span>
				<span v-else>Gast</span>
			</div>
			<div>
				<UButton v-if="!user" size="sm" icon="i-lucide-log-in" to="/login">Login</UButton>
				<UButton v-else size="sm" color="secondary" variant="outline" icon="i-lucide-log-out" @click="onLogout">Logout</UButton>
			</div>
		</div>
	</aside>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const userRef = useSupabaseUser();
const user = computed(() => userRef.value || null);

async function onLogout() {
  await supabase.auth.signOut();
  await navigateTo('/login');
}
</script>
