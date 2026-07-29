import { z } from "zod";
import { prisma } from "~/server/utils/prisma";
import { AccessPermission } from "~/types/permissions";

type AppointmentRequestUpdateDelegate = {
	update: (args: {
		where: { id: string };
		data: { Evaluator: { connect: { id: string } } };
	}) => Promise<unknown>;
};

function getAppointmentRequestUpdateDelegate(): AppointmentRequestUpdateDelegate {
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

	const typed = delegate as Partial<AppointmentRequestUpdateDelegate>;
	if (typeof typed.update !== "function") {
		throw createError({
			statusCode: 500,
			statusMessage:
				"AppointmentRequest model is not available in Prisma client.",
		});
	}

	return typed as AppointmentRequestUpdateDelegate;
}

const assignEvaluatorSchema = z.object({
	appointmentRequestId: z.string().min(1),
	evaluatorId: z.string().min(1),
});

async function resolveEvaluatorExists(evaluatorId: string) {
	// Evaluators are currently represented by User records in this schema.
	const user = await prisma.user.findUnique({
		where: { id: evaluatorId },
		select: { id: true },
	});
	return Boolean(user);
}

async function assignEvaluator(
	appointmentRequestId: string,
	evaluatorId: string
) {
	const appointmentRequest = getAppointmentRequestUpdateDelegate();

	return await appointmentRequest.update({
		where: { id: appointmentRequestId },
		data: {
			Evaluator: { connect: { id: evaluatorId } },
		},
	});
}

export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async (event) => {
		const { appointmentRequestId, evaluatorId } = await validateBody(
			event,
			assignEvaluatorSchema
		);

		const evaluatorExists = await resolveEvaluatorExists(evaluatorId);
		if (!evaluatorExists) {
			throw createError({
				statusCode: 404,
				statusMessage: "Evaluator not found.",
			});
		}

		try {
			return await assignEvaluator(appointmentRequestId, evaluatorId);
		} catch (e) {
			handlePrismaError(e);
		}
	}
);
