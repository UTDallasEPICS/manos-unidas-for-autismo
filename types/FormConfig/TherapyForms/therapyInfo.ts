export type DateAndVal = { value: string; date: string };

export interface TherapySelectionData {
	selectedTherapies: string[];
	selectedObjectives: string[];
	objectiveDetails: Record<string, string>;
	objectivesDate: string;
	customGoals: Array<{ id: number; label: string; details: string }>;
}

export interface TherapyReinforcerData {
	reinforcers: DateAndVal;
}

export interface TherapyRecommendationData {
	familyRecommendations: DateAndVal;
	groupRecommendationParents: string;
}

export interface TherapyGoalsData {
	goalsAchieved: DateAndVal;
}

export interface TherapyProgressData {
	progressNotes: DateAndVal;
	nextSessionObjectives: DateAndVal;
}

export interface TherapyIncidentData {
	incidents: DateAndVal;
	generalObservations: DateAndVal;
}

export type TherapyNoteForm = TherapySelectionData &
	TherapyReinforcerData &
	TherapyRecommendationData &
	TherapyGoalsData &
	TherapyProgressData &
	TherapyIncidentData;

export interface TherapyNoteObjective {
	goalKey?: string | null;
	goalLabel?: string;
	details?: string | null;
}

export interface TherapyNoteSelectionData {
	therapyTypes?: string[];
	objectivesDate?: string;
	objectives?: TherapyNoteObjective[];
}

export interface TherapyNoteReinforcerData {
	reinforcersUsed?: string;
	reinforcersDate?: string;
}

export interface TherapyNoteRecommendationData {
	familyRecommendations?: string;
	familyRecommendationsDate?: string;
	groupRecommendationParents?: string;
}

export interface TherapyNoteGoalsData {
	goalsAchieved?: string;
	goalsAchievedDate?: string;
}

export interface TherapyNoteProgressData {
	progressNotes?: string;
	progressNotesDate?: string;
	nextSessionObjectives?: string;
	nextSessionObjectivesDate?: string;
}

export interface TherapyNoteIncidentData {
	incidents?: string;
	incidentsDate?: string;
	generalObservations?: string;
	generalObservationsDate?: string;
}

export type TherapyNote = {
	id: number;
	createdAt?: string;
	updatedAt?: string;
} & TherapyNoteSelectionData &
	TherapyNoteReinforcerData &
	TherapyNoteRecommendationData &
	TherapyNoteGoalsData &
	TherapyNoteProgressData &
	TherapyNoteIncidentData;

export interface NoteField {
	key: keyof TherapyNote;
	label: string;
	dateKey?: keyof TherapyNote;
}
