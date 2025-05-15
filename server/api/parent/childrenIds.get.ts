import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = z.object({
	pId: z.string(),
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

	const { pId } = queries.data;

	const parent = await prisma.user.findUnique({
		where: {
			id: pId,
		},
		include: {
			NonEmployee: {
				include: { Children: true },
			},
		},
	});

	const cIds = [];
	if (!parent?.NonEmployee?.Children) {
		throw createError({
			statusCode: 500,
			statusMessage: `Failed to find children for user: ${parent?.id}`,
		});
	}
	for (const child of parent.NonEmployee.Children) {
		cIds.push(child.id);
	}
	return cIds;
});
