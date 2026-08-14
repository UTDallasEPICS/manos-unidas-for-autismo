import { AccessPermission } from "~/types/permissions";
// server/api/search/employees.get.ts

export default defineAuthedHandler(
	{ access: AccessPermission.ADMIN },
	async () => {
		// Fetch employees (users with non-null `type`) and include useful relations
		const employeeUsers = await prisma.user.findMany({
			where: {
				AND: [
					{ type: { not: null } }, // must have a type
					{ NonEmployee: null }, // exclude users linked to NonEmployee
				],
			},
			include: {
				Specializations: true,
				Sessions: true,
			},
			orderBy: { lName: "asc" },
		});

		return employeeUsers.map((u) => {
			return {
				id: u.id,
				name: formatFullName(u.fName, u.mInit, u.lName),
				email: u.email ?? null,
				phone: u.phone ?? null,
				whatsApp: u.whatsApp ?? null,
				contactPref: u.contactPref ?? null,
				type: u.type ?? null,
				specializations: (u.Specializations || []).map((s) => s.name),
				sessions: (u.Sessions || []).map((s) => ({
					id: s.id,
					time: s.time,
					duration: s.duration,
				})),
			};
		});
	}
);
