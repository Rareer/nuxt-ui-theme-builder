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
	</aside>
</template>
