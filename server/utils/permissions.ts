import type { Prisma } from "@prisma/client";
import { UserType } from "@prisma/client";
import { AccessPermission, type AccessVal } from "~/types/permissions";

export type UserWithRelations = Prisma.UserGetPayload<{
	include: {
		NonEmployee: {
			include: {
				GuardianLinks: { select: { patientId: true } };
				Patient: true;
			};
		};
	};
}>;

/**
 * Single source of truth mapping a user (with relations) to their permission set.
 *
 * Consumed by the Better Auth `customSession` plugin so permissions travel with
 * the session to both the client (`useSession`) and the server
 * (`auth.api.getSession` → authentication middleware). There is exactly one
 * place that decides "what can this user do": here.
 */
export function computePermissions(
	user: UserWithRelations | null | undefined
): AccessVal {
	const perms: AccessVal = { [AccessPermission.PUBLIC]: true };
	if (!user) return perms;

	perms[AccessPermission.USER] = true;

	switch (user.type) {
		case UserType.ADMIN:
			// ADMIN is a full superset of every employee capability.
			perms[AccessPermission.ADMIN] = true;
			perms[AccessPermission.STAFF] = true;
			perms[AccessPermission.USER_SERVICE] = true;
			perms[AccessPermission.IT_SERVICE] = true;
			perms[AccessPermission.THERAPIST] = true;
			perms[AccessPermission.EVALUATOR] = true;
			break;
		case UserType.USER_SERVICE:
			perms[AccessPermission.USER_SERVICE] = true;
			perms[AccessPermission.STAFF] = true;
			break;
		case UserType.IT_SERVICE:
			perms[AccessPermission.IT_SERVICE] = true;
			perms[AccessPermission.STAFF] = true;
			break;
		case UserType.THERAPIST:
			perms[AccessPermission.THERAPIST] = true;
			perms[AccessPermission.STAFF] = true;
			break;
		case UserType.EVALUATOR:
			perms[AccessPermission.EVALUATOR] = true;
			perms[AccessPermission.STAFF] = true;
			break;
	}

	// Relationship-derived roles: a NonEmployee may be a patient and/or a
	// guardian (a guardian of one or more patients via PatientGuardian).
	if (user.NonEmployee?.Patient) perms[AccessPermission.PATIENT] = true;
	if (user.NonEmployee?.GuardianLinks?.length)
		perms[AccessPermission.PARENT] = true;

	return perms;
}
