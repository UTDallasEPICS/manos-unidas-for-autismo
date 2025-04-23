import { z } from "zod";
import {
	PrismaClient,
	Gender,
	Status,
	InsuranceCompany,
	ContactType,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const schema = z.object({
	fName: z.string(),
	mInit: z.string().max(1).optional(),
	lName: z.string(),
	gender: z.nativeEnum(Gender),
	dob: z.coerce.date(),
	nationality: z.string(),
	streetName: z.string(),
	streetNum: z.number(),
	buildingNum: z.number().optional(),
	postcode: z.number(),
	identification: z.string(),
	city: z.string(),
	insurance: z.nativeEnum(InsuranceCompany),
	contactPref: z.nativeEnum(ContactType).default("EMAIL"),
	email: z.string().email(),
	phone: z.string().optional(),
	whatsapp: z.string().optional(),
	isDiagnosed: z.boolean(),
	hasBeenPatient: z.boolean(),
	status: z.nativeEnum(Status),
	wantsEval: z.boolean(),
	comment: z.string().optional(),
});

const validateSchema = schema.strict();

export default defineEventHandler(async (event) => {
	const validatedBody = await readValidatedBody(event, (body) =>
		validateSchema.safeParse(body)
	);

	if (!validatedBody.success) {
		const zodError = validatedBody.error?.format();
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request Body",
			data: zodError,
		});
	}

	const {
		fName,
		mInit,
		lName,
		gender,
		dob,
		nationality,
		city,
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

	try {
		const result = await prisma.$transaction(async (tx) => {
			//If postcode does not exist, add it to database
			await prisma.postCodeCity.upsert({
				where: { postCode: postcode },
				update: {},
				create: { postCode: postcode, city },
			});

			//Create User entry
			const user = await tx.user.create({
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
			const nonEmployee = await tx.nonEmployee.create({
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
			const patient = await tx.patient.create({
				data: {
					id: user.id,
					identification: identification,
					diagnosed: isDiagnosed,
				},
			});

			//Create ContactForm entry
			const form = await tx.contactForm.create({
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
		});

		return result;
	} catch (e) {
		if (e instanceof PrismaClientKnownRequestError) {
			switch (String(e.code)) {
				case "P2002":
					console.log("uniqueness error");
					throw createError({
						statusCode: 400,
						statusMessage: "Schema Uniqueness Constraint Violated",
						data: e.meta,
					});
				case "P2005":
				case "P2006":
					console.log("bad input");
					throw createError({
						statusCode: 400,
						statusMessage: "Wrong input type",
						data: e.meta,
					});
				case "P2011":
				case "P2012":
				case "P2013":
					console.log("missing required fields");
					throw createError({
						statusCode: 400,
						statusMessage: "Missing required fields",
						data: e.meta,
					});
				default:
					throw createError({
						statusCode: 400,
						statusMessage: "Unexpected Prisma error",
						message: e.message,
						data: e.meta,
					});
			}
		}
	}
});

//get
