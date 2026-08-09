import { z } from "zod";

const schema = z.object({
	userId: z.string(),
});

const validateSchema = schema.strict();

export default defineAuthedHandler(
	{
		access: "AUTH",
		// Same PHI gate as schedule/patient.get.ts: self / parent-of /
		// assigned-therapist / clinical staff (USER_SERVICE|EVALUATOR|ADMIN).
		// Unlike that endpoint, this isn't bounded to a single week, so a
		// patient can see their full appointment history in one call.
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
