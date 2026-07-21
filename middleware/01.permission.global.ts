import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { pageAccessMap, AccessPermission } from "~/types/permissions";

export default defineNuxtRouteMiddleware(async (to) => {
	const { access, userId, fetchMe } = useAuthState();

	// Fetch permissions
	await fetchMe();

	const permissions = access.value;
	const requiredAccessPermission = pageAccessMap[to.name as string];

	// Allow PUBLIC routes without authentication
	if (requiredAccessPermission === AccessPermission.PUBLIC) {
		console.log("Public route, navigation authorized");
		return;
	}

	// Unknown route — allow and let the page handle it
	if (!requiredAccessPermission) {
		console.log("Unknown route, navigation authorized");
		return;
	}

	// Not logged in
	if (!userId.value) {
		console.log("Not logged in, redirecting to login");
		return navigateTo("/login");
	}

	// Check permission
	if (
		permissions &&
		typeof permissions === "object" &&
		permissions[requiredAccessPermission as AccessPermission]
	) {
		console.log("Navigation authorized");
		return;
	}

	console.log("Navigation unauthorized, redirecting to login");
	return navigateTo("/login");
});
