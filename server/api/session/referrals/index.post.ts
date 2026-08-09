import { z } from "zod";
import { getMissingRequiredFields } from "~/composables/form/useRequestValidation";
import { prisma } from "~/server/utils/prisma";
import { AccessPermission } from "~/types/permissions";

type TherapistReferralCreateDelegate = {
	create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
};

function getTherapistReferralCreateDelegate(): TherapistReferralCreateDelegate {
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

	const typed = delegate as Partial<TherapistReferralCreateDelegate>;
	if (typeof typed.create !== "function") {
		throw createError({
			statusCode: 500,
			statusMessage:
				"TherapistReferral model is not available in Prisma client.",
		});
	}

	return typed as TherapistReferralCreateDelegate;
}

const therapistReferralSchema = z.object({
	patientId: z.string().min(1),
	therapyRecommendation: z.string().min(1),
	therapistType: z.string().min(1),
});

async function createReferralWithPatient(
	therapistReferral: TherapistReferralCreateDelegate,
	baseData: Record<string, unknown>,
	patientId: string
) {
	return await therapistReferral.create({
		data: {
			...baseData,
			Patient: { connect: { id: patientId } },
		},
	});
}

export default defineAuthedHandler(
	{ access: AccessPermission.EVALUATOR },
	async (event) => {
		const data = await validateBody(event, therapistReferralSchema);

		const missing = getMissingRequiredFields(data, [
			"patientId",
			"therapyRecommendation",
			"therapistType",
		]);
		if (missing.length > 0) {
			throw createError({
				statusCode: 400,
				statusMessage: `Missing required fields: ${missing.join(", ")}`,
			});
		}

		const patientExists = await prisma.patient.findUnique({
			where: { id: data.patientId },
			select: { id: true },
		});
		if (!patientExists) {
			throw createError({
				statusCode: 404,
				statusMessage: "Patient not found.",
			});
		}

		// The submitting evaluator is always the authenticated user, never a
		// client-supplied id — otherwise any evaluator could attribute a
		// referral to someone else.
		const evaluatorId = event.context.user!.id;

		const therapistReferral = getTherapistReferralCreateDelegate();

		try {
			return await createReferralWithPatient(
				therapistReferral,
				{
					therapyRecommendation: data.therapyRecommendation,
					therapistType: data.therapistType,
					evaluatorId,
					therapistId: null,
				},
				data.patientId
			);
		} catch (e) {
			handlePrismaError(e);
		}
	}
);
