<!-- Read-only therapy-note viewer. Rebuilt on NuxtUI (UModal). Self-contained:
     no longer depends on the Form engine / FormConfig. -->
<script setup lang="ts">
import type { TherapyNote } from "~/types/formTypes";

type NoteField = { key: string; label: string; dateKey?: string };

const props = defineProps<{
	modelValue: boolean;
	note: TherapyNote | null;
}>();

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const { t } = useI18n();
const { therapyTypeLabel } = useTherapyTypes();

const open = computed({
	get: () => props.modelValue,
	set: (v) => emit("update:modelValue", v),
});

const noteFields = computed<NoteField[]>(() => [
	{ key: "otherTherapies", label: t("profile.otherTherapies") },
	{
		key: "reinforcersUsed",
		label: t("profile.reinforcersUsed"),
		dateKey: "reinforcersDate",
	},
	{
		key: "familyRecommendations",
		label: t("profile.recommendations"),
		dateKey: "familyRecommendationsDate",
	},
	{
		key: "groupRecommendationParents",
		label: t("profile.groupRecommendation"),
	},
	{
		key: "goalsAchieved",
		label: t("profile.goalsAchieved"),
		dateKey: "goalsAchievedDate",
	},
	{
		key: "progressNotes",
		label: t("profile.progressNotes"),
		dateKey: "progressNotesDate",
	},
	{
		key: "nextSessionObjectives",
		label: t("profile.nextSessionObjectives"),
		dateKey: "nextSessionObjectivesDate",
	},
	{
		key: "incidents",
		label: t("profile.incidents"),
		dateKey: "incidentsDate",
	},
	{
		key: "generalObservations",
		label: t("profile.generalObservations"),
		dateKey: "generalObservationsDate",
	},
]);

const noteRec = computed(
	() => (props.note ?? {}) as unknown as Record<string, string | undefined>
);

function formatDate(value?: string | Date | null) {
	if (!value) return t("profile.noDate");
	const d = new Date(value);
	return isNaN(d.getTime()) ? t("profile.noDate") : d.toLocaleString();
}
</script>

<template>
	<UModal v-model:open="open" :title="t('profile.noteTitle')">
		<template #body>
			<div v-if="note" class="space-y-3 text-sm">
				<p>
					<span class="text-muted"
						>{{ t("profile.createdAt") }}:</span
					>
					{{ formatDate(note.createdAt) }}
				</p>
				<p v-if="note.updatedAt && note.updatedAt !== note.createdAt">
					<span class="text-muted"
						>{{ t("profile.updatedAt") }}:</span
					>
					{{ formatDate(note.updatedAt) }}
				</p>
				<p>
					<span class="text-muted">{{ t("profile.therapy") }}:</span>
					{{ therapyTypeLabel(note.therapyType) }}
				</p>

				<div v-if="note.objectives?.length">
					<p class="text-muted">
						{{ t("profile.objectivesWorked") }}
						<span v-if="note.objectivesDate">
							({{ formatDate(note.objectivesDate) }})
						</span>
					</p>
					<ul class="ml-4 list-disc">
						<li v-for="o in note.objectives" :key="o.id">
							<span class="text-highlighted font-medium">
								{{ o.goalLabel }}
							</span>
							<span v-if="o.details"> – {{ o.details }}</span>
						</li>
					</ul>
				</div>

				<template v-for="field in noteFields" :key="field.key">
					<p v-if="noteRec[field.key]">
						<span class="text-muted">
							{{ field.label }}
							<span
								v-if="field.dateKey && noteRec[field.dateKey]"
							>
								({{ formatDate(noteRec[field.dateKey]) }})
							</span>
							:
						</span>
						{{ noteRec[field.key] }}
					</p>
				</template>
			</div>
		</template>

		<template #footer>
			<div class="flex w-full justify-end">
				<UButton
					color="neutral"
					variant="outline"
					:label="t('profile.close')"
					@click="open = false"
				/>
			</div>
		</template>
	</UModal>
</template>
