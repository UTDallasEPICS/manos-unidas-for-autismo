import { AccessPermission } from "~/types/permissions";

// Bookable "runs this session" candidates for the calendar's create/edit
// form (SessionDetailModal): therapists (regular sessions) and evaluators
// (evaluation appointments). Kept separate from session/therapists.get.ts,
// which is THERAPIST-only and used elsewhere (e.g. resolving therapist names
// on the evaluator referrals list) — that contract shouldn't start returning
// evaluators too.
export default defineAuthedHandler(
	{ access: AccessPermission.STAFF },
	async () => {
		const staff = await prisma.user.findMany({
			where: { type: { in: ["THERAPIST", "EVALUATOR"] } },
			select: {
				id: true,
				fName: true,
				lName: true,
				type: true,
			},
			orderBy: { lName: "asc" },
		});

		return staff;
	}
);
