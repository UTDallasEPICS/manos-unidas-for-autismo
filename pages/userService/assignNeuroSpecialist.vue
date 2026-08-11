<!-- User-service: neuro-specialist referrals. Assign a therapist per row via
     AssignModal. Rebuilt on NuxtUI (UTable). -->
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import AssignModal from "~/components/userService/AssignModal.vue";

const { t } = useI18n();

interface ReferralRequest {
	id: string;
	patientId: string;
	evaluatorId: string;
	therapyRecommendation: string;
	therapistType: string;
	submittedAt: string;
}

const { data, status, error, refresh } = await useFetch<ReferralRequest[]>(
	"/api/session/referrals",
	{
		default: () => [],
	}
);

type Row = ReferralRequest & { submitted: string };
const rows = computed<Row[]>(() =>
	(data.value ?? []).map((r) => ({
		...r,
		evaluatorId: r.evaluatorId || "—",
		therapistType: r.therapistType || "—",
		therapyRecommendation: r.therapyRecommendation || "—",
		submitted: r.submittedAt
			? new Date(r.submittedAt).toLocaleString()
			: "—",
	}))
);

const columns = computed<TableColumn<Row>[]>(() => [
	{ accessorKey: "patientId", header: t("assign.colPatientId") },
	{ accessorKey: "evaluatorId", header: t("assign.colEvaluatorId") },
	{ accessorKey: "therapistType", header: t("assign.colTherapistType") },
	{
		accessorKey: "therapyRecommendation",
		header: t("assign.colRecommendation"),
	},
	{ accessorKey: "submitted", header: t("assign.colSubmittedAt") },
	{ accessorKey: "actions", header: "" },
]);

const open = ref(false);
const selected = ref<ReferralRequest | null>(null);
function openAssign(row: Row) {
	selected.value = row;
	open.value = true;
}
</script>

<template>
	<div class="mx-auto w-full max-w-6xl">
		<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
			<h1 class="text-highlighted text-xl font-semibold">
				{{ t("assign.referralTitle") }}
			</h1>
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
			{{ t("assign.emptyReferrals") }}
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
			mode="referral"
			:item="selected"
			@assigned="refresh()"
		/>
	</div>
</template>
