import { z } from "zod";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const Gender = {
	MALE: "MALE",
	FEMALE: "FEMALE",
	OTHER: "OTHER",
} as const;

const PreferredContact = {
	EMAIL: "EMAIL",
	PHONE: "PHONE",
} as const;

const Status = {
	NEEDS_PROCESSING: "PROCESSING",
	NEEDS_SCHEDULING: "SCHEDULING",
	PROCESSED: "COMPLETED",
} as const;

const Insurance = {
	SENASA_CONTRIBUTIVO: "SENASA_CONTRIBUTIVO",
	SENASA_SUBSIDIADO: "SENASA_SUBSIDIADO",
	ARS_HUMANO: "ARS_HUMANO",
	MAPFRE: "MAPFRE",
	LA_MONUMENTAL: "LA_MONUMENTAL",
	ARS_UNIVERSAL: "ARS_UNIVERSAL",
	ARS_META_SALUD: "ARS_META_SALUD",
	ARS_PLAN_SALUD_BANCO_CENTRAL: "ARS_PLAN_SALUD_BANCO_CENTRAL",
	RENACER: "RENACER",
	OTRO: "OTRO",
} as const;

const schema = z.object({
	fName: z.string(),
	mInit: z.string().max(1).nullable(),
	lName: z.string(),
	age: z.number(),
	gender: z.nativeEnum(Gender),
	dob: z.coerce.date(),
	nationality: z.string(),
	streetName: z.string(),
	streetNum: z.number(),
	buildingNum: z.number(),
	postcode: z.number(),
	parentName: z.string().nullable(),
	identification: z.string(),
	birthCountry: z.string(),
	birthCity: z.string(),
	nss: z.string(),
	insurance: z.nativeEnum(Insurance),
	address: z.string(),
	contactPref: z.nativeEnum(PreferredContact),
	email: z.string().email(),
	phone: z.string().nullable(),
	isDiagnosed: z.boolean(),
	hasBeenPatient: z.boolean(),
	status: z.nativeEnum(Status),
	wantsEval: z.boolean(),
	comment: z.string(),
});

const validateSchema = schema.strict();

export default defineEventHandler(async (event) => {
	const validatedBody = await readValidatedBody(event, (body) =>
		validateSchema.safeParse(body)
	);

	if (!validatedBody.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request body",
		});
	}

	const {
		fName,
		mInit,
		lName,
		gender,
		dob,
		nationality,
		insurance,
		identification,
		streetName,
		streetNum,
		buildingNum,
		postcode,
		contactPref,
		email,
		phone,
		isDiagnosed,
		hasBeenPatient,
		status,
		wantsEval,
		comment,
	} = validatedBody.data;

	//Create User entry
	const user = await prisma.user.create({
		data: {
			fName: fName,
			mInit: mInit,
			lName: lName,
			email: email,
			phone: phone,
			contactPref: contactPref,
		},
	});

	//Create NonEmployee Entry
	const nonEmployee = await prisma.nonEmployee.create({
		data: {
			id: user.id,
			gender: gender,
			dob: dob,
			streetName: streetName,
			streetNum: streetNum,
			buildingNum: buildingNum,
			postCode: postcode,
		},
	});

	//Create Patient entry
	const patient = await prisma.patient.create({
		data: {
			id: user.id,
			identification: identification,
			diagnosed: isDiagnosed,
		},
	});

	//Create ContactForm entry
	const form = await prisma.contactForm.create({
		data: {
			returnPatient: hasBeenPatient,
			wantsEval: wantsEval,
			insurance: insurance,
			status: status,
			nationality: nationality,
			comment: comment,
			patientId: patient.id,
		},
	});

	return { user, nonEmployee, patient, form };
});
