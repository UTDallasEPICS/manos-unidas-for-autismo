import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const schema = z.object({
	pId: z.string(),
});

const validateSchema = schema.strict();

export default defineAuthedHandler(
	{
		access: [AccessPermission.PARENT, AccessPermission.STAFF],
		// Returns a parent's children ids (patient identities), so scope to
		// clinical staff (USER_SERVICE|EVALUATOR|ADMIN, NOT IT_SERVICE) or the
		// parent themself — a bare STAFF gate would admit IT_SERVICE.
		ownership: async (event) => {
			const { pId } = await validateQuery(event, validateSchema);
			if (hasClinicalPatientAccess(event)) return true;
			return isSelf(event, pId);
		},
	},
	async (event) => {
		const { pId } = await validateQuery(event, validateSchema);

		const guardianships = await prisma.patientGuardian.findMany({
			where: { guardianId: pId },
			select: { patientId: true },
		});

		return guardianships.map((g) => g.patientId);
	}
);
