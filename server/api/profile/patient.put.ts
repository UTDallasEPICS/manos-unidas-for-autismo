import { z } from "zod";
import { Prisma, PrismaClient, Gender, ContactType } from "@prisma/client";

const prisma = new PrismaClient();

const schema = z.object({
	id: z.string(),
	fName: z.string(),
	mInit: z.string().max(1).optional().nullable(),
	lName: z.string(),
	gender: z.nativeEnum(Gender),
	dob: z.coerce.date(),
	streetName: z.string(),
	streetNum: z.number(),
	buildingNum: z.number().optional().nullable(),
	postcode: z.number(),
	identification: z.string(),
	city: z.string(),
	contactPref: z.nativeEnum(ContactType).default("PHONE"),
	email: z.string().email().optional(),
	phone: z.string(),
	whatsapp: z.string().optional(),
	isDiagnosed: z.boolean(),
});

const validateSchema = schema.strict();

export default defineEventHandler(async (event) => {
	const validatedBody = await readValidatedBody(event, (body) =>
		validateSchema.safeParse(body)
	);

	if (!validatedBody.success) {
		const zodError = validatedBody.error?.format();
		console.log(zodError);
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request Body",
			data: zodError,
		});
	}

	const {
		id,
		fName,
		mInit,
		lName,
		gender,
		dob,
		city,
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
	} = validatedBody.data;

	try {
		const result = await prisma.$transaction(async (tx) => {
			//If postcode does not exist, add it to database
			await tx.postCodeCity.upsert({
				where: { postCode: postcode },
				update: {},
				create: { postCode: postcode, city },
			});

			//Update User entry
			const user = await tx.user.update({
				where: {
					id: id,
				},
				data: {
					fName: fName,
					mInit: mInit,
					lName: lName,
					email: email || "",
					phone: phone,
					whatsApp: whatsapp,
					contactPref: contactPref,
				},
			});

			//Create NonEmployee Entry
			const nonEmployee = await tx.nonEmployee.update({
				where: {
					id: id,
				},
				data: {
					gender: gender,
					dob: dob,
					streetName: streetName,
					streetNum: streetNum,
					buildingNum: buildingNum,
					postCode: postcode,
				},
			});

			//Create Patient entry
			const patient = await tx.patient.update({
				where: {
					id: id,
				},
				data: {
					identification: identification,
					diagnosed: isDiagnosed,
				},
			});

			return { user, nonEmployee, patient };
		});

		return result;
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError) {
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
