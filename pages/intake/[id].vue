<template>
	<div class="mx-auto max-w-5xl p-8">
		<h1 class="font-cormorant-garamond mb-2 text-4xl">Complete Intake</h1>
		<p class="mb-8 text-gray-500">Request ID: {{ route.params.id }}</p>

		<UForm :state="form" class="space-y-8">
			<!-- Patient Information -->
			<UCard>
				<template #header>
					<h2 class="text-xl font-semibold">Patient Information</h2>
				</template>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<UFormField label="Record Number" name="recordNumber">
						<UInput
							:model-value="
								form.patient.recordNumber || 'System-generated'
							"
							disabled
						/>
					</UFormField>

					<UFormField label="Status" name="status">
						<USelect
							v-model="form.patient.status"
							:items="statusOptions"
							class="w-full"
						/>
					</UFormField>

					<UFormField label="First Name" name="firstName">
						<UInput v-model="form.patient.firstName" />
					</UFormField>

					<UFormField label="Middle Name" name="middleName">
						<UInput v-model="form.patient.middleName" />
					</UFormField>

					<UFormField label="Last Name" name="lastName">
						<UInput v-model="form.patient.lastName" />
					</UFormField>

					<UFormField label="Date of Birth" name="dateOfBirth">
						<UInput
							v-model="form.patient.dateOfBirth"
							type="date"
							@change="updateAge"
						/>
					</UFormField>

					<UFormField label="Age" name="age">
						<UInput
							v-model="form.patient.age"
							type="number"
							disabled
						/>
					</UFormField>

					<UFormField label="Sex" name="sex">
						<USelect
							v-model="form.patient.sex"
							:items="['MALE', 'FEMALE', 'OTHER']"
							class="w-full"
						/>
					</UFormField>

					<UFormField label="Nationality" name="nationality">
						<UInput v-model="form.patient.nationality" />
					</UFormField>

					<UFormField
						label="National ID / Birth Certificate"
						name="nationalId"
					>
						<UInput v-model="form.patient.nationalId" />
					</UFormField>

					<UFormField label="Social Security Number (NSS)" name="nss">
						<UInput v-model="form.patient.nss" />
					</UFormField>

					<UFormField label="Phone Number" name="phoneNumber">
						<UInput v-model="form.patient.phoneNumber" />
					</UFormField>

					<UFormField label="Email" name="email">
						<UInput v-model="form.patient.email" />
					</UFormField>

					<UFormField
						label="Health Insurance (ARS)"
						name="healthInsurance"
					>
						<USelect
							v-model="form.patient.healthInsurance"
							:items="insuranceOptions"
							class="w-full"
						/>
					</UFormField>
				</div>
			</UCard>

			<!-- Intake Dates -->
			<UCard>
				<template #header>
					<h2 class="text-xl font-semibold">Intake Dates</h2>
				</template>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<UFormField
						label="Initial Interview Date"
						name="interviewDate"
					>
						<UInput
							v-model="form.intake.interviewDate"
							type="date"
						/>
					</UFormField>

					<UFormField
						label="Program Evaluation Date"
						name="evaluationDate"
					>
						<UInput
							v-model="form.intake.evaluationDate"
							type="date"
						/>
					</UFormField>

					<UFormField
						label="Therapy Start Date"
						name="therapyStartDate"
					>
						<UInput
							v-model="form.intake.therapyStartDate"
							type="date"
						/>
					</UFormField>
				</div>
			</UCard>

			<!-- Parents / Guardians (only shown for non-adult patients) -->
			<UCard v-if="!form.request.isAdult">
				<template #header>
					<div class="flex items-center justify-between">
						<div>
							<h2 class="text-xl font-semibold">
								Parents / Guardians / Tutors
							</h2>
							<p class="mt-1 text-sm text-gray-500">
								A guardian with an email can log in to view this
								patient. Add every guardian who should have
								access.
							</p>
						</div>
						<UButton size="sm" variant="soft" @click="addGuardian"
							>+ Add Guardian</UButton
						>
					</div>
				</template>

				<div
					v-if="form.guardians.length === 0"
					class="text-gray-400 italic"
				>
					No guardians added.
				</div>

				<div
					v-for="(g, index) in form.guardians"
					:key="index"
					class="mb-6 rounded border p-4"
				>
					<div class="mb-2 flex items-center justify-between">
						<p class="font-medium">
							Guardian #{{ index + 1 }}
							<span
								v-if="index === 0"
								class="ml-2 text-xs text-gray-500"
								>(primary)</span
							>
						</p>
						<button
							class="text-sm text-red-500 hover:underline"
							@click="removeGuardian(index)"
						>
							Remove
						</button>
					</div>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<UFormField
							label="Full Name"
							:name="`guardians[${index}].name`"
						>
							<UInput v-model="g.name" />
						</UFormField>

						<UFormField
							label="Relationship"
							:name="`guardians[${index}].relationship`"
						>
							<UInput v-model="g.relationship" />
						</UFormField>

						<UFormField
							label="ID Number (Cédula)"
							:name="`guardians[${index}].idNumber`"
						>
							<UInput v-model="g.idNumber" />
						</UFormField>

						<UFormField
							label="Social Security Number (NSS)"
							:name="`guardians[${index}].nss`"
						>
							<UInput v-model="g.nss" />
						</UFormField>

						<UFormField
							label="Phone Number"
							:name="`guardians[${index}].phone`"
						>
							<UInput v-model="g.phone" />
						</UFormField>

						<UFormField
							label="Email (enables login)"
							:name="`guardians[${index}].email`"
						>
							<UInput v-model="g.email" type="email" />
						</UFormField>

						<UFormField
							label="Street Name"
							:name="`guardians[${index}].streetName`"
						>
							<UInput v-model="g.streetName" />
						</UFormField>

						<UFormField
							label="Street Number"
							:name="`guardians[${index}].streetNum`"
						>
							<UInput v-model="g.streetNum" />
						</UFormField>

						<UFormField
							label="Building / Apartment Number"
							:name="`guardians[${index}].buildingNum`"
						>
							<UInput v-model="g.buildingNum" />
						</UFormField>

						<UFormField
							label="Postal Code"
							:name="`guardians[${index}].postCode`"
						>
							<UInput v-model="g.postCode" />
						</UFormField>
					</div>
				</div>
			</UCard>

			<!-- Medical Information -->
			<UCard>
				<template #header>
					<h2 class="text-xl font-semibold">Medical Information</h2>
				</template>
				<div class="space-y-4">
					<UFormField label="Diagnosis(es)" name="diagnosis">
						<UTextarea v-model="form.medical.diagnosis" :rows="3" />
					</UFormField>

					<UFormField label="Medications" name="medications">
						<UTextarea
							v-model="form.medical.medications"
							:rows="2"
						/>
					</UFormField>

					<UFormField label="Allergies" name="allergies">
						<UTextarea v-model="form.medical.allergies" :rows="2" />
					</UFormField>

					<UFormField label="Dietary Restrictions" name="diet">
						<UTextarea
							v-model="form.medical.dietaryRestrictions"
							:rows="2"
						/>
					</UFormField>
				</div>
			</UCard>

			<!-- Developmental History -->
			<UCard>
				<template #header>
					<h2 class="text-xl font-semibold">Developmental History</h2>
				</template>
				<div class="space-y-4">
					<UFormField
						label="Language and Speech"
						name="languageSpeech"
					>
						<UTextarea
							v-model="form.developmental.languageSpeech"
							:rows="2"
						/>
					</UFormField>

					<UFormField label="Behavior" name="behavior">
						<UTextarea
							v-model="form.developmental.behavior"
							:rows="2"
						/>
					</UFormField>

					<UFormField
						label="Adaptive Behavior"
						name="adaptiveBehavior"
					>
						<UTextarea
							v-model="form.developmental.adaptiveBehavior"
							:rows="2"
						/>
					</UFormField>

					<UFormField label="Sleep" name="sleep">
						<UTextarea
							v-model="form.developmental.sleep"
							:rows="2"
						/>
					</UFormField>

					<UFormField
						label="Nutrition / Eating Habits"
						name="nutrition"
					>
						<UTextarea
							v-model="form.developmental.nutrition"
							:rows="2"
						/>
					</UFormField>

					<UFormField label="Motor Skills" name="motorSkills">
						<UTextarea
							v-model="form.developmental.motorSkills"
							:rows="2"
						/>
					</UFormField>
				</div>
			</UCard>

			<!-- Services Requested -->
			<UCard>
				<template #header>
					<h2 class="text-xl font-semibold">Services Requested</h2>
					<p class="mt-1 text-sm text-gray-500">
						Pre-filled from the request form — edit as needed.
					</p>
				</template>

				<div class="space-y-6">
					<div>
						<p class="mb-2 font-medium">Therapies</p>
						<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
							<label
								v-for="therapy in therapyOptions"
								:key="therapy.value"
								class="flex items-center gap-2"
							>
								<input
									v-model="form.services.therapies"
									type="checkbox"
									:value="therapy.value"
								/>
								{{ therapy.label }}
							</label>
						</div>
					</div>

					<div>
						<p class="mb-2 font-medium">Complementary Services</p>
						<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
							<label
								v-for="service in complementaryOptions"
								:key="service.value"
								class="flex items-center gap-2"
							>
								<input
									v-model="
										form.services.complementaryServices
									"
									type="checkbox"
									:value="service.value"
								/>
								{{ service.label }}
							</label>
						</div>
					</div>

					<div>
						<p class="mb-2 font-medium">Workshops / Classes</p>
						<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
							<label
								v-for="workshop in workshopOptions"
								:key="workshop.value"
								class="flex items-center gap-2"
							>
								<input
									v-model="form.services.workshops"
									type="checkbox"
									:value="workshop.value"
								/>
								{{ workshop.label }}
							</label>
						</div>
					</div>
				</div>
			</UCard>

			<!-- Sponsorship -->
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold">Sponsorship</h2>
						<UButton
							size="sm"
							variant="soft"
							@click="addSponsorship"
							>+ Add Sponsorship</UButton
						>
					</div>
				</template>

				<div
					v-if="form.sponsorships.length === 0"
					class="text-gray-400 italic"
				>
					No sponsorships added.
				</div>

				<div
					v-for="(s, index) in form.sponsorships"
					:key="index"
					class="mb-6 rounded border p-4"
				>
					<div class="mb-2 flex items-center justify-between">
						<p class="font-medium">Sponsorship #{{ index + 1 }}</p>
						<button
							class="text-sm text-red-500 hover:underline"
							@click="removeSponsorship(index)"
						>
							Remove
						</button>
					</div>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<UFormField
							:label="'Sponsor Name'"
							:name="`sponsorships[${index}].sponsorName`"
						>
							<UInput v-model="s.sponsorName" />
						</UFormField>

						<UFormField
							:label="'Amount'"
							:name="`sponsorships[${index}].amount`"
						>
							<UInput v-model="s.amount" type="number" />
						</UFormField>

						<UFormField
							:label="'Start Date'"
							:name="`sponsorships[${index}].startDate`"
						>
							<UInput v-model="s.startDate" type="date" />
						</UFormField>

						<UFormField
							:label="'End Date'"
							:name="`sponsorships[${index}].endDate`"
						>
							<UInput v-model="s.endDate" type="date" />
						</UFormField>

						<UFormField
							:label="'Continuation Date'"
							:name="`sponsorships[${index}].newDate`"
						>
							<UInput v-model="s.newDate" type="date" />
						</UFormField>
					</div>
				</div>
			</UCard>

			<!-- Therapist Notes -->
			<UCard>
				<template #header>
					<h2 class="text-xl font-semibold">Therapist Notes</h2>
				</template>
				<div class="space-y-4">
					<UFormField label="Therapist Name" name="therapistName">
						<UInput v-model="form.clinicalNotes.therapistName" />
					</UFormField>

					<UFormField label="Date of Note" name="noteDate">
						<UInput
							v-model="form.clinicalNotes.noteDate"
							type="date"
						/>
					</UFormField>

					<UFormField label="Therapist Notes" name="therapistNotes">
						<UTextarea
							v-model="form.clinicalNotes.therapistNotes"
							:rows="8"
						/>
					</UFormField>
				</div>
			</UCard>

			<!-- Actions -->
			<div class="flex flex-col gap-4">
				<!-- Success / error messages -->
				<p
					v-if="successMessage"
					class="text-center font-medium text-green-600"
				>
					{{ successMessage }}
				</p>
				<p
					v-if="errorMessage"
					class="text-center font-medium text-red-600"
				>
					{{ errorMessage }}
				</p>

				<div class="flex justify-between">
					<UButton
						color="neutral"
						variant="soft"
						@click="() => navigateTo('/viewContactForms')"
					>
						Back to Review Forms
					</UButton>

					<div class="flex gap-4">
						<UButton
							color="neutral"
							variant="soft"
							@click="saveDraft"
						>
							Save Draft
						</UButton>
						<UButton type="button" @click="submitIntake">
							Complete Intake
						</UButton>
					</div>
				</div>
			</div>
		</UForm>
	</div>
</template>

<script setup lang="ts">
const route = useRoute();

// Enum dropdowns bind the underscore Prisma enum value; the label is display-only.
const statusOptions = [
	{ value: "ACTIVE", label: "Active" },
	{ value: "WITHDRAWN", label: "Withdrawn" },
	{ value: "DROPPED_OUT", label: "Dropped Out" },
];

const insuranceOptions = [
	{ value: "SENASA_CONTRIBUTIVO", label: "SENASA Contributivo" },
	{ value: "SENASA_SUBSIDIADO", label: "SENASA Subsidiado" },
	{ value: "ARS_HUMANO", label: "ARS Humano" },
	{ value: "MAPFRE", label: "MAPFRE" },
	{ value: "LA_MONUMENTAL", label: "La Monumental" },
	{ value: "ARS_UNIVERSAL", label: "ARS Universal" },
	{ value: "ARS_META_SALUD", label: "ARS Meta Salud" },
	{
		value: "ARS_PLAN_SALUD_BANCO_CENTRAL",
		label: "ARS Plan Salud Banco Central",
	},
	{ value: "RENACER", label: "Renacer" },
	{ value: "OTRO", label: "Otro" },
];

// Service options matching existing enums
const therapyOptions = [
	{
		value: "DIAGNOSTIC_ASSESSMENT",
		label: "Diagnostic Assessment (Evaluación Diagnóstica)",
	},
	{
		value: "EARLY_INTERVENTION",
		label: "Early Intervention (Intervención Temprana)",
	},
	{
		value: "BEHAVIORAL_THERAPY",
		label: "Behavioral Therapy (Terapia Conductual)",
	},
	{
		value: "LEARNING_THERAPY",
		label: "Learning Therapy (Terapia de Aprendizaje)",
	},
	{ value: "SPEECH_THERAPY", label: "Speech Therapy (Terapia del Lenguaje)" },
	{ value: "SOCIAL_SKILLS", label: "Social Skills (Habilidades Sociales)" },
	{ value: "SEFVI", label: "SEFVI" },
];

const complementaryOptions = [
	{
		value: "MUSICAL_STIMULATION",
		label: "Musical Stimulation (Estimulación Musical)",
	},
	{
		value: "PHYSICAL_COGNITIVE_ACTIVITY",
		label: "Physical and Cognitive Activity (Actividad Física y Cognitiva)",
	},
	{
		value: "LEARNING_IN_MOTION",
		label: "Learning in Motion (Aprendiendo en Movimiento)",
	},
	{
		value: "DYNAMIC_THINKING",
		label: "Dynamic Thinking (Pensamiento Dinámico)",
	},
	{ value: "FAMILY_THERAPY", label: "Family Therapy (Terapia Familiar)" },
	{ value: "COUPLES_THERAPY", label: "Couples Therapy (Terapia de Parejas)" },
	{
		value: "SEXUALITY_THERAPY",
		label: "Sexuality Therapy and Consultations (Terapia y Consultas de Sexualidad)",
	},
	{
		value: "CHILD_ADOLESCENT_PSYCHOLOGICAL_THERAPY",
		label: "Child and Adolescent Psychological Therapy (Terapia Psicológica Infanto-Juvenil)",
	},
	{
		value: "NUTRITIONAL_CONSULTATION",
		label: "Nutritional Consultation (Consulta Nutricional)",
	},
	{ value: "SCHOOL_VISIT", label: "School Visit (Visita Escolar)" },
];

const workshopOptions = [
	{
		value: "THEATRE_COMMUNICATION",
		label: "Theatre and Communication Classes (Clases de Teatro y Comunicación)",
	},
	{
		value: "TALKS_AND_WORKSHOPS",
		label: "Request for Talks and Workshops (Solicitud de Charla y Talleres)",
	},
];

const form = reactive({
	request: {
		id: undefined as number | undefined,
		isAdult: false,
	},

	patient: {
		requestId: undefined as number | undefined,
		recordNumber: "",
		firstName: "",
		middleName: "",
		lastName: "",
		dateOfBirth: "",
		age: undefined as number | undefined,
		sex: "",
		nationality: "",
		nationalId: "",
		nss: "",
		phoneNumber: "",
		email: "",
		healthInsurance: "",
		status: "ACTIVE",
	},

	guardians: [] as GuardianForm[],

	intake: {
		interviewDate: "",
		evaluationDate: "",
		therapyStartDate: "",
	},

	medical: {
		diagnosis: "",
		medications: "",
		allergies: "",
		dietaryRestrictions: "",
	},

	developmental: {
		languageSpeech: "",
		behavior: "",
		adaptiveBehavior: "",
		sleep: "",
		nutrition: "",
		motorSkills: "",
	},

	services: {
		therapies: [] as string[],
		complementaryServices: [] as string[],
		workshops: [] as string[],
	},

	sponsorships: [] as {
		sponsorName: string;
		amount: number | undefined;
		startDate: string;
		endDate: string;
		newDate: string;
	}[],

	clinicalNotes: {
		therapistName: "",
		noteDate: "",
		therapistNotes: "",
	},
});

// Auto-compute age from DOB
function updateAge() {
	if (!form.patient.dateOfBirth) return;
	const birth = new Date(form.patient.dateOfBirth);
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const m = today.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
	form.patient.age = age;
}

function addSponsorship() {
	form.sponsorships.push({
		sponsorName: "",
		amount: undefined,
		startDate: "",
		endDate: "",
		newDate: "",
	});
}

function removeSponsorship(index: number) {
	form.sponsorships.splice(index, 1);
}

interface GuardianForm {
	name: string;
	relationship: string;
	idNumber: string;
	nss: string;
	phone: string;
	email: string;
	streetName: string;
	streetNum: string;
	buildingNum: string;
	postCode: string;
}

function emptyGuardian(): GuardianForm {
	return {
		name: "",
		relationship: "",
		idNumber: "",
		nss: "",
		phone: "",
		email: "",
		streetName: "",
		streetNum: "",
		buildingNum: "",
		postCode: "",
	};
}

function addGuardian() {
	form.guardians.push(emptyGuardian());
}

function removeGuardian(index: number) {
	form.guardians.splice(index, 1);
}

interface RequestData {
	id: number;
	isAdult: boolean;
	firstName: string;
	middleName?: string | null;
	lastName: string;
	email: string;
	phone: { number: string }[];
	whatsapp: string;
	idNumber: string;
	streetName: string;
	streetNum: string;
	buildingNum?: string | null;
	postCode: string;
	patientFirstName: string;
	patientMiddleName?: string | null;
	patientLastName: string;
	patientAge: number;
	diagnosed: boolean;
	therapies: { name: string }[];
	complementaryServices: { name: string }[];
	workshops: { name: string }[];
}

function populateFromRequest(request: RequestData) {
	form.request.id = request.id;
	form.request.isAdult = request.isAdult;
	form.patient.requestId = request.id;

	// Pre-fill services from request
	form.services.therapies = request.therapies?.map((t) => t.name) ?? [];
	form.services.complementaryServices =
		request.complementaryServices?.map((s) => s.name) ?? [];
	form.services.workshops = request.workshops?.map((w) => w.name) ?? [];

	if (request.isAdult) {
		form.patient.firstName = request.firstName;
		form.patient.middleName = request.middleName ?? "";
		form.patient.lastName = request.lastName;
		form.patient.email = request.email;
		form.patient.phoneNumber = request.phone?.[0]?.number ?? "";
		form.patient.nationalId = request.idNumber;
		form.patient.age = request.patientAge;
	} else {
		// Seed the first guardian from the request contact; staff can edit it
		// and add more guardians.
		form.guardians = [
			{
				...emptyGuardian(),
				name: `${request.firstName} ${request.lastName}`,
				relationship: "Parent/Guardian",
				idNumber: request.idNumber,
				email: request.email ?? "",
				phone: request.phone?.[0]?.number ?? "",
				streetName: request.streetName ?? "",
				streetNum: request.streetNum ?? "",
				buildingNum: request.buildingNum ?? "",
				postCode: request.postCode ?? "",
			},
		];

		form.patient.firstName = request.patientFirstName;
		form.patient.middleName = request.patientMiddleName ?? "";
		form.patient.lastName = request.patientLastName;
		form.patient.age = request.patientAge;
	}
}

async function loadRequest() {
	const requestId = Number(route.params.id);
	const draft = await $fetch<Record<string, unknown>>(
		`/api/intake/draft/${requestId}`
	).catch(() => null);

	if (draft) {
		Object.assign(form, draft);
	} else {
		// No draft, so populate from request data as before
		const request = await $fetch<RequestData>(`/api/request/${requestId}`);
		populateFromRequest(request);
	}
}

const successMessage = ref("");
const errorMessage = ref("");

async function saveDraft() {
	try {
		await $fetch("/api/intake/draft", {
			method: "POST",
			body: form,
		});
		successMessage.value = "Draft saved successfully.";
		errorMessage.value = "";
	} catch (err) {
		console.error(err);
		errorMessage.value = "Failed to save draft.";
		successMessage.value = "";
	}
}

async function submitIntake() {
	try {
		await $fetch("/api/intake/submit", {
			method: "POST",
			body: form,
		});
		successMessage.value = "Intake completed successfully.";
		errorMessage.value = "";
	} catch (err) {
		console.error(err);
		errorMessage.value = "Failed to submit intake. Please try again.";
		successMessage.value = "";
	}
}

onMounted(() => {
	loadRequest();
});
</script>
