import { $fetch } from "ofetch";

export function useTherapyNoteForm() {
	function dateStringWithCurrentTime(
		dateStr: string | null | undefined
	): string | null {
		if (!dateStr) return null;

		const parts = dateStr.split("-").map(Number);
		if (parts.length !== 3) return null;

		const [year, month, day] = parts;
		if (!year || !month || !day) return null;

		const now = new Date();

		const combined = new Date(
			year,
			month - 1,
			day,
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds()
		);

		return combined.toISOString();
	}

	/**
	 * Maps any form data shape to the API payload and saves.
	 * Accepts Record<string, unknown> for flexibility with component emit types.
	 */
	async function saveTherapyNote(
		formData: Record<string, unknown>,
		patientId: string,
		noteId: number | null,
		onSuccess: () => Promise<void>,
		sessionId?: string | null
	) {
		const reinforcers =
			(formData.reinforcers as Record<string, string>) ?? {};
		const famRecs =
			(formData.familyRecommendations as Record<string, string>) ?? {};
		const progressNotes =
			(formData.progressNotes as Record<string, string>) ?? {};
		const nextSeshObjectives =
			(formData.nextSessionObjectives as Record<string, string>) ?? {};
		const incidents = (formData.incidents as Record<string, string>) ?? {};
		const observations =
			(formData.generalObservations as Record<string, string>) ?? {};
		const goalsAchieved =
			(formData.goalsAchieved as Record<string, string>) ?? {};

		const selectedObjectives =
			(formData.selectedObjectives as string[]) ?? [];
		const objectiveDetails =
			(formData.objectiveDetails as Record<string, string>) ?? {};
		const customGoals =
			(formData.customGoals as Array<{
				id: number;
				label: string;
				details: string;
			}>) ?? [];

		const objectivesPayload: {
			goalKey?: string | null;
			goalLabel: string;
			details?: string | null;
		}[] = [];

		for (const key of selectedObjectives) {
			objectivesPayload.push({
				goalKey: key,
				goalLabel: key,
				details: objectiveDetails[key] || null,
			});
		}

		for (const cg of customGoals) {
			if (!cg.label && !cg.details) continue;
			objectivesPayload.push({
				goalKey: null,
				goalLabel: cg.label || "Other",
				details: cg.details || null,
			});
		}

		const payload = {
			patientId,
			sessionId: sessionId ?? null,
			therapyType: formData.selectedTherapy,
			objectives: objectivesPayload,
			objectivesDate: dateStringWithCurrentTime(
				formData.objectivesDate as string
			),
			reinforcersUsed: reinforcers.value || null,
			reinforcersDate: dateStringWithCurrentTime(reinforcers.date),
			familyRecommendations: famRecs.value || null,
			familyRecommendationsDate: dateStringWithCurrentTime(famRecs.date),
			groupRecommendationParents:
				(formData.groupRecommendationParents as string) || null,
			goalsAchieved: goalsAchieved.value || null,
			goalsAchievedDate: dateStringWithCurrentTime(goalsAchieved.date),
			progressNotes: progressNotes.value || null,
			progressNotesDate: dateStringWithCurrentTime(progressNotes.date),
			nextSessionObjectives: nextSeshObjectives.value || null,
			nextSessionObjectivesDate: dateStringWithCurrentTime(
				nextSeshObjectives.date
			),
			incidents: incidents.value || null,
			incidentsDate: dateStringWithCurrentTime(incidents.date),
			generalObservations: observations.value || null,
			generalObservationsDate: dateStringWithCurrentTime(
				observations.date
			),
		};

		const url = noteId
			? `/api/session/notes/${noteId}`
			: "/api/session/notes";

		const method = noteId ? "PUT" : "POST";

		try {
			await $fetch(url, {
				method,
				body: payload,
				credentials: "include",
			});

			await onSuccess();
			return { success: true };
		} catch (err: unknown) {
			console.error("Error saving therapy note:", err);
			const error = err as {
				data?: { error?: string };
				message?: string;
			};
			const fromApi = error?.data?.error;
			const msg = fromApi || error?.message || "Unknown error";
			return { success: false, error: msg };
		}
	}

	return {
		dateStringWithCurrentTime,
		saveTherapyNote,
	};
}
