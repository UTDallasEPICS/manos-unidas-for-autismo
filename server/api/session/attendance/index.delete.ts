import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const removePatientSchema = z.object({
	sessionId: z.string().uuid(),
	patientId: z.string().uuid(),
});

export default defineAuthedHandler(
	{ access: [AccessPermission.THERAPIST, AccessPermission.USER_SERVICE] },
	async (event) => {
		const { sessionId, patientId } = await validateBody(
			event,
			removePatientSchema
		);

		try {
			await prisma.sessionPatient.delete({
				where: { sessionId_patientId: { sessionId, patientId } },
			});

			return { message: "Patient removed from session." };
		} catch (error: unknown) {
			if (error && typeof error === "object" && "code" in error) {
				if (error.code === "P2025") {
					throw createError({
						statusCode: 404,
						statusMessage: "Patient is not part of this session.",
					});
				}
			}

			throw createError({
				statusCode: 500,
				statusMessage: "Remove failed.",
			});
		}
	}
);
