// Shared therapist-overlap guard for session create + update (#52). A therapist
// may not have two sessions whose time windows overlap. `excludeSessionId` skips
// the session being edited so an update doesn't conflict with itself.
export async function assertNoTherapistOverlap(params: {
	therapistId: string;
	time: Date;
	duration: number;
	excludeSessionId?: string;
}) {
	const newStart = params.time.getTime();
	const newEnd = newStart + params.duration * 60 * 1000;

	const sessions = await prisma.session.findMany({
		where: {
			therapistId: params.therapistId,
			...(params.excludeSessionId
				? { id: { not: params.excludeSessionId } }
				: {}),
		},
		select: { time: true, duration: true },
	});

	const overlaps = sessions.some((s) => {
		const start = new Date(s.time).getTime();
		const end = start + s.duration * 60 * 1000;
		return start < newEnd && end > newStart;
	});

	if (overlaps) {
		throw createError({
			statusCode: 409,
			statusMessage: "This therapist already has an overlapping session.",
		});
	}
}
