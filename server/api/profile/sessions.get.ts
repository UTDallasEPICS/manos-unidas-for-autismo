import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const schema = z.object({
	patientId: z.string(),
});

export default defineAuthedHandler(
	// ADMIN passes any role list via the permission superset. USER_SERVICE is
	// listed explicitly because it does NOT inherit THERAPIST — without it,
	// user-service coordinators would be denied before reaching the handler.
	{ access: [AccessPermission.THERAPIST, AccessPermission.USER_SERVICE] },
	async (event) => {
		const { patientId } = await validateQuery(event, schema);
		const userId = event.context.user?.id;
		const permissions = event.context.permissions;

		// USER_SERVICE / ADMIN coordinate all sessions for a patient; a
		// therapist only sees the sessions they own.
		const seesAllSessions =
			permissions[AccessPermission.ADMIN] ||
			permissions[AccessPermission.USER_SERVICE];

		return await prisma.session.findMany({
			where: {
				Patients: {
					some: { patientId },
				},
				// Therapists only see their own sessions
				...(!seesAllSessions && { therapistId: userId }),
			},
			include: {
				Type: true,
				// Only the therapist's name is rendered — avoid leaking the
				// rest of the therapist's User row to the client.
				Therapist: { select: { fName: true, lName: true } },
				TherapyNotes: {
					where: { patientId },
					select: { id: true },
				},
			},
			orderBy: { time: "desc" },
		});
	}
);
