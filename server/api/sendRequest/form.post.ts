import { z } from "zod";

// Strict-ish validation for the one PUBLIC write surface. Arrays are defaulted so
// omitting a section is fine, but malformed input is rejected with 400 rather than
// crashing the handler (previously body.phone.map / body.therapies.map threw on
// non-array input — an unauthenticated 500 surface). Service names are validated
// as strings here — Prisma enforces enum membership at write time — to avoid a
// build-time dependency on generated enum exports.
const requestSchema = z.object({
	contactFirstName: z.string().min(1),
	contactMiddleName: z.string().nullish(),
	contactLastName: z.string().min(1),
	idNumber: z.string().min(1),
	email: z.string().email(),
	phone: z.array(z.string()).default([]),
	whatsapp: z.string(),
	streetName: z.string(),
	streetNum: z.string(),
	buildingNum: z.string().nullish(),
	postCode: z.string(),
	isAdult: z.boolean(),
	patientFirstName: z.string(),
	patientMiddleName: z.string().nullish(),
	patientLastName: z.string(),
	patientAge: z.coerce.number().int(),
	diagnosed: z.boolean(),
	returnPatient: z.boolean(),
	previousVisitDate: z.string().nullish(),
	wantsEval: z.boolean(),
	hasReferral: z.boolean(),
	therapies: z.array(z.string()).default([]),
	complementaryServices: z.array(z.string()).default([]),
	workshops: z.array(z.string()).default([]),
});

export default defineAuthedHandler({ access: "PUBLIC" }, async (event) => {
	const body = await validateBody(event, requestSchema);

	const request = await prisma.request.create({
		data: {
			firstName: body.contactFirstName,
			middleName: body.contactMiddleName,
			lastName: body.contactLastName,

			idNumber: body.idNumber,
			email: body.email,
			phone: { create: body.phone.map((number) => ({ number })) },
			whatsapp: body.whatsapp,

			streetName: body.streetName,
			streetNum: body.streetNum,
			buildingNum: body.buildingNum,
			postCode: body.postCode,

			isAdult: body.isAdult,

			patientFirstName: body.patientFirstName,
			patientMiddleName: body.patientMiddleName,
			patientLastName: body.patientLastName,
			patientAge: body.patientAge,

			diagnosed: body.diagnosed,
			returnPatient: body.returnPatient,
			previousVisitDate: body.previousVisitDate
				? new Date(body.previousVisitDate)
				: null,
			wantsEval: body.wantsEval,
			hasReferral: body.hasReferral,

			therapies: {
				create: body.therapies.map((name) => ({ name: name as never })),
			},
			complementaryServices: {
				create: body.complementaryServices.map((name) => ({
					name: name as never,
				})),
			},
			workshops: {
				create: body.workshops.map((name) => ({ name: name as never })),
			},
		},
	});

	return { success: true, request };
});
