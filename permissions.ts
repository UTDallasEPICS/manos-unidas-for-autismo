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
	// Public Pages
	"/": AccessPermission.PUBLIC,
	"/index": AccessPermission.PUBLIC,
	"/ContactForm": AccessPermission.PUBLIC,
	// All User Pages
	"/Dashboard": AccessPermission.USER,
	"/ScheduleView": AccessPermission.USER,
	// Patient Pages
	"/MyProfile": AccessPermission.PATIENT,
	// Parent Pages
	"/ChildProfiles": AccessPermission.PARENT,
	// Therapist Pages
	"/patientProfile": AccessPermission.THERAPIST,
	// User Support Pages
	"/ReviewContactForms": AccessPermission.USER_SUPPORT,
	// Admin Pages
	"/Admin": AccessPermission.ADMIN,
	// User Search Page
	"/patientSearch": AccessPermission.THERAPIST,
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
