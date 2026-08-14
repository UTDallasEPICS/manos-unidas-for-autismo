import type { H3Event } from "h3";
import { AccessPermission } from "~/types/permissions";

/*
 * Reusable ownership predicates for `defineAuthedHandler({ ownership })`.
 *
 * ID-EQUALITY ASSUMPTION (verified from prisma/schema.prisma): for non-employees
 *   User.id === NonEmployee.id === Patient.id
 * because NonEmployee.id references User.id and Patient.id references
 * NonEmployee.id. Every current endpoint passes the User id, which therefore
 * equals the Patient id. If a caller ever passes a Patient.identification or a
 * NonEmployee-only id, these predicates break — always pass the User id.
 */

/**
 * True when the current user is clinical staff cleared to view patient PHI:
 * USER_SERVICE / EVALUATOR / ADMIN. Deliberately EXCLUDES IT_SERVICE — even
 * though computePermissions() grants STAFF to IT_SERVICE, IT is an IT-support
 * role with no clinical need for patient schedules or PHI. Use this instead of
 * a bare `permissions[STAFF]` gate on any endpoint that returns patient data.
 */
export function hasClinicalPatientAccess(event: H3Event): boolean {
	const p = event.context.permissions;
	return !!(
		p[AccessPermission.USER_SERVICE] ||
		p[AccessPermission.EVALUATOR] ||
		p[AccessPermission.ADMIN]
	);
}

/** True when the resource's owning userId is the current session user. */
export function isSelf(event: H3Event, userId: string): boolean {
	return event.context.user?.id === userId;
}

/**
 * True when the current user is a guardian of the given child. `childUserId`
 * equals the child's Patient.id, and the current user is the guardian
 * (guardianId === guardian User.id === NonEmployee.id) via a PatientGuardian
 * link.
 */
export async function isParentOf(
	event: H3Event,
	childUserId: string
): Promise<boolean> {
	const user = event.context.user;
	if (!user) return false;

	const link = await prisma.patientGuardian.findFirst({
		where: { guardianId: user.id, patientId: childUserId },
		select: { patientId: true },
	});

	return !!link;
}

/**
 * True when the current therapist is "assigned" to the patient, defined as
 * sharing at least one Session (Session.therapistId + SessionPatient).
 * `patientUserId` === Patient.id.
 */
export async function isAssignedTherapist(
	event: H3Event,
	patientUserId: string
): Promise<boolean> {
	const user = event.context.user;
	if (!user) return false;

	const count = await prisma.session.count({
		where: {
			therapistId: user.id,
			Patients: { some: { patientId: patientUserId } },
		},
	});

	return count > 0;
}

/**
 * True when the current user may view the given patient:
 *   - staff with patient access (USER_SERVICE / EVALUATOR / ADMIN), OR
 *   - the patient themself, OR
 *   - a parent of the patient, OR
 *   - a therapist assigned (via a shared Session) to the patient.
 * ADMIN is implied by the superset but listed explicitly for clarity.
 * `patientUserId` === Patient.id.
 */
export async function canViewPatient(
	event: H3Event,
	patientUserId: string
): Promise<boolean> {
	if (hasClinicalPatientAccess(event)) return true;
	if (isSelf(event, patientUserId)) return true;
	if (await isParentOf(event, patientUserId)) return true;
	if (await isAssignedTherapist(event, patientUserId)) return true;
	return false;
}

/**
 * True when the current user may manage a session's roster / attendance /
 * billing: clinical coordination staff (USER_SERVICE / ADMIN), or the therapist
 * who OWNS the session. Uses the session's `therapistId` rather than
 * isAssignedTherapist — attendance writes add patients who may not yet share a
 * session, so a shared-session check would be circular.
 */
export async function canManageSession(
	event: H3Event,
	sessionId: string
): Promise<boolean> {
	const p = event.context.permissions;
	if (p[AccessPermission.USER_SERVICE] || p[AccessPermission.ADMIN])
		return true;

	const session = await prisma.session.findUnique({
		where: { id: sessionId },
		select: { therapistId: true },
	});
	return !!session && session.therapistId === event.context.user?.id;
}
