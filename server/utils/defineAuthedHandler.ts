import type { EventHandler, H3Event } from "h3";
import type { AccessPermission } from "~/types/permissions";

/**
 * The access decision for a wrapped endpoint:
 *   - 'PUBLIC'          : anyone, no session required.
 *   - 'AUTH'            : any authenticated user (session present), no role required.
 *   - AccessPermission  : a single required role.
 *   - AccessPermission[]: any one of the listed roles (OR).
 *
 * ADMIN is a superset (computePermissions grants ADMIN every role boolean),
 * so ADMIN passes any role list automatically — no special-casing needed.
 */
export type AuthAccess =
	"PUBLIC" | "AUTH" | AccessPermission | AccessPermission[];

export interface AuthConfig {
	access: AuthAccess;
	/**
	 * Optional per-resource ownership check, run AFTER role checks pass and only
	 * when a user is present. Return false to deny with 403.
	 */
	ownership?: (event: H3Event) => Promise<boolean> | boolean;
}

/**
 * Colocated, deny-by-default authorization wrapper. Every endpoint under
 * server/api/** must make an explicit access decision through this wrapper;
 * unwrapped endpoints are denied by the tripwire plugin (fail CLOSED).
 *
 * On a full allow it sets `event.context.authorized = true` so the tripwire
 * lets the response through.
 */
export function defineAuthedHandler(
	config: AuthConfig,
	handler: EventHandler
): EventHandler {
	return defineEventHandler(async (event: H3Event) => {
		const { access } = config;

		// (1) Public endpoints require no session.
		if (access === "PUBLIC") {
			event.context.authorized = true;
			return handler(event);
		}

		// (2) Every non-public endpoint requires a user. Missing user -> 401.
		const user = event.context.user;
		if (!user) {
			throw createError({
				statusCode: 401,
				statusMessage: "Unauthorized",
			});
		}

		// (3) 'AUTH' just needs a present user (checked above).
		if (access !== "AUTH") {
			// (4) Role check: any one of the listed roles must be true.
			const roles = Array.isArray(access) ? access : [access];
			const hasRole = roles.some(
				(r) => event.context.permissions[r] === true
			);
			if (!hasRole) {
				throw createError({
					statusCode: 403,
					statusMessage: "Forbidden",
				});
			}
		}

		// (5) Optional ownership check. User is present here, so failure is 403.
		if (config.ownership) {
			const ok = await config.ownership(event);
			if (!ok) {
				throw createError({
					statusCode: 403,
					statusMessage: "Forbidden",
				});
			}
		}

		// (6) Full allow.
		event.context.authorized = true;
		return handler(event);
	});
}
