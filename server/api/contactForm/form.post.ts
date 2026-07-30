import { z } from "zod";
import { Status, InsuranceCompany } from "@prisma/client";
import { patientBaseSchema } from "~/server/utils/patientSchemas";

const validateSchema = patientBaseSchema
	.extend({
		nationality: z.string(),
		insurance: z.nativeEnum(InsuranceCompany),
		hasBeenPatient: z.boolean(),
		wantsEval: z.boolean(),
		status: z.nativeEnum(Status),
		comment: z.string().optional(),
		medication: z.string().optional(),
		allergies: z.string().optional(),
		diet: z.string().optional(),
	})
	.strict();

export default defineAuthedHandler({ access: "PUBLIC" }, async (event) => {
	const data = await validateBody(event, validateSchema);

	try {
		const result = await prisma.$transaction(async (tx) => {
			await tx.postCodeCity.upsert({
				where: { postCode: data.postcode },
				update: {},
				create: { postCode: data.postcode, city: data.city },
			});

			const user = await tx.user.create({
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

			const nonEmployee = await tx.nonEmployee.create({
				data: {
					id: user.id,
					gender: data.gender,
					dob: data.dob,
					streetName: data.streetName,
					streetNum: data.streetNum,
					buildingNum: data.buildingNum,
					postCode: data.postcode,
				},
			});

			const patient = await tx.patient.create({
				data: {
					id: user.id,
					identification: data.identification,
					diagnosed: data.isDiagnosed,
				},
			});

			const form = await tx.contactForm.create({
				data: {
					returnPatient: data.hasBeenPatient,
					wantsEval: data.wantsEval,
					insurance: data.insurance,
					status: "PROCESSING",
					nationality: data.nationality,
					comment: data.comment,
					patientId: patient.id,
				},
			});

			if (data.medication) {
				await tx.medicalRecord.create({
					data: {
						patientId: patient.id,
						data: `Medication: ${data.medication}`,
					},
				});
			}
			if (data.allergies) {
				await tx.medicalRecord.create({
					data: {
						patientId: patient.id,
						data: `Allergies: ${data.allergies}`,
					},
				});
			}
			if (data.diet) {
				await tx.medicalRecord.create({
					data: {
						patientId: patient.id,
						data: `Diet: ${data.diet}`,
					},
				});
			}

			return { user, nonEmployee, patient, form };
		});

		return result;
	} catch (e) {
		handlePrismaError(e);
	}
});
