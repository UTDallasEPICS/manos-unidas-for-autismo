import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const sessionSchema = z.object({
	typeID: z.string(), // We are passing the ID of the session type
	time: z.coerce.date(),
	comment: z.string().optional(),
	maxAttendance: z.number().optional().default(1),
	therapistID: z.string(),
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

	const { typeID, time, comment, maxAttendance, therapistID } =
		validatedBody.data;

	// Create the session with the type directly assigned as a string
	const newSession = await prisma.session.create({
		data: {
			Type: typeID, // Directly assigning typeID (string)
			Time: time,
			Comment: comment || null,
			MaxAttendance: maxAttendance,
			TherapistID: therapistID,
		},
	});

	if (!newSession) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create session",
		});
	}
});
