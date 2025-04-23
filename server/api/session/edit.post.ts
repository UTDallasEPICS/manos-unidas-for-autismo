import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for updating a session (appointment)
const updateSessionSchema = z.object({
	id: z.string(),
	typeId: z.string().optional(),
	time: z.coerce.date().optional(),
	comment: z.string().nullable().optional(),
	maxAttendance: z.number().gte(1).optional(),
	therapistId: z.string().optional(),
	duration: z.number().gte(1).optional(),
});

export default defineEventHandler(async (event) => {
	if (event.method !== "PUT") {
		throw createError({
			statusCode: 405,
			statusMessage: "Method not allowed",
		});
	}

	const body = await readBody(event);
	const parsed = updateSessionSchema.safeParse(body);

	if (!parsed.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request body",
			data: parsed.error.format(),
		});
	}

	const { id, ...updateData } = parsed.data;

	try {
		const updatedSession = await prisma.session.update({
			where: { id },
			data: updateData,
		});

		return updatedSession;
	} catch (error: unknown) {
		if (error && typeof error === "object" && "code" in error) {
			const prismaError = error as { code: string };

			if (prismaError.code === "P2025") {
				throw createError({
					statusCode: 404,
					statusMessage: "Appointment not found.",
				});
			}
		}

		throw createError({
			statusCode: 500,
			statusMessage: "Unexpected error updating session.",
		});
	}
});
