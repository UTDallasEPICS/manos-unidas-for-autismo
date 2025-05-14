import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = z.object({
	pId: z.string(),
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

	const { pId } = queries.data;

	const parent = await prisma.user.findUnique({
		where: {
			id: pId,
		},
		include: {
			NonEmployee: {
				include: {
					Children: {
						include: {
							User: {
								include: {
									User: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!parent?.NonEmployee?.Children) {
		throw createError({
			statusCode: 500,
			statusMessage: `Failed to find children for user: ${parent?.id}`,
		});
	}

	const patientUsers = parent.NonEmployee.Children;

	return patientUsers.map((p) => {
		const ne = p.User!;
		const u = ne.User!;
		// build full name
		const name = [u.fName, u.mInit ? `${u.mInit}.` : null, u.lName]
			.filter(Boolean)
			.join(" ");
		// compute age from dob
		const age = ne.dob
			? Math.floor(
					(Date.now() - ne.dob.getTime()) / 1000 / 60 / 60 / 24 / 365
				)
			: null;
		return {
			id: u.id,
			name,
			type: u.type ?? "",
			age,
			gender: ne.gender,
		};
	});
});
