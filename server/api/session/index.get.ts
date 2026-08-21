import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const schema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async (event) => {
		const query = await validateQuery(event, schema);

		const where: Record<string, unknown> = {};

		if (query.startDate || query.endDate) {
			const time: { gte?: Date; lt?: Date } = {};
			if (query.startDate) time.gte = new Date(query.startDate);
			if (query.endDate) {
				// endDate is an inclusive calendar day (YYYY-MM-DD). Use an
				// exclusive upper bound at the start of the NEXT day so sessions
				// later than midnight on the last day aren't dropped.
				const next = new Date(query.endDate);
				next.setDate(next.getDate() + 1);
				time.lt = next;
			}
			where.time = time;
		}

		return await prisma.session.findMany({
			where,
			include: sessionWithDetailsInclude,
			orderBy: { time: "desc" },
		});
	}
);
