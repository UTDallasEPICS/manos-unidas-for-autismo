// server/api/session/[id].put.ts
import { defineEventHandler, readBody, getRouterParam } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) {
		return { error: "No session ID provided" };
	}

	const body = await readBody(event);

	try {
		const updated = await prisma.session.update({
			where: { id },
			data: {
				therapistId: body.therapistId,
				typeId: body.typeId,
				time: body.time,
				duration: body.duration,
				maxAttendance: body.maxAttendance,
				comment: body.comment,
			},
		});

		return updated;
	} catch (error) {
		console.error("Failed to update session:", error);
		return {
			error: "Failed to update session. Please ensure the ID exists and the data is valid.",
		};
	}
});
