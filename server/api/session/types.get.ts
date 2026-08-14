import { AccessPermission } from "~/types/permissions";
export default defineAuthedHandler(
	{ access: AccessPermission.STAFF },
	async () => {
		return prisma.sessionType.findMany();
	}
);
