import { AccessPermission } from "~/types/permissions";
export default defineAuthedHandler(
	{ access: AccessPermission.STAFF },
	async () => {
		const therapists = await prisma.user.findMany({
			where: { type: "THERAPIST" },
			select: {
				id: true,
				fName: true,
				lName: true,
			},
			orderBy: { lName: "asc" },
		});

		// return an array of { id, fName, lName }
		return therapists;
	}
);
