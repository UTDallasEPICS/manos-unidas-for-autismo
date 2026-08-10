<template>
	<div class="mt-[50px] flex justify-center p-5">
		<div class="w-full max-w-4xl">
			<div class="flex justify-center">
				<h1 class="mb-[30px] text-[40px]">Request Appointment Form</h1>
			</div>

			<!-- ADULT/CHILD TOGGLE -->
			<div class="mb-[30px]">
				<p class="mb-[10px] text-[20px] font-medium">
					Who is this request for? <span class="text-red-500">*</span>
				</p>
				<div class="flex flex-col gap-y-[10px]">
					<label class="flex flex-row items-center gap-x-[10px]">
						<input type="radio" v-model="isAdult" :value="true" />
						I am requesting services for myself
					</label>
					<label class="flex flex-row items-center gap-x-[10px]">
						<input type="radio" v-model="isAdult" :value="false" />
						I am requesting services for a child or family member
					</label>
				</div>
				<p
					v-if="errors.isAdult"
					class="mt-[5px] text-[18px] text-red-500"
				>
					{{ errors.isAdult }}
				</p>
			</div>

			<!-- CONTACT PERSON INFO -->
			<h2 class="mb-[20px] text-[25px] font-medium">
				{{
					isAdult
						? "Your Information"
						: "Your Information (Parent / Guardian)"
				}}
			</h2>

			<div class="grid grid-cols-3 gap-9">
				<div class="flex flex-col">
					<label class="text-lg font-medium"
						>First name: <span class="text-red-500">*</span></label
					>
					<input
						v-model="contactFirstName"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					<p
						v-if="errors.contactFirstName"
						class="text-[18px] text-red-500"
					>
						{{ errors.contactFirstName }}
					</p>
				</div>

				<div class="flex flex-col">
					<label class="text-lg font-medium">Middle name:</label>
					<input
						v-model="contactMiddleName"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div class="flex flex-col">
					<label class="text-lg font-medium"
						>Last name: <span class="text-red-500">*</span></label
					>
					<input
						v-model="contactLastName"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					<p
						v-if="errors.contactLastName"
						class="text-[18px] text-red-500"
					>
						{{ errors.contactLastName }}
					</p>
				</div>

				<div class="col-span-3 flex flex-col">
					<label class="text-lg font-medium"
						>Dominican ID (Cédula):
						<span class="text-red-500">*</span></label
					>
					<input
						v-model="idNumber"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="000-0000000-0"
					/>
					<p v-if="errors.idNumber" class="text-[18px] text-red-500">
						{{ errors.idNumber }}
					</p>
				</div>

				<div class="col-span-3 flex flex-col">
					<label class="text-lg font-medium"
						>Email: <span class="text-red-500">*</span></label
					>
					<input
						v-model="email"
						type="email"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					<p v-if="errors.email" class="text-[18px] text-red-500">
						{{ errors.email }}
					</p>
				</div>

				<div class="flex flex-col">
					<label class="text-lg font-medium"
						>Primary Phone:
						<span class="text-red-500">*</span></label
					>
					<input
						v-model="primaryPhone"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="000-000-0000"
					/>
					<p
						v-if="errors.primaryPhone"
						class="text-[18px] text-red-500"
					>
						{{ errors.primaryPhone }}
					</p>
				</div>
				<div>
					<label class="text-lg font-medium">Secondary Phone: </label>
					<input
						v-model="secondaryPhone"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="000-000-0000"
					/>
					<p
						v-if="errors.secondaryPhone"
						class="text-[18px] text-red-500"
					>
						{{ errors.secondaryPhone }}
					</p>
				</div>

				<div class="flex flex-col">
					<label class="text-lg font-medium"
						>WhatsApp: <span class="text-red-500">*</span></label
					>
					<input
						v-model="whatsapp"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					<p v-if="errors.whatsapp" class="text-[18px] text-red-500">
						{{ errors.whatsapp }}
					</p>
				</div>
			</div>

			<!-- ADDRESS -->
			<h2 class="mt-[30px] mb-[20px] text-[25px] font-medium">
				Address (Dirección)
			</h2>
			<div class="grid grid-cols-3 gap-9">
				<div class="col-span-2 flex flex-col">
					<label class="text-lg font-medium"
						>Street name: <span class="text-red-500">*</span></label
					>
					<input
						v-model="streetName"
						type="text"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					<p
						v-if="errors.streetName"
						class="text-[18px] text-red-500"
					>
						{{ errors.streetName }}
					</p>
				</div>

				<div class="flex flex-col">
					<label class="text-lg font-medium"
						>Street number:
						<span class="text-red-500">*</span></label
					>
					<input
						v-model="streetNum"
						type="text"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					<p v-if="errors.streetNum" class="text-[18px] text-red-500">
						{{ errors.streetNum }}
					</p>
				</div>

				<div class="flex flex-col">
					<label class="text-lg font-medium"
						>Building / Apartment number:</label
					>
					<input
						v-model="buildingNum"
						type="text"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div class="flex flex-col">
					<label class="text-lg font-medium"
						>Postal code: <span class="text-red-500">*</span></label
					>
					<input
						v-model="postCode"
						type="text"
						class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					<p v-if="errors.postCode" class="text-[18px] text-red-500">
						{{ errors.postCode }}
					</p>
				</div>
			</div>

			<!-- PATIENT INFO (only shown if filling out for someone else) -->
			<div v-if="isAdult === false" class="mt-[30px]">
				<h2 class="mb-[20px] text-[25px] font-medium">
					Patient Information
				</h2>
				<div class="grid grid-cols-3 gap-9">
					<div class="flex flex-col">
						<label class="text-lg font-medium"
							>Patient first name:
							<span class="text-red-500">*</span></label
						>
						<input
							v-model="patientFirstName"
							class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
						<p
							v-if="errors.patientFirstName"
							class="text-[18px] text-red-500"
						>
							{{ errors.patientFirstName }}
						</p>
					</div>

					<div class="flex flex-col">
						<label class="text-lg font-medium"
							>Patient middle name:</label
						>
						<input
							v-model="patientMiddleName"
							class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>

					<div class="flex flex-col">
						<label class="text-lg font-medium"
							>Patient last name:
							<span class="text-red-500">*</span></label
						>
						<input
							v-model="patientLastName"
							class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
						<p
							v-if="errors.patientLastName"
							class="text-[18px] text-red-500"
						>
							{{ errors.patientLastName }}
						</p>
					</div>
				</div>
			</div>

			<!-- PATIENT DETAILS (always shown, label changes based on isAdult) -->
			<div class="mt-[30px]">
				<h2 class="mb-[20px] text-[25px] font-medium">
					{{ isAdult ? "Additional Information" : "Patient Details" }}
				</h2>
				<div class="grid grid-cols-3 gap-9">
					<div class="flex flex-col">
						<label class="text-lg font-medium">
							{{ isAdult ? "Your age:" : "Patient's age:" }}
							<span class="text-red-500">*</span>
						</label>
						<input
							v-model="patientAge"
							type="number"
							min="0"
							class="input h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
						<p
							v-if="errors.patientAge"
							class="text-[18px] text-red-500"
						>
							{{ errors.patientAge }}
						</p>
					</div>

					<div class="col-span-2 flex flex-col">
						<label class="text-lg font-medium">
							{{
								isAdult
									? "Have you been diagnosed?"
									: "Has the patient been diagnosed?"
							}}
							<span class="text-red-500">*</span>
						</label>
						<div class="mt-[10px] flex flex-row gap-x-[20px]">
							<label class="flex items-center gap-x-[5px]">
								<input
									type="radio"
									v-model="diagnosed"
									:value="true"
								/>
								Yes
							</label>
							<label class="flex items-center gap-x-[5px]">
								<input
									type="radio"
									v-model="diagnosed"
									:value="false"
								/>
								No
							</label>
						</div>
						<p
							v-if="errors.diagnosed"
							class="text-[18px] text-red-500"
						>
							{{ errors.diagnosed }}
						</p>
					</div>
				</div>
			</div>

			<!-- HISTORY -->
			<div class="mt-[30px]">
				<h2 class="mb-[20px] text-[25px] font-medium">History</h2>
				<div class="flex flex-col gap-y-[20px]">
					<div>
						<label class="text-lg font-medium">
							Have you used our institution before?
							<span class="text-red-500">*</span>
						</label>
						<div class="mt-[10px] flex flex-row gap-x-[20px]">
							<label class="flex items-center gap-x-[5px]">
								<input
									type="radio"
									v-model="returnPatient"
									:value="true"
								/>
								Yes
							</label>
							<label class="flex items-center gap-x-[5px]">
								<input
									type="radio"
									v-model="returnPatient"
									:value="false"
								/>
								No
							</label>
						</div>
						<p
							v-if="errors.returnPatient"
							class="text-[18px] text-red-500"
						>
							{{ errors.returnPatient }}
						</p>
					</div>

					<div v-if="returnPatient">
						<label class="text-lg font-medium"
							>When did you last visit?</label
						>
						<input
							v-model="previousVisitDate"
							type="date"
							class="input mt-[10px] h-[40px] w-full rounded-md border border-gray-300 p-2 text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>

					<div>
						<label class="text-lg font-medium">
							Do you want to schedule a diagnostic evaluation?
							<span class="text-red-500">*</span>
						</label>
						<div class="mt-[10px] flex flex-row gap-x-[20px]">
							<label class="flex items-center gap-x-[5px]">
								<input
									type="radio"
									v-model="wantsEval"
									:value="true"
								/>
								Yes
							</label>
							<label class="flex items-center gap-x-[5px]">
								<input
									type="radio"
									v-model="wantsEval"
									:value="false"
								/>
								No
							</label>
						</div>
						<p
							v-if="errors.wantsEval"
							class="text-[18px] text-red-500"
						>
							{{ errors.wantsEval }}
						</p>
					</div>

					<div>
						<label class="text-lg font-medium">
							Do you have a referral for the requested service?
							<span class="text-red-500">*</span>
						</label>
						<div class="mt-[10px] flex flex-row gap-x-[20px]">
							<label class="flex items-center gap-x-[5px]">
								<input
									type="radio"
									v-model="hasReferral"
									:value="true"
								/>
								Yes
							</label>
							<label class="flex items-center gap-x-[5px]">
								<input
									type="radio"
									v-model="hasReferral"
									:value="false"
								/>
								No
							</label>
						</div>
						<p
							v-if="errors.hasReferral"
							class="text-[18px] text-red-500"
						>
							{{ errors.hasReferral }}
						</p>
					</div>
				</div>
			</div>

			<!-- SERVICES -->
			<div class="mt-[30px]">
				<h2 class="mb-[20px] text-[25px] font-medium">
					Services Requested
				</h2>

				<p class="mb-[10px] text-[20px] font-medium">
					Therapies (Terapias):
				</p>
				<div class="mb-[20px] ml-[20px] flex flex-col gap-y-[15px]">
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="DIAGNOSTIC_ASSESSMENT"
							v-model="therapies"
						/>
						Diagnostic Assessment (Evaluación Diagnóstica)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="EARLY_INTERVENTION"
							v-model="therapies"
						/>
						Early Intervention (Intervención Temprana)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="BEHAVIORAL_THERAPY"
							v-model="therapies"
						/>
						Behavioral Therapy (Terapia Conductual)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="LEARNING_THERAPY"
							v-model="therapies"
						/>
						Learning Therapy (Terapia de Aprendizaje)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="SPEECH_THERAPY"
							v-model="therapies"
						/>
						Speech Therapy (Terapia del Lenguaje)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="SOCIAL_SKILLS"
							v-model="therapies"
						/>
						Social Skills (Habilidades Sociales)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="SEFVI"
							v-model="therapies"
						/>
						SEFVI
					</label>
				</div>

				<p class="mb-[10px] text-[20px] font-medium">
					Complementary Services (Servicios Complementarios):
				</p>
				<div class="mb-[20px] ml-[20px] flex flex-col gap-y-[15px]">
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="MUSICAL_STIMULATION"
							v-model="complementaryServices"
						/>
						Musical Stimulation (Estimulación Musical)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="PHYSICAL_COGNITIVE_ACTIVITY"
							v-model="complementaryServices"
						/>
						Physical and Cognitive Activity (Actividad Física y
						Cognitiva)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="LEARNING_IN_MOTION"
							v-model="complementaryServices"
						/>
						Learning in Motion (Aprendiendo en Movimiento)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="DYNAMIC_THINKING"
							v-model="complementaryServices"
						/>
						Dynamic Thinking (Pensamiento Dinámico)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="FAMILY_THERAPY"
							v-model="complementaryServices"
						/>
						Family Therapy (Terapia Familiar)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="COUPLES_THERAPY"
							v-model="complementaryServices"
						/>
						Couples Therapy (Terapia de Parejas)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="SEXUALITY_THERAPY"
							v-model="complementaryServices"
						/>
						Sexuality Therapy and Consultations (Terapia y Consultas
						de Sexualidad)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="CHILD_ADOLESCENT_PSYCHOLOGICAL_THERAPY"
							v-model="complementaryServices"
						/>
						Child and Adolescent Psychological Therapy (Terapia
						Psicológica Infanto-Juvenil)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="NUTRITIONAL_CONSULTATION"
							v-model="complementaryServices"
						/>
						Nutritional Consultation (Consulta Nutricional)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="SCHOOL_VISIT"
							v-model="complementaryServices"
						/>
						School Visit (Visita Escolar)
					</label>
				</div>

				<p class="mb-[10px] text-[20px] font-medium">
					Workshops / Classes (Talleres / Clases):
				</p>
				<div class="mb-[20px] ml-[20px] flex flex-col gap-y-[15px]">
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="THEATRE_COMMUNICATION"
							v-model="workshops"
						/>
						Theatre and Communication Classes (Clases de Teatro y
						Comunicación)
					</label>
					<label class="flex flex-row gap-x-[10px]">
						<input
							type="checkbox"
							value="TALKS_AND_WORKSHOPS"
							v-model="workshops"
						/>
						Request for Talks and Workshops (Solicitud de Charla y
						Talleres)
					</label>
				</div>

				<p v-if="errors.services" class="text-[18px] text-red-500">
					{{ errors.services }}
				</p>
			</div>

			<div class="flex justify-center">
				<button
					@click.prevent="sendRequest"
					class="mt-[50px] h-[50px] w-[150px] border-2 border-black bg-red-500 text-[20px] hover:bg-red-400 active:bg-red-300"
				>
					Send Request
				</button>
			</div>
			<div class="mt-4 flex justify-center">
				<p
					v-if="formError"
					class="max-w-lg text-center font-medium text-red-600"
				>
					{{ formError }}
				</p>
			</div>

			<p class="mt-[50px] text-center text-[16px] font-bold">
				Once your request has been received, our team will review it and
				get in touch with you to continue with the process.
			</p>
			<p class="mt-[5px] text-center text-[16px] font-bold">
				If you have any inconvenience filling out this form, you can
				contact us at
				<a
					href="tel:+18499251246"
					class="text-blue-500 hover:text-red-500"
					>(849) 925-1246</a
				>. This form is for exclusive use by the Foundation's clients
				and your information will be treated with strict
				confidentiality.
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

definePageMeta({ layout: "auth" });

// Adult/child toggle
const isAdult = ref<boolean | null>(null);

// Contact person fields
const contactFirstName = ref("");
const contactMiddleName = ref("");
const contactLastName = ref("");
const idNumber = ref("");
const email = ref("");
const primaryPhone = ref("");
const secondaryPhone = ref("");
const whatsapp = ref("");

// Address fields
const streetName = ref("");
const streetNum = ref("");
const buildingNum = ref("");
const postCode = ref("");

// Patient fields (only used when isAdult === false)
const patientFirstName = ref("");
const patientMiddleName = ref("");
const patientLastName = ref("");
const patientAge = ref<number | null>(null);
const diagnosed = ref<boolean | null>(null);

// History fields
const returnPatient = ref<boolean | null>(null);
const previousVisitDate = ref("");
const wantsEval = ref<boolean | null>(null);
const hasReferral = ref<boolean | null>(null);

// Services
const therapies = ref<string[]>([]);
const complementaryServices = ref<string[]>([]);
const workshops = ref<string[]>([]);

const errors = reactive({
	isAdult: "",
	contactFirstName: "",
	contactLastName: "",
	idNumber: "",
	email: "",
	primaryPhone: "",
	secondaryPhone: "",
	whatsapp: "",
	streetName: "",
	streetNum: "",
	postCode: "",
	patientFirstName: "",
	patientLastName: "",
	patientAge: "",
	diagnosed: "",
	returnPatient: "",
	wantsEval: "",
	hasReferral: "",
	services: "",
});
const formError = ref("");

const router = useRouter();

type IdValidationResult =
	| { valid: true }
	| {
			valid: false;
			reason: "length" | "checksum";
	  };

function validateId(id: string): IdValidationResult {
	const cleanId = id.replace(/[-\s]/g, "");
	if (!/^\d{11}$/.test(cleanId)) return { valid: false, reason: "length" };
	const digits = cleanId.split("").map(Number);
	const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
	let sum = 0;
	for (let i = 0; i < 10; i++) {
		let prod = digits[i]! * weights[i]!;
		if (prod > 9) prod = Math.floor(prod / 10) + (prod % 10);
		sum += prod;
	}
	const valid = (10 - (sum % 10)) % 10 === digits[10];
	return valid ? { valid: true } : { valid: false, reason: "checksum" };
}

async function sendRequest() {
	// Reset errors
	formError.value = "";
	Object.keys(errors).forEach(
		(k) => ((errors as Record<string, string>)[k] = "")
	);

	let valid = true;

	// Who is this for?
	if (isAdult.value === null) {
		errors.isAdult = "Please select who this request is for";
		valid = false;
	}

	// Contact person
	if (!contactFirstName.value) {
		errors.contactFirstName = "Please fill out this field";
		valid = false;
	}
	if (!contactLastName.value) {
		errors.contactLastName = "Please fill out this field";
		valid = false;
	}
	if (!idNumber.value) {
		errors.idNumber = "Please fill out this field";
		valid = false;
	} else {
		const result = validateId(idNumber.value);
		if (!result.valid) {
			errors.idNumber =
				result.reason === "length"
					? "ID must be 11 digits"
					: "Invalid checksum — please verify your ID number";
			valid = false;
		}
	}
	if (!email.value) {
		errors.email = "Please fill out this field";
		valid = false;
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
		errors.email = "Not a valid email";
		valid = false;
	}
	const cleanPrimaryPhone = primaryPhone.value.replace(/\D/g, "");
	const cleanSecondaryPhone = secondaryPhone.value.replace(/\D/g, "");
	if (!cleanPrimaryPhone) {
		errors.primaryPhone = "Please fill out this field";
		valid = false;
	} else if (!/^\d{10}$/.test(cleanPrimaryPhone)) {
		errors.primaryPhone = "Not a valid phone number (10 digits)";
		valid = false;
	}
	if (cleanSecondaryPhone && !/^\d{10}$/.test(cleanSecondaryPhone)) {
		errors.secondaryPhone = "Not a valid phone number (10 digits)";
		valid = false;
	}
	if (!whatsapp.value) {
		errors.whatsapp = "Please fill out this field";
		valid = false;
	} else if (!/^\d{10}$/.test(whatsapp.value)) {
		errors.whatsapp = "Not a valid WhatsApp number (10 digits)";
		valid = false;
	}

	// Address
	if (!streetName.value) {
		errors.streetName = "Please fill out this field";
		valid = false;
	}
	if (!streetNum.value) {
		errors.streetNum = "Please fill out this field";
		valid = false;
	}
	if (!postCode.value) {
		errors.postCode = "Please fill out this field";
		valid = false;
	}

	// Patient info (only if filling out for someone else)
	if (isAdult.value === false) {
		if (!patientFirstName.value) {
			errors.patientFirstName = "Please fill out this field";
			valid = false;
		}
		if (!patientLastName.value) {
			errors.patientLastName = "Please fill out this field";
			valid = false;
		}
	}

	// Patient details
	if (!patientAge.value) {
		errors.patientAge = "Please fill out this field";
		valid = false;
	}
	if (diagnosed.value === null) {
		errors.diagnosed = "Please select an option";
		valid = false;
	}

	// History
	if (returnPatient.value === null) {
		errors.returnPatient = "Please select an option";
		valid = false;
	}
	if (wantsEval.value === null) {
		errors.wantsEval = "Please select an option";
		valid = false;
	}
	if (hasReferral.value === null) {
		errors.hasReferral = "Please select an option";
		valid = false;
	}

	// Services — at least one must be selected across all three categories
	if (
		therapies.value.length === 0 &&
		complementaryServices.value.length === 0 &&
		workshops.value.length === 0
	) {
		errors.services = "Please select at least one service";
		valid = false;
	}

	if (!valid) {
		formError.value =
			"Some fields were not filled out correctly. Please check all information entered.";
		return;
	}
	formError.value = "";

	const phones = [cleanPrimaryPhone];

	if (cleanSecondaryPhone) {
		phones.push(cleanSecondaryPhone);
	}

	try {
		const res = await $fetch("/api/sendRequest/form", {
			method: "POST",
			body: {
				contactFirstName: contactFirstName.value,
				contactMiddleName: contactMiddleName.value || null,
				contactLastName: contactLastName.value,
				idNumber: idNumber.value,
				email: email.value,
				phone: [cleanPrimaryPhone, cleanSecondaryPhone].filter(Boolean),
				whatsapp: whatsapp.value,
				streetName: streetName.value,
				streetNum: streetNum.value,
				buildingNum: buildingNum.value || null,
				postCode: postCode.value,
				isAdult: isAdult.value,
				patientFirstName: isAdult.value
					? contactFirstName.value
					: patientFirstName.value,
				patientMiddleName: isAdult.value
					? contactMiddleName.value
					: patientMiddleName.value,
				patientLastName: isAdult.value
					? contactLastName.value
					: patientLastName.value,
				patientAge: patientAge.value,
				diagnosed: diagnosed.value,
				returnPatient: returnPatient.value,
				previousVisitDate: previousVisitDate.value || null,
				wantsEval: wantsEval.value,
				hasReferral: hasReferral.value,
				therapies: therapies.value,
				complementaryServices: complementaryServices.value,
				workshops: workshops.value,
			},
		});

		if (res.success) {
			alert("Request sent successfully!");
			router.push("/login");
		} else {
			alert("Failed to send request.");
		}
	} catch (err) {
		console.error(err);
		alert("Error sending request.");
	}
}
</script>
