// Basic types
type DateAndVal = {
	value: string;
	date: string;
};

// Basic interfaces

// For editing profile form data
export interface userInfo {
	firstName: string;
	middleInitial: string;
	lastName: string;
	DOB: string;
	gender: string;
}

export interface userAddressInfo {
	address: string;
	buildNum: string | number;
	city: string;
	postCode: string;
}

export interface userContactInfo {
	phone: string;
	email: string;
	whatsApp: string;
	contactPreference: string;
}

// for editing progress report data

export interface objectiveInfo {
	objectiveNames: string[];
	objectiveDetails: Record<string, string>;
	objectivesDate: string;
}

export interface goalsInfo {
	customGoals: Array<{ id: number; label: string; details: string }>;
	goals: DateAndVal;
}

export interface progressInfo {
	therapy: string;
	objectives: objectiveInfo;
	goals: goalsInfo;
	groupRecommendationParents: string;
}

export interface datedData {
	reinforcers: DateAndVal;
	famRecs: DateAndVal;
	progressNotes: DateAndVal;
	nextSeshObjectives: DateAndVal;
	incidents: DateAndVal;
	observations: DateAndVal;
}

// For therapy notes
export interface therapyInfo {
	id: number;
	patientId: string;
	sessionId?: string | null;
	createdAt: string;
	updatedAt: string;
	[key: string]: unknown;
}

// Recommendation (from therapy notes)
export interface Recommendation {
	id: number;
	familyRecommendations: string;
	familyRecommendationsDate: string;
}

// Patient medical/health info
export interface patientMedicalInfo {
	diagnosis?: string;
	medication?: string;
	allergies?: string;
	diet?: string;
}

// Patient administrative/ID info
export interface patientAdminInfo {
	recordNumber?: string;
	identification?: unknown;
	diagnosed?: unknown;
}

// Patient family/guardian info
export interface patientFamilyInfo {
	parentName?: string;
}

// Appointment tracking
export interface Appointment {
	paid: boolean;
}

export interface patientAppointmentInfo {
	Appointments?: Appointment[];
}

// NonEmployee personal info
export interface nonEmployeePersonalInfo {
	dob?: string;
	gender?: string;
}

// NonEmployee address (DB-side representation)
export interface nonEmployeeAddressInfo {
	streetNum?: string;
	streetName?: string;
	buildingNum?: string;
	postCode?: string;
	PostCodeCity?: { city?: string };
}

// NonEmployee → Patient nesting
export interface nonEmployeePatientNesting {
	Patient?: PatientDetails;
	[key: string]: unknown;
}

// Profile nesting
export interface profileNesting {
	NonEmployee?: NonEmployee;
	[key: string]: unknown;
}

// v-for loop config for therapy note fields
export interface NoteField {
	key: string;
	label: string;
	dateKey?: string;
}

// Complex types

export type ProfileForm = userInfo & userAddressInfo & userContactInfo;
export type ProgressForm = progressInfo & datedData;
// Set arrays in goals and objectives to empty arrays of the correct type
// For any string types that are optional, they will be made mandatory
// and if there isn't a value, just put an empty string.
export type TherapyNote = therapyInfo & datedData & progressInfo;

export type PatientDetails = patientMedicalInfo &
	patientAdminInfo &
	patientFamilyInfo &
	patientAppointmentInfo & { [key: string]: unknown };

export type NonEmployee = nonEmployeePersonalInfo &
	nonEmployeeAddressInfo &
	nonEmployeePatientNesting;

export type Profile = userInfo & userContactInfo & profileNesting;
