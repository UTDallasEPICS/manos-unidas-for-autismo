/*
 * Deny-by-default tripwire.
 *
 * Every /api/** route MUST make an explicit access decision through
 * defineAuthedHandler, which sets `event.context.authorized = true` on allow.
 * This plugin runs after the route handler has produced a value but before it
 * is sent (Nitro `beforeResponse`); if a matched /api route reached this point
 * WITHOUT authorized === true, it was never wrapped — so we DENY the response.
 *
 * SCOPE: this runs AFTER the handler, so it is defense-in-depth, not a perfect
 * backstop — a forgotten wrapper on a mutating endpoint would have already
 * written to the DB before the 403 is substituted, and a handler that writes the
 * response itself (sendStream/res.end) can slip past it. The PRIMARY guarantee is
 * the `checker` CI step (scripts/check-endpoint-auth.mjs), which fails the build
 * if any server/api endpoint is missing defineAuthedHandler.
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
