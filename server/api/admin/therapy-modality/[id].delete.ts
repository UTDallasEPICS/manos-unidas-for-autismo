import { AccessPermission } from "~/types/permissions";

// Delete a therapy modality (objectives cascade). ADMIN-only. Existing
// TherapyNotes store the type key + objective text as plain strings, so they are
// unaffected — deactivating is usually preferable to deleting.
export default defineAuthedHandler(
	{ access: AccessPermission.ADMIN },
	async (event) => {
		const id = getRouterParam(event, "id");
		if (!id) {
			throw createError({ statusCode: 400, statusMessage: "Missing id" });
		}
		try {
			await prisma.therapyModality.delete({ where: { id } });
			return { ok: true };
		} catch (e) {
			handlePrismaError(e);
		}
	}
);
