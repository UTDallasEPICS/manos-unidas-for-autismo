import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = z.object({
	id: z.string(),
});

const validateSchema = schema.strict();

export default defineEventHandler(async (event) => {
	const queries = await getValidatedQuery(event, (query) =>
		validateSchema.safeParse(query)
	);
	if (!queries.success) {
		const zodError = queries.error.format();
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request",
			data: zodError,
		});
	}

	const { id } = queries.data;

	const patient = await prisma.user.findUnique({
		where: {
			id: id,
		},
		include: {
			NonEmployee: {
				include: {
					Patient: {
						include: {
							Appointments: true,
							MedicalRecords: true,
							ProgressReports: {
								include: {
									Questions: true,
								},
							},
						},
					},
					PostCodeCity: true,
				},
			},
		},
	});

	return patient;
});
