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
	},
	{
		label: 'Breadcrumb',
		icon: 'i-lucide-link',
		to: '/components/UBreadcrumb',
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
	<AutoUi>
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
						<AutoUi>
							<UButton color="primary">Primary</UButton>
						</AutoUi>
						<AutoUi>
							<UButton color="primary" variant="soft">Soft</UButton>
						</AutoUi>
						<AutoUi>
							<UButton color="primary" variant="outline">Outline</UButton>
						</AutoUi>
						<AutoUi>
							<UButton color="success" icon="i-lucide-check-circle">Success</UButton>
						</AutoUi>
						<AutoUi>
							<UButton color="warning" icon="i-lucide-triangle-alert">Warn</UButton>
						</AutoUi>
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
						<AutoUi>
							<UBadge color="primary">Primary</UBadge>
						</AutoUi>
						<AutoUi>
							<UBadge color="secondary">Secondary</UBadge>
						</AutoUi>
						<AutoUi>
							<UBadge color="neutral">Neutral</UBadge>
						</AutoUi>
						<AutoUi>
							<UBadge color="success">Success</UBadge>
						</AutoUi>
						<AutoUi>
							<UBadge color="warning">Warning</UBadge>
						</AutoUi>
						<AutoUi>
							<UBadge color="error" variant="soft">Soft</UBadge>
						</AutoUi>
					</div>
				</UCard>

				<!-- Alert -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Alert
						</div>
					</template>
					<AutoUi>
						<UAlert
							color="info"
							variant="soft"
							icon="i-lucide-info"
							:title="$t('preview.themingPreviewTitle')"
							:description="$t('preview.themingPreviewDesc')"
						/>
					</AutoUi>
				</UCard>

				<!-- Avatars -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Avatars
						</div>
					</template>
					<div class="flex items-center gap-4">
						<AutoUi>
							<UAvatar src="https://i.pravatar.cc/100?img=11" />
						</AutoUi>
						<AutoUi>
							<UAvatar
								src="https://i.pravatar.cc/100?img=12"
								size="lg"
							/>
						</AutoUi>
						<AutoUi>
							<UAvatar
								src="https://i.pravatar.cc/100?img=13"
								size="sm"
							/>
						</AutoUi>
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
						<AutoUi>
							<UInput
								v-model="inputText"
								:placeholder="$t('preview.enterText')"
								class="w-full"
							/>
						</AutoUi>
						<AutoUi>
							<USelect
								v-model="selectedItem"
								:items="selectItems"
								:placeholder="$t('preview.select')"
								class="w-full"
							/>
						</AutoUi>
						<AutoUi>
							<UTextarea
								v-model="textareaText"
								:placeholder="$t('preview.multiline')"
								class="w-full"
							/>
						</AutoUi>
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
							<AutoUi>
								<USwitch v-model="isOn" />
							</AutoUi>
							<span class="text-sm text-gray-600">{{ isOn ? $t('preview.on') : $t('preview.off') }}</span>
						</div>
						<div class="flex flex-col gap-2">
							<AutoUi>
								<UCheckbox
									v-model="checkA"
									:label="$t('preview.subscribeNewsletter')"
								/>
							</AutoUi>
							<AutoUi>
								<UCheckbox
									v-model="checkB"
									:label="$t('preview.acceptTOS')"
								/>
							</AutoUi>
						</div>
						<AutoUi>
							<URadioGroup
								v-model="selectedOption"
								:options="radioOptions"
							/>
						</AutoUi>
					</div>
				</UCard>

				<!-- Tabs -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Tabs
						</div>
					</template>
					<AutoUi>
						<UTabs
							v-model="activeTab"
							:items="tabItems"
							color="neutral"
						/>
					</AutoUi>
				</UCard>

				<!-- Accordion -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Accordion
						</div>
					</template>
					<AutoUi>
						<UAccordion :items="accordionDemo" />
					</AutoUi>
				</UCard>

				<!-- Modal -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Modal
						</div>
					</template>
					<div class="flex items-center gap-3">
						<AutoUi>
							<UButton
								icon="i-lucide-layers"
								@click="isModalOpen = true"
							>
								{{ $t('preview.open') }}
							</UButton>
						</AutoUi>
						<span class="text-sm text-gray-600">{{ $t('preview.dialogWithStyles') }}</span>
					</div>
					<AutoUi>
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
								<AutoUi>
									<UButton
										variant="soft"
										@click="isModalOpen = false"
									>
										{{ $t('preview.close') }}
									</UButton>
								</AutoUi>
								<AutoUi>
									<UButton
										color="primary"
										@click="isModalOpen = false"
									>
										{{ $t('preview.ok') }}
									</UButton>
								</AutoUi>
							</div>
						</template>
						</UModal>
					</AutoUi>
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
						<AutoUi>
							<USeparator />
						</AutoUi>
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
						<AutoUi>
							<UTooltip :text="$t('preview.moreInfo')">
								<AutoUi>
									<UButton
										variant="outline"
										icon="i-lucide-circle-help"
									>
										{{ $t('preview.hover') }}
									</UButton>
								</AutoUi>
							</UTooltip>
						</AutoUi>
					</div>
				</UCard>

				<!-- Popover -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Popover
						</div>
					</template>
					<AutoUi>
						<UPopover>
							<AutoUi>
								<UButton
									variant="soft"
									icon="i-lucide-chevron-down"
								>
									{{ $t('preview.open') }}
								</UButton>
							</AutoUi>
							<template #content>
								<div class="p-3 text-sm text-gray-600 w-56">
									{{ $t('preview.popoverContent') }}
								</div>
							</template>
						</UPopover>
					</AutoUi>
				</UCard>

				<!-- DropdownMenu -->
				<UCard>
					<template #header>
						<div class="font-medium">
							DropdownMenu
						</div>
					</template>
					<AutoUi>
						<UDropdownMenu :items="dropdownItems">
							<AutoUi>
								<UButton
									icon="i-lucide-ellipsis-vertical"
									variant="outline"
								>
									{{ $t('actions.actions') }}
								</UButton>
							</AutoUi>
						</UDropdownMenu>
					</AutoUi>
				</UCard>

				<!-- Pagination -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Pagination
						</div>
					</template>
					<div class="flex justify-center">
						<AutoUi>
							<UPagination
								v-model:page="page"
								:page-count="10"
							/>
						</AutoUi>
					</div>
				</UCard>

				<!-- Table -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Table
						</div>
					</template>
					<AutoUi>
						<UTable
							:columns="tableColumns"
							:rows="tableRows"
							class="max-w-full overflow-auto"
						/>
					</AutoUi>
				</UCard>

				<!-- Progress -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Progress
						</div>
					</template>
					<div class="space-y-3">
						<AutoUi>
							<UProgress :value="progress" />
						</AutoUi>
						<AutoUi>
							<UButton
								size="sm"
								variant="soft"
								@click="progress = (progress + 10) % 110"
							>
								{{ $t('actions.increase') }}
							</UButton>
						</AutoUi>
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
						<AutoUi>
							<USkeleton class="h-6 w-1/3" />
						</AutoUi>
						<AutoUi>
							<USkeleton class="h-4 w-2/3" />
						</AutoUi>
						<AutoUi>
							<USkeleton class="h-4 w-1/2" />
						</AutoUi>
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
						<AutoUi>
							<UChip color="primary">
								<AutoUi>
									<UButton
										color="neutral"
										variant="soft"
									>
										Primary
										</UButton>
								</AutoUi>
							</UChip>
						</AutoUi>
						<AutoUi>
							<UChip color="secondary">
								<AutoUi>
									<UButton
										color="neutral"
										variant="soft"
									>
										Secondary
										</UButton>
								</AutoUi>
							</UChip>
						</AutoUi>
						<AutoUi>
							<UChip
								color="primary"
								inset
							>
								<AutoUi>
									<UButton
										color="neutral"
										variant="soft"
									>
										Inset
										</UButton>
								</AutoUi>
							</UChip>
						</AutoUi>
						<AutoUi>
							<UChip
								color="success"
								standalone
							>
								<AutoUi>
									<UButton
										color="neutral"
										variant="soft"
									>
										Standalone
										</UButton>
								</AutoUi>
							</UChip>
						</AutoUi>
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
						<AutoUi>
							<USlider
								v-model="slider"
								:max="100"
							/>
						</AutoUi>
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
						<AutoUi>
							<UButton
								variant="soft"
								@click="notify($t('preview.toastInfoTitle'), $t('preview.toastInfoDesc'), 'info')"
							>
								Info
							</UButton>
						</AutoUi>
						<AutoUi>
							<UButton
								color="success"
								variant="soft"
								@click="notify($t('preview.toastSuccessTitle'), $t('preview.toastSuccessDesc'), 'success')"
							>
								Success
							</UButton>
						</AutoUi>
						<AutoUi>
							<UButton
								color="error"
								variant="soft"
								@click="notify($t('preview.toastErrorTitle'), $t('preview.toastErrorDesc'), 'error')"
							>
								Error
							</UButton>
						</AutoUi>
					</div>
				</UCard>

				<!-- Breadcrumbs -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Breadcrumbs
						</div>
					</template>
					<AutoUi>
						<UBreadcrumb :items="breadcrumbLinks" />
					</AutoUi>
				</UCard>

				<!-- Avatar Group -->
				<UCard>
					<template #header>
						<div class="font-medium">
							Avatar Group
						</div>
					</template>
					<AutoUi>
						<UAvatarGroup>
							<AutoUi>
								<UAvatar
									src="https://github.com/nuxt.png"
									alt="Nuxt"
								/>
							</AutoUi>
							<AutoUi>
								<UAvatar
									src="https://github.com/nuxt-labs.png"
									alt="Nuxt Labs"
								/>
							</AutoUi>
							<AutoUi>
								<UAvatar
									src="https://github.com/unjs.png"
									alt="unjs"
								/>
							</AutoUi>
						</UAvatarGroup>
					</AutoUi>
				</UCard>
			</div>
		</section>
	</UContainer>
</AutoUi>
</template>
