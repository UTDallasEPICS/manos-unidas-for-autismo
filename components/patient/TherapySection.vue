<template>
	<!-- Session List -->
	<div v-if="can('THERAPIST') || can('ADMIN')" class="mb-6 py-4">
		<div class="mb-2 flex items-center justify-between">
			<h3 class="text-lg font-semibold">
				{{ $t("profile.appointments") }}
			</h3>
		</div>

		<!-- Mobile: stacked cards (the 5-column table overflows on phones) -->
		<div class="flex flex-col gap-2 sm:hidden">
			<p v-if="!sessions.length" class="text-muted text-sm">
				{{ t("profile.noAppointments") }}
			</p>
			<div
				v-for="row in sessions"
				:key="row.id"
				class="border-default rounded-lg border p-3"
			>
				<div class="text-highlighted text-sm font-medium">
					{{ formatSessionTime(row.time) }}
				</div>
				<div class="text-muted mt-0.5 text-sm">
					{{ row.Type?.name ?? "—" }} ·
					{{
						[row.Therapist?.fName, row.Therapist?.lName]
							.filter(Boolean)
							.join(" ") || "—"
					}}
				</div>
				<div class="mt-2 flex flex-wrap gap-2">
					<template v-if="row.TherapyNotes?.length">
						<UButton
							size="xs"
							color="success"
							variant="soft"
							icon="i-lucide-eye"
							@click="
								handleOpenNoteFromSession(row.TherapyNotes[0])
							"
						>
							{{ t("profile.columns.viewNote") }}
						</UButton>
						<UButton
							size="xs"
							color="primary"
							variant="soft"
							@click="
								handleEditNoteFromSession(row.TherapyNotes[0])
							"
						>
							{{ t("profile.columns.editNote") }}
						</UButton>
					</template>
					<UButton
						v-else
						size="xs"
						variant="soft"
						@click="handleNewNoteForSession(row)"
					>
						{{ t("profile.columns.addNote") }}
					</UButton>
				</div>
			</div>
		</div>

		<!-- Desktop: full table (scrolls horizontally if it must) -->
		<div class="hidden overflow-x-auto sm:block">
			<UTable :data="sessions" :columns="sessionColumns">
				<template #time-cell="{ row }">
					{{ formatSessionTime(row.original.time) }}
				</template>

				<template #type-cell="{ row }">
					{{ row.original.Type?.name ?? "—" }}
				</template>

				<template #therapist-cell="{ row }">
					{{ row.original.Therapist?.fName }}
					{{ row.original.Therapist?.lName }}
				</template>

				<template #note-cell="{ row }">
					<UButton
						v-if="row.original.TherapyNotes?.length"
						size="xs"
						color="success"
						variant="soft"
						icon="i-lucide-eye"
						@click="
							handleOpenNoteFromSession(
								row.original.TherapyNotes[0]
							)
						"
					>
						{{ t("profile.columns.viewNote") }}
					</UButton>
					<span v-else class="text-sm text-gray-400">
						{{ t("profile.columns.noNote") }}
					</span>
				</template>

				<template #actions-cell="{ row }">
					<UButton
						v-if="row.original.TherapyNotes?.length"
						size="xs"
						color="primary"
						variant="soft"
						@click="
							handleEditNoteFromSession(
								row.original.TherapyNotes[0]
							)
						"
					>
						{{ t("profile.columns.editNote") }}
					</UButton>
					<UButton
						v-else
						size="xs"
						variant="soft"
						@click="handleNewNoteForSession(row.original)"
					>
						{{ t("profile.columns.addNote") }}
					</UButton>
				</template>
			</UTable>
		</div>
	</div>

	<!-- Therapy Notes history -->
	<TherapyNotesHistory
		v-if="can('THERAPIST') || can('ADMIN')"
		:notes="therapyNotes"
		@open-note="handleOpenNote"
		@edit-note="handleEditNote"
	/>

	<!-- Modals -->
	<RecommendationsModal
		v-model="modals.recommendations"
		:recommendations="recommendations"
		@view-recommendation="viewRecommendation"
	/>

	<TherapyReportModal
		v-model="modals.progressReport"
		:patient-id="patientId"
		:editing-note="editingNote ?? undefined"
		@save="handleProgressReportSave"
	/>

	<TherapyViewNoteModal v-model="modals.viewNote" :note="activeNote" />
</template>

<script setup lang="ts">
import type { TherapyNote, Recommendation } from "~/types/formTypes";
const { t, locale } = useI18n();
const toast = useToast();

const props = defineProps<{
	patientId: string;
}>();

const { can } = useAccess();
const canViewSessions = computed(() => can("THERAPIST") || can("ADMIN"));
const {
	therapyNotes,
	loadTherapyNotes,
	editingNoteId,
	editingNote,
	selectedSessionId,
	openNewTherapyNote,
	openEditTherapyNote,
} = useTherapyNotes(props.patientId);
const { saveTherapyNote } = useTherapyNoteForm();
const { modals, openModal, closeModal } = useModalToggle(
	"recommendations",
	"progressReport",
	"viewNote"
);

defineExpose({ openRecommendationsModal, handleNewNote });

const activeNote = ref<TherapyNote | null>(null);
const recommendations = ref<Recommendation[]>([]);
const selectedSessionTime = ref<string | null>(null);

// Fetch sessions for this patient. Only therapists/admins may hit this
// endpoint — skip the request (and its 403) for every other profile viewer.
const { data: sessions } = await useFetch("/api/profile/sessions", {
	query: { patientId: props.patientId },
	default: () => [],
	immediate: canViewSessions.value,
});

const sessionColumns = computed(() => [
	{
		id: "time",
		accessorKey: "time",
		header: t("profile.columns.dateTime"),
	},
	{
		id: "type",
		header: t("profile.columns.type"),
	},
	{
		id: "therapist",
		header: t("profile.columns.therapist"),
	},
	{
		id: "note",
		header: t("profile.columns.note"),
	},
	{
		id: "actions",
		header: t("profile.columns.actions"),
	},
]);

function formatSessionTime(timeValue: unknown): string {
	if (!timeValue) return "—";

	try {
		const date = new Date(timeValue as string | number | Date);
		if (isNaN(date.getTime())) return "—";

		// Safely extract string locale ('en', 'es', etc.) regardless of i18n version
		const lang = typeof locale.value === "string" ? locale.value : "en";

		const dateStr = date.toLocaleDateString(lang);
		const timeStr = date.toLocaleTimeString(lang, {
			hour: "2-digit",
			minute: "2-digit",
		});

		return `${dateStr} ${timeStr}`;
	} catch (err) {
		console.error("Error formatting date:", err);
		return "—";
	}
}

// --- Init ---
onMounted(() => {
	loadTherapyNotes();
});

// --- Exposed for parent to call ---
function openRecommendationsModal() {
	recommendations.value = therapyNotes.value
		.filter((note) => note.familyRecommendations)
		.sort(
			(a, b) =>
				new Date(String(b.familyRecommendationsDate)).getTime() -
				new Date(String(a.familyRecommendationsDate)).getTime()
		)
		.map((note) => ({
			id: note.id,
			familyRecommendations: String(note.familyRecommendations),
			familyRecommendationsDate: String(note.familyRecommendationsDate),
		}));
	openModal("recommendations");
}

function handleNewNote() {
	openNewTherapyNote();
	openModal("progressReport");
}

function handleNewNoteForSession(session: { id: string; time: string }) {
	openNewTherapyNote(session.id);
	selectedSessionTime.value = session.time;
	openModal("progressReport");
}

// --- Internal handlers ---
function viewRecommendation(note: Recommendation) {
	const fullNote = therapyNotes.value.find((n) => n.id === note.id);
	if (fullNote) handleOpenNote(fullNote);
	closeModal("recommendations");
}

function handleOpenNote(note: TherapyNote) {
	activeNote.value = note;
	openModal("viewNote");
}

function handleOpenNoteFromSession(sessionNote: { id: number }) {
	const fullNote = therapyNotes.value.find((n) => n.id === sessionNote.id);
	if (fullNote) {
		handleOpenNote(fullNote);
	}
}

function handleEditNote(note: TherapyNote) {
	openEditTherapyNote(note);
	openModal("progressReport");
}

function handleEditNoteFromSession(sessionNote: { id: number }) {
	const fullNote = therapyNotes.value.find((n) => n.id === sessionNote.id);
	if (fullNote) {
		handleEditNote(fullNote);
	}
}

async function handleProgressReportSave(formData: Record<string, unknown>) {
	const result = await saveTherapyNote(
		formData,
		props.patientId,
		editingNoteId.value,
		async () => {
			await loadTherapyNotes();
		},
		selectedSessionId.value,
		// Pass the note being edited so unchanged dates keep their original
		// timestamp instead of being re-stamped to "now".
		editingNote.value as Record<string, unknown> | null
	);

	if (result.success) {
		closeModal("progressReport");
		editingNoteId.value = null;
		selectedSessionId.value = null;
		selectedSessionTime.value = null;
	} else {
		toast.add({
			title: t("therapyNote.saveError"),
			description:
				typeof result.error === "string" ? result.error : undefined,
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	}
}
</script>
