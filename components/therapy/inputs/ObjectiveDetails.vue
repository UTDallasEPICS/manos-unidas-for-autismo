<!-- Per-objective detail notes + a shared date. Migrated from the deleted
     Form/Input/ObjectiveDetails.vue. Model is an ObjectiveDetailsValue
     ({ objectives, details, date }); `objectives` is display-only (driven by the
     selected objectives), and only `details`/`date` are written back — matching
     the composable setter, so objectiveDetails / objectivesDate are unchanged. -->
<script setup lang="ts">
import type {
	FormFieldConfig,
	ObjectiveDetailsValue,
} from "~/types/FormConfig/formConfig";

defineProps<{ fieldConfig: FormFieldConfig }>();

const model = defineModel<ObjectiveDetailsValue>({
	default: () => ({ objectives: [], details: {}, date: "" }),
});

const { t } = useI18n();

function updateDetail(key: string, val: string) {
	model.value = {
		...model.value,
		details: { ...model.value.details, [key]: val },
	};
}

function updateDate(date: string) {
	model.value = { ...model.value, date };
}
</script>

<template>
	<div>
		<label class="text-default mb-1 block text-sm font-medium">
			{{ fieldConfig.label }}
			<span v-if="fieldConfig.required" class="text-error">*</span>
		</label>
		<div v-if="model.objectives.length" class="space-y-3">
			<div
				v-for="objectiveKey in model.objectives"
				:key="objectiveKey"
				class="border-default space-y-1 rounded-md border p-2"
			>
				<div class="text-default text-sm font-semibold">
					{{ objectiveKey }}
				</div>
				<UTextarea
					:model-value="model.details[objectiveKey] ?? ''"
					:placeholder="
						t('therapyNote.detailsFor', { objective: objectiveKey })
					"
					:rows="2"
					class="w-full"
					@update:model-value="updateDetail(objectiveKey, $event)"
				/>
			</div>
		</div>
		<p v-else class="text-muted text-sm">
			{{ t("therapyNote.selectObjectiveAbove") }}
		</p>
		<div class="mt-3">
			<label class="text-default mb-1 block text-sm font-medium">
				{{ t("therapyNote.date") }}
			</label>
			<UInput
				:model-value="model.date"
				type="date"
				class="w-full md:w-1/3"
				@update:model-value="updateDate(String($event))"
			/>
		</div>
	</div>
</template>
