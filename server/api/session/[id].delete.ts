import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const idSchema = z.string().uuid();

export default defineAuthedHandler(
	{ access: [AccessPermission.USER_SERVICE, AccessPermission.ADMIN] },
	async (event) => {
		const idParam = getRouterParam(event, "id");
		if (!idParam) {
			throw createError({ statusCode: 400, statusMessage: "Missing id" });
		}
		const id = idSchema.parse(idParam);

		const attendeeCount = await prisma.sessionPatient.count({
			where: { sessionId: id },
		});
		if (attendeeCount > 0) {
			throw createError({
				statusCode: 400,
				statusMessage:
					"Remove all patients from this session before deleting it.",
			});
		}

		try {
			await prisma.session.delete({ where: { id } });
			return { message: "Session deleted." };
		} catch (error) {
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				error.code === "P2025"
			) {
				throw createError({
					statusCode: 404,
					statusMessage: "Session not found.",
				});
			}
			throw createError({
				statusCode: 500,
				statusMessage: "Unexpected error deleting session.",
			});
		}
	}
);
