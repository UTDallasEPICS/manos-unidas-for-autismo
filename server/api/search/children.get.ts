import { z } from "zod";
import { AccessPermission } from "~/types/permissions";

const schema = z.object({
	pId: z.string(),
});

const validateSchema = schema.strict();

export default defineAuthedHandler(
	{
		access: [AccessPermission.PARENT, AccessPermission.STAFF],
		// Returns a parent's children with name/age/gender (patient PHI), so
		// scope to clinical staff (USER_SERVICE|EVALUATOR|ADMIN, NOT IT_SERVICE)
		// or the parent themself — a bare STAFF gate would leak PHI to IT_SERVICE.
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
			include: {
				Patient: {
					include: {
						User: {
							include: {
								User: true,
							},
						},
					},
				},
			},
		});

		return guardianships.map((g) => {
			const ne = g.Patient.User!;
			const u = ne.User!;
			return {
				id: u.id,
				name: formatFullName(u.fName, u.mInit, u.lName),
				type: u.type ?? "",
				age: ne.dob ? computeAge(ne.dob) : null,
				gender: ne.gender,
			};
		});
	}
);
