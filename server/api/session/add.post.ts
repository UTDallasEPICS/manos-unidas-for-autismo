import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const addPatientSchema = z.object({
	sessionId: z.string(),
	patientId: z.string(),
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
