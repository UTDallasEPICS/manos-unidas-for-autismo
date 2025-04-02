import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
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
	buildingNum: z.number().nullable(),
	postcode: z.number(),
	parentName: z.string().nullable(),
	identification: z.string(),
	birthCountry: z.string(),
	birthCity: z.string(),
	insurance: z.nativeEnum(Insurance),
	address: z.string(),
	contactPref: z.nativeEnum(PreferredContact),
	email: z.string().email(),
	phone: z.string().nullable(),
	whatsapp: z.string().nullable(),
	isDiagnosed: z.boolean(),
	hasBeenPatient: z.boolean(),
	status: z.nativeEnum(Status),
	wantsEval: z.boolean(),
	comment: z.string().nullable(),
});

const validateSchema = schema.strict();

export default defineEventHandler(async (event) => {
	const validatedBody = await readValidatedBody(event, (body) =>
		validateSchema.safeParse(body)
	);

	if (!validatedBody.success) {
		const zodError = validatedBody.error?.issues;
		throw createError({
			statusCode: 400,
			statusMessage: `${zodError}`,
		});
	}

	const {
		fName,
		mInit,
		lName,
		gender,
		dob,
		nationality,
		birthCity,
		insurance,
		identification,
		streetName,
		streetNum,
		buildingNum,
		postcode,
		contactPref,
		email,
		phone,
		whatsapp,
		isDiagnosed,
		hasBeenPatient,
		wantsEval,
		comment,
	} = validatedBody.data;

	//Check for zipcode city entry
	const post = await prisma.postCodeCity.findUnique({
		where: {
			postCode: postcode,
		},
	});

	//If no postcode, add it to database
	if (!post) {
		await prisma.postCodeCity.create({
			data: {
				postCode: postcode,
				city: birthCity,
			},
		});
	}

	try {
		//Create User entry
		const user = await prisma.user.create({
			data: {
				fName: fName,
				mInit: mInit,
				lName: lName,
				email: email,
				phone: phone,
				whatsApp: whatsapp,
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
				status: "PROCESSING",
				nationality: nationality,
				comment: comment,
				patientId: patient.id,
			},
		});

		return { user, nonEmployee, patient, form };
	} catch (e) {
		if (e instanceof PrismaClientKnownRequestError) {
			throw createError({
				statusCode: 400,
				statusMessage: e.message,
			});
		}
	}
});
