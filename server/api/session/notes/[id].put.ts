import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const therapyNoteUpdateSchema = z.object({
	therapyTypes: z.array(z.string()).min(1),
	goalsAchieved: z.string().optional().nullable(),
	progressNotes: z.string().optional().nullable(),
	nextSessionObjectives: z.string().optional().nullable(),
	generalObservations: z.string().optional().nullable(),
	...therapyNoteOptionalFields,
});

export default defineAuthedHandler(
	{
		access: [AccessPermission.THERAPIST, AccessPermission.ADMIN],
		ownership: async (event) => {
			if (event.context.permissions[AccessPermission.ADMIN]) {
				return true;
			}

			const idParam = getRouterParam(event, "id");
			if (!idParam) return false;
			const noteId = Number(idParam);
			if (Number.isNaN(noteId)) return false;
			const note = await prisma.therapyNote.findUnique({
				where: { id: noteId },
				select: { patientId: true },
			});
			if (!note) return false;
			return isAssignedTherapist(event, note.patientId);
		},
	},
	async (event) => {
		const idParam = getRouterParam(event, "id");
		if (!idParam) {
			throw createError({
				statusCode: 400,
				statusMessage: "Missing note id",
			});
		}
		const noteId = Number(idParam);

		const data = await validateBody(event, therapyNoteUpdateSchema);

		// 1) Update note fields
		const note = await prisma.therapyNote.update({
			where: { id: noteId },
			data: {
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

				goalsAchieved: data.goalsAchieved ?? null,
				goalsAchievedDate: parseDateOrNull(data.goalsAchievedDate),

				progressNotes: data.progressNotes ?? null,
				progressNotesDate: parseDateOrNull(data.progressNotesDate),

				nextSessionObjectives: data.nextSessionObjectives ?? null,
				nextSessionObjectivesDate: parseDateOrNull(
					data.nextSessionObjectivesDate
				),

				incidents: data.incidents ?? null,
				incidentsDate: parseDateOrNull(data.incidentsDate),

				generalObservations: data.generalObservations ?? null,
				generalObservationsDate: parseDateOrNull(
					data.generalObservationsDate
				),
			},
		});

		// 2) Replace objectives (simple strategy)
		await prisma.therapyNoteObjective.deleteMany({
			where: { therapyNoteId: noteId },
		});

		if (data.objectives && data.objectives.length > 0) {
			await prisma.therapyNoteObjective.createMany({
				data: data.objectives.map((obj) => ({
					therapyNoteId: noteId,
					goalKey: obj.goalKey ?? null,
					goalLabel: obj.goalLabel,
					details: obj.details ?? null,
				})),
			});
		}

		// 3) Replace therapy types (same strategy as objectives)
		await prisma.therapyNoteType.deleteMany({
			where: { therapyNoteId: noteId },
		});
		await prisma.therapyNoteType.createMany({
			data: data.therapyTypes.map((therapyType) => ({
				therapyNoteId: noteId,
				therapyType,
			})),
		});

		return {
			success: true,
			data: { ...note, therapyTypes: data.therapyTypes },
		};
	}
);
