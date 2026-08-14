import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const schema = z.object({
	date: z.coerce.date(),
	pId: z.string(),
	questions: z
		.object({
			question: z.string(),
			answer: z.string(),
		})
		.array(),
});

const validateSchema = schema.strict();

export default defineAuthedHandler(
	{
		access: AccessPermission.THERAPIST,
		ownership: async (event) => {
			const { pId } = await validateBody(event, validateSchema);
			return isAssignedTherapist(event, pId);
		},
	},
	async (event) => {
		const { date, pId, questions } = await validateBody(
			event,
			validateSchema
		);

		try {
			const result = await prisma.$transaction(async (tx) => {
				const report = await tx.report.create({
					data: { date, patientId: pId },
				});

				await tx.reportData.createMany({
					data: questions.map((q) => ({
						reportId: report.id,
						question: q.question,
						answer: q.answer,
					})),
				});

				return report;
			});

			return result;
		} catch (e) {
			handlePrismaError(e);
		}
	}
);
