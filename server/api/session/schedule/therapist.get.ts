import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const schema = z.object({
	userId: z.string(),
	date: z.coerce.date(),
});

const validateSchema = schema.strict();

export default defineAuthedHandler(
	{
		access: AccessPermission.THERAPIST,
		// Sessions carry nested patient PHI, so gate on clinical staff
		// (USER_SERVICE|EVALUATOR|ADMIN, NOT IT_SERVICE) or the therapist viewing
		// their own schedule.
		ownership: async (event) => {
			const { userId } = await validateQuery(event, validateSchema);
			if (hasClinicalPatientAccess(event)) return true;
			return isSelf(event, userId);
		},
	},
	async (event) => {
		const { userId, date } = await validateQuery(event, validateSchema);

		const { monday, saturday } = getWeekBounds(date);

		const sessions = await prisma.session.findMany({
			where: {
				time: { gte: monday, lt: saturday },
				therapistId: userId,
			},
			include: sessionWithDetailsInclude,
		});

		return sessions;
	}
);
