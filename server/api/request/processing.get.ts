import { Status } from "@prisma/client";
import { AccessPermission } from "~/types/permissions";

export default defineAuthedHandler(
	{ access: AccessPermission.USER_SERVICE },
	async () => {
		const requests = await prisma.request.findMany({
			where: { status: Status.PROCESSING },
			include: {
				therapies: true,
				complementaryServices: true,
				workshops: true,
				phone: true,
			},
			orderBy: { createdAt: "desc" },
		});
		return requests;
	}
);
