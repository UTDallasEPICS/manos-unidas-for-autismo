import type {
	TherapyType,
	ComplementaryServiceType,
	WorkshopType,
} from "@prisma/client";

export default defineAuthedHandler({ access: "PUBLIC" }, async (event) => {
	const body = await readBody(event);
	console.log("BODY:", body);
	console.log(Object.keys(body));

	const data = {
		firstName: body.contactFirstName,
		middleName: body.contactMiddleName,
		lastName: body.contactLastName,

		idNumber: body.idNumber,
		email: body.email,
		phone: {
			create: body.phone.map((number: string) => ({
				number,
			})),
		},
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
			create: body.therapies.map((name: TherapyType) => ({ name })),
		},
		complementaryServices: {
			create: body.complementaryServices.map(
				(name: ComplementaryServiceType) => ({ name })
			),
		},
		workshops: {
			create: body.workshops.map((name: WorkshopType) => ({ name })),
		},
	};

	console.dir(data, { depth: null });

	const request = await prisma.request.create({
		data,
	});

	return { success: true, request };
});
