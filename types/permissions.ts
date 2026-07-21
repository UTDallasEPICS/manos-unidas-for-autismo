enum AccessPermission {
	PUBLIC = "PUBLIC",
	USER = "USER",
	PATIENT = "PATIENT",
	PARENT = "PARENT",
	STAFF = "STAFF",
	THERAPIST = "THERAPIST",
	USER_SERVICE = "USER_SERVICE",
	IT_SERVICE = "IT_SERVICE",
	ADMIN = "ADMIN",
	EVALUATOR = "EVALUATOR",
}

type AccessVal = Partial<Record<AccessPermission, boolean>>;

/* 
	NOTE: 
		This does not check for extraneous APIs. Clean it yourself. Best to organize it in order when you expand all server/api folders.
		Also, careful when using / and /index. Include both to be safe.
*/

const pageAccessMap: { [routeName: string]: AccessPermission } = {
	// Public Pages
	index: AccessPermission.PUBLIC,
	login: AccessPermission.PUBLIC,
	"patient-contactForm": AccessPermission.PUBLIC,
	// All User Pages
	"dashboard-dashboard": AccessPermission.USER,
	"admin-scheduleView": AccessPermission.USER,
	// Patient Pages
	"myProfile-id": AccessPermission.PATIENT,
	"dashboard-patientDashboard": AccessPermission.PATIENT,
	// Parent Pages
	childSearch: AccessPermission.PARENT,
	"dashboard-parentDashboard": AccessPermission.PARENT,
	"childProfile-id": AccessPermission.PARENT,
	// All Staff Pages
	"patient-patientSearch": AccessPermission.STAFF,
	"patientProfile-id": AccessPermission.STAFF,
	// Therapist Pages
	"dashboard-therapistDashboard": AccessPermission.THERAPIST,
	// User Service Pages
	"dashboard-userServiceDashboard": AccessPermission.USER_SERVICE,
	"userService-viewAppointmentRequests": AccessPermission.USER_SERVICE,
	"userService-assignNeuroSpecialist": AccessPermission.USER_SERVICE,
	"patient-viewContactForms": AccessPermission.USER_SERVICE,
	// IT Service Pages
	"dashboard-iTServiceDashboard": AccessPermission.IT_SERVICE,
	// Admin Pages

	"admin-employeeSearch": AccessPermission.ADMIN,
	"admin-createAccount": AccessPermission.ADMIN,

	"dashboard-admin": AccessPermission.ADMIN,
	"admin-userSearch": AccessPermission.ADMIN,
	// "admin-employeeSearch": AccessPermission.ADMIN,

	// testing:
	"patient-testingForm": AccessPermission.PATIENT,

	// Contact & About
	contact: AccessPermission.USER,
	about: AccessPermission.USER,

	requestForm: AccessPermission.PUBLIC,
	"dashboard-evaluatorDashboard": AccessPermission.EVALUATOR,
};

const apiAccessMap: {
	[route: string]: { [method: string]: AccessPermission };
} = {
	"/api/me": {
		GET: AccessPermission.PUBLIC,
	},
	/*"/api/login": {
		POST: AccessPermission.PUBLIC,
	},
	"/api/updatePermissions": {
		GET: AccessPermission.PUBLIC,
	},*/
	"/api/contactForm/form": {
		POST: AccessPermission.PUBLIC,
	},
	"/api/session/create": {
		POST: AccessPermission.USER_SERVICE,
	},
	"/api/session/types": {
		GET: AccessPermission.USER_SERVICE || AccessPermission.ADMIN,
	},
};

export { AccessPermission, pageAccessMap, apiAccessMap };
// necessary to export separately as types do not actually "exist" in js
// its not a runtime value so its exported separately by ts (because of verbatimModuleSyntax)
export type { AccessVal };
