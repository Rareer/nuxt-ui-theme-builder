<script setup lang="ts">
const form = reactive({
	name: '',
	email: '',
	message: '',
});

// State für Komponenten-Vorschau
const inputText = ref('');
const textareaText = ref('');
const isOn = ref(true);
const isModalOpen = ref(false);
const checkA = ref(false);
const checkB = ref(true);

const selectItems = ['Apple', 'Banana', 'Cherry'];
const selectedItem = ref<string | undefined>(selectItems[0]);

const radioOptions = [
	{ value: 'a', label: 'Option A' },
	{ value: 'b', label: 'Option B' },
	{ value: 'c', label: 'Option C' },
];
const selectedOption = ref('a');

const tabItems = [
	{ label: 'Übersicht', content: 'Inhalt Tab 1' },
	{ label: 'Details', content: 'Inhalt Tab 2' },
	{ label: 'Einstellungen', content: 'Inhalt Tab 3' },
];
const activeTab = ref(0);

const accordionDemo = [
	{ label: 'Abschnitt A', content: 'Beschreibung für A' },
	{ label: 'Abschnitt B', content: 'Beschreibung für B' },
];

// Extra Komponenten: Dropdown, Pagination, Table, Progress, Slider
const dropdownItems = [
	[
		{ label: 'Bearbeiten', icon: 'i-lucide-pencil', click: () => console.log('Bearbeiten') },
		{ label: 'Teilen', icon: 'i-lucide-share', click: () => console.log('Teilen') },
	],
	[
		{ label: 'Löschen', icon: 'i-lucide-trash', color: 'error', click: () => console.log('Löschen') },
	],
];

const page = ref(1);

type TableRow = { name: string; email: string; role: string };
const tableColumns = [
	{ accessorKey: 'name', header: 'Name' },
	{ accessorKey: 'email', header: 'E-Mail' },
	{ accessorKey: 'role', header: 'Rolle' },
];
const tableRows: TableRow[] = [
	{ name: 'Max Mustermann', email: 'max@example.com', role: 'Admin' },
	{ name: 'Erika Beispiel', email: 'erika@example.com', role: 'User' },
	{ name: 'Hans Müller', email: 'hans@example.com', role: 'Editor' },
];

const progress = ref(30);
const slider = ref(25);

// Toast notifications
const toast = useToast();
function notify(title: string, description: string, color: 'info' | 'success' | 'error' | 'warning' | 'primary' | 'neutral' = 'info') {
	const icon
    = color === 'success'
    	? 'i-lucide-check-circle'
    	: color === 'error'
    		? 'i-lucide-triangle-alert'
    		: 'i-lucide-info';
	toast.add({ title, description, color, icon });
}

// Breadcrumbs
const breadcrumbLinks = ref([
  {
    label: 'Home',
    icon: 'i-lucide-house'
  },
  {
    label: 'Components',
    icon: 'i-lucide-box',
    to: '/components'
  },
  {
    label: 'Breadcrumb',
    icon: 'i-lucide-link',
    to: '/components/breadcrumb'
  }
])

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
];

function submitForm() {
	console.log('Form submitted:', { ...form });
}
</script>

<template>
	<UContainer class="space-y-24 py-16">
		<!-- Komponenten-Vorschau Grid -->
		<section>
			<h2 class="text-2xl font-semibold mb-6 text-center">
				{{ $t('preview.componentsPreview') }}
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<!-- Buttons -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Buttons
						</div>
					</template>
					<div class="flex flex-wrap gap-3">
						<UButton color="primary">
							Primary
						</UButton>
						<UButton variant="soft">
							Soft
						</UButton>
						<UButton variant="outline">
							Outline
						</UButton>
						<UButton
							color="success"
							icon="i-lucide-check-circle"
						>
							Success
						</UButton>
						<UButton
							color="warning"
							icon="i-lucide-triangle-alert"
						>
							Warn
						</UButton>
					</div>
				</UCard>

				<!-- Badges -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Badges
						</div>
					</template>
					<div class="flex flex-wrap gap-2">
						<UBadge color="primary">
							Primary
						</UBadge>
						<UBadge color="secondary">
							Secondary
						</UBadge>
						<UBadge color="neutral">
							Neutral
						</UBadge>
						<UBadge color="success">
							Success
						</UBadge>
						<UBadge color="warning">
							Warning
						</UBadge>
						<UBadge
							color="error"
							variant="soft"
						>
							Soft
						</UBadge>
					</div>
				</UCard>

				<!-- Alert -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Alert
						</div>
					</template>
					<UAlert
						color="info"
						variant="soft"
						icon="i-lucide-info"
						:title="$t('preview.themingPreviewTitle')"
						:description="$t('preview.themingPreviewDesc')"
					/>
				</UCard>

				<!-- Avatars -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Avatars
						</div>
					</template>
					<div class="flex items-center gap-4">
						<UAvatar src="https://i.pravatar.cc/100?img=11" />
						<UAvatar
							src="https://i.pravatar.cc/100?img=12"
							size="lg"
						/>
						<UAvatar
							src="https://i.pravatar.cc/100?img=13"
							size="sm"
						/>
					</div>
				</UCard>

				<!-- Inputs -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Inputs
						</div>
					</template>
					<div class="space-y-3">
						<UInput
							v-model="inputText"
							:placeholder="$t('preview.enterText')"
							class="w-full"
						/>
						<USelect
							v-model="selectedItem"
							:items="selectItems"
							:placeholder="$t('preview.select')"
							class="w-full"
						/>
						<UTextarea
							v-model="textareaText"
							:placeholder="$t('preview.multiline')"
							class="w-full"
						/>
					</div>
				</UCard>

				<!-- Switch, Checkbox & Radio -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Switch, Checkbox & Radio
						</div>
					</template>
					<div class="flex flex-col gap-4">
						<div class="flex items-center gap-3">
							<USwitch v-model="isOn" />
							<span class="text-sm text-gray-600">{{ isOn ? $t('preview.on') : $t('preview.off') }}</span>
						</div>
						<div class="flex flex-col gap-2">
							<UCheckbox
								v-model="checkA"
								:label="$t('preview.subscribeNewsletter')"
							/>
							<UCheckbox
								v-model="checkB"
								:label="$t('preview.acceptTOS')"
							/>
						</div>
						<URadioGroup
							v-model="selectedOption"
							:options="radioOptions"
						/>
					</div>
				</UCard>

				<!-- Tabs -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Tabs
						</div>
					</template>
					<UTabs
						v-model="activeTab"
						:items="tabItems"
						color="neutral"
					/>
				</UCard>

				<!-- Accordion -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Accordion
						</div>
					</template>
					<UAccordion :items="accordionDemo" />
				</UCard>

				<!-- Modal -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Modal
						</div>
					</template>
					<div class="flex items-center gap-3">
						<UButton
							icon="i-lucide-layers"
							@click="isModalOpen = true"
						>
							{{ $t('preview.open') }}
						</UButton>
						<span class="text-sm text-gray-600">{{ $t('preview.dialogWithStyles') }}</span>
					</div>
					<UModal v-model:open="isModalOpen">
						<template #header>
							<div class="flex items-center gap-2">
								<UIcon name="i-lucide-sparkles" />
								<span>{{ $t('preview.exampleModal') }}</span>
							</div>
						</template>
						<template #body>
							<p class="text-sm text-gray-600">
								{{ $t('preview.modalBodyText') }}
							</p>
						</template>
						<template #footer>
							<div class="flex justify-end gap-2">
								<UButton
									variant="soft"
									@click="isModalOpen = false"
								>
									{{ $t('preview.close') }}
								</UButton>
								<UButton
									color="primary"
									@click="isModalOpen = false"
								>
									{{ $t('preview.ok') }}
								</UButton>
							</div>
						</template>
					</UModal>
				</UCard>

				<!-- Separator -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Separator
						</div>
					</template>
					<div>
						<div class="flex items-center justify-between text-sm text-gray-600 mb-2">
							<span>{{ $t('preview.top') }}</span>
							<span>{{ $t('preview.bottom') }}</span>
						</div>
						<USeparator />
						<p class="text-sm text-gray-600 mt-2">
							{{ $t('preview.separatesContent') }}
						</p>
					</div>
				</UCard>

				<!-- Tooltip -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Tooltip
						</div>
					</template>
					<div class="flex gap-3">
						<UTooltip :text="$t('preview.moreInfo')">
							<UButton
								variant="outline"
								icon="i-lucide-circle-help"
							>
								{{ $t('preview.hover') }}
							</UButton>
						</UTooltip>
					</div>
				</UCard>

				<!-- Popover -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Popover
						</div>
					</template>
					<UPopover>
						<UButton
							variant="soft"
							icon="i-lucide-chevron-down"
						>
							{{ $t('preview.open') }}
						</UButton>
						<template #content>
							<div class="p-3 text-sm text-gray-600 w-56">
								{{ $t('preview.popoverContent') }}
							</div>
						</template>
					</UPopover>
				</UCard>

				<!-- DropdownMenu -->
				<UCard>
					<template #header>
						<div class="font-medium">
							DropdownMenu
						</div>
					</template>
					<UDropdownMenu :items="dropdownItems">
						<UButton
							icon="i-lucide-ellipsis-vertical"
							variant="outline"
						>
							{{ $t('actions.actions') }}
						</UButton>
					</UDropdownMenu>
				</UCard>

				<!-- Pagination -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Pagination
						</div>
					</template>
					<div class="flex justify-center">
						<UPagination
							v-model:page="page"
							:page-count="10"
						/>
					</div>
				</UCard>

				<!-- Table -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Table
						</div>
					</template>
					<UTable
						:columns="tableColumns"
						:rows="tableRows"
						class="max-w-full overflow-auto"
					/>
				</UCard>

				<!-- Progress -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Progress
						</div>
					</template>
					<div class="space-y-3">
						<UProgress :value="progress" />
						<UButton
							size="sm"
							variant="soft"
							@click="progress = (progress + 10) % 110"
						>
							{{ $t('actions.increase') }}
						</UButton>
					</div>
				</UCard>

				<!-- Skeleton -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Skeleton
						</div>
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
						<div class="font-medium">
							Chips
						</div>
					</template>
					<div class="flex flex-wrap gap-2">
						<UChip color="primary">
							Primary
						</UChip>
						<UChip color="secondary">
							Secondary
						</UChip>
						<UChip color="neutral">
							Neutral
						</UChip>
						<UChip color="success">
							Success
						</UChip>
						<UChip color="warning">
							Warning
						</UChip>
						<UChip
							color="info"
							variant="soft"
						>
							Info
						</UChip>
					</div>
				</UCard>

				<!-- Slider -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Slider
						</div>
					</template>
					<div class="space-y-3">
						<USlider
							v-model="slider"
							:max="100"
						/>
						<div class="text-sm text-gray-600">
							{{ $t('preview.value') }}: {{ slider }}
						</div>
					</div>
				</UCard>

				<!-- Notification (Toast) -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Toast
						</div>
					</template>
					<div class="flex gap-2">
						<UButton
							variant="soft"
							@click="notify($t('preview.toastInfoTitle'), $t('preview.toastInfoDesc'), 'info')"
						>
							Info
						</UButton>
						<UButton
							color="success"
							variant="soft"
							@click="notify($t('preview.toastSuccessTitle'), $t('preview.toastSuccessDesc'), 'success')"
						>
							Success
						</UButton>
						<UButton
							color="error"
							variant="soft"
							@click="notify($t('preview.toastErrorTitle'), $t('preview.toastErrorDesc'), 'error')"
						>
							Error
						</UButton>
					</div>
				</UCard>

				<!-- Breadcrumbs -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Breadcrumbs
						</div>
					</template>
					<UBreadcrumb :items="breadcrumbLinks" />
				</UCard>

				<!-- Avatar Group -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Avatar Group
						</div>
					</template>
					<UAvatarGroup>
						<UAvatar
							src="https://github.com/nuxt.png"
							alt="Nuxt"
						/>
						<UAvatar
							src="https://github.com/nuxt-labs.png"
							alt="Nuxt Labs"
						/>
						<UAvatar
							src="https://github.com/unjs.png"
							alt="unjs"
						/>
					</UAvatarGroup>
				</UCard>
			</div>
		</section>

		<!-- Hinweis / Alert -->
		<UAlert
			color="info"
			variant="soft"
			icon="i-lucide-info"
			title="Neu in Version 1.5"
			description="Jetzt mit integriertem Dark Mode, neuen Komponenten und verbesserter Performance!"
		/>

		<!-- Hero Section -->
		<section class="text-center space-y-6">
			<h1 class="text-4xl font-bold">
				{{ $t('preview.heroTitle') }} <UBadge color="primary">
					Beta
				</UBadge>
			</h1>
			<p class="text-gray-500 text-lg max-w-2xl mx-auto">
				{{ $t('preview.heroSubtitle') }}
			</p>
			<div class="flex justify-center gap-4">
				<UButton
					color="primary"
					variant="solid"
					size="lg"
					icon="i-lucide-play-circle"
				>
					{{ $t('preview.btnGetStarted') }}
				</UButton>
				<UButton
					color="neutral"
					size="lg"
					variant="soft"
				>
					{{ $t('preview.btnLearnMore') }}
				</UButton>
			</div>
		</section>

		<USeparator />

		<!-- Feature Section -->
		<section>
			<h2 class="text-2xl font-semibold mb-6 text-center">
				{{ $t('preview.featuresTitle') }}
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<UCard>
					<template #header>
						<div class="flex items-center gap-2">
							<UIcon name="i-lucide-zap" />
							<span>{{ $t('preview.featureFastTitle') }}</span>
						</div>
					</template>
					<p>{{ $t('preview.featureFastDesc') }}</p>
				</UCard>
				<UCard>
					<template #header>
						<div class="flex items-center gap-2">
							<UIcon name="i-lucide-smartphone" />
							<span>{{ $t('preview.featureResponsiveTitle') }}</span>
						</div>
					</template>
					<p>{{ $t('preview.featureResponsiveDesc') }}</p>
				</UCard>
				<UCard>
					<template #header>
						<div class="flex items-center gap-2">
							<UIcon name="i-lucide-cube" />
							<span>{{ $t('preview.featureModularTitle') }}</span>
						</div>
					</template>
					<p>{{ $t('preview.featureModularDesc') }}</p>
				</UCard>
			</div>
		</section>

		<USeparator />

		<!-- FAQ Section -->
		<section>
			<h2 class="text-2xl font-semibold mb-6 text-center">
				{{ $t('preview.faqTitle') }}
			</h2>
			<UAccordion :items="faqItems" />
		</section>

		<USeparator />

		<!-- Testimonials -->
		<section>
			<h2 class="text-2xl font-semibold mb-6 text-center">
				{{ $t('preview.testimonialsTitle') }}
			</h2>
			<div class="grid md:grid-cols-2 gap-6">
				<UCard>
					<p class="mb-4">
						{{ $t('preview.testimonial1') }}
					</p>
					<div class="flex items-center gap-4">
						<UAvatar
							src="https://i.pravatar.cc/100?img=1"
							alt="User 1"
						/>
						<div>
							<p class="font-semibold">
								Laura S. <UBadge color="info">
									{{ $t('preview.badgeProUser') }}
								</UBadge>
							</p>
							<p class="text-sm text-gray-500">
								{{ $t('preview.roleFrontendLead') }}
							</p>
						</div>
					</div>
				</UCard>
				<UCard>
					<p class="mb-4">
						{{ $t('preview.testimonial2') }}
					</p>
					<div class="flex items-center gap-4">
						<UAvatar
							src="https://i.pravatar.cc/100?img=3"
							alt="User 2"
						/>
						<div>
							<p class="font-semibold">
								Mark T. <UBadge
									color="secondary"
									variant="soft"
								>
									{{ $t('preview.badgeEarlyAdopter') }}
								</UBadge>
							</p>
							<p class="text-sm text-gray-500">
								{{ $t('preview.roleFullstackDev') }}
							</p>
						</div>
					</div>
				</UCard>
			</div>
		</section>

		<USeparator />

		<!-- Kontaktformular -->
		<section>
			<h2 class="text-2xl font-semibold mb-6 text-center">
				{{ $t('preview.contact.title') }}
			</h2>
			<UCard class="max-w-2xl mx-auto space-y-4">
				<UInput
					v-model="form.name"
					:placeholder="$t('preview.contact.name')"
				/>
				<UInput
					v-model="form.email"
					type="email"
					:placeholder="$t('preview.contact.email')"
				/>
				<UTextarea
					v-model="form.message"
					:placeholder="$t('preview.contact.message')"
				/>
				<UButton
					color="primary"
					block
					icon="i-lucide-send"
					@click="submitForm"
				>
					{{ $t('preview.contact.send') }}
				</UButton>
			</UCard>
		</section>

		<USeparator />

		<!-- Footer -->
		<footer class="text-center pt-12 border-t mt-12">
			<div class="flex justify-center mb-4">
				<UAvatar
					src="https://i.pravatar.cc/100?img=5"
					size="lg"
				/>
			</div>
			<p class="text-sm text-gray-500">
				{{ $t('preview.footer.copyright', { year: new Date().getFullYear() }) }}
			</p>
			<div class="flex justify-center gap-2 mt-2 flex-wrap">
				<UBadge color="primary">
					{{ $t('preview.footer.nuxt3') }}
				</UBadge>
				<UBadge color="secondary">
					{{ $t('preview.footer.tailwind') }}
				</UBadge>
				<UBadge color="success">
					{{ $t('preview.footer.nuxtui') }}
				</UBadge>
				<UBadge color="warning">
					{{ $t('preview.footer.composable') }}
				</UBadge>
			</div>
		</footer>
	</UContainer>
</template>
