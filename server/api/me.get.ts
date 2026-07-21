export default defineEventHandler((event) => {
	console.log("ME endpoint - user:", event.context.user?.id ?? "null");
	return {
		user: event.context.user ?? null,
		permissions: event.context.permissions ?? {},
	};
});
