import { defineNuxtRouteMiddleware } from "nuxt/app";
import { pageAccessMap } from "~/permissions";

export default defineNuxtRouteMiddleware((to, from) => {
	const accessCookie = useCookie("AccessPermission");
	const permissions = accessCookie.value;

	console.log(
		"Attempting to navigating\nfrom: " + from.path + ", to: " + to.path
	);
	// TODO, handle when navigating back to index page while logged in
	if (to.path == "/") {
		console.log("Navigation authorized");
		return;
	}

	// page does not exist in pageAccessMap
	if (!pageAccessMap[to.name]) {
		if (!from.path || to.path == from.path) {
			console.log("Unknown path, navigating to index");
			return navigateTo("/");
		} else {
			console.log("Unknown path, returning to: " + from.path);
			return navigateTo(from.path);
		}
	}
	// do not have permission to access
	const requiredAccessPermission: string = pageAccessMap[to.name];
	if (
		!(
			permissions &&
			typeof permissions === "object" &&
			permissions[requiredAccessPermission]
		)
	) {
		if (!from.path) {
			return navigateTo(from.path);
		}
		if (!from.path || to.path == from.path) {
			console.log("Unauthorized path, navigating to index");
			return navigateTo("/");
		} else {
			console.log("Unauthorized path, returning to: " + from.path);
			return navigateTo(from.path);
		}
	}
	console.log("Navigation authorized");
});
