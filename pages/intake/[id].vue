<template>
	<div class="mx-auto max-w-5xl p-8">
		<h1 class="font-cormorant-garamond mb-2 text-4xl">
			{{ t("intake.title") }}
		</h1>
		<p class="mb-8 text-gray-500">
			{{ t("intake.requestId", { id: route.params.id }) }}
		</p>

		<UForm :state="form" class="space-y-8">
			<!-- Patient Information -->
			<UCard>
				<template #header>
					<h2 class="text-xl font-semibold">
						{{ t("intake.patientInfo") }}
					</h2>
				</template>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<UFormField
						:label="t('intake.recordNumber')"
						name="recordNumber"
					>
						<UInput
							:model-value="
								form.patient.recordNumber ||
								t('intake.systemGenerated')
							"
							disabled
						/>
					</UFormField>

					<UFormField :label="t('intake.status')" name="status">
						<USelect
							v-model="form.patient.status"
							:items="statusOptions"
							class="w-full"
						/>
					</UFormField>

					<UFormField :label="t('intake.firstName')" name="firstName">
						<UInput v-model="form.patient.firstName" />
					</UFormField>

					<UFormField
						:label="t('intake.middleName')"
						name="middleName"
					>
						<UInput v-model="form.patient.middleName" />
					</UFormField>

					<UFormField :label="t('intake.lastName')" name="lastName">
						<UInput v-model="form.patient.lastName" />
					</UFormField>

					<UFormField
						:label="t('intake.dateOfBirth')"
						name="dateOfBirth"
					>
						<UInput
							v-model="form.patient.dateOfBirth"
							type="date"
							@change="updateAge"
						/>
					</UFormField>

					<UFormField :label="t('intake.age')" name="age">
						<UInput
							v-model="form.patient.age"
							type="number"
							disabled
						/>
					</UFormField>

					<UFormField :label="t('intake.sex')" name="sex">
						<USelect
							v-model="form.patient.sex"
							:items="sexOptions"
							class="w-full"
						/>
					</UFormField>

					<UFormField
						:label="t('intake.nationality')"
						name="nationality"
					>
						<UInput v-model="form.patient.nationality" />
					</UFormField>

					<UFormField
						:label="t('intake.nationalId')"
						name="nationalId"
					>
						<UInput v-model="form.patient.nationalId" />
					</UFormField>

					<UFormField :label="t('intake.nss')" name="nss">
						<UInput v-model="form.patient.nss" />
					</UFormField>

					<UFormField
						:label="t('intake.phoneNumber')"
						name="phoneNumber"
					>
						<UInput v-model="form.patient.phoneNumber" />
					</UFormField>

					<UFormField :label="t('intake.email')" name="email">
						<UInput v-model="form.patient.email" />
					</UFormField>

					<UFormField
						:label="t('intake.healthInsurance')"
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
					<h2 class="text-xl font-semibold">
						{{ t("intake.intakeDates") }}
					</h2>
				</template>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<UFormField
						:label="t('intake.interviewDate')"
						name="interviewDate"
					>
						<UInput
							v-model="form.intake.interviewDate"
							type="date"
						/>
					</UFormField>

					<UFormField
						:label="t('intake.evaluationDate')"
						name="evaluationDate"
					>
						<UInput
							v-model="form.intake.evaluationDate"
							type="date"
						/>
					</UFormField>

					<UFormField
						:label="t('intake.therapyStartDate')"
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
								{{ t("intake.guardiansTitle") }}
							</h2>
							<p class="mt-1 text-sm text-gray-500">
								{{ t("intake.guardiansHint") }}
							</p>
						</div>
						<UButton size="sm" variant="soft" @click="addGuardian">
							{{ t("intake.addGuardian") }}
						</UButton>
					</div>
				</template>

				<div
					v-if="form.guardians.length === 0"
					class="text-gray-400 italic"
				>
					{{ t("intake.noGuardians") }}
				</div>

				<div
					v-for="(g, index) in form.guardians"
					:key="index"
					class="mb-6 rounded border p-4"
				>
					<div class="mb-2 flex items-center justify-between">
						<p class="font-medium">
							{{ t("intake.guardianNum", { num: index + 1 }) }}
							<span
								v-if="index === 0"
								class="ml-2 text-xs text-gray-500"
							>
								{{ t("intake.primary") }}
							</span>
						</p>
						<button
							class="text-sm text-red-500 hover:underline"
							@click="removeGuardian(index)"
						>
							{{ t("intake.remove") }}
						</button>
					</div>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<UFormField
							:label="t('intake.guardianName')"
							:name="`guardians[${index}].name`"
						>
							<UInput v-model="g.name" />
						</UFormField>

						<UFormField
							:label="t('intake.relationship')"
							:name="`guardians[${index}].relationship`"
						>
							<UInput v-model="g.relationship" />
						</UFormField>

						<UFormField
							:label="t('intake.idNumber')"
							:name="`guardians[${index}].idNumber`"
						>
							<UInput v-model="g.idNumber" />
						</UFormField>

						<UFormField
							:label="t('intake.nss')"
							:name="`guardians[${index}].nss`"
						>
							<UInput v-model="g.nss" />
						</UFormField>

						<UFormField
							:label="t('intake.phoneNumber')"
							:name="`guardians[${index}].phone`"
						>
							<UInput v-model="g.phone" />
						</UFormField>

						<UFormField
							:label="t('intake.guardianEmail')"
							:name="`guardians[${index}].email`"
						>
							<UInput v-model="g.email" type="email" />
						</UFormField>

						<UFormField
							:label="t('intake.streetName')"
							:name="`guardians[${index}].streetName`"
						>
							<UInput v-model="g.streetName" />
						</UFormField>

						<UFormField
							:label="t('intake.streetNum')"
							:name="`guardians[${index}].streetNum`"
						>
							<UInput v-model="g.streetNum" />
						</UFormField>

						<UFormField
							:label="t('intake.buildingNum')"
							:name="`guardians[${index}].buildingNum`"
						>
							<UInput v-model="g.buildingNum" />
						</UFormField>

						<UFormField
							:label="t('intake.postCode')"
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
					<h2 class="text-xl font-semibold">
						{{ t("intake.medicalInfo") }}
					</h2>
				</template>
				<div class="space-y-4">
					<UFormField :label="t('intake.diagnosis')" name="diagnosis">
						<UTextarea v-model="form.medical.diagnosis" :rows="3" />
					</UFormField>

					<UFormField
						:label="t('intake.medications')"
						name="medications"
					>
						<UTextarea
							v-model="form.medical.medications"
							:rows="2"
						/>
					</UFormField>

					<UFormField :label="t('intake.allergies')" name="allergies">
						<UTextarea v-model="form.medical.allergies" :rows="2" />
					</UFormField>

					<UFormField :label="t('intake.diet')" name="diet">
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
					<h2 class="text-xl font-semibold">
						{{ t("intake.developmentalHistory") }}
					</h2>
				</template>
				<div class="space-y-4">
					<UFormField
						:label="t('intake.languageSpeech')"
						name="languageSpeech"
					>
						<UTextarea
							v-model="form.developmental.languageSpeech"
							:rows="2"
						/>
					</UFormField>

					<UFormField :label="t('intake.behavior')" name="behavior">
						<UTextarea
							v-model="form.developmental.behavior"
							:rows="2"
						/>
					</UFormField>

					<UFormField
						:label="t('intake.adaptiveBehavior')"
						name="adaptiveBehavior"
					>
						<UTextarea
							v-model="form.developmental.adaptiveBehavior"
							:rows="2"
						/>
					</UFormField>

					<UFormField :label="t('intake.sleep')" name="sleep">
						<UTextarea
							v-model="form.developmental.sleep"
							:rows="2"
						/>
					</UFormField>

					<UFormField :label="t('intake.nutrition')" name="nutrition">
						<UTextarea
							v-model="form.developmental.nutrition"
							:rows="2"
						/>
					</UFormField>

					<UFormField
						:label="t('intake.motorSkills')"
						name="motorSkills"
					>
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
					<h2 class="text-xl font-semibold">
						{{ t("intake.servicesRequested") }}
					</h2>
					<p class="mt-1 text-sm text-gray-500">
						{{ t("intake.servicesHint") }}
					</p>
				</template>

				<div class="space-y-6">
					<div>
						<p class="mb-2 font-medium">
							{{ t("intake.therapies") }}
						</p>
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
						<p class="mb-2 font-medium">
							{{ t("intake.complementaryServices") }}
						</p>
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
						<p class="mb-2 font-medium">
							{{ t("intake.workshops") }}
						</p>
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
						<h2 class="text-xl font-semibold">
							{{ t("intake.sponsorship") }}
						</h2>
						<UButton
							size="sm"
							variant="soft"
							@click="addSponsorship"
						>
							{{ t("intake.addSponsorship") }}
						</UButton>
					</div>
				</template>

				<div
					v-if="form.sponsorships.length === 0"
					class="text-gray-400 italic"
				>
					{{ t("intake.noSponsorships") }}
				</div>

				<div
					v-for="(s, index) in form.sponsorships"
					:key="index"
					class="mb-6 rounded border p-4"
				>
					<div class="mb-2 flex items-center justify-between">
						<p class="font-medium">
							{{ t("intake.sponsorshipNum", { num: index + 1 }) }}
						</p>
						<button
							class="text-sm text-red-500 hover:underline"
							@click="removeSponsorship(index)"
						>
							{{ t("intake.remove") }}
						</button>
					</div>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<UFormField
							:label="t('intake.sponsorName')"
							:name="`sponsorships[${index}].sponsorName`"
						>
							<UInput v-model="s.sponsorName" />
						</UFormField>

						<UFormField
							:label="t('intake.amount')"
							:name="`sponsorships[${index}].amount`"
						>
							<UInput v-model="s.amount" type="number" />
						</UFormField>

						<UFormField
							:label="t('intake.startDate')"
							:name="`sponsorships[${index}].startDate`"
						>
							<UInput v-model="s.startDate" type="date" />
						</UFormField>

						<UFormField
							:label="t('intake.endDate')"
							:name="`sponsorships[${index}].endDate`"
						>
							<UInput v-model="s.endDate" type="date" />
						</UFormField>

						<UFormField
							:label="t('intake.newDate')"
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
					<h2 class="text-xl font-semibold">
						{{ t("intake.therapistNotesTitle") }}
					</h2>
				</template>
				<div class="space-y-4">
					<UFormField
						:label="t('intake.therapistName')"
						name="therapistName"
					>
						<UInput v-model="form.clinicalNotes.therapistName" />
					</UFormField>

					<UFormField :label="t('intake.noteDate')" name="noteDate">
						<UInput
							v-model="form.clinicalNotes.noteDate"
							type="date"
						/>
					</UFormField>

					<UFormField
						:label="t('intake.therapistNotes')"
						name="therapistNotes"
					>
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
						{{ t("intake.backToReview") }}
					</UButton>

					<div class="flex gap-4">
						<UButton
							color="neutral"
							variant="soft"
							@click="saveDraft"
						>
							{{ t("intake.saveDraft") }}
						</UButton>
						<UButton type="button" @click="submitIntake">
							{{ t("intake.submit") }}
						</UButton>
					</div>
				</div>
			</div>
		</UForm>
	</div>
</template>

<script setup lang="ts">
const route = useRoute();
const { t } = useI18n();

// Enum dropdowns bind the underscore Prisma enum value; the label is display-only.
const statusOptions = computed(() => [
	{ value: "ACTIVE", label: t("intake.status_ACTIVE") },
	{ value: "WITHDRAWN", label: t("intake.status_WITHDRAWN") },
	{ value: "DROPPED_OUT", label: t("intake.status_DROPPED_OUT") },
]);

const sexOptions = computed(() => [
	{ value: "MALE", label: t("signup.gender_MALE") },
	{ value: "FEMALE", label: t("signup.gender_FEMALE") },
	{ value: "OTHER", label: t("signup.gender_OTHER") },
]);

const insuranceOptions = computed(() => [
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
	{ value: "OTRO", label: t("intake.insurance_OTRO") },
]);

// Service options matching existing enums; labels reuse the shared request.svc_* keys.
const THERAPIES = [
	"DIAGNOSTIC_ASSESSMENT",
	"EARLY_INTERVENTION",
	"BEHAVIORAL_THERAPY",
	"LEARNING_THERAPY",
	"SPEECH_THERAPY",
	"SOCIAL_SKILLS",
	"SEFVI",
] as const;

const COMPLEMENTARY = [
	"MUSICAL_STIMULATION",
	"PHYSICAL_COGNITIVE_ACTIVITY",
	"LEARNING_IN_MOTION",
	"DYNAMIC_THINKING",
	"FAMILY_THERAPY",
	"COUPLES_THERAPY",
	"SEXUALITY_THERAPY",
	"CHILD_ADOLESCENT_PSYCHOLOGICAL_THERAPY",
	"NUTRITIONAL_CONSULTATION",
	"SCHOOL_VISIT",
] as const;

const WORKSHOPS = ["THEATRE_COMMUNICATION", "TALKS_AND_WORKSHOPS"] as const;

const svcItems = (vals: readonly string[]) =>
	vals.map((v) => ({ value: v, label: t(`request.svc_${v}`) }));

const therapyOptions = computed(() => svcItems(THERAPIES));
const complementaryOptions = computed(() => svcItems(COMPLEMENTARY));
const workshopOptions = computed(() => svcItems(WORKSHOPS));

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
				relationship: t("intake.defaultRelationship"),
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
		successMessage.value = t("intake.draftSaved");
		errorMessage.value = "";
	} catch (err) {
		console.error(err);
		errorMessage.value = t("intake.draftSaveError");
		successMessage.value = "";
	}
}

async function submitIntake() {
	try {
		await $fetch("/api/intake/submit", {
			method: "POST",
			body: form,
		});
		successMessage.value = t("intake.submitSuccess");
		errorMessage.value = "";
	} catch (err) {
		console.error(err);
		errorMessage.value = t("intake.submitError");
		successMessage.value = "";
	}
}

onMounted(() => {
	loadRequest();
});
</script>
