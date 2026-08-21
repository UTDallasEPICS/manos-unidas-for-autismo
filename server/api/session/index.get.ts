import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const schema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	therapistId: z.string().optional(),
	typeId: z.string().optional(),
});

export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async (event) => {
		const query = await validateQuery(event, schema);

		const where: Record<string, unknown> = {};

		if (query.startDate || query.endDate) {
			where.time = {
				...(query.startDate && { gte: new Date(query.startDate) }),
				...(query.endDate && { lte: new Date(query.endDate) }),
			};
		}

		if (query.therapistId) {
			where.therapistId = query.therapistId;
		}

		if (query.typeId) {
			where.typeId = query.typeId;
		}

		return await prisma.session.findMany({
			where,
			include: {
				Therapist: true,
				Type: true,
				Patients: {
					include: {
						Patient: {
							include: {
								User: {
									include: {
										User: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: { time: "desc" },
		});
	}
);
