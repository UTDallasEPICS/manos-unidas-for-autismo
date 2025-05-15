import { z } from "zod";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = z.object({
	date: z.coerce.date(),
	pId: z.string(),
	questions: z
		.object({
			question: z.string(),
			answer: z.string(),
		})
		.array(),
});

const validateSchema = schema.strict();

export default defineEventHandler(async (event) => {
	const validatedBody = await readValidatedBody(event, (body) =>
		validateSchema.safeParse(body)
	);

	if (!validatedBody.success) {
		const zodError = validatedBody.error?.format();
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request Body",
			data: zodError,
		});
	}

	const { date, pId, questions } = validatedBody.data;

	try {
		const result = await prisma.$transaction(async (tx) => {
			//Create report entry
			const report = await tx.report.create({
				data: {
					date: date,
					patientId: pId,
				},
			});

			const qs = [];
			//Create NonEmployee Entry
			for (const question of questions) {
				const q = await tx.reportData.create({
					data: {
						reportId: report.id,
						question: question.question,
						answer: question.answer,
					},
				});
				qs.push(q);
			}

			return { report, qs };
		});

		return result;
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
