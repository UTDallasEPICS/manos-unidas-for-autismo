import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const schema = z.object({
	patientId: z.string(),
});

export default defineAuthedHandler(
	{ access: AccessPermission.THERAPIST },
	async (event) => {
		const { patientId } = await validateQuery(event, schema);
		const userId = event.context.user?.id;
		const permissions = event.context.permissions;

		const isAdmin =
			permissions[AccessPermission.ADMIN] ||
			permissions[AccessPermission.USER_SERVICE];

		return await prisma.session.findMany({
			where: {
				Patients: {
					some: { patientId },
				},
				// Therapists only see their own sessions
				...(!isAdmin && { therapistId: userId }),
			},
			include: {
				Type: true,
				Therapist: true,
				TherapyNotes: {
					where: { patientId },
					select: { id: true },
				},
			},
			orderBy: { time: "desc" },
		});
	}
);
