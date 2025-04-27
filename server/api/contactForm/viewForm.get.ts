import { z } from "zod";
import { PrismaClient } from "@prisma/client";
// import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const schema = z.object({
	term: z.string(),
});

const validateSchema = schema.strict();

export default defineEventHandler(async (event) => {
	const queries = await getValidatedQuery(event, (query) =>
		validateSchema.safeParse(query)
	);
	if (!queries.success) {
		const zodError = queries.error.format();
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request",
			data: zodError,
		});
	}

	const { term } = queries.data;

	const isPatient = term.toLocaleLowerCase() === "patient";

	const items = prisma.contactForm.findMany({
		where: { returnPatient: { equals: isPatient } },
	});
	return items;
});
