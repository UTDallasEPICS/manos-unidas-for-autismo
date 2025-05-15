enum AccessPermission {
	PUBLIC = "PUBLIC",
	USER = "USER",
	PATIENT = "PATIENT",
	PARENT = "PARENT",
	STAFF = "STAFF",
	THERAPIST = "THERAPIST",
	USER_SERVICE = "USER_SERVICE",
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
	"myProfile-id": AccessPermission.PATIENT,
	// Parent Pages
	childSearch: AccessPermission.PARENT,
	"childProfile-id": AccessPermission.PARENT,
	// All Staff Pages
	patientSearch: AccessPermission.STAFF,
	"patientProfile-id": AccessPermission.STAFF,
	viewContactForms: AccessPermission.STAFF,
	// Therapist Pages
	// User Service Pages
	// Admin Pages
	admin: AccessPermission.ADMIN,
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
		POST: AccessPermission.USER_SERVICE,
	},
	"/api/session/sessionType": {
		GET: AccessPermission.USER_SERVICE || AccessPermission.ADMIN,
	},
};

export { AccessPermission, pageAccessMap, apiAccessMap };
