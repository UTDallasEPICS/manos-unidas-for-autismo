import { prisma } from "~/server/utils/prisma";
import { AccessPermission } from "~/types/permissions";

type TherapistReferralFindManyDelegate = {
	findMany: (args?: unknown) => Promise<unknown>;
};

function getTherapistReferralDelegate(): TherapistReferralFindManyDelegate {
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

	const typed = delegate as Partial<TherapistReferralFindManyDelegate>;
	if (typeof typed.findMany !== "function") {
		throw createError({
			statusCode: 500,
			statusMessage:
				"TherapistReferral model is not available in Prisma client.",
		});
	}

	return typed as TherapistReferralFindManyDelegate;
}

export default defineAuthedHandler(
	{
		access: [
			AccessPermission.USER_SERVICE,
			AccessPermission.EVALUATOR,
			AccessPermission.THERAPIST,
		],
	},
	async (event) => {
		const therapistReferral = getTherapistReferralDelegate();
		const p = event.context.permissions;
		const user = event.context.user!;

		// A plain THERAPIST may only see referrals assigned to them, and a plain
		// EVALUATOR may only see referrals they submitted; USER_SERVICE / ADMIN
		// see all.
		const isTherapistOnly =
			!!p[AccessPermission.THERAPIST] &&
			!(p[AccessPermission.USER_SERVICE] || p[AccessPermission.ADMIN]);
		const isEvaluatorOnly =
			!!p[AccessPermission.EVALUATOR] &&
			!(p[AccessPermission.USER_SERVICE] || p[AccessPermission.ADMIN]);

		let where: Record<string, unknown> | undefined;
		if (isTherapistOnly) where = { therapistId: user.id };
		else if (isEvaluatorOnly) where = { evaluatorId: user.id };

		return await therapistReferral.findMany(where ? { where } : undefined);
	}
);
