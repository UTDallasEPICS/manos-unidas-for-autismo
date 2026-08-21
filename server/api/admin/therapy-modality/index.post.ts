import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

// Create a therapy modality (type) + its objectives. ADMIN-only. The stable
// `key` (stored on TherapyNote.therapyType) is auto-generated from the English
// label and de-duplicated, so admins never manage keys by hand.
const objectiveSchema = z.object({
	kind: z.enum(["objective", "header", "subheader"]),
	labelEn: z.string().trim().min(1),
	labelEs: z.string().trim().min(1),
});

const schema = z.object({
	labelEn: z.string().trim().min(1),
	labelEs: z.string().trim().min(1),
	active: z.boolean().default(true),
	objectives: z.array(objectiveSchema).default([]),
});

function slugKey(label: string): string {
	return (
		label
			.trim()
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, "_")
			.replace(/^_+|_+$/g, "") || "THERAPY"
	);
}

export default defineAuthedHandler(
	{ access: AccessPermission.ADMIN },
	async (event) => {
		const data = await validateBody(event, schema);

		const base = slugKey(data.labelEn);
		let key = base;
		let n = 2;
		while (await prisma.therapyModality.findUnique({ where: { key } })) {
			key = `${base}_${n++}`;
		}

		const max = await prisma.therapyModality.aggregate({
			_max: { order: true },
		});
		const order = (max._max.order ?? 0) + 1;

		try {
			return await prisma.therapyModality.create({
				data: {
					key,
					labelEn: data.labelEn,
					labelEs: data.labelEs,
					active: data.active,
					order,
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
		} catch (e) {
			handlePrismaError(e);
		}
	}
);
