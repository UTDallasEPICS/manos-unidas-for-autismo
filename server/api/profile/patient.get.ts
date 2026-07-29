import { z } from "zod";

const schema = z.object({
	id: z.string(),
});

const validateSchema = schema.strict();

export default defineAuthedHandler(
	{
		access: "AUTH",
		ownership: async (event) => {
			const { id } = await validateQuery(event, validateSchema);
			return canViewPatient(event, id);
		},
	},
	async (event) => {
		const { id } = await validateQuery(event, validateSchema);

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
	}
);
