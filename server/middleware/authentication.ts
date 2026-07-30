import { AccessPermission } from "~/types/permissions";
import type { AccessVal, SessionUser } from "~/types/permissions";
import { auth } from "~/server/utils/auth";

declare module "h3" {
	interface H3EventContext {
		permissions: AccessVal;
		user: SessionUser | null;
		authorized?: boolean;
	}
}

// Forwards the Better Auth session into the request context. Permissions are
// computed once by the customSession plugin (server/utils/permissions.ts) and
// travel with the session, so this middleware does not re-compute them — one
// source of truth.
export default defineEventHandler(async (event) => {
	const session = (await auth.api.getSession({ headers: event.headers })) as {
		user?: SessionUser;
		permissions?: AccessVal;
	} | null;

	event.context.user = session?.user ?? null;
	event.context.permissions = session?.permissions ?? {
		[AccessPermission.PUBLIC]: true,
	};
});
