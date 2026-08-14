import { prisma } from "~/server/utils/prisma";
import { AccessPermission } from "~/types/permissions";

type AppointmentRequestFindManyDelegate = {
	findMany: () => Promise<unknown>;
};

function getAppointmentRequestDelegate(): AppointmentRequestFindManyDelegate {
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

	const typed = delegate as Partial<AppointmentRequestFindManyDelegate>;
	if (typeof typed.findMany !== "function") {
		throw createError({
			statusCode: 500,
			statusMessage:
				"AppointmentRequest model is not available in Prisma client.",
		});
	}

	return typed as AppointmentRequestFindManyDelegate;
}

export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async () => {
		const appointmentRequest = getAppointmentRequestDelegate();
		return await appointmentRequest.findMany();
	}
);
