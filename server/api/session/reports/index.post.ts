import { z } from "zod";
import { getMissingRequiredFields } from "~/composables/form/useRequestValidation";
import { AccessPermission } from "~/types/permissions";

const therapyReportSchema = z.object({
	patientId: z.string().min(1),
	sessionId: z.string().optional().nullable(),
	testsUsed: z.string().min(1),
	diagnosis: z.string().min(1),
});

export default defineAuthedHandler(
	{
		access: [AccessPermission.THERAPIST, AccessPermission.ADMIN],
		ownership: async (event) => {
			if (event.context.permissions[AccessPermission.ADMIN]) return true;
			const data = await validateBody(event, therapyReportSchema);
			return isAssignedTherapist(event, data.patientId);
		},
	},
	async (event) => {
		const data = await validateBody(event, therapyReportSchema);

		const missing = getMissingRequiredFields(data, [
			"patientId",
			"testsUsed",
			"diagnosis",
		]);
		if (missing.length > 0) {
			throw createError({
				statusCode: 400,
				statusMessage: `Missing required fields: ${missing.join(", ")}`,
			});
		}

		// Integrity: a report may only be attached to a session the patient
		// actually attends, same guard as therapy notes.
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
				throw createError({
					statusCode: 400,
					statusMessage: "Session does not include this patient.",
				});
			}
		}

		// The submitting therapist is always the authenticated user, never a
		// client-supplied id.
		const therapistId = event.context.user!.id;

		try {
			return await prisma.therapyReport.create({
				data: {
					patientId: data.patientId,
					sessionId: data.sessionId || null,
					testsUsed: data.testsUsed,
					diagnosis: data.diagnosis,
					therapistId,
				},
			});
		} catch (e) {
			handlePrismaError(e);
		}
	}
);
