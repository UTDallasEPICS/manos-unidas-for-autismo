<!-- Therapy picker + its objectives checklist (drill down). Model is a
     DrilldownValue ({ selected, checked }); `selected` is now a list — a note
     can cover more than one therapy type. Changing the selection resets
     `checked` to [], same as the old single-select behavior, since objectives
     are keyed per therapy type (`${type}::${label}`) and stale keys from a
     removed type would otherwise linger unseen in the saved data. -->
<script setup lang="ts">
import type {
	FormFieldConfig,
	DrilldownValue,
	CheckboxOption,
} from "~/types/FormConfig/formConfig";
import { objectivesByTherapy } from "~/composables/therapy/therapyData";

defineProps<{ fieldConfig: FormFieldConfig }>();

const model = defineModel<DrilldownValue>({
	default: () => ({ selected: [], checked: [] }),
});

const { t } = useI18n();
const { therapyTypeLabel, therapyTypeOptions } = useTherapyTypes();

const selectedTherapies = computed({
	get: () => model.value.selected,
	// Changing the therapy selection clears previously-checked objectives —
	// mirrors the old widget so stale objectives from a removed therapy are
	// never saved.
	set: (val: string[]) => {
		model.value = { selected: val, checked: [] };
	},
});

const selectedObjectives = computed({
	get: () => model.value.checked,
	set: (val: string[]) => {
		model.value = { selected: model.value.selected, checked: val };
	},
});

// Objectives from every selected therapy, grouped under a header per therapy
// so labels that happen to repeat across types (the checklists share a lot of
// content) stay visually and functionally distinct. Each item's checkbox
// value is namespaced `${therapyType}::${label}` so checking "C. Receptive
// Language" under one therapy doesn't collide with the same label under
// another selected therapy.
const objectivesForSelectedTherapies = computed<CheckboxOption[]>(() => {
	const options: CheckboxOption[] = [];
	for (const type of selectedTherapies.value) {
		const items = objectivesByTherapy[type];
		if (!items?.length) continue;
		options.push({ header: therapyTypeLabel(type) });
		for (const item of items) {
			if (typeof item === "string") {
				options.push({ value: `${type}::${item}`, label: item });
			} else if (item.header) {
				options.push({ header: item.header });
			} else {
				options.push({ subheader: item.subheader });
			}
		}
	}
	return options;
});

const objectivesFieldConfig = computed<FormFieldConfig>(() => ({
	name: "selectedObjectives",
	label: t("therapyNote.objectivesByTherapy"),
	type: "checkboxgroup",
	required: true,
	checkboxOptions: objectivesForSelectedTherapies.value,
}));
</script>

<template>
	<div class="grid gap-4 md:grid-cols-2">
		<UFormField
			:label="fieldConfig.label"
			:required="fieldConfig.required"
			class="flex flex-col"
		>
			<USelectMenu
				v-model="selectedTherapies"
				:items="therapyTypeOptions"
				value-key="value"
				multiple
				:placeholder="t('therapyNote.selectTherapy')"
				class="w-full"
			/>
		</UFormField>

		<TherapyInputsCheckboxGroup
			v-if="selectedTherapies.length"
			v-model="selectedObjectives"
			:field-config="objectivesFieldConfig"
		/>
		<p v-else class="text-muted text-sm">
			{{ t("therapyNote.selectTherapyFirst") }}
		</p>
	</div>
</template>
