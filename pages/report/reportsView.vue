<!-- Coordinator (USER_SERVICE): review therapist reports and deliver them to
     the patient (if an adult) or their guardian (if a minor). -->
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
	title: "report.myTitle",
});

const { t } = useI18n();
const toast = useToast();

interface ReportRow {
	id: string;
	patientId: string;
	therapistId: string;
	testsUsed: string;
	diagnosis: string;
	createdAt: string;
	deliveredAt: string | null;
}
interface PatientRow {
	id: string;
	name: string;
}
interface TherapistRow {
	id: string;
	fName: string;
	lName: string;
}

const {
	data: reportData,
	status,
	error,
	refresh,
} = await useFetch<ReportRow[]>("/api/session/reports", { default: () => [] });
const { data: patientData } = await useFetch<PatientRow[]>("/api/search/all", {
	default: () => [],
});
const { data: therapistData } = await useFetch<TherapistRow[]>(
	"/api/session/therapists",
	{ default: () => [] }
);

const patientById = computed(
	() => new Map((patientData.value ?? []).map((p) => [p.id, p.name]))
);
const therapistById = computed(
	() =>
		new Map(
			(therapistData.value ?? []).map((th) => [
				th.id,
				`${th.fName} ${th.lName}`.trim(),
			])
		)
);

type Row = {
	id: string;
	patient: string;
	therapist: string;
	diagnosis: string;
	submitted: string;
	delivered: boolean;
};

const rows = computed<Row[]>(() =>
	(reportData.value ?? []).map((r) => ({
		id: r.id,
		patient: patientById.value.get(r.patientId) ?? r.patientId,
		therapist: therapistById.value.get(r.therapistId) ?? r.therapistId,
		diagnosis: r.diagnosis || "—",
		submitted: r.createdAt
			? new Date(r.createdAt).toLocaleDateString()
			: "—",
		delivered: !!r.deliveredAt,
	}))
);

const columns = computed<TableColumn<Row>[]>(() => [
	{ accessorKey: "patient", header: t("report.patient") },
	{ accessorKey: "therapist", header: t("report.therapist") },
	{ accessorKey: "diagnosis", header: t("report.diagnosisLabel") },
	{ accessorKey: "submitted", header: t("report.submitted") },
	{ accessorKey: "delivered", header: t("report.status") },
]);

const deliveringId = ref<string | null>(null);

async function deliverReport(id: string) {
	deliveringId.value = id;
	try {
		await $fetch(`/api/session/reports/${id}/deliver`, { method: "POST" });
		toast.add({
			title: t("report.deliverSuccess"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
		await refresh();
	} catch {
		toast.add({
			title: t("report.deliverError"),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	} finally {
		deliveringId.value = null;
	}
}
</script>

<template>
	<div class="mx-auto w-full max-w-5xl">
		<UAlert
			v-if="error"
			color="error"
			variant="subtle"
			icon="i-lucide-triangle-alert"
			:title="t('report.loadError')"
		/>
		<div
			v-else-if="!rows.length && status !== 'pending'"
			class="border-default text-muted rounded-lg border border-dashed py-12 text-center"
		>
			{{ t("report.empty") }}
		</div>
		<UTable
			v-else
			:data="rows"
			:columns="columns"
			:loading="status === 'pending'"
		>
			<template #delivered-cell="{ row }">
				<UBadge
					v-if="row.original.delivered"
					color="success"
					variant="subtle"
					:label="t('report.delivered')"
				/>
				<div v-else class="flex items-center gap-2">
					<UBadge
						color="warning"
						variant="subtle"
						:label="t('report.pendingDelivery')"
					/>
					<UButton
						size="xs"
						icon="i-lucide-send"
						:loading="deliveringId === row.original.id"
						:label="t('report.deliver')"
						@click="deliverReport(row.original.id)"
					/>
				</div>
			</template>
		</UTable>
	</div>
</template>
