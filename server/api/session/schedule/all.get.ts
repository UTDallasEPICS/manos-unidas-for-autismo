import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const schema = z.object({
	start: z.coerce.date(),
	end: z.coerce.date(),
	filter: z.string().array().optional(),
});

const validateSchema = schema.strict();

export default defineAuthedHandler(
	{ access: [AccessPermission.USER_SERVICE, AccessPermission.EVALUATOR] },
	async (event) => {
		// coerce single filter string to array before validation
		const query = getQuery(event);
		if (typeof query.filter == "string") {
			query.filter = [query.filter];
		}

		const { start, end, filter } = validateSchema.parse(query);

		const constructedFilter = (filter ?? []).map((f) => ({ typeId: f }));

		const sessions = await prisma.session.findMany({
			where: {
				time: { gte: start, lt: end },
				NOT: { OR: constructedFilter },
			},
			include: sessionWithDetailsInclude,
		});
		return sessions;
	}
);
