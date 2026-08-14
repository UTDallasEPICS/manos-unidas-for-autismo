<!-- User-service: evaluation appointment requests. Assign an evaluator per row
     via AssignModal. Rebuilt on NuxtUI (UTable). -->
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import AssignModal from "~/components/userService/AssignModal.vue";

definePageMeta({
	title: "assign.apptTitle",
});

const { t } = useI18n();

interface Appointment {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	serviceType: string;
}

const { data, status, error, refresh } = await useFetch<Appointment[]>(
	"/api/session/appointments",
	{
		default: () => [],
	}
);

type Row = Appointment & { name: string };
const rows = computed<Row[]>(() =>
	(data.value ?? []).map((a) => ({
		...a,
		name: `${a.firstName} ${a.lastName}`.trim() || "—",
		email: a.email || "—",
		phone: a.phone || "—",
		serviceType: a.serviceType || "—",
	}))
);

const columns = computed<TableColumn<Row>[]>(() => [
	{ accessorKey: "name", header: t("assign.colName") },
	{ accessorKey: "email", header: t("assign.colEmail") },
	{ accessorKey: "phone", header: t("assign.colPhone") },
	{ accessorKey: "serviceType", header: t("assign.colService") },
	{ accessorKey: "actions", header: "" },
]);

const open = ref(false);
const selected = ref<Appointment | null>(null);
function openAssign(row: Row) {
	selected.value = row;
	open.value = true;
}
</script>

<template>
	<div class="mx-auto w-full max-w-6xl">
		<div class="mb-6 flex flex-wrap items-center justify-end gap-3">
			<UButton
				icon="i-lucide-refresh-cw"
				color="neutral"
				variant="outline"
				:label="t('assign.refresh')"
				:loading="status === 'pending'"
				@click="refresh()"
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
			{{ t("assign.emptyAppts") }}
		</div>
		<UTable
			v-else
			:data="rows"
			:columns="columns"
			:loading="status === 'pending'"
		>
			<template #actions-cell="{ row }">
				<UButton
					size="xs"
					icon="i-lucide-user-plus"
					:label="t('assign.assign')"
					@click="openAssign(row.original)"
				/>
			</template>
		</UTable>

		<AssignModal
			v-model="open"
			mode="appointment"
			:item="selected"
			@assigned="refresh()"
		/>
	</div>
</template>
