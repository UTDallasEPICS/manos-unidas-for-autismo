import { setCookie } from "h3";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = z.object({
	email: z.string().email(),
});

const validateSchema = schema.strict().required();

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
	const { email } = validatedQuery.data;

	// find user with email
	const user = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});

	if (!user) {
		throw createError({
			statusCode: 500,
			statusMessage: `Failed to find user for email: ${email}`,
		});
	}
	setCookie(event, "userId", user.id);
	return `Successful login for user ${email}:${user.id}`;
});
