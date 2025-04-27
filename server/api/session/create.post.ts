import { Prisma, PrismaClient } from "@prisma/client";
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
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError) {
			switch (String(e.code)) {
				case "P2002":
					console.log("uniqueness error");
					throw createError({
						statusCode: 400,
						statusMessage: "Schema Uniqueness Constraint Violated",
						data: e.meta,
					});
				case "P2005":
				case "P2006":
					console.log("bad input");
					throw createError({
						statusCode: 400,
						statusMessage: "Wrong input type",
						data: e.meta,
					});
				case "P2011":
				case "P2012":
				case "P2013":
					console.log("missing required fields");
					throw createError({
						statusCode: 400,
						statusMessage: "Missing required fields",
						data: e.meta,
					});
				default:
					throw createError({
						statusCode: 400,
						statusMessage: "Unexpected Prisma error",
						message: e.message,
						data: e.meta,
					});
			}
		}
	}
});
