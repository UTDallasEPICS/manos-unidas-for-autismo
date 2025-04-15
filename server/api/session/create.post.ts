import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const sessionSchema = z.object({
	typeId: z.string(),
	time: z.coerce.date(),
	comment: z.string().optional(),
	maxAttendance: z.number().gte(1),
	therapistId: z.string(),
	duration: z.number().min(1),
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

	if (!newSession) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create session",
		});
	}
});
