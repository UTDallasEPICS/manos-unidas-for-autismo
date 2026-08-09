<template>
	<div class="font-sc-encode p-4">
		<div class="mb-4 flex flex-row items-center">
			<h1 class="font-cormorant-garamond text-3xl font-bold text-nowrap">
				My Referrals
			</h1>
			<div class="w-full"></div>
			<NuxtLink
				:to="{ name: 'evaluator-createReferral' }"
				class="btn text-nowrap"
			>
				Create Referral
			</NuxtLink>
		</div>

		<table class="w-full table-auto border-collapse">
			<thead class="bg-gray-100">
				<tr>
					<th class="px-4 py-2 text-left">Patient</th>
					<th class="px-4 py-2 text-left">Therapist Type</th>
					<th class="px-4 py-2 text-left">Recommendation</th>
					<th class="px-4 py-2 text-left">Submitted</th>
					<th class="px-4 py-2 text-left">Status</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="referral in referrals"
					:key="referral.id"
					class="border-t"
				>
					<td class="px-4 py-2">
						{{ patientName(referral.patientId) }}
					</td>
					<td class="px-4 py-2">
						{{ referral.therapistType || "—" }}
					</td>
					<td class="px-4 py-2">
						{{ referral.therapyRecommendation || "—" }}
					</td>
					<td class="px-4 py-2">
						{{ formatDate(referral.submittedAt) }}
					</td>
					<td class="px-4 py-2">
						<span
							v-if="referral.therapistId"
							class="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
						>
							Assigned: {{ therapistName(referral.therapistId) }}
						</span>
						<span
							v-else
							class="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800"
						>
							Pending
						</span>
					</td>
				</tr>
				<tr v-if="!referrals.length">
					<td colspan="5" class="px-4 py-2 text-center text-gray-400">
						You haven't submitted any referrals yet.
					</td>
				</tr>
			</tbody>
		</table>

		<div v-if="error" class="mt-4 text-sm text-red-600">
			Failed to load your referrals.
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFetch } from "#imports";

interface ReferralRow {
	id: string;
	patientId: string;
	therapistId: string | null;
	evaluatorId: string;
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

const { data: referralData, error } = await useFetch<ReferralRow[]>(
	"/api/session/referrals",
	{ default: () => [] }
);

const { data: patientData } = await useFetch<PatientRow[]>("/api/search/all", {
	default: () => [],
});

const { data: therapistData } = await useFetch<TherapistRow[]>(
	"/api/session/therapists",
	{ default: () => [] }
);

const referrals = computed(() => referralData.value ?? []);

const patientNameById = computed(() => {
	const map = new Map<string, string>();
	for (const p of patientData.value ?? []) map.set(p.id, p.name);
	return map;
});

const therapistNameById = computed(() => {
	const map = new Map<string, string>();
	for (const t of therapistData.value ?? [])
		map.set(t.id, `${t.fName} ${t.lName}`.trim());
	return map;
});

function patientName(id: string): string {
	return patientNameById.value.get(id) ?? id;
}

function therapistName(id: string): string {
	return therapistNameById.value.get(id) ?? id;
}

function formatDate(value: string): string {
	return value ? new Date(value).toLocaleString() : "—";
}
</script>
