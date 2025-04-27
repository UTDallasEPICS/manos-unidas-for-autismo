import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = z.object({
	date: z.coerce.date(),
	filter: z.string().array().optional(),
});

const validateSchema = schema.strict();

export default defineEventHandler(async (event) => {
	// get query
	const query = getQuery(event);
	if (typeof query.filter == "string") {
		query.filter = [query.filter];
	}

	const validatedQuery = await getValidatedQuery(event, () =>
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
	const { date, filter } = validatedQuery.data;

	// get monday & friday
	const firstDay =
		date.getDate() - date.getDay() + (date.getDay() == 0 ? -6 : 1);
	const monday = new Date(date.getTime());
	monday.setDate(firstDay);
	monday.setHours(0, 0, 0, 0);
	const saturday = new Date(date.getTime());
	saturday.setDate(firstDay + 5);
	saturday.setHours(0, 0, 0, 0);

	// construct the filter object
	const constructedFilter = [];
	if (filter != null || filter != undefined) {
		for (let i = 0; i < filter.length; i++) {
			constructedFilter.push({ typeId: filter[i] });
		}
	}

	const sessions = await prisma.session.findMany({
		where: {
			time: {
				gte: monday,
				lt: saturday,
			},
			NOT: {
				OR: constructedFilter,
			},
		},
		include: {
			Type: true,
			Therapist: true,
		},
	});
	return sessions;
});
