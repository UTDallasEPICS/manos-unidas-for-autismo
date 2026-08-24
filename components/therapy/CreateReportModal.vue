<!-- Therapist: create a post-appointment report for a patient — which tests/
     assessments were used and the resulting diagnosis/recommendation.
     Coordinator (USER_SERVICE) staff later deliver it via
     pages/report/reportsView.vue. -->
<script setup lang="ts">
const props = defineProps<{
	modelValue: boolean;
	patientId: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
	save: [data: { testsUsed: string; diagnosis: string }];
}>();

const { t } = useI18n();
const toast = useToast();

const testsUsed = ref("");
const diagnosis = ref("");

watch(
	() => props.modelValue,
	(open) => {
		if (open) {
			testsUsed.value = "";
			diagnosis.value = "";
		}
	}
);

function handleSubmit() {
	if (!testsUsed.value.trim() || !diagnosis.value.trim()) {
		toast.add({
			title: t("report.validationError"),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
		return;
	}
	emit("save", {
		testsUsed: testsUsed.value.trim(),
		diagnosis: diagnosis.value.trim(),
	});
}
</script>

<template>
	<UModal
		:open="modelValue"
		:title="t('report.createTitle')"
		:ui="{ content: 'max-w-2xl' }"
		@update:open="(v: boolean) => emit('update:modelValue', v)"
	>
		<template #body>
			<form
				id="create-report-form"
				class="space-y-4"
				@submit.prevent="handleSubmit"
			>
				<UFormField :label="t('report.testsUsedLabel')" required>
					<UTextarea
						v-model="testsUsed"
						:rows="2"
						:placeholder="t('report.testsUsedPlaceholder')"
						class="w-full"
					/>
				</UFormField>
				<UFormField :label="t('report.diagnosisLabel')" required>
					<UTextarea
						v-model="diagnosis"
						:rows="5"
						:placeholder="t('report.diagnosisPlaceholder')"
						class="w-full"
					/>
				</UFormField>
			</form>
		</template>

		<template #footer>
			<div class="flex w-full justify-end gap-3">
				<UButton
					color="neutral"
					variant="outline"
					:label="t('profile.cancel')"
					@click="emit('update:modelValue', false)"
				/>
				<UButton
					type="submit"
					form="create-report-form"
					:label="t('report.submit')"
				/>
			</div>
		</template>
	</UModal>
</template>
