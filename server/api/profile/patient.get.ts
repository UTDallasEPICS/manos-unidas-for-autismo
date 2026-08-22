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
								Diagnoses: true,
								Sponsor: true,
								Sponsorships: true,
								Support: true,
								Guardians: {
									include: {
										Guardian: { include: { User: true } },
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
		// (mirrors the client gate in components/profile/Details.vue), plus the
		// patient viewing their OWN profile. Strip it from the payload for
		// everyone else so it is never exposed via the API, not just hidden.
		const perms = event.context.permissions;
		const isSelf = event.context.user?.id === id;
		const canSeeContact =
			isSelf ||
			perms[AccessPermission.ADMIN] ||
			perms[AccessPermission.IT_SERVICE];
		if (patient && !canSeeContact) {
			const { phone, whatsApp, ...rest } = patient;
			return rest;
		}

		return patient;
	}
);
