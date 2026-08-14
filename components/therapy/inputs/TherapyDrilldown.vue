<!-- Therapy picker + its objectives checklist (drill down). Migrated from the
     deleted Form/Input/TherapyDrilldown.vue. Model is a DrilldownValue
     ({ selected, checked }); selecting a therapy resets `checked` to [], exactly
     as before, so the saved selectedTherapy / selectedObjectives are unchanged. -->
<script setup lang="ts">
import type {
	FormFieldConfig,
	DrilldownValue,
} from "~/types/FormConfig/formConfig";
import { objectivesByTherapy } from "~/composables/therapy/therapyData";

defineProps<{ fieldConfig: FormFieldConfig }>();

const model = defineModel<DrilldownValue>({
	default: () => ({ selected: "", checked: [] }),
});

const { t } = useI18n();
const { therapyTypeOptions } = useTherapyTypes();

const selectedTherapy = computed({
	get: () => model.value.selected,
	// Changing therapy clears the previously-checked objectives — mirrors the
	// old widget so stale objectives from another therapy are never saved.
	set: (val: string) => {
		model.value = { selected: val, checked: [] };
	},
});

const selectedObjectives = computed({
	get: () => model.value.checked,
	set: (val: string[]) => {
		model.value = { selected: model.value.selected, checked: val };
	},
});

const objectivesForSelectedTherapy = computed(() => {
	if (!selectedTherapy.value) return [];
	return objectivesByTherapy[selectedTherapy.value] || [];
});

const objectivesFieldConfig = computed<FormFieldConfig>(() => ({
	name: "selectedObjectives",
	label: t("therapyNote.objectivesByTherapy"),
	type: "checkboxgroup",
	required: true,
	checkboxOptions: objectivesForSelectedTherapy.value.map((item) => {
		if (typeof item === "string") return { value: item, label: item };
		if (item.header) return { header: item.header };
		return { subheader: item.subheader };
	}),
}));
</script>

<template>
	<div class="grid gap-4 md:grid-cols-2">
		<UFormField
			:label="fieldConfig.label"
			:required="fieldConfig.required"
			class="flex flex-col"
		>
			<USelect
				v-model="selectedTherapy"
				:items="therapyTypeOptions"
				:placeholder="t('therapyNote.selectTherapy')"
				class="w-full"
			/>
		</UFormField>

		<TherapyInputsCheckboxGroup
			v-if="selectedTherapy"
			v-model="selectedObjectives"
			:field-config="objectivesFieldConfig"
		/>
		<p v-else class="text-muted text-sm">
			{{ t("therapyNote.selectTherapyFirst") }}
		</p>
	</div>
</template>
