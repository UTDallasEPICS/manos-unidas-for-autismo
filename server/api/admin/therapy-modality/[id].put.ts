import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

// Update a therapy modality + fully replace its objectives (the editor sends the
// whole list on save). ADMIN-only. `key` is immutable so existing TherapyNotes
// keep resolving.
const objectiveSchema = z.object({
	kind: z.enum(["objective", "header", "subheader"]),
	labelEn: z.string().trim().min(1),
	labelEs: z.string().trim().min(1),
});

const schema = z.object({
	labelEn: z.string().trim().min(1),
	labelEs: z.string().trim().min(1),
	active: z.boolean(),
	order: z.number().int().optional(),
	objectives: z.array(objectiveSchema).default([]),
});

export default defineAuthedHandler(
	{ access: AccessPermission.ADMIN },
	async (event) => {
		const id = getRouterParam(event, "id");
		if (!id) {
			throw createError({ statusCode: 400, statusMessage: "Missing id" });
		}
		const data = await validateBody(event, schema);

		try {
			return await prisma.$transaction(async (tx) => {
				await tx.therapyObjective.deleteMany({
					where: { therapyModalityId: id },
				});
				return tx.therapyModality.update({
					where: { id },
					data: {
						labelEn: data.labelEn,
						labelEs: data.labelEs,
						active: data.active,
						...(data.order !== undefined
							? { order: data.order }
							: {}),
						Objectives: {
							create: data.objectives.map((o, i) => ({
								kind: o.kind,
								labelEn: o.labelEn,
								labelEs: o.labelEs,
								order: i,
							})),
						},
					},
					include: { Objectives: { orderBy: { order: "asc" } } },
				});
			});
		} catch (e) {
			handlePrismaError(e);
		}
	}
);
