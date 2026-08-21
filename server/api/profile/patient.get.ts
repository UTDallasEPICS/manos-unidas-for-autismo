import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

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

		// Contact info (phone/WhatsApp) is PII restricted to ADMIN + IT_SERVICE
		// (mirrors the client gate in components/profile/Details.vue). Strip it
		// from the payload for everyone else so it is never exposed via the API,
		// not just hidden in the UI.
		const perms = event.context.permissions;
		const canSeeContact =
			perms[AccessPermission.ADMIN] || perms[AccessPermission.IT_SERVICE];
		if (patient && !canSeeContact) {
			const { phone, whatsApp, ...rest } = patient;
			return rest;
		}

		return patient;
	}
);
