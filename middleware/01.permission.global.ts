import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { pageAccessMap, AccessPermission } from "~/types/permissions";

// UX-only routing guard. Real authorization is enforced server-side (the
// authentication middleware + defineAuthedHandler on every endpoint). This just
// improves the client experience: send anonymous users to /login, and bounce
// logged-in users who lack a page's permission back to their dashboard.
export default defineNuxtRouteMiddleware((to) => {
	const { userId, access } = useAuthState();

	// Logged-in users landing on the public root go straight to their dashboard
	// (issue #210). Runs SSR-side off the seeded session, so there's no flash.
	if (to.name === "index" && userId.value) {
		const { dashboardNavigation } = useDashboardNavigation();
		return dashboardNavigation();
	}

	const required = pageAccessMap[to.name as string];

	// Public routes, or routes not in the map: let the page handle it.
	if (!required || required === AccessPermission.PUBLIC) {
		return;
	}

	// Not logged in → login.
	if (!userId.value) {
		return navigateTo("/login");
	}

	// Logged in but missing the page's required permission → their dashboard.
	if (!(access.value && access.value[required])) {
		const { dashboardNavigation } = useDashboardNavigation();
		return dashboardNavigation();
	}
});
