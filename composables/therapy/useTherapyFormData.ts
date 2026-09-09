import { useFormData } from "~/composables/form/useFormData";
import { useFormValidation } from "~/composables/form/useFormValidation";
import { therapyFormBlueprint } from "~/types/FormConfig";
import type {
	FormFieldConfig,
	FormFieldValue,
	DrilldownValue,
	ObjectiveDetailsValue,
	CustomGoal,
} from "~/types/FormConfig/formConfig";
import type {
	TherapyNoteForm,
	TherapyNote,
} from "~/types/FormConfig/TherapyForms/therapyInfo";

export interface CustomInput {
	model: WritableComputedRef<FormFieldValue>;
	config: FormFieldConfig;
}

export function useTherapyFormData(
	modelValue: Ref<boolean>,
	editingNote: Ref<TherapyNote | undefined>
) {
	const {
		formData: baseFormData,
		getFieldValue,
		setFieldValue,
		resetForm: resetBlueprint,
	} = useFormData(therapyFormBlueprint);

	const { validateBlueprint } = useFormValidation(
		therapyFormBlueprint,
		getFieldValue
	);

	const formData = computed({
		get: () => baseFormData.value as unknown as TherapyNoteForm,
		set: (val) => {
			baseFormData.value = val as unknown as typeof baseFormData.value;
		},
	});

	// --- Custom inputs (not driven by blueprint) ---

	function sameTherapies(a: string[], b: string[]): boolean {
		return a.length === b.length && a.every((v) => b.includes(v));
	}

	const therapyDrilldownValue = computed({
		get: (): DrilldownValue => ({
			selected: formData.value.selectedTherapies ?? [],
			checked: formData.value.selectedObjectives ?? [],
		}),
		set: (val: DrilldownValue) => {
			if (
				!sameTherapies(val.selected, formData.value.selectedTherapies)
			) {
				formData.value.objectiveDetails = {};
			}
			formData.value.selectedTherapies = val.selected;
			formData.value.selectedObjectives = val.checked;
		},
	});

	const objectiveDetailsValue = computed({
		get: (): ObjectiveDetailsValue => ({
			objectives: formData.value.selectedObjectives ?? [],
			details: formData.value.objectiveDetails ?? {},
			date: formData.value.objectivesDate ?? "",
		}),
		set: (val: ObjectiveDetailsValue) => {
			formData.value.objectiveDetails = val.details;
			formData.value.objectivesDate = val.date;
		},
	});

	const customGoalsValue = computed({
		get: (): CustomGoal[] => formData.value.customGoals ?? [],
		set: (val: CustomGoal[]) => {
			formData.value.customGoals = val;
		},
	});

	const customInputs: CustomInput[] = [
		{
			model: therapyDrilldownValue as WritableComputedRef<FormFieldValue>,
			config: {
				name: "therapySelection",
				label: "Therapy (drill down)",
				type: "therapydrilldown",
				required: true,
			},
		},
		{
			model: objectiveDetailsValue as WritableComputedRef<FormFieldValue>,
			config: {
				name: "objectiveDetails",
				label: "Objectives worked on - details",
				type: "objectivedetails",
			},
		},
		{
			model: customGoalsValue as WritableComputedRef<FormFieldValue>,
			config: {
				name: "customGoals",
				label: "Other goal(s)",
				type: "customgoals",
			},
		},
	];

	// --- Reset / populate ---

	function resetForm() {
		resetBlueprint();
		Object.assign(formData.value, {
			selectedTherapies: [],
			selectedObjectives: [],
			objectiveDetails: {},
			objectivesDate: "",
			customGoals: [],
		});
	}
	resetForm();

	function isRowVisible(row: FormFieldConfig[]): boolean {
		if (row.some((f) => f.name === "groupRecommendationParents")) {
			return formData.value.selectedTherapies.includes(
				"INDEPENDENT_LIVING"
			);
		}
		return true;
	}

	// --- Validation ---

	function validate(): boolean {
		if (!formData.value.selectedTherapies.length) {
			alert("Please select at least one therapy.");
			return false;
		}

		const blueprintError = validateBlueprint();
		if (blueprintError) {
			alert(blueprintError);
			return false;
		}

		const hasObjectives = formData.value.selectedObjectives.length > 0;
		const hasCustomGoals = formData.value.customGoals.some(
			(g) => g.label?.trim() || g.details?.trim()
		);
		if (!hasObjectives && !hasCustomGoals) {
			alert("Please select at least one objective or add another goal.");
			return false;
		}

		return true;
	}

	// --- Populate from existing note ---

	function populateFromNote(note: TherapyNote) {
		formData.value.selectedTherapies = note.therapyTypes ?? [];
		formData.value.objectivesDate = note.objectivesDate
			? note.objectivesDate.slice(0, 10)
			: "";
		formData.value.reinforcers = {
			value: note.reinforcersUsed || "",
			date: note.reinforcersDate ? note.reinforcersDate.slice(0, 10) : "",
		};
		formData.value.familyRecommendations = {
			value: note.familyRecommendations || "",
			date: note.familyRecommendationsDate
				? note.familyRecommendationsDate.slice(0, 10)
				: "",
		};
		formData.value.groupRecommendationParents =
			note.groupRecommendationParents || "";
		formData.value.goalsAchieved = {
			value: note.goalsAchieved || "",
			date: note.goalsAchievedDate
				? note.goalsAchievedDate.slice(0, 10)
				: "",
		};
		formData.value.progressNotes = {
			value: note.progressNotes || "",
			date: note.progressNotesDate
				? note.progressNotesDate.slice(0, 10)
				: "",
		};
		formData.value.nextSessionObjectives = {
			value: note.nextSessionObjectives || "",
			date: note.nextSessionObjectivesDate
				? note.nextSessionObjectivesDate.slice(0, 10)
				: "",
		};
		formData.value.incidents = {
			value: note.incidents || "",
			date: note.incidentsDate ? note.incidentsDate.slice(0, 10) : "",
		};
		formData.value.generalObservations = {
			value: note.generalObservations || "",
			date: note.generalObservationsDate
				? note.generalObservationsDate.slice(0, 10)
				: "",
		};

		formData.value.selectedObjectives = [];
		formData.value.objectiveDetails = {};
		formData.value.customGoals = [];

		if (note.objectives && Array.isArray(note.objectives)) {
			for (const obj of note.objectives) {
				if (obj.goalKey) {
					if (
						!formData.value.selectedObjectives.includes(obj.goalKey)
					) {
						formData.value.selectedObjectives.push(obj.goalKey);
					}
					formData.value.objectiveDetails[obj.goalKey] =
						obj.details || "";
				} else {
					formData.value.customGoals.push({
						id: formData.value.customGoals.length + 1,
						label: obj.goalLabel || "Other",
						details: obj.details || "",
					});
				}
			}
		}
	}

	watch(
		() => modelValue.value,
		(newVal) => {
			if (newVal && editingNote.value) {
				populateFromNote(editingNote.value);
			} else {
				resetForm();
			}
		}
	);

	return {
		formData,
		customInputs,
		getFieldValue,
		setFieldValue,
		isRowVisible,
		validate,
	};
}
