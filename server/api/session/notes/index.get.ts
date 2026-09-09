import { AccessPermission } from "~/types/permissions";

export default defineAuthedHandler(
	{
		access: AccessPermission.STAFF,
		ownership: async (event) => {
			const { patientId } = getQuery(event) as { patientId?: string };
			const p = event.context.permissions;
			if (
				p[AccessPermission.USER_SERVICE] ||
				p[AccessPermission.EVALUATOR] ||
				p[AccessPermission.ADMIN]
			)
				return true;
			if (p[AccessPermission.THERAPIST] && patientId)
				return isAssignedTherapist(event, patientId);
			return false;
		},
	},
	async (event) => {
		const { patientId } = getQuery(event) as { patientId?: string };

		if (!patientId) {
			event.node.res.statusCode = 400;
			return { success: false, error: "patientId is required" };
		}

		const notes = await prisma.therapyNote.findMany({
			where: { patientId: String(patientId) },
			include: {
				objectives: true,
				types: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return {
			success: true,
			data: notes.map(({ types, ...note }) => ({
				...note,
				therapyTypes: types.map((t) => t.therapyType),
			})),
		};
	}
);
