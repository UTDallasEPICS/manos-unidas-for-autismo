import { AccessPermission } from "~/types/permissions";

// The therapy-modality catalog (types + their objectives) for the therapy-note
// drilldown. Returns all modalities (active + inactive) so historical notes
// referencing a now-inactive/legacy type still resolve a label; the client
// filters to `active` for the picker. STAFF-gated (clinical staff only).
export default defineAuthedHandler(
	{ access: AccessPermission.STAFF },
	async () => {
		return prisma.therapyModality.findMany({
			orderBy: { order: "asc" },
			include: {
				Objectives: { orderBy: { order: "asc" } },
			},
		});
	}
);
