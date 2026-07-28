import { z } from "zod";

const sessionSchema = z.object({
	typeId: z.string(),
	time: z.coerce.date().refine((d) => d > new Date(), {
		message: "Appointment time must be in the future",
	}),
	comment: z.string().optional(),
	maxAttendance: z.number().gte(1),
	therapistId: z.string(),
	duration: z.number().gte(1),
});

export default defineEventHandler(async (event) => {
	const { typeId, time, comment, maxAttendance, therapistId, duration } =
		await validateBody(event, sessionSchema);

	try {
		const newSession = await prisma.session.create({
			data: {
				typeId,
				therapistId,
				time,
				comment,
				maxAttendance,
				duration,
			},
		});

		return newSession;
	} catch (e) {
		handlePrismaError(e);
	}
});
