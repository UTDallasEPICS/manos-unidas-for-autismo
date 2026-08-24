import { AccessPermission } from "~/types/permissions";

export default defineAuthedHandler(
	{
		access: [
			AccessPermission.THERAPIST,
			AccessPermission.USER_SERVICE,
			AccessPermission.ADMIN,
		],
	},
	async (event) => {
		const p = event.context.permissions;
		const user = event.context.user!;

		// A plain THERAPIST may only see reports they submitted; USER_SERVICE /
		// ADMIN (coordinators) see all, since they're the ones delivering them.
		const isTherapistOnly =
			!!p[AccessPermission.THERAPIST] &&
			!(p[AccessPermission.USER_SERVICE] || p[AccessPermission.ADMIN]);

		return await prisma.therapyReport.findMany({
			where: isTherapistOnly ? { therapistId: user.id } : undefined,
			orderBy: { createdAt: "desc" },
		});
	}
);
