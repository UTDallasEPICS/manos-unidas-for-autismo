<!-- Evaluator: create a therapist referral for a patient. -->
<script setup lang="ts">
definePageMeta({
	title: "referrals.createTitle",
});

const { t } = useI18n();
const localePath = useLocalePath();
const toast = useToast();

interface PatientRow {
	id: string;
	name: string;
}

const { data: patients } = await useFetch<PatientRow[]>("/api/search/all", {
	default: () => [],
});

const patientItems = computed(() =>
	(patients.value ?? []).map((p) => ({ label: p.name, id: p.id }))
);

const selectedPatient = ref<{ label: string; id: string } | undefined>();
const therapistType = ref("");
const therapyRecommendation = ref("");
const isSubmitting = ref(false);

const canSubmit = computed(
	() =>
		!!selectedPatient.value &&
		!!therapistType.value.trim() &&
		!!therapyRecommendation.value.trim()
);

async function submitReferral() {
	if (!selectedPatient.value) return;
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
		toast.add({
			title: t("referrals.submitSuccess", {
				name: selectedPatient.value.label,
			}),
			color: "success",
			icon: "i-lucide-circle-check",
		});
		selectedPatient.value = undefined;
		therapistType.value = "";
		therapyRecommendation.value = "";
	} catch {
		toast.add({
			title: t("referrals.submitError"),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	} finally {
		isSubmitting.value = false;
	}
}
</script>

<template>
	<div class="mx-auto w-full max-w-xl">
		<div class="mb-6 flex flex-wrap items-center justify-end gap-3">
			<UButton
				:to="localePath({ name: 'evaluator-myReferrals' })"
				variant="ghost"
				color="neutral"
				icon="i-lucide-list-checks"
				:label="t('referrals.backToList')"
			/>
		</div>

		<div class="space-y-4">
			<UFormField :label="t('referrals.selectPatient')" required>
				<USelectMenu
					v-model="selectedPatient"
					:items="patientItems"
					:placeholder="t('referrals.searchPatient')"
					icon="i-lucide-search"
					class="w-full"
				/>
			</UFormField>
			<UFormField :label="t('referrals.therapistTypeLabel')" required>
				<UInput
					v-model="therapistType"
					:placeholder="t('referrals.therapistTypePlaceholder')"
					class="w-full"
				/>
			</UFormField>
			<UFormField :label="t('referrals.recommendationLabel')" required>
				<UTextarea
					v-model="therapyRecommendation"
					:rows="5"
					:placeholder="t('referrals.recommendationPlaceholder')"
					class="w-full"
				/>
			</UFormField>
			<UButton
				:loading="isSubmitting"
				:disabled="!canSubmit"
				:label="t('referrals.submit')"
				@click="submitReferral"
			/>
		</div>
	</div>
</template>
