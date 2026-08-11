<!-- Therapy note create/edit form. Rebuilt on NuxtUI UModal (replaces the deleted
     custom Form engine). Rendering only — all data lives in useTherapyFormData,
     which owns the saved shape, validation and edit-populate. Blueprint fields
     are dispatched by field.type (textarea / date) and bound via
     getFieldValue/setFieldValue exactly as before; the three custom inputs
     (therapy drill-down, objective details, custom goals) keep their v-model
     contracts. Emits save / add-question / update:modelValue; editingNote prop
     drives populate-vs-reset inside the composable. -->
<script setup lang="ts">
import { therapyFormBlueprint } from "~/types/FormConfig";
import { useTherapyFormData } from "~/composables/therapy/useTherapyFormData";
import type {
	FormFieldConfig,
	DrilldownValue,
	ObjectiveDetailsValue,
	CustomGoal,
} from "~/types/FormConfig/formConfig";
import type {
	TherapyNoteForm,
	TherapyNote,
} from "~/types/FormConfig/TherapyForms/therapyInfo";

const props = defineProps<{
	modelValue: boolean;
	editingNote?: TherapyNote;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
	save: [data: TherapyNoteForm];
	"add-question": [];
}>();

const { t } = useI18n();
const toast = useToast();

const {
	formData,
	customInputs,
	getFieldValue,
	setFieldValue,
	isRowVisible,
	validate,
} = useTherapyFormData(
	toRef(props, "modelValue"),
	toRef(props, "editingNote") as Ref<TherapyNote | undefined>
);

function fieldKey(field: FormFieldConfig): string {
	return field.dataKey ? `${field.dataKey}-${field.name}` : field.name;
}

function handleSubmit() {
	if (!validate()) {
		toast.add({
			title: t("therapyNote.validationError"),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
		return;
	}
	emit("save", formData.value);
}
</script>

<template>
	<UModal
		:open="modelValue"
		:title="t('profile.noteTitle')"
		:ui="{ content: 'max-w-3xl' }"
		@update:open="(v: boolean) => emit('update:modelValue', v)"
	>
		<template #body>
			<form
				id="therapy-note-form"
				class="space-y-4"
				@submit.prevent="handleSubmit"
			>
				<!-- Custom inputs (therapy drill-down, objective details, custom goals) -->
				<div v-for="input in customInputs" :key="input.config.name">
					<TherapyInputsTherapyDrilldown
						v-if="input.config.type === 'therapydrilldown'"
						v-model="input.model.value as DrilldownValue"
						:field-config="input.config"
					/>
					<TherapyInputsObjectiveDetails
						v-else-if="input.config.type === 'objectivedetails'"
						v-model="input.model.value as ObjectiveDetailsValue"
						:field-config="input.config"
					/>
					<TherapyInputsCustomGoals
						v-else-if="input.config.type === 'customgoals'"
						v-model="input.model.value as CustomGoal[]"
						:field-config="input.config"
					/>
				</div>

				<!-- Blueprint-driven fields -->
				<div
					v-for="section in therapyFormBlueprint"
					:key="section.sectionTitle"
				>
					<div
						v-for="(row, rowIdx) in section.fields"
						v-show="isRowVisible(row)"
						:key="rowIdx"
						:class="
							row.length > 1
								? 'grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'
								: ''
						"
						class="mb-4"
					>
						<UFormField
							v-for="field in row"
							:key="fieldKey(field)"
							:label="field.label"
							:required="field.required"
						>
							<UTextarea
								v-if="field.type === 'textarea'"
								:model-value="
									(getFieldValue(field) as string) ?? ''
								"
								:placeholder="field.placeholder"
								:rows="3"
								class="w-full"
								@update:model-value="
									setFieldValue(field, $event)
								"
							/>
							<UInput
								v-else-if="field.type === 'date'"
								:model-value="
									(getFieldValue(field) as string) ?? ''
								"
								type="date"
								class="w-full"
								@update:model-value="
									setFieldValue(field, String($event))
								"
							/>
							<UInput
								v-else
								:model-value="
									(getFieldValue(field) as string) ?? ''
								"
								:placeholder="field.placeholder"
								class="w-full"
								@update:model-value="
									setFieldValue(field, String($event))
								"
							/>
						</UFormField>
					</div>
				</div>

				<UButton
					type="button"
					color="neutral"
					variant="outline"
					block
					icon="i-lucide-plus"
					:label="t('therapyNote.addQuestion')"
					@click="emit('add-question')"
				/>
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
					form="therapy-note-form"
					:label="t('profile.save')"
				/>
			</div>
		</template>
	</UModal>
</template>
