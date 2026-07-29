/*
 * Deny-by-default tripwire.
 *
 * Every /api/** route MUST make an explicit access decision through
 * defineAuthedHandler, which sets `event.context.authorized = true` on allow.
 * This plugin runs after the route handler has produced a value but before it
 * is sent (Nitro `beforeResponse`); if a matched /api route reached this point
 * WITHOUT authorized === true, it was never wrapped — so we DENY. Forgetting to
 * wrap an endpoint therefore fails CLOSED, never open.
 *
 * Passthroughs:
 *   - non-/api paths (SSR pages, static assets) — never touch them.
 *   - /api/auth/** — Better Auth handles its own authorization.
 */
export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("beforeResponse", (event, response) => {
		const path = event.path ?? getRequestURL(event).pathname;

		if (!path.startsWith("/api/")) return;
		if (path.startsWith("/api/auth/")) return;
		if (event.context.authorized === true) return;

		setResponseStatus(event, 403);
		response.body = {
			error: true,
			statusCode: 403,
			statusMessage: "Forbidden",
			message: "Endpoint not authorized (no explicit access decision)",
		};
	});
});
