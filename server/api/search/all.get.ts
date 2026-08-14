import { AccessPermission } from "~/types/permissions";
// server/api/users/index.get.ts

export default defineAuthedHandler(
	{ access: [AccessPermission.USER_SERVICE, AccessPermission.EVALUATOR] },
	async () => {
		const patientUsers = await prisma.user.findMany({
			where: {
				NonEmployee: {
					// only keep NonEmployees which themselves have a Patient record
					Patient: { isNot: null },
				},
			},
			include: {
				NonEmployee: {
					include: {
						Patient: true,
					},
				},
			},
		});

		return patientUsers.map((u) => {
			const ne = u.NonEmployee!;
			return {
				id: u.id,
				name: formatFullName(u.fName, u.mInit, u.lName),
				type: u.type ?? "",
				age: ne.dob ? computeAge(ne.dob) : null,
				gender: ne.gender,
			};
		});
	}
);
