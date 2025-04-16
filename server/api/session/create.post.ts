import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const sessionSchema = z.object({
	typeId: z.string(),
	time: z.coerce.date(),
	comment: z.string().optional(),
	maxAttendance: z.number().gte(1),
	therapistId: z.string(),
	duration: z.number().gte(1),
});

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		throw createError({
			statusCode: 405,
			statusMessage: "Method not allowed",
		});
	}

	const body = await readBody(event);
	const validatedBody = sessionSchema.safeParse(body);

	if (!validatedBody.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request body",
			data: validatedBody.error.format(),
		});
	}

	const { typeId, time, comment, maxAttendance, therapistId, duration } =
		validatedBody.data;

	try {
		const newSession = await prisma.session.create({
			data: {
				typeId,
				therapistId,
				time,
				comment,
				maxAttendance,
				duration,
			},
		});

		return newSession;
	} catch (error: unknown) {
		if (error && typeof error === "object" && "code" in error) {
			const prismaError = error as { code: string };

			if (prismaError.code === "P2002") {
				throw createError({
					statusCode: 409,
					statusMessage:
						"A session with this therapist at this time already exists.",
				});
			}

			if (prismaError.code === "P2025") {
				throw createError({
					statusCode: 404,
					statusMessage: "Invalid therapistId or typeId.",
				});
			}
		}

		throw createError({
			statusCode: 500,
			statusMessage: "Unexpected error creating session.",
		});
	}
});
