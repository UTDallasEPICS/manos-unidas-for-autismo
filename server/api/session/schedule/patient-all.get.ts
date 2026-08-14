import { z } from "zod";

const schema = z.object({
	userId: z.string(),
});

const validateSchema = schema.strict();

export default defineAuthedHandler(
	{
		access: "AUTH",

		ownership: async (event) => {
			const { userId } = await validateQuery(event, validateSchema);
			return canViewPatient(event, userId);
		},
	},
	async (event) => {
		const { userId } = await validateQuery(event, validateSchema);

		const sessions = await prisma.session.findMany({
			where: {
				Patients: { some: { patientId: userId } },
			},
			include: sessionWithDetailsInclude,
			orderBy: { time: "desc" },
		});

		return sessions;
	}
);
