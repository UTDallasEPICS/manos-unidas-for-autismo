// server/api/session/[id]/reports.get.ts
import { AccessPermission } from "~/types/permissions";

export default defineAuthedHandler(
	{
		access: [AccessPermission.THERAPIST, AccessPermission.USER_SERVICE],
		// PHI: only staff who may manage the session (USER_SERVICE / ADMIN) or
		// the therapist who owns it can read its reports.
		ownership: async (event) => {
			const sessionId = getRouterParam(event, "id");
			if (!sessionId) return false;
			return canManageSession(event, sessionId);
		},
	},
	async (event) => {
		const sessionId = getRouterParam(event, "id");
		if (!sessionId) return [];

		return await prisma.therapyReport.findMany({
			where: { sessionId },
			orderBy: { createdAt: "desc" },
		});
	}
);
