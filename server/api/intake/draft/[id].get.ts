import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const paramSchema = z.object({ id: z.coerce.number().int().positive() });

// Loads a saved intake draft (the JSON form blob) by request id. Same audience
// as the rest of the intake flow.
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

		const draft = await prisma.intakeDraft.findUnique({
			where: { requestId: parsed.data.id },
		});

		return draft ? JSON.parse(draft.data) : null;
	}
);
