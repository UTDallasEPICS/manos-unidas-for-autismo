// Route guard for /dev. This diagnostics page is ADMIN/IT-only in EVERY
// environment (including local) — it exposes build/session internals and a
// full route map, so it is never opened up to other roles or anonymous users.
// Attached explicitly via definePageMeta({ middleware: "dev" }); the target
// pages it links to still enforce their own server-side authorization.
export default defineNuxtRouteMiddleware(() => {
	const { can } = useAccess();
	if (can("ADMIN") || can("IT_SERVICE")) return;

	// Anyone else (wrong role or not logged in) is bounced to their dashboard,
	// which itself sends anonymous users back to the landing/login page.
	const { dashboardNavigation } = useDashboardNavigation();
	return dashboardNavigation();
});
