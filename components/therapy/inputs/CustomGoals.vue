<!-- Free-form "other goals" list (name + details per goal). Migrated from the
     deleted Form/Input/CustomGoals.vue. Model is a CustomGoal[] with the same
     id/label/details shape and add/remove/update semantics, so the saved
     customGoals array is byte-for-byte the same as before. -->
<script setup lang="ts">
import type {
	FormFieldConfig,
	CustomGoal,
} from "~/types/FormConfig/formConfig";

defineProps<{ fieldConfig: FormFieldConfig }>();

const model = defineModel<CustomGoal[]>({ default: () => [] });

const { t } = useI18n();

const nextId = ref(1);

watch(
	model,
	(g) => {
		const maxId = (g ?? []).reduce((max, cg) => Math.max(max, cg.id), 0);
		if (maxId >= nextId.value) nextId.value = maxId + 1;
	},
	{ immediate: true }
);

function addGoal() {
	model.value = [
		...model.value,
		{ id: nextId.value++, label: "", details: "" },
	];
}

function removeGoal(id: number) {
	model.value = model.value.filter((cg) => cg.id !== id);
}

function updateGoal(id: number, field: "label" | "details", val: string) {
	model.value = model.value.map((cg) =>
		cg.id === id ? { ...cg, [field]: val } : cg
	);
}
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-default block text-sm font-medium">
				{{ fieldConfig.label }}
				<span v-if="fieldConfig.required" class="text-error">*</span>
			</label>
			<UButton
				type="button"
				color="neutral"
				variant="link"
				size="xs"
				icon="i-lucide-plus"
				:label="t('therapyNote.addOtherGoal')"
				@click="addGoal"
			/>
		</div>
		<div v-if="model.length" class="space-y-3">
			<div
				v-for="cg in model"
				:key="cg.id"
				class="border-default space-y-2 rounded-md border p-2"
			>
				<div class="flex items-center gap-2">
					<UInput
						:model-value="cg.label"
						type="text"
						class="w-full"
						:placeholder="t('therapyNote.goalNamePlaceholder')"
						@update:model-value="
							updateGoal(cg.id, 'label', String($event))
						"
					/>
					<UButton
						type="button"
						color="error"
						variant="link"
						size="xs"
						:label="t('therapyNote.remove')"
						@click="removeGoal(cg.id)"
					/>
				</div>
				<UTextarea
					:model-value="cg.details"
					:rows="2"
					class="w-full"
					:placeholder="t('therapyNote.goalDetailsPlaceholder')"
					@update:model-value="
						updateGoal(cg.id, 'details', String($event))
					"
				/>
			</div>
		</div>
		<p v-else class="text-muted text-sm">
			{{ t("therapyNote.addGoalHint") }}
		</p>
	</div>
</template>
