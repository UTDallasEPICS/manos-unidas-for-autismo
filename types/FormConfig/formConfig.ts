type InputType =
	| "text"
	| "number"
	| "date"
	| "email"
	| "radio"
	| "select"
	| "file"
	| "multitext" // custom type for dropdowns
	| "multiselect" // custom type for dropdowns where you can select multiple
	| "textarea"
	| "checkboxgroup"
	| "therapydrilldown"
	| "objectivedetails"
	| "customgoals";

export interface CheckboxOption {
	header?: string;
	subheader?: string;
	value?: string;
	label?: string;
}

export interface FormFieldConfig {
	name: string;
	label: string;
	type: InputType;
	dataKey?: string;
	placeholder?: string;
	options?: {
		// specifically for select and multiselect
		label: string;
		value: string;
	}[];
	checkboxOptions?: CheckboxOption[];
	required?: boolean;
	// Specifically for file uploads
	accept?: string;
	multiple?: boolean;
}

export interface FormSection {
	sectionTitle: string;
	fields: FormFieldConfig[][];
}

export interface DrilldownValue {
	selected: string[];
	checked: string[];
}

export interface ObjectiveDetailsValue {
	objectives: string[];
	details: Record<string, string>;
	date: string;
}

export interface CustomGoal {
	id: number;
	label: string;
	details: string;
}

export type FormFieldValue =
	| string
	| number
	| boolean
	| string[]
	| File
	| File[]
	| null
	| undefined
	| DrilldownValue
	| ObjectiveDetailsValue
	| CustomGoal[];
