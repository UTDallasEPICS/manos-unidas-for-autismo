import { defineEventHandler, getRouterParam } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) return { error: "No session ID provided" };

	try {
		const session = await prisma.session.findUnique({
			where: { id: String(id) }, // 👈 make sure this is a string
			select: {
				id: true,
				therapistId: true,
				typeId: true,
				time: true,
				duration: true,
				maxAttendance: true,
				comment: true,
			},
		});

		if (!session) return { error: "Session not found" };

		return session;
	} catch (err) {
		console.error("API ERROR:", err);
		return { error: "Server error" };
	}
});
