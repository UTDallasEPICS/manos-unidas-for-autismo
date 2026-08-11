import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const sessionSchema = z.object({
	typeId: z.string(),
	time: z.coerce.date().refine((d) => d > new Date(), {
		message: "Appointment time must be in the future",
	}),
	comment: z.string().optional(),
	// #160: cap max attendance so unreasonable values (e.g. 999999) are rejected.
	maxAttendance: z.number().int().gte(1).lte(50),
	therapistId: z.string(),
	duration: z.number().gte(1),
});

export default defineAuthedHandler(
	{ access: [AccessPermission.USER_SERVICE, AccessPermission.ADMIN] },
	async (event) => {
		const { typeId, time, comment, maxAttendance, therapistId, duration } =
			await validateBody(event, sessionSchema);

		// #52: reject a session that overlaps another for the same therapist.
		// Checked before the try so the 409 propagates (handlePrismaError below
		// only translates Prisma errors).
		const newStart = time.getTime();
		const newEnd = newStart + duration * 60 * 1000;
		const therapistSessions = await prisma.session.findMany({
			where: { therapistId },
			select: { time: true, duration: true },
		});
		const overlaps = therapistSessions.some((s) => {
			const start = new Date(s.time).getTime();
			const end = start + s.duration * 60 * 1000;
			return start < newEnd && end > newStart;
		});
		if (overlaps) {
			throw createError({
				statusCode: 409,
				statusMessage:
					"This therapist already has an overlapping session.",
			});
		}

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
	}
);
