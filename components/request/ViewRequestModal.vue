<template>
	<div
		v-if="request"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		@click.self="$emit('close')"
	>
		<div
			class="font-sc-encode relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-8 shadow-xl"
		>
			<!-- Header -->
			<div class="mb-6 flex items-center justify-between">
				<h2 class="font-cormorant-garamond text-3xl text-gray-500">
					Full Request — #{{ request.id }}
				</h2>
				<button
					class="text-2xl text-gray-500 hover:text-black"
					@click="$emit('close')"
				>
					✕
				</button>
			</div>

			<!-- Metadata -->
			<div class="mb-6 flex gap-6 text-sm text-gray-500">
				<span
					>Submitted:
					{{ new Date(request.createdAt).toLocaleDateString() }}</span
				>
				<span>Status: {{ request.status }}</span>
				<span>{{
					request.isAdult ? "Adult (self)" : "Parent / Guardian"
				}}</span>
			</div>

			<!-- Contact Person -->
			<section class="mb-6">
				<h3
					class="font-cormorant-garamond mb-3 border-b pb-1 text-2xl text-gray-500"
				>
					{{
						request.isAdult
							? "Patient / Contact Person"
							: "Contact Person (Parent / Guardian)"
					}}
				</h3>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-500">Full Name</p>
						<p class="text-gray-500">
							{{ request.firstName }}
							{{ request.middleName ?? "" }}
							{{ request.lastName }}
						</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">ID Card (Cédula)</p>
						<p class="text-gray-500">{{ request.idNumber }}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Email</p>
						<p class="text-gray-500">{{ request.email }}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Phone</p>
						<p class="text-gray-500">
							{{ request.phone.map((p) => p.number).join(", ") }}
						</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">WhatsApp</p>
						<p class="text-gray-500">{{ request.whatsapp }}</p>
					</div>
				</div>
			</section>

			<!-- Address -->
			<section class="mb-6">
				<h3
					class="font-cormorant-garamond mb-3 border-b pb-1 text-2xl text-gray-500"
				>
					Address
				</h3>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-500">Street</p>
						<p class="text-gray-500">
							{{ request.streetName }} {{ request.streetNum }}
						</p>
					</div>
					<div v-if="request.buildingNum">
						<p class="text-sm text-gray-500">
							Building / Apartment
						</p>
						<p class="text-gray-500">{{ request.buildingNum }}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Postal Code</p>
						<p class="text-gray-500">{{ request.postCode }}</p>
					</div>
				</div>
			</section>

			<!-- Patient Info (only shown if parent is filling out) -->
			<section v-if="!request.isAdult" class="mb-6">
				<h3
					class="font-cormorant-garamond mb-3 border-b pb-1 text-2xl text-gray-500"
				>
					Patient Information
				</h3>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-500">Patient Name</p>
						<p class="text-gray-500">
							{{ request.patientFirstName }}
							{{ request.patientMiddleName ?? "" }}
							{{ request.patientLastName }}
						</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Age</p>
						<p class="text-gray-500">{{ request.patientAge }}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Diagnosed</p>
						<p class="text-gray-500">
							{{ request.diagnosed ? "Yes" : "No" }}
						</p>
					</div>
				</div>
			</section>

			<!-- Patient Info for adult -->
			<section v-else class="mb-6">
				<h3
					class="font-cormorant-garamond mb-3 border-b pb-1 text-2xl text-gray-500"
				>
					Patient Details
				</h3>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-500">Age</p>
						<p class="text-gray-500">{{ request.patientAge }}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Diagnosed</p>
						<p class="text-gray-500">
							{{ request.diagnosed ? "Yes" : "No" }}
						</p>
					</div>
				</div>
			</section>

			<!-- History -->
			<section class="mb-6">
				<h3
					class="font-cormorant-garamond mb-3 border-b pb-1 text-2xl text-gray-500"
				>
					History
				</h3>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-500">Previous Patient</p>
						<p class="text-gray-500">
							{{ request.returnPatient ? "Yes" : "No" }}
						</p>
					</div>
					<div v-if="request.previousVisitDate">
						<p class="text-sm text-gray-500">Previous Visit</p>
						<p class="text-gray-500">
							{{
								new Date(
									request.previousVisitDate
								).toLocaleDateString()
							}}
						</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">
							Wants Diagnostic Evaluation
						</p>
						<p class="text-gray-500">
							{{ request.wantsEval ? "Yes" : "No" }}
						</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Has Referral</p>
						<p class="text-gray-500">
							{{ request.hasReferral ? "Yes" : "No" }}
						</p>
					</div>
				</div>
			</section>

			<!-- Services -->
			<section class="mb-6">
				<h3
					class="font-cormorant-garamond mb-3 border-b pb-1 text-2xl text-gray-500"
				>
					Services Requested
				</h3>

				<div v-if="request.therapies.length" class="mb-4">
					<p class="mb-1 text-sm text-gray-500">Therapies</p>
					<ul class="ml-5 list-disc text-gray-500">
						<li v-for="t in request.therapies" :key="t.name">
							{{ therapyLabel(t.name) }}
						</li>
					</ul>
				</div>

				<div v-if="request.complementaryServices.length" class="mb-4">
					<p class="mb-1 text-sm text-gray-500">
						Complementary Services
					</p>
					<ul class="ml-5 list-disc text-gray-500">
						<li
							v-for="s in request.complementaryServices"
							:key="s.name"
						>
							{{ complementaryLabel(s.name) }}
						</li>
					</ul>
				</div>

				<div v-if="request.workshops.length" class="mb-4">
					<p class="mb-1 text-sm text-gray-500">
						Workshops / Classes
					</p>
					<ul class="ml-5 list-disc text-gray-500">
						<li v-for="w in request.workshops" :key="w.name">
							{{ workshopLabel(w.name) }}
						</li>
					</ul>
				</div>

				<p
					v-if="
						!request.therapies.length &&
						!request.complementaryServices.length &&
						!request.workshops.length
					"
					class="text-gray-400 italic"
				>
					No services selected.
				</p>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
interface RequestPhone {
	id: number;
	number: string;
	requestId: number;
}

interface Request {
	id: number;
	firstName: string;
	middleName?: string;
	lastName: string;
	email: string;
	phone: RequestPhone[];
	whatsapp: string;
	idNumber: string;
	status: string;
	streetName: string;
	streetNum: string;
	buildingNum?: string;
	postCode: string;
	isAdult: boolean;
	patientFirstName: string;
	patientMiddleName?: string;
	patientLastName: string;
	patientAge: number;
	diagnosed: boolean;
	returnPatient: boolean;
	previousVisitDate?: string;
	wantsEval: boolean;
	hasReferral: boolean;
	createdAt: string;
	therapies: { name: string }[];
	complementaryServices: { name: string }[];
	workshops: { name: string }[];
}

defineProps<{
	request: Request | null;
}>();

defineEmits<{
	close: [];
}>();

const therapyLabels: Record<string, string> = {
	DIAGNOSTIC_ASSESSMENT: "Diagnostic Assessment (Evaluación Diagnóstica)",
	EARLY_INTERVENTION: "Early Intervention (Intervención Temprana)",
	BEHAVIORAL_THERAPY: "Behavioral Therapy (Terapia Conductual)",
	LEARNING_THERAPY: "Learning Therapy (Terapia de Aprendizaje)",
	SPEECH_THERAPY: "Speech Therapy (Terapia del Lenguaje)",
	SOCIAL_SKILLS: "Social Skills (Habilidades Sociales)",
	SEFVI: "SEFVI",
};

const complementaryLabels: Record<string, string> = {
	MUSICAL_STIMULATION: "Musical Stimulation (Estimulación Musical)",
	PHYSICAL_COGNITIVE_ACTIVITY:
		"Physical and Cognitive Activity (Actividad Física y Cognitiva)",
	LEARNING_IN_MOTION: "Learning in Motion (Aprendiendo en Movimiento)",
	DYNAMIC_THINKING: "Dynamic Thinking (Pensamiento Dinámico)",
	FAMILY_THERAPY: "Family Therapy (Terapia Familiar)",
	COUPLES_THERAPY: "Couples Therapy (Terapia de Parejas)",
	SEXUALITY_THERAPY:
		"Sexuality Therapy and Consultations (Terapia y Consultas de Sexualidad)",
	CHILD_ADOLESCENT_PSYCHOLOGICAL_THERAPY:
		"Child and Adolescent Psychological Therapy (Terapia Psicológica Infanto-Juvenil)",
	NUTRITIONAL_CONSULTATION: "Nutritional Consultation (Consulta Nutricional)",
	SCHOOL_VISIT: "School Visit (Visita Escolar)",
};

const workshopLabels: Record<string, string> = {
	THEATRE_COMMUNICATION:
		"Theatre and Communication Classes (Clases de Teatro y Comunicación)",
	TALKS_AND_WORKSHOPS:
		"Request for Talks and Workshops (Solicitud de Charla y Talleres)",
};

function therapyLabel(name: string) {
	return therapyLabels[name] ?? name;
}

function complementaryLabel(name: string) {
	return complementaryLabels[name] ?? name;
}

function workshopLabel(name: string) {
	return workshopLabels[name] ?? name;
}
</script>
