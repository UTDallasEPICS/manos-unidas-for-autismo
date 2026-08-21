import { AccessPermission } from "~/types/permissions";

// Existing therapist specialization names, for the create-account picker.
// ADMIN-only (used only by the account-creation form).
export default defineAuthedHandler(
	{ access: AccessPermission.ADMIN },
	async () => {
		const specs = await prisma.specialization.findMany({
			select: { name: true },
			orderBy: { name: "asc" },
		});
		return specs.map((s) => s.name);
	}
);
