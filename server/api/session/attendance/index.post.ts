import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const addPatientSchema = z.object({
	sessionId: z.string().uuid(),
	patientId: z.string().uuid(),
	paid: z.boolean().optional().default(false),
});

export default defineAuthedHandler(
	{
		access: [AccessPermission.THERAPIST, AccessPermission.USER_SERVICE],
		// A therapist may only modify the roster/billing of their OWN session.
		ownership: async (event) => {
			const { sessionId } = await validateBody(event, addPatientSchema);
			return canManageSession(event, sessionId);
		},
	},
	async (event) => {
		const { sessionId, patientId, paid } = await validateBody(
			event,
			addPatientSchema
		);

		//Find session's current count
		const currentCount = await prisma.sessionPatient.count({
			where: { sessionId },
		});

		//Find session's max count
		const session = await prisma.session.findUnique({
			where: { id: sessionId },
			select: { maxAttendance: true },
		});

		if (!session) {
			throw createError({
				statusCode: 404,
				statusMessage: "Session not found",
			});
		}

		if (currentCount >= session.maxAttendance) {
			throw createError({
				statusCode: 400,
				statusMessage: "Session has reached max attendance",
			});
		}

		try {
			const entry = await prisma.sessionPatient.create({
				data: { sessionId, patientId, paid },
			});
			return entry;
		} catch (error: unknown) {
			if (error && typeof error === "object" && "code" in error) {
				const prismaError = error as { code: string };

				if (prismaError.code === "P2025") {
					throw createError({
						statusCode: 404,
						statusMessage: "Appointment not found.",
					});
				}

				if (prismaError.code === "P2002") {
					throw createError({
						statusCode: 409,
						statusMessage: "Patient is already in this session.",
					});
				}
			}

			throw createError({
				statusCode: 500,
				statusMessage: "An unexpected error occurred.",
			});
		}
	}
);
