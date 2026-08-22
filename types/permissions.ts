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

// Whitelisted user shape returned by the customSession plugin to the client.
interface SessionUser {
	id: string;
	fName: string;
	lName: string;
	email: string;
	type: string | null;
}

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
	"patient-appointments": AccessPermission.PATIENT,
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
	"intake-id": AccessPermission.USER_SERVICE,
	"request-id": AccessPermission.USER_SERVICE,
	"session-sessionsView": AccessPermission.USER_SERVICE,
	// IT Service Pages
	"dashboard-iTServiceDashboard": AccessPermission.IT_SERVICE,
	// Admin Pages

	employees: AccessPermission.ADMIN,
	"employees-create": AccessPermission.ADMIN,
	"therapy-types": AccessPermission.ADMIN,

	"dashboard-admin": AccessPermission.ADMIN,

	// Contact
	contact: AccessPermission.USER,

	requestForm: AccessPermission.PUBLIC,
	"dashboard-evaluatorDashboard": AccessPermission.EVALUATOR,
	"evaluator-createReferral": AccessPermission.EVALUATOR,
	"evaluator-myReferrals": AccessPermission.EVALUATOR,
};

export { AccessPermission, pageAccessMap };
// necessary to export separately as types do not actually "exist" in js
// its not a runtime value so its exported separately by ts (because of verbatimModuleSyntax)
export type { AccessVal, SessionUser };
