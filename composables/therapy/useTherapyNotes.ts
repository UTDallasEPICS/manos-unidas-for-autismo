import { ref, computed } from "vue";
import { $fetch } from "ofetch";
import type { TherapyNote } from "~/types/FormConfig/TherapyForms/therapyInfo";

interface TherapyNotesResponse {
	data?: TherapyNote[];
}

export function useTherapyNotes(patientId: string | string[]) {
	const therapyNotes = ref<TherapyNote[]>([]);
	const selectedSessionId = ref<string | null>(null);

	async function loadTherapyNotes() {
		const res = await $fetch<TherapyNotesResponse>("/api/session/notes", {
			method: "GET",
			params: { patientId },
		});
		const data = res.data;
		therapyNotes.value = data || [];
	}

	const editingNoteId = ref<number | null>(null);

	const editingNote = computed(() => {
		if (!editingNoteId.value) return null;
		return (
			therapyNotes.value.find((n) => n.id === editingNoteId.value) || null
		);
	});

	function openNewTherapyNote(sessionId?: string) {
		editingNoteId.value = null;
		selectedSessionId.value = sessionId ?? null;
	}

	function openEditTherapyNote(note: { id: number }) {
		editingNoteId.value = note.id;
	}

	return {
		therapyNotes,
		loadTherapyNotes,
		editingNoteId,
		editingNote,
		selectedSessionId,
		openNewTherapyNote,
		openEditTherapyNote,
	};
}
