enum AccessPermission {
	PUBLIC = "PUBLIC",
	USER = "USER",
	PATIENT = "PATIENT",
	PARENT = "PARENT",
	THERAPIST = "THERAPIST",
	USER_SUPPORT = "USER_SUPPORT",
	ADMIN = "ADMIN",
}

/* 
	NOTE: 
		This does not check for extraneous APIs. Clean it yourself. Best to organize it in order when you expand all server/api folders.
		Also, careful when using / and /index. Include both to be safe.
*/

const pageAccessMap: { [route: string]: AccessPermission } = {
	"/": AccessPermission.PUBLIC,
	"/index": AccessPermission.PUBLIC,
	"/contactForm": AccessPermission.PUBLIC,
	"/dashboard": AccessPermission.USER,
};
const apiAccessMap: {
	[route: string]: { [method: string]: AccessPermission };
} = {
	"/api/login": {
		POST: AccessPermission.PUBLIC,
	},
	"/api/updatePermissions": {
		GET: AccessPermission.PUBLIC,
	},
};

export { AccessPermission, pageAccessMap, apiAccessMap };
