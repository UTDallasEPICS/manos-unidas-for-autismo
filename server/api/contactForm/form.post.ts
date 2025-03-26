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
	NEEDS_PROCESSING: "NEEDS_PROCESSING",
	NEEDS_SCHEDULING: "NEEDS_SCHEDULING",
	PROCESSED: "PROCESSED",
} as const;

const schema = z.object({
	fName: z.string(),
	mInit: z.string().max(1).nullable(),
	lName: z.string(),
	age: z.number(),
	gender: z.nativeEnum(Gender),
	dob: z.coerce.date(),
	parentName: z.string().nullable(),
	idCard: z.string(),
	birthCountry: z.string(),
	birthCity: z.string(),
	nss: z.string(),
	insurance: z.string(),
	address: z.string(),
	preferredContact: z.nativeEnum(PreferredContact),
	email: z.string().email(),
	phone: z.string().nullable(),
	isDiagnosed: z.boolean(),
	hasBeenPatient: z.boolean(),
	status: z.nativeEnum(Status),
	wantsEval: z.boolean(),
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
		nss,
		idCard,
		address,
		preferredContact,
		email,
		phone,
		isDiagnosed,
		hasBeenPatient,
		status,
		wantsEval,
	} = validatedBody.data;

	//Create User entry
	const user = await prisma.user.create({
		data: {
			FName: fName,
			MInit: mInit,
			LName: lName,
			Email: email,
			Phone: phone,
			PreferredContact: preferredContact,
		},
	});

	//Create Patient entry
	const patient = await prisma.patient.create({
		data: {
			ID: user.ID,
			DOB: dob,
			Gender: gender,
			Address: address,
			NSS: nss,
			Identification: idCard,
			Diagnosed: isDiagnosed,
		},
	});

	//Create ContactForm entry
	const form = await prisma.contactForm.create({
		data: {
			BeenHereBefore: hasBeenPatient,
			WantsDiagnosticEval: wantsEval,
			Status: status,
			patientID: patient.ID,
		},
	});

	return { user, patient, form };
});
