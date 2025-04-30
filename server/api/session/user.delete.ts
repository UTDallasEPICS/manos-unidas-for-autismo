import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const removePatientSchema = z.object({
	sessionId: z.string().uuid(),
	patientId: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const parsed = removePatientSchema.safeParse(body);

	if (!parsed.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid data",
			data: parsed.error.format(),
		});
	}

	const { sessionId, patientId } = parsed.data;

	try {
		await prisma.sessionPatient.delete({
			where: { sessionId_patientId: { sessionId, patientId } },
		});

		return { message: "Patient removed from session." };
	} catch (error: unknown) {
		if (error && typeof error === "object" && "code" in error) {
			if (error.code === "P2025") {
				throw createError({
					statusCode: 404,
					statusMessage: "Patient is not part of this session.",
				});
			}
		}

		throw createError({ statusCode: 500, statusMessage: "Remove failed." });
	}
});
