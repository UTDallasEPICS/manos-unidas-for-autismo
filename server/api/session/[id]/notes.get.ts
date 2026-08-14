// server/api/session/[id]/notes.get.ts
import { AccessPermission } from "~/types/permissions";

export default defineAuthedHandler(
	{
		access: [AccessPermission.THERAPIST, AccessPermission.USER_SERVICE],
		// PHI: only staff who may manage the session (USER_SERVICE / ADMIN) or
		// the therapist who owns it can read its notes. Prevents a therapist
		// from reading notes for a session they aren't attached to.
		ownership: async (event) => {
			const sessionId = getRouterParam(event, "id");
			if (!sessionId) return false;
			return canManageSession(event, sessionId);
		},
	},
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
