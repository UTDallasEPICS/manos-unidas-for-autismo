import { z } from "zod";
import type { Status } from "@prisma/client";
import { AccessPermission } from "~/types/permissions";

const schema = z.object({
	term: z.enum(["PROCESSING", "COMPLETED", "PENDING"]),
});

const validateSchema = schema.strict();

export default defineAuthedHandler(
	{ access: [AccessPermission.USER_SERVICE, AccessPermission.EVALUATOR] },
	async (event) => {
		const { term } = await validateQuery(event, validateSchema);

		const items = await prisma.user.findMany({
			where: {
				NonEmployee: {
					Patient: {
						ContactForm: {
							status: {
								equals: term as Status,
							},
						},
					},
				},
			},
			include: {
				NonEmployee: {
					include: {
						Patient: {
							include: {
								ContactForm: true,
							},
						},
					},
				},
			},
		});

		return items;
	}
);
