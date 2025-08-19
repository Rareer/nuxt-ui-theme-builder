<script setup lang="ts">
// Set page meta
const { t } = useI18n();

useHead(() => ({
	title: t('index.headTitle'),
	meta: [
		{ name: 'description', content: t('index.headDescription') },
	],
}));
</script>

<template>
	<div class="max-w-6xl mx-auto px-4 py-12">
		<!-- Hero Section -->
		<div class="text-center mb-16">
			<h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
				{{ $t('index.heroTitle') }}
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
				{{ $t('index.heroSubtitle') }}
			</p>
			<div class="flex gap-4 justify-center flex-wrap">
				<UButton
					to="/colors"
					size="lg"
					icon="i-lucide-palette"
				>
					{{ $t('index.btnManageColors') }}
				</UButton>
				<UButton
					to="/components"
					variant="outline"
					size="lg"
					icon="i-lucide-square-code"
				>
					{{ $t('index.btnCustomizeComponents') }}
				</UButton>
			</div>
		</div>

		<!-- Features Grid -->
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
			<!-- Custom Colors -->
			<div class="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
				<div class="flex items-center mb-4">
					<UIcon
						name="i-lucide-palette"
						class="text-primary-500 text-2xl mr-3"
					/>
					<h3 class="text-xl font-semibold">
						{{ $t('index.featureColorsTitle') }}
					</h3>
				</div>
				<p class="text-gray-600 dark:text-gray-400 mb-4">
					{{ $t('index.featureColorsDesc') }}
				</p>
				<UButton
					to="/colors"
					variant="soft"
					size="sm"
				>
					{{ $t('colors.explore') }}
				</UButton>
			</div>

			<!-- Component Variants -->
			<div class="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
				<div class="flex items-center mb-4">
					<UIcon
						name="i-lucide-square-code"
						class="text-primary-500 text-2xl mr-3"
					/>
					<h3 class="text-xl font-semibold">
						{{ $t('index.featureComponentsTitle') }}
					</h3>
				</div>
				<p class="text-gray-600 dark:text-gray-400 mb-4">
					{{ $t('index.featureComponentsDesc') }}
				</p>
				<UButton
					to="/components/UButton"
					variant="soft"
					size="sm"
				>
					{{ $t('index.btnCustomizeComponents') }}
				</UButton>
			</div>

			<!-- Live Preview -->
			<div class="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
				<div class="flex items-center mb-4">
					<UIcon
						name="i-lucide-eye"
						class="text-primary-500 text-2xl mr-3"
					/>
					<h3 class="text-xl font-semibold">
						{{ $t('index.featurePreviewTitle') }}
					</h3>
				</div>
				<p class="text-gray-600 dark:text-gray-400 mb-4">
					{{ $t('index.featurePreviewDesc') }}
				</p>
				<UButton
					to="/preview"
					variant="soft"
					size="sm"
				>
					{{ $t('index.btnOpenPreview') }}
				</UButton>
			</div>
		</div>

		<!-- Getting Started Section -->
		<div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center">
			<h2 class="text-3xl font-bold mb-4">
				{{ $t('index.gettingStartedTitle') }}
			</h2>
			<p class="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
				{{ $t('index.gettingStartedSubtitle') }}
			</p>
			<div class="flex gap-4 justify-center flex-wrap">
				<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
					<UIcon
						name="i-lucide-check-circle"
						class="text-green-500"
					/>
					<span>{{ $t('index.bulletUnlimitedColors') }}</span>
				</div>
				<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
					<UIcon
						name="i-lucide-check-circle"
						class="text-green-500"
					/>
					<span>{{ $t('index.bulletAllComponents') }}</span>
				</div>
				<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
					<UIcon
						name="i-lucide-check-circle"
						class="text-green-500"
					/>
					<span>{{ $t('index.bulletLivePreview') }}</span>
				</div>
			</div>
		</div>
	</div>
</template>
