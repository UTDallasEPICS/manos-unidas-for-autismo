import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const addPatientSchema = z.object({
	sessionId: z.string().uuid(),
	patientId: z.string().uuid(),
	paid: z.boolean().optional().default(false),
});

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const parsed = addPatientSchema.safeParse(body);

	if (!parsed.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid data",
			data: parsed.error.format(),
		});
	}

	const { sessionId, patientId, paid } = parsed.data;

	//Find session's current count
	const currentCount = await prisma.sessionPatient.count({
		where: { sessionId },
	});

	//Find session's max count
	const session = await prisma.session.findUnique({
		where: { id: sessionId },
		select: { maxAttendance: true },
	});

	if (!session) {
		throw createError({
			statusCode: 404,
			statusMessage: "Session not found",
		});
	}

	if (currentCount >= session.maxAttendance) {
		throw createError({
			statusCode: 400,
			statusMessage: "Session has reached max attendance",
		});
	}

	try {
		const entry = await prisma.sessionPatient.create({
			data: { sessionId, patientId, paid },
		});
		return entry;
	} catch (error: unknown) {
		if (error && typeof error === "object" && "code" in error) {
			const prismaError = error as { code: string };

			if (prismaError.code === "P2025") {
				throw createError({
					statusCode: 404,
					statusMessage: "Appointment not found.",
				});
			}

			if (prismaError.code === "P2002") {
				throw createError({
					statusCode: 409,
					statusMessage: "Patient is already in this session.",
				});
			}
		}

		throw createError({
			statusCode: 500,
			statusMessage: "An unexpected error occurred.",
		});
	}
});
