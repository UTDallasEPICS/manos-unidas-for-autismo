import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

// The draft is the in-progress intake form stored verbatim as a JSON blob so
// staff can resume later. We only require a valid request id; the rest of the
// form is free-form and re-validated at submit time.
const draftSchema = z
	.object({
		request: z.object({ id: z.coerce.number().int().positive() }),
	})
	.passthrough();

export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async (event) => {
		const body = await validateBody(event, draftSchema);
		const requestId = body.request.id;

		await prisma.intakeDraft.upsert({
			where: { requestId },
			create: { requestId, data: JSON.stringify(body) },
			update: { data: JSON.stringify(body) },
		});

		return { success: true };
	}
);
