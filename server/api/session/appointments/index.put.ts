import { z } from "zod";
import { prisma } from "~/server/utils/prisma";
import { AccessPermission } from "~/types/permissions";

const EVALUATION_SESSION_TYPE_NAME = "Evaluation Appointment";
const EVALUATION_SESSION_DURATION_MINUTES = 60;

const assignEvaluatorSchema = z.object({
	appointmentRequestId: z.string().min(1),
	evaluatorId: z.string().min(1),
});

async function resolveEvaluator(evaluatorId: string) {
	const user = await prisma.user.findUnique({
		where: { id: evaluatorId },
		select: { id: true, type: true },
	});
	return user && user.type === "EVALUATOR" ? user : null;
}

export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async (event) => {
		const { appointmentRequestId, evaluatorId } = await validateBody(
			event,
			assignEvaluatorSchema
		);

		const evaluator = await resolveEvaluator(evaluatorId);
		if (!evaluator) {
			throw createError({
				statusCode: 404,
				statusMessage: "Evaluator not found.",
			});
		}

		const appointmentRequest = await prisma.appointmentRequest.findUnique({
			where: { id: appointmentRequestId },
			select: {
				id: true,
				patientId: true,
				scheduledDate: true,
				sessionId: true,
			},
		});
		if (!appointmentRequest) {
			throw createError({
				statusCode: 404,
				statusMessage: "Appointment request not found.",
			});
		}

		try {
			return await prisma.$transaction(async (tx) => {
				// Reassigning an already-scheduled meeting: move the existing
				// session to the new evaluator rather than creating a duplicate.
				if (appointmentRequest.sessionId) {
					await tx.session.update({
						where: { id: appointmentRequest.sessionId },
						data: { therapistId: evaluatorId },
					});

					return await tx.appointmentRequest.update({
						where: { id: appointmentRequestId },
						data: { Evaluator: { connect: { id: evaluatorId } } },
					});
				}

				// First assignment: create the bookable patient-meets-evaluator
				// session (issue: calendar should start once intake + evaluator
				// assignment is done) and link it back to this request.
				const evaluationType = await tx.sessionType.findUnique({
					where: { name: EVALUATION_SESSION_TYPE_NAME },
					select: { id: true },
				});
				if (!evaluationType) {
					throw createError({
						statusCode: 500,
						statusMessage: `Missing required "${EVALUATION_SESSION_TYPE_NAME}" session type; seed it before assigning evaluators.`,
					});
				}

				const session = await tx.session.create({
					data: {
						typeId: evaluationType.id,
						therapistId: evaluatorId,
						time: appointmentRequest.scheduledDate,
						duration: EVALUATION_SESSION_DURATION_MINUTES,
						maxAttendance: 1,
					},
				});

				await tx.sessionPatient.create({
					data: {
						sessionId: session.id,
						patientId: appointmentRequest.patientId,
					},
				});

				return await tx.appointmentRequest.update({
					where: { id: appointmentRequestId },
					data: {
						Evaluator: { connect: { id: evaluatorId } },
						Session: { connect: { id: session.id } },
					},
				});
			});
		} catch (e) {
			if (
				e &&
				typeof e === "object" &&
				"code" in e &&
				e.code === "P2002"
			) {
				throw createError({
					statusCode: 409,
					statusMessage:
						"This evaluator already has another session scheduled at that time.",
				});
			}
			handlePrismaError(e);
		}
	}
);
