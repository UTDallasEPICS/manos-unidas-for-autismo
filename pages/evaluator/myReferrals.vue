<!-- Evaluator: list of my submitted referrals. -->
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
	title: "referrals.myTitle",
});

const { t } = useI18n();
const localePath = useLocalePath();

interface ReferralRow {
	id: string;
	patientId: string;
	therapistId: string | null;
	therapyRecommendation: string;
	therapistType: string;
	submittedAt: string;
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
	data: referralData,
	status,
	error,
} = await useFetch<ReferralRow[]>("/api/session/referrals", {
	default: () => [],
});
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
	patient: string;
	therapistType: string;
	recommendation: string;
	submitted: string;
	assigned: string | null;
};

const rows = computed<Row[]>(() =>
	(referralData.value ?? []).map((r) => ({
		patient: patientById.value.get(r.patientId) ?? r.patientId,
		therapistType: r.therapistType || "—",
		recommendation: r.therapyRecommendation || "—",
		submitted: r.submittedAt
			? new Date(r.submittedAt).toLocaleDateString()
			: "—",
		assigned: r.therapistId
			? (therapistById.value.get(r.therapistId) ?? r.therapistId)
			: null,
	}))
);

const columns = computed<TableColumn<Row>[]>(() => [
	{ accessorKey: "patient", header: t("referrals.patient") },
	{ accessorKey: "therapistType", header: t("referrals.therapistType") },
	{ accessorKey: "recommendation", header: t("referrals.recommendation") },
	{ accessorKey: "submitted", header: t("referrals.submitted") },
	{ accessorKey: "assigned", header: t("referrals.status") },
]);
</script>

<template>
	<div class="mx-auto w-full max-w-5xl">
		<div class="mb-6 flex flex-wrap items-center justify-end gap-3">
			<UButton
				:to="localePath({ name: 'evaluator-createReferral' })"
				icon="i-lucide-clipboard-plus"
				:label="t('referrals.create')"
			/>
		</div>

		<UAlert
			v-if="error"
			color="error"
			variant="subtle"
			icon="i-lucide-triangle-alert"
			:title="t('referrals.loadError')"
		/>
		<div
			v-else-if="!rows.length && status !== 'pending'"
			class="border-default text-muted rounded-lg border border-dashed py-12 text-center"
		>
			{{ t("referrals.empty") }}
		</div>
		<UTable
			v-else
			:data="rows"
			:columns="columns"
			:loading="status === 'pending'"
		>
			<template #assigned-cell="{ row }">
				<UBadge
					v-if="row.original.assigned"
					color="success"
					variant="subtle"
					:label="
						t('referrals.assignedTo', {
							name: row.original.assigned,
						})
					"
				/>
				<UBadge
					v-else
					color="warning"
					variant="subtle"
					:label="t('referrals.pending')"
				/>
			</template>
		</UTable>
	</div>
</template>
