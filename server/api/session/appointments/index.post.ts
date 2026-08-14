import { z } from "zod";
import {
	getMissingRequiredFields,
	validateScheduledDateTime,
} from "~/composables/form/useRequestValidation";
import { prisma } from "~/server/utils/prisma";
import { AccessPermission } from "~/types/permissions";

const appointmentRequestSchema = z.object({
	firstName: z.string().min(1),
	middleName: z.string().optional().nullable(),
	lastName: z.string().min(1),
	email: z.string().email(),
	phone: z.string().min(1),
	whatsApp: z.string().min(1),
	domRepId: z.string().min(1),
	serviceType: z.string().min(1),
	scheduledDate: z.coerce.date(),
	ipAddress: z.string().optional().nullable(),
});

type AppointmentRequestCreateDelegate = {
	create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
};

function getAppointmentRequestCreateDelegate(): AppointmentRequestCreateDelegate {
	const delegate = (prisma as unknown as Record<string, unknown>)[
		"appointmentRequest"
	];

	if (!delegate || typeof delegate !== "object") {
		throw createError({
			statusCode: 500,
			statusMessage:
				"AppointmentRequest model is not available in Prisma client.",
		});
	}

	const typed = delegate as Partial<AppointmentRequestCreateDelegate>;
	if (typeof typed.create !== "function") {
		throw createError({
			statusCode: 500,
			statusMessage:
				"AppointmentRequest model is not available in Prisma client.",
		});
	}

	return typed as AppointmentRequestCreateDelegate;
}

async function ensurePatientForAppointment(
	data: z.infer<typeof appointmentRequestSchema>
) {
	const existingByIdentification = await prisma.patient.findFirst({
		where: { identification: data.domRepId },
		select: { id: true },
	});
	if (existingByIdentification) return existingByIdentification.id as string;

	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [
				{ email: data.email },
				{ phone: data.phone },
				{ whatsApp: data.whatsApp },
			],
		},
		select: { id: true },
	});

	if (existingUser) {
		const existingPatient = await prisma.patient.findFirst({
			where: { id: existingUser.id },
			select: { id: true },
		});
		if (existingPatient) return existingPatient.id as string;

		await prisma.postCodeCity.upsert({
			where: { postCode: 1000 },
			update: {},
			create: { postCode: 1000, city: "Pending" },
		});

		await prisma.nonEmployee.upsert({
			where: { id: existingUser.id },
			update: {},
			create: {
				id: existingUser.id,
				gender: "OTHER",
				dob: new Date("1970-01-01T00:00:00.000Z"),
				streetName: "Pending",
				streetNum: 0,
				buildingNum: null,
				postCode: 1000,
			},
		});

		const patient = await prisma.patient.create({
			data: {
				id: existingUser.id,
				identification: data.domRepId,
				diagnosed: false,
			},
		});
		return patient.id as string;
	}

	await prisma.postCodeCity.upsert({
		where: { postCode: 1000 },
		update: {},
		create: { postCode: 1000, city: "Pending" },
	});

	const user = await prisma.user.create({
		data: {
			fName: data.firstName,
			mInit: data.middleName?.slice(0, 1) ?? null,
			lName: data.lastName,
			email: data.email,
			phone: data.phone,
			whatsApp: data.whatsApp,
			contactPref: "PHONE",
		},
	});

	await prisma.nonEmployee.create({
		data: {
			id: user.id,
			gender: "OTHER",
			dob: new Date("1970-01-01T00:00:00.000Z"),
			streetName: "Pending",
			streetNum: 0,
			buildingNum: null,
			postCode: 1000,
		},
	});

	const patient = await prisma.patient.create({
		data: {
			id: user.id,
			identification: data.domRepId,
			diagnosed: false,
		},
	});

	return patient.id as string;
}

async function createAppointmentRequestWithPatient(
	appointmentRequest: AppointmentRequestCreateDelegate,
	baseData: Record<string, unknown>,
	patientId: string
) {
	return await appointmentRequest.create({
		data: {
			...baseData,
			Patient: { connect: { id: patientId } },
		},
	});
}

export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async (event) => {
		const data = await validateBody(event, appointmentRequestSchema);

		const missing = getMissingRequiredFields(data, [
			"firstName",
			"lastName",
			"email",
			"phone",
			"whatsApp",
			"domRepId",
		]);
		if (missing.length > 0) {
			throw createError({
				statusCode: 400,
				statusMessage: `Missing required fields: ${missing.join(", ")}`,
			});
		}

		const scheduleValidation = validateScheduledDateTime(
			data.scheduledDate
		);
		if (!scheduleValidation.isValid) {
			throw createError({
				statusCode: 400,
				statusMessage: scheduleValidation.error,
			});
		}

		const appointmentRequest = getAppointmentRequestCreateDelegate();

		try {
			const patientId = await ensurePatientForAppointment(data);
			const ipAddress = data.ipAddress ?? getRequestIP(event) ?? null;

			const created = await createAppointmentRequestWithPatient(
				appointmentRequest,
				{
					firstName: data.firstName,
					middleName: data.middleName ?? null,
					lastName: data.lastName,
					email: data.email,
					phone: data.phone,
					whatsApp: data.whatsApp,
					domRepId: data.domRepId,
					serviceType: data.serviceType,
					scheduledDate: scheduleValidation.date,
					ipAddress,
				},
				patientId
			);

			return created;
		} catch (e) {
			handlePrismaError(e);
		}
	}
);
