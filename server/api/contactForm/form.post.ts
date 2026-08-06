import { z } from "zod";
import { Status, InsuranceCompany } from "@prisma/client";
import { patientBaseSchema } from "~/server/utils/patientSchemas";
import { computeAge } from "~/server/utils/dateHelpers";
import { randomUUID } from "node:crypto";

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
		parentFirstName: z.string().optional(),
		parentLastName: z.string().optional(),
	})
	.strict();

export default defineAuthedHandler({ access: "PUBLIC" }, async (event) => {
	const data = await validateBody(event, validateSchema);
	const isAdult = computeAge(data.dob) >= 18;

	try {
		const result = await prisma.$transaction(async (tx) => {
			await tx.postCodeCity.upsert({
				where: { postCode: data.postcode },
				update: {},
				create: { postCode: data.postcode, city: data.city },
			});

			// A minor doesn't log in and the real contact belongs to the
			// parent, so give the patient's own User a synthetic email/phone
			// instead of the submitted ones (same pattern as intake/submit.post.ts).
			const patientEmail = isAdult
				? data.email || ""
				: `patient-${randomUUID()}@intake.local`;
			const patientPhone = isAdult
				? data.phone
				: `intake-${randomUUID()}`;

			const user = await tx.user.create({
				data: {
					fName: data.fName,
					mInit: data.mInit,
					lName: data.lName,
					email: patientEmail,
					phone: patientPhone,
					whatsApp: isAdult ? data.whatsapp : undefined,
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

			// Guardian (minors only): dedupe by email so siblings signing up
			// separately share one guardian login, same as the intake flow.
			if (!isAdult && data.parentFirstName) {
				const guardianEmail =
					data.email || `guardian-${randomUUID()}@intake.local`;
				const guardianPhone = data.phone || `guardian-${randomUUID()}`;

				let guardianUser = await tx.user.findUnique({
					where: { email: guardianEmail },
				});
				if (!guardianUser) {
					guardianUser = await tx.user.create({
						data: {
							fName: data.parentFirstName,
							lName: data.parentLastName || "",
							email: guardianEmail,
							phone: guardianPhone,
							whatsApp: data.whatsapp,
							contactPref: data.contactPref,
						},
					});
				}

				await tx.nonEmployee.upsert({
					where: { id: guardianUser.id },
					create: {
						id: guardianUser.id,
						streetName: data.streetName,
						streetNum: data.streetNum,
						buildingNum: data.buildingNum,
						postCode: data.postcode,
					},
					update: {},
				});

				await tx.patientGuardian.upsert({
					where: {
						patientId_guardianId: {
							patientId: patient.id,
							guardianId: guardianUser.id,
						},
					},
					create: {
						patientId: patient.id,
						guardianId: guardianUser.id,
						relationship: "Parent/Guardian",
						primaryGuardian: true,
					},
					update: {},
				});
			}

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
