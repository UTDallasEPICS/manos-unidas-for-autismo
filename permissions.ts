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

const pageAccessMap: { [routeName: string]: AccessPermission } = {
	// Public Pages
	index: AccessPermission.PUBLIC,
	contactForm: AccessPermission.PUBLIC,
	// All User Pages
	dashboard: AccessPermission.USER,
	scheduleView: AccessPermission.USER,
	// Patient Pages
	// Parent Pages
	childProfiles: AccessPermission.PARENT,
	// Therapist Pages
	"patientProfile-id": AccessPermission.THERAPIST,
	// User Support Pages
	reviewContactForms: AccessPermission.USER_SUPPORT,
	// Admin Pages
	admin: AccessPermission.ADMIN,
	// User Search Page
	patientSearch: AccessPermission.THERAPIST,
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
	"/api/contactForm/form": {
		POST: AccessPermission.PUBLIC,
	},
	"/api/session/create": {
		POST: AccessPermission.USER_SUPPORT,
	},
	"/api/session/sessionType": {
		GET: AccessPermission.USER_SUPPORT || AccessPermission.ADMIN,
	},
};

export { AccessPermission, pageAccessMap, apiAccessMap };
