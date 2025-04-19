export default defineEventHandler(async (event) => {
	console.log(event.context.permissions);
	setCookie(
		event,
		"AccessPermission",
		JSON.stringify(event.context.permissions)
	);
	return `Successfully updated permissions: ${JSON.stringify(event.context.permissions)}`;
});
