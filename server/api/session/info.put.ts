import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

// Schema for updating a session (appointment)
const updateSessionSchema = z.object({
	id: z.string().uuid(),
	typeId: z.string().optional(),
	time: z.coerce.date().optional(),
	comment: z.string().nullable().optional(),
	maxAttendance: z.number().gte(1).optional(),
	therapistId: z.string().optional(),
	duration: z.number().gte(1).optional(),
});

export default defineAuthedHandler(
	{ access: [AccessPermission.USER_SERVICE, AccessPermission.ADMIN] },
	async (event) => {
		const { id, ...updateData } = await validateBody(
			event,
			updateSessionSchema
		);

		const existing = await prisma.session.findUnique({
			where: { id },
			select: { time: true, duration: true, therapistId: true },
		});
		if (!existing) {
			throw createError({
				statusCode: 404,
				statusMessage: "Appointment not found.",
			});
		}

		// Only re-validate the schedule when time / duration / therapist actually
		// change (e.g. a drag-reschedule) — editing a comment on a past session
		// shouldn't be blocked. Mirrors create.post.ts's future-time + overlap
		// rules, which the update path was previously missing.
		const existingTime = new Date(existing.time).getTime();
		const scheduleChanged =
			(updateData.time !== undefined &&
				updateData.time.getTime() !== existingTime) ||
			(updateData.duration !== undefined &&
				updateData.duration !== existing.duration) ||
			(updateData.therapistId !== undefined &&
				updateData.therapistId !== existing.therapistId);

		if (scheduleChanged) {
			const effTime = updateData.time ?? new Date(existing.time);
			const effDuration = updateData.duration ?? existing.duration;
			const effTherapistId =
				updateData.therapistId ?? existing.therapistId;

			if (
				updateData.time !== undefined &&
				effTime.getTime() < Date.now()
			) {
				throw createError({
					statusCode: 400,
					statusMessage: "Appointment time must be in the future.",
				});
			}

			await assertNoTherapistOverlap({
				therapistId: effTherapistId,
				time: effTime,
				duration: effDuration,
				excludeSessionId: id,
			});
		}

		try {
			const updatedSession = await prisma.session.update({
				where: { id },
				data: updateData,
			});

			return updatedSession;
		} catch (error: unknown) {
			if (error && typeof error === "object" && "code" in error) {
				const prismaError = error as { code: string };

				if (prismaError.code === "P2025") {
					throw createError({
						statusCode: 404,
						statusMessage: "Appointment not found.",
					});
				}
			}

			throw createError({
				statusCode: 500,
				statusMessage: "Unexpected error updating session.",
			});
		}
	}
);
