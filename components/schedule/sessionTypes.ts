export type SessionPatientDetails = {
	sessionId: string;
	patientId: string;
	paid: boolean;
	Patient: {
		id: string;
		User: {
			id: string;
			User: {
				id: string;
				fName: string;
				lName: string;
			};
		};
	};
};

export type SessionWithAttendance = {
	id: string;
	time: string | Date;
	duration: number;
	maxAttendance: number;
	Type: { name: string } | null;
	Therapist: {
		id: string;
		fName: string | null;
		lName: string | null;
	} | null;
	Patients: SessionPatientDetails[];
};
