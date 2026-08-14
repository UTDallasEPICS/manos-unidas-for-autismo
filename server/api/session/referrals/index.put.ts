import { z } from "zod";
import { prisma } from "~/server/utils/prisma";
import { AccessPermission } from "~/types/permissions";

type TherapistReferralUpdateDelegate = {
	update: (args: {
		where: { id: string };
		data: { Therapist: { connect: { id: string } } };
	}) => Promise<unknown>;
};

function getTherapistReferralUpdateDelegate(): TherapistReferralUpdateDelegate {
	const delegate = (prisma as unknown as Record<string, unknown>)[
		"therapistReferral"
	];

	if (!delegate || typeof delegate !== "object") {
		throw createError({
			statusCode: 500,
			statusMessage:
				"TherapistReferral model is not available in Prisma client.",
		});
	}

	const typed = delegate as Partial<TherapistReferralUpdateDelegate>;
	if (typeof typed.update !== "function") {
		throw createError({
			statusCode: 500,
			statusMessage:
				"TherapistReferral model is not available in Prisma client.",
		});
	}

	return typed as TherapistReferralUpdateDelegate;
}

const assignTherapistSchema = z.object({
	therapistReferralId: z.string().min(1),
	therapistId: z.string().min(1),
});

async function resolveTherapistExists(therapistId: string) {
	const user = await prisma.user.findUnique({
		where: { id: therapistId },
		select: { id: true, type: true },
	});
	return Boolean(user && user.type === "THERAPIST");
}

async function assignTherapist(
	therapistReferralId: string,
	therapistId: string
) {
	const therapistReferral = getTherapistReferralUpdateDelegate();

	return await therapistReferral.update({
		where: { id: therapistReferralId },
		data: {
			Therapist: { connect: { id: therapistId } },
		},
	});
}

export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async (event) => {
		const { therapistReferralId, therapistId } = await validateBody(
			event,
			assignTherapistSchema
		);

		const therapistExists = await resolveTherapistExists(therapistId);
		if (!therapistExists) {
			throw createError({
				statusCode: 404,
				statusMessage: "Therapist not found.",
			});
		}

		try {
			return await assignTherapist(therapistReferralId, therapistId);
		} catch (e) {
			handlePrismaError(e);
		}
	}
);
