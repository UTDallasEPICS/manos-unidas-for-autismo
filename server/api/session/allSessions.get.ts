import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = z.object({
	date: z.coerce.date(),
	filter: z.array(z.string()).optional(),
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
	//const { date, filter } = validatedQuery.data;
	const { date } = validatedQuery.data;

	// get monday & friday
	const firstDay =
		date.getDate() - date.getDay() + (date.getDay() == 0 ? -6 : 1);
	const monday = new Date(date.getTime());
	monday.setDate(firstDay);
	monday.setHours(0, 0, 0, 0);
	const friday = new Date(date.getTime());

	// needs to be set to friday later
	friday.setDate(firstDay + 6);
	//friday.setDate(firstDay + 4);
	friday.setHours(0, 0, 0, 0);

	console.log("for: " + date);

	// if there are filters
	const sessions = await prisma.session.findMany({
		where: {
			time: {
				gte: monday,
				lte: friday,
			},
			// typeId: {
			// 	hasSome: filter,
			// },
		},
	});

	return sessions;
});
