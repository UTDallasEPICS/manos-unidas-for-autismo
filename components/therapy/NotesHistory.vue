<!-- Therapy notes history (therapist view). Lists notes with open/edit actions.
     Rebuilt on NuxtUI. -->
<script setup lang="ts">
import { therapyTypes } from "~/composables/therapy/therapyData";
import type { TherapyNote } from "~/types/formTypes";

defineProps<{ notes: TherapyNote[] }>();

defineEmits<{
	"open-note": [note: TherapyNote];
	"edit-note": [note: TherapyNote];
}>();

const { t } = useI18n();

function formatDate(value?: string | Date | null) {
	return value ? new Date(value).toLocaleString() : "—";
}
</script>

<template>
	<UCard class="mt-6">
		<template #header>
			<h2 class="text-highlighted font-semibold">
				{{ t("profile.therapyNotes") }}
			</h2>
		</template>

		<p v-if="!notes.length" class="text-muted text-sm">
			{{ t("profile.noNotes") }}
		</p>

		<div class="flex flex-col gap-3">
			<div
				v-for="note in notes"
				:key="note.id"
				class="border-default flex items-center justify-between rounded-lg border p-3"
			>
				<div class="min-w-0">
					<p class="text-highlighted text-sm font-medium">
						{{ t("profile.created") }}:
						{{ formatDate(note.createdAt) }}
					</p>
					<p
						v-if="note.updatedAt !== note.createdAt"
						class="text-dimmed text-xs"
					>
						{{ t("profile.updated") }}:
						{{ formatDate(note.updatedAt) }}
					</p>
					<p class="text-muted text-sm">
						{{
							therapyTypes[String(note.therapyType)] ||
							String(note.therapyType)
						}}
					</p>
				</div>
				<div class="flex shrink-0 gap-2">
					<UButton
						size="xs"
						color="neutral"
						variant="outline"
						icon="i-lucide-eye"
						:label="t('profile.open')"
						@click="$emit('open-note', note)"
					/>
					<UButton
						size="xs"
						variant="outline"
						icon="i-lucide-pencil"
						:label="t('profile.edit')"
						@click="$emit('edit-note', note)"
					/>
				</div>
			</div>
		</div>
	</UCard>
</template>
