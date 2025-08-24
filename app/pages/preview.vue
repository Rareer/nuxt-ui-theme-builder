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
		{ label: 'Bearbeiten', icon: 'i-lucide-pencil' },
		{ label: 'Teilen', icon: 'i-lucide-share' },
	],
	[
		{ label: 'Löschen', icon: 'i-lucide-trash', color: 'error' },
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
		icon: 'i-lucide-house',
	},
	{
		label: 'Components',
		icon: 'i-lucide-box',
		to: '/components',
	},
	{
		label: 'Breadcrumb',
		icon: 'i-lucide-link',
		to: '/components/breadcrumb',
	},
]);

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
							<UButton
								color="neutral"
								variant="soft"
							>
								Primary
							</UButton>
						</UChip>
						<UChip color="secondary">
							<UButton
								color="neutral"
								variant="soft"
							>
								Secondary
							</UButton>
						</UChip>
						<UChip
							color="primary"
							inset
						>
							<UButton
								color="neutral"
								variant="soft"
							>
								Inset
							</UButton>
						</UChip>
						<UChip
							color="success"
							standalone
						>
							<UButton
								color="neutral"
								variant="soft"
							>
								Standalone
							</UButton>
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
	</UContainer>
</template>
