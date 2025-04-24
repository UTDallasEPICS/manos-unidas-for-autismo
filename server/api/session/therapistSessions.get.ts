import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = z.object({
	userId: z.string(),
	date: z.coerce.date(),
});

const validateSchema = schema.strict();

export default defineEventHandler(async (event) => {
	const validatedQuery = await getValidatedQuery(event, (query) =>
		validateSchema.safeParse(query)
	);
	if (!validatedQuery.success) {
		const zodError = validatedQuery.error?.format();
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request Body",
			data: zodError,
		});
	}
	const { userId, date } = validatedQuery.data;

	// get monday & friday
	const firstDay =
		date.getDate() - date.getDay() + (date.getDay() == 0 ? -6 : 1);
	const monday = new Date(date.getTime());
	monday.setDate(firstDay);
	const friday = new Date(date.getTime());
	friday.setDate(firstDay + 4);

	// get session using therapistId
	const sessions = await prisma.session.findMany({
		where: {
			time: {
				gte: friday,
				lte: monday,
			},
			therapistId: userId,
		},
	});

	return sessions;
});
