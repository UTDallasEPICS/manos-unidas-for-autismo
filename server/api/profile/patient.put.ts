import { z } from "zod";
import { patientBaseSchema } from "~/server/utils/patientSchemas";
import { AccessPermission } from "~/types/permissions";

const validateSchema = patientBaseSchema
	.extend({
		id: z.string(),
	})
	.strict();

export default defineAuthedHandler(
	{
		access: "AUTH",
		ownership: async (event) => {
			const data = await validateBody(event, validateSchema);
			const p = event.context.permissions;
			if (p[AccessPermission.USER_SERVICE]) return true;
			return isSelf(event, data.id);
		},
	},
	async (event) => {
		const data = await validateBody(event, validateSchema);

		try {
			const result = await prisma.$transaction(async (tx) => {
				await tx.postCodeCity.upsert({
					where: { postCode: data.postcode },
					update: {},
					create: { postCode: data.postcode, city: data.city },
				});

				const user = await tx.user.update({
					where: { id: data.id },
					data: {
						fName: data.fName,
						mInit: data.mInit,
						lName: data.lName,
						email: data.email || "",
						phone: data.phone,
						whatsApp: data.whatsapp,
						contactPref: data.contactPref,
					},
				});

				const nonEmployee = await tx.nonEmployee.update({
					where: { id: data.id },
					data: {
						gender: data.gender,
						dob: data.dob,
						streetName: data.streetName,
						streetNum: data.streetNum,
						buildingNum: data.buildingNum,
						postCode: data.postcode,
					},
				});

				const patient = await tx.patient.update({
					where: { id: data.id },
					data: {
						identification: data.identification,
						diagnosed: data.isDiagnosed,
					},
				});

				return { user, nonEmployee, patient };
			});

			return result;
		} catch (e) {
			handlePrismaError(e);
		}
	}
);
