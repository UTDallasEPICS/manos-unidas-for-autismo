import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const therapyNoteSchema = z.object({
	patientId: z.string(),
	therapyType: z.string(),
	sessionId: z.string().optional().nullable(),
	submitterID: z.number().int().optional().nullable(),
	submitterId: z.number().int().optional().nullable(),
	goalsAchieved: z.string().min(1, "Goals Achieved is required"),
	progressNotes: z.string().min(1, "Progress Notes is required"),
	nextSessionObjectives: z
		.string()
		.min(1, "Objectives for next session is required"),
	generalObservations: z.string().min(1, "General Observations is required"),
	...therapyNoteOptionalFields,
});

export default defineAuthedHandler(
	{
		access: [AccessPermission.THERAPIST, AccessPermission.ADMIN],
		ownership: async (event) => {
			if (event.context.permissions[AccessPermission.ADMIN]) {
				return true;
			}
			const data = await validateBody(event, therapyNoteSchema);
			return isAssignedTherapist(event, data.patientId);
		},
	},
	async (event) => {
		const data = await validateBody(event, therapyNoteSchema);
		// at least one objective required
		if (!data.objectives || data.objectives.length === 0) {
			event.node.res.statusCode = 400;
			return {
				success: false,
				error: "At least one objective or custom goal is required.",
			};
		}

		// Integrity: a note may only be attached to a session the patient
		// actually attends. Guards against a note being mis-attributed to an
		// unrelated (e.g. another therapist's) session via a crafted request.
		if (data.sessionId) {
			const onRoster = await prisma.sessionPatient.findUnique({
				where: {
					sessionId_patientId: {
						sessionId: data.sessionId,
						patientId: data.patientId,
					},
				},
				select: { sessionId: true },
			});
			if (!onRoster) {
				event.node.res.statusCode = 400;
				return {
					success: false,
					error: "Session does not include this patient.",
				};
			}
		}

		// 1) Create TherapyNote
		const note = await prisma.therapyNote.create({
			data: {
				patientId: data.patientId,
				therapyType: data.therapyType,
				sessionId: data.sessionId ?? null,
				submitterId: data.submitterID ?? data.submitterId ?? null,

				otherTherapies: data.otherTherapies ?? null,

				objectivesDate: parseDateOrNull(data.objectivesDate),

				reinforcersUsed: data.reinforcersUsed ?? null,
				reinforcersDate: parseDateOrNull(data.reinforcersDate),

				familyRecommendations: data.familyRecommendations ?? null,
				familyRecommendationsDate: parseDateOrNull(
					data.familyRecommendationsDate
				),

				groupRecommendationParents:
					data.groupRecommendationParents ?? null,

				goalsAchieved: data.goalsAchieved,
				goalsAchievedDate: parseDateOrNull(data.goalsAchievedDate),

				progressNotes: data.progressNotes,
				progressNotesDate: parseDateOrNull(data.progressNotesDate),

				nextSessionObjectives: data.nextSessionObjectives,
				nextSessionObjectivesDate: parseDateOrNull(
					data.nextSessionObjectivesDate
				),

				incidents: data.incidents ?? null,
				incidentsDate: parseDateOrNull(data.incidentsDate),

				generalObservations: data.generalObservations,
				generalObservationsDate: parseDateOrNull(
					data.generalObservationsDate
				),
			},
		});

		// 2) Create multiple objectives
		if (data.objectives && data.objectives.length > 0) {
			await prisma.therapyNoteObjective.createMany({
				data: data.objectives.map((obj) => ({
					therapyNoteId: note.id,
					goalKey: obj.goalKey ?? null,
					goalLabel: obj.goalLabel,
					details: obj.details ?? null,
				})),
			});
		}

		return {
			success: true,
			data: note,
		};
	}
);
