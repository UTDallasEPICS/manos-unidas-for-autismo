import { AccessPermission } from "~/types/permissions";

// Bookable "runs this session" candidates for the calendar's create/edit
// form: therapists (regular sessions) and evaluators (evaluation
// appointments). Kept separate from session/therapists.get.ts, which backs
// the existing CreateAppointment.vue therapist-only dropdown and shouldn't
// start offering evaluators as an option there.
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
