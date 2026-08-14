<!-- User-service: review incoming contact-form submissions (status "processing").
     Each row links to the full request and to the intake flow. Rebuilt on
     NuxtUI (UTable) — replaces the old raw-table + headless Listbox sort. -->
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
	title: "contactForms.title",
});

const { t } = useI18n();
const localePath = useLocalePath();

interface RequestPhone {
	id: number;
	number: string;
	requestId: number;
}
interface Request {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: RequestPhone[];
	patientFirstName: string;
	patientLastName: string;
	createdAt: string;
}

const {
	data: requests,
	status,
	error,
	refresh,
} = await useFetch<Request[]>("/api/request/processing", {
	default: () => [],
});

const sortBy = ref<"date" | "name">("date");
const sortItems = computed(() => [
	{ label: t("contactForms.sortDate"), value: "date" as const },
	{ label: t("contactForms.sortName"), value: "name" as const },
]);

type Row = {
	id: number;
	contact: string;
	email: string;
	phone: string;
	patient: string;
	submitted: string;
};

const rows = computed<Row[]>(() => {
	const list = [...(requests.value ?? [])];
	list.sort((a, b) =>
		sortBy.value === "name"
			? a.lastName.localeCompare(b.lastName)
			: new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
	return list.map((r) => ({
		id: r.id,
		contact: `${r.firstName} ${r.lastName}`.trim(),
		email: r.email,
		phone: (r.phone ?? []).map((p) => p.number).join(", ") || "—",
		patient: `${r.patientFirstName} ${r.patientLastName}`.trim() || "—",
		submitted: r.createdAt
			? new Date(r.createdAt).toLocaleDateString()
			: "—",
	}));
});

const columns = computed<TableColumn<Row>[]>(() => [
	{ accessorKey: "contact", header: t("contactForms.colContact") },
	{ accessorKey: "email", header: t("contactForms.colEmail") },
	{ accessorKey: "phone", header: t("contactForms.colPhone") },
	{ accessorKey: "patient", header: t("contactForms.colPatient") },
	{ accessorKey: "submitted", header: t("contactForms.colDate") },
	{ accessorKey: "actions", header: t("contactForms.colActions") },
]);
</script>

<template>
	<div class="mx-auto w-full max-w-6xl">
		<div class="mb-6 flex flex-wrap items-center justify-end gap-3">
			<USelect
				v-model="sortBy"
				:items="sortItems"
				:icon="'i-lucide-arrow-up-down'"
				class="w-56"
				:aria-label="t('contactForms.sortBy')"
			/>
		</div>

		<UAlert
			v-if="error"
			color="error"
			variant="subtle"
			icon="i-lucide-triangle-alert"
			:title="t('common.loadError')"
			:actions="[
				{
					label: t('common.retry'),
					color: 'neutral',
					variant: 'subtle',
					onClick: () => refresh(),
				},
			]"
		/>
		<div
			v-else-if="!rows.length && status !== 'pending'"
			class="border-default text-muted rounded-lg border border-dashed py-12 text-center"
		>
			{{ t("contactForms.empty") }}
		</div>
		<UTable
			v-else
			:data="rows"
			:columns="columns"
			:loading="status === 'pending'"
		>
			<template #actions-cell="{ row }">
				<div class="flex flex-wrap gap-2">
					<UButton
						:to="localePath(`/request/${row.original.id}`)"
						color="neutral"
						variant="outline"
						size="xs"
						icon="i-lucide-file-text"
						:label="t('contactForms.viewFull')"
					/>
					<UButton
						:to="localePath(`/intake/${row.original.id}`)"
						color="primary"
						variant="solid"
						size="xs"
						icon="i-lucide-clipboard-check"
						:label="t('contactForms.completeIntake')"
					/>
				</div>
			</template>
		</UTable>
	</div>
</template>
