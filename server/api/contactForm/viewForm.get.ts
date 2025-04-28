import { z } from "zod";
import { PrismaClient, Status } from "@prisma/client";

const prisma = new PrismaClient();

const schema = z.object({
	term: z.enum(["PROCESSING", "COMPLETED", "PENDING"]),
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

	const items = prisma.user.findMany({
		where: {
			NonEmployee: {
				Patient: {
					ContactForm: {
						status: {
							equals: term as Status,
						},
					},
				},
			},
		},
		include: {
			NonEmployee: {
				include: {
					Patient: {
						include: {
							ContactForm: true,
						},
					},
				},
			},
		},
	});

	console.log(items);
	return items;
});
