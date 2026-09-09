import { $fetch } from "ofetch";

export function useTherapyNoteForm() {
	const { objectiveLabel } = useTherapyTypes();

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
	 * Resolve the timestamp to persist for a dated field. When editing, the
	 * form only carries the date portion (yyyy-mm-dd), so re-saving an unchanged
	 * date would otherwise re-stamp its time to "now" on every update. If the
	 * form date still matches the stored value, keep the original timestamp
	 * exactly; only a new or genuinely changed date gets the current time.
	 */
	function resolveDate(
		formDate: string | null | undefined,
		originalDate: unknown
	): string | null {
		if (!formDate) return null;
		if (originalDate) {
			const original = new Date(originalDate as string | number | Date);
			if (
				!isNaN(original.getTime()) &&
				original.toISOString().slice(0, 10) === formDate
			) {
				return original.toISOString();
			}
		}
		return dateStringWithCurrentTime(formDate);
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
		sessionId?: string | null,
		originalNote?: Record<string, unknown> | null
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
				goalLabel: objectiveLabel(key),
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
			therapyTypes: formData.selectedTherapies,
			objectives: objectivesPayload,
			objectivesDate: resolveDate(
				formData.objectivesDate as string,
				originalNote?.objectivesDate
			),
			reinforcersUsed: reinforcers.value || null,
			reinforcersDate: resolveDate(
				reinforcers.date,
				originalNote?.reinforcersDate
			),
			familyRecommendations: famRecs.value || null,
			familyRecommendationsDate: resolveDate(
				famRecs.date,
				originalNote?.familyRecommendationsDate
			),
			groupRecommendationParents:
				(formData.groupRecommendationParents as string) || null,
			goalsAchieved: goalsAchieved.value || null,
			goalsAchievedDate: resolveDate(
				goalsAchieved.date,
				originalNote?.goalsAchievedDate
			),
			progressNotes: progressNotes.value || null,
			progressNotesDate: resolveDate(
				progressNotes.date,
				originalNote?.progressNotesDate
			),
			nextSessionObjectives: nextSeshObjectives.value || null,
			nextSessionObjectivesDate: resolveDate(
				nextSeshObjectives.date,
				originalNote?.nextSessionObjectivesDate
			),
			incidents: incidents.value || null,
			incidentsDate: resolveDate(
				incidents.date,
				originalNote?.incidentsDate
			),
			generalObservations: observations.value || null,
			generalObservationsDate: resolveDate(
				observations.date,
				originalNote?.generalObservationsDate
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
