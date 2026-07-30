import { z } from "zod";

const schema = z.object({
	userId: z.string(),
	date: z.coerce.date(),
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
		const { userId, date } = await validateQuery(event, validateSchema);

		const { monday, saturday } = getWeekBounds(date);

		const sessions = await prisma.session.findMany({
			where: {
				time: { gte: monday, lt: saturday },
				Patients: { some: { patientId: userId } },
			},
			include: sessionWithDetailsInclude,
		});

		return sessions;
	}
);
