import { z } from "zod";

const schema = z.object({
	userId: z.string(),
	start: z.coerce.date(),
	end: z.coerce.date(),
});

const validateSchema = schema.strict();

export default defineAuthedHandler(
	{
		access: "AUTH",
		// Returns a patient's sessions incl. nested patient PHI, so scope to who
		// may view this patient: self / parent-of / assigned-therapist /
		// USER_SERVICE|EVALUATOR|ADMIN. Deliberately NOT a bare STAFF gate — that
		// would leak PHI to IT_SERVICE.
		ownership: async (event) => {
			const { userId } = await validateQuery(event, validateSchema);
			return canViewPatient(event, userId);
		},
	},
	async (event) => {
		const { userId, start, end } = await validateQuery(
			event,
			validateSchema
		);

		const sessions = await prisma.session.findMany({
			where: {
				time: { gte: start, lt: end },
				Patients: { some: { patientId: userId } },
			},
			include: sessionWithDetailsInclude,
		});

		return sessions;
	}
);
