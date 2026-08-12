// server/api/session/[id]/notes.get.ts
import { AccessPermission } from "~/types/permissions";

export default defineAuthedHandler(
	{ access: [AccessPermission.THERAPIST, AccessPermission.ADMIN] },
	async (event) => {
		const sessionId = getRouterParam(event, "id");
		if (!sessionId) return [];

		const notes = await prisma.therapyNote.findMany({
			where: { sessionId },
			include: {
				objectives: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return notes;
	}
);
