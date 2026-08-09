<template>
	<div class="font-sc-encode p-4">
		<div class="mb-4 flex flex-row items-center">
			<h1 class="font-cormorant-garamond text-3xl font-bold text-nowrap">
				Create Referral
			</h1>
			<div class="w-full"></div>
			<NuxtLink
				:to="{ name: 'evaluator-myReferrals' }"
				class="btn text-nowrap"
			>
				My Referrals
			</NuxtLink>
		</div>

		<form
			class="flex max-w-xl flex-col gap-4"
			@submit.prevent="submitReferral"
		>
			<div class="flex flex-col gap-1">
				<label class="font-medium" for="patient">Patient</label>
				<div
					v-if="selectedPatient"
					class="flex items-center justify-between rounded border border-gray-300 px-3 py-2"
				>
					<span>{{ selectedPatient.name }}</span>
					<button
						type="button"
						class="text-sm text-blue-600 hover:underline"
						@click="clearSelectedPatient"
					>
						Change
					</button>
				</div>
				<template v-else>
					<input
						id="patient"
						v-model="patientQuery"
						type="text"
						placeholder="Search by patient name..."
						class="input w-full"
					/>
					<div
						v-if="patientQuery"
						class="flex max-h-40 flex-col gap-1 overflow-y-auto rounded border border-gray-200"
					>
						<button
							v-for="p in matchingPatients"
							:key="p.id"
							type="button"
							class="cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-100"
							@click="selectPatient(p)"
						>
							{{ p.name }}
						</button>
						<div
							v-if="!matchingPatients.length"
							class="px-3 py-2 text-sm text-gray-400"
						>
							No matching patients.
						</div>
					</div>
				</template>
			</div>

			<div class="flex flex-col gap-1">
				<label class="font-medium" for="therapistType"
					>Therapist Type</label
				>
				<input
					id="therapistType"
					v-model="therapistType"
					type="text"
					required
					placeholder="e.g. Occupational, Language, Interventional..."
					class="input w-full"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label class="font-medium" for="recommendation"
					>Therapy Recommendation</label
				>
				<textarea
					id="recommendation"
					v-model="therapyRecommendation"
					required
					rows="5"
					placeholder="Summarize the assessment and what you're recommending..."
					class="input w-full"
				></textarea>
			</div>

			<div
				v-if="errorMessage"
				class="rounded bg-red-50 px-3 py-2 text-sm text-red-700"
			>
				{{ errorMessage }}
			</div>
			<div
				v-if="successMessage"
				class="rounded bg-green-50 px-3 py-2 text-sm text-green-700"
			>
				{{ successMessage }}
			</div>

			<button
				type="submit"
				class="btn w-fit"
				:disabled="!canSubmit || isSubmitting"
			>
				{{ isSubmitting ? "Submitting..." : "Submit Referral" }}
			</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useFetch } from "#imports";

interface PatientRow {
	id: string;
	name: string;
	type: string;
	age: number | null;
	gender: string | null;
}

const { data: patients } = await useFetch<PatientRow[]>("/api/search/all", {
	default: () => [],
});

const patientQuery = ref("");
const selectedPatient = ref<PatientRow | null>(null);
const therapistType = ref("");
const therapyRecommendation = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const isSubmitting = ref(false);

const matchingPatients = computed(() => {
	const q = patientQuery.value.trim().toLowerCase();
	if (!q) return [];
	return (patients.value ?? []).filter((p) =>
		p.name.toLowerCase().includes(q)
	);
});

function selectPatient(patient: PatientRow) {
	selectedPatient.value = patient;
	patientQuery.value = "";
}

function clearSelectedPatient() {
	selectedPatient.value = null;
}

const canSubmit = computed(
	() =>
		!!selectedPatient.value &&
		!!therapistType.value.trim() &&
		!!therapyRecommendation.value.trim()
);

function extractErrorMessage(err: unknown, fallback: string): string {
	if (err && typeof err === "object" && "data" in err) {
		const data = (
			err as { data?: { statusMessage?: string; message?: string } }
		).data;
		if (data?.statusMessage) return data.statusMessage;
		if (data?.message) return data.message;
	}
	return fallback;
}

async function submitReferral() {
	if (!selectedPatient.value) return;

	errorMessage.value = "";
	successMessage.value = "";
	isSubmitting.value = true;

	try {
		await $fetch("/api/session/referrals", {
			method: "POST",
			body: {
				patientId: selectedPatient.value.id,
				therapistType: therapistType.value.trim(),
				therapyRecommendation: therapyRecommendation.value.trim(),
			},
		});

		successMessage.value = `Referral submitted for ${selectedPatient.value.name}.`;
		selectedPatient.value = null;
		therapistType.value = "";
		therapyRecommendation.value = "";
	} catch (err) {
		errorMessage.value = extractErrorMessage(
			err,
			"Failed to submit referral."
		);
	} finally {
		isSubmitting.value = false;
	}
}
</script>
