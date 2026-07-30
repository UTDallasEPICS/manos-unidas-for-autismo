import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const paramSchema = z.object({ id: z.coerce.number().int().positive() });

// Returns a single intake request (contact + patient + requested services). This
// is request PII consumed by the intake form, so gate to USER_SERVICE (ADMIN
// inherits) — the same role that reviews the request queue.
export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async (event) => {
		const parsed = paramSchema.safeParse({
			id: getRouterParam(event, "id"),
		});
		if (!parsed.success) {
			throw createError({
				statusCode: 400,
				statusMessage: "Invalid request ID",
			});
		}

		const request = await prisma.request.findUnique({
			where: { id: parsed.data.id },
			include: {
				phone: true,
				therapies: true,
				complementaryServices: true,
				workshops: true,
			},
		});

		if (!request) {
			throw createError({
				statusCode: 404,
				statusMessage: "Request not found",
			});
		}

		return request;
	}
);
