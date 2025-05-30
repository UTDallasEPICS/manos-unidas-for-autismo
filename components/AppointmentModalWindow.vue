<!-- 14 May 2025
    When appointment box is clicked, this window should display and show appointment details. As of now it doesn't distinguish between patient or staff and displays all the information.
 -->
<template>
	<!-- Background -->
	<div
		class="fixed top-0 right-0 z-50 h-full w-full bg-black/70"
		@click="closeWindow"
	></div>

	<div
		class="font-sc-encode fixed top-0 right-0 z-51 h-full w-full items-center text-left"
	>
		<!-- Window -->
		<div
			class="text-md relative z-52 m-7 flex max-h-7/8 flex-col overflow-y-auto bg-white p-4 text-black"
		>
			<div
				class="flex cursor-pointer justify-end pr-2 text-right"
				@click="closeWindow"
			>
				<X :size="30" />
			</div>
			<!-- Information -->
			<div class="m-3 flex flex-col gap-3">
				<h1 class="font-cormorant-garamond text-3xl font-bold">
					{{ props.session.Type.name + " - " + duration }}
				</h1>
				<h2 class="text-xl">
					Therapist: {{ props.session.Therapist.fName }}
				</h2>
				<h3 class="font-bold" v-if="!permissions.nonEmployee">
					Maximum Patients: {{ props.session.maxAttendance }}
				</h3>
				<h3 class="font-bold" v-else>
					Space Left: {{ remainingSpace }}
				</h3>
				<button
					class="grid cursor-pointer grid-cols-2 bg-blue-950 text-white"
					@click="showPatients = !showPatients"
					v-if="!permissions.nonEmployee"
				>
					<span class="col-span-1 px-2 py-1 text-left font-bold"
						>Patients Attending</span
					>
					<span class="col-span-1 flex justify-end px-2 py-1">
						<ChevronDown v-if="!showPatients" />
						<ChevronUp v-else />
					</span>
				</button>
				<div v-if="showPatients" class="px-5">
					<div
						v-for="patient in props.session.Patients"
						:key="patient"
						class="grid cursor-pointer grid-cols-5 hover:bg-gray-100"
						@click="goToPatient(patient.Patient.User.User.id)"
					>
						<div class="col-span-2">
							{{
								patient.Patient.User.User.fName +
								" " +
								patient.Patient.User.User.lName
							}}
						</div>
						<div class="col-span-1 text-center">
							Age: {{ getAge(patient.Patient.User.dob) }}
						</div>
						<div class="col-span-1 text-center">
							Gender:
							{{ getGender(patient.Patient.User.gender) }}
						</div>
						<div
							class="col-span-1 px-3 text-right text-xs text-blue-400"
						>
							View Profile &gt;
						</div>
					</div>
					<div v-if="!props.session.Patients.length">No patients</div>
				</div>
				<div
					v-if="
						typeof props.session.comment != undefined &&
						props.session.comment != null &&
						props.session.comment.length > 0 &&
						!permissions.nonEmployee
					"
				>
					<h3 class="font-bold">Comments:</h3>
					<div>{{ props.session.comment }}</div>
				</div>
			</div>
			<!-- Buttons -->
			<div class="flex flex-col justify-center gap-3">
				<div class="flex justify-center">
					<button
						class="btn cursor-pointer"
						v-if="!permissions.nonEmployee"
					>
						Therapy Notes
					</button>
				</div>
				<div class="flex justify-center">
					<button
						class="btn cursor-pointer"
						v-if="
							!permissions.nonEmployee &&
							permissions.editAppointments
						"
						@click="showEditAppointment()"
					>
						Edit Appointment
					</button>
				</div>
			</div>

			<div class="mt-5 mb-10 flex justify-center" v-if="showEdit">
				<editAppointment
					:session="props.session"
					@close-edit="showEditAppointment()"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, useCookie, navigateTo } from "#imports";
import type { Session } from "@prisma/client";
import { X, ChevronDown, ChevronUp } from "lucide-vue-next";
import { AccessPermission } from "~/permissions";
import { Gender } from "@prisma/client";

const props = defineProps<{
	session: Session;
}>();

const emit = defineEmits(["closeWindow"]);

function closeWindow() {
	emit("closeWindow");
}

const access = useCookie("AccessPermission");

const permissions = computed(() => {
	let actions = {
		nonEmployee: true, // patient = true, user service/admin/therapist = false
		editAppointments: false, // user service = true, admin/patient/therapist = false
	};

	if (access.value) {
		if (
			access.value[AccessPermission.USER_SERVICE] ||
			access.value[AccessPermission.ADMIN] ||
			access.value[AccessPermission.THERAPIST]
		) {
			actions.nonEmployee = false;
		}
		if (access.value[AccessPermission.USER_SERVICE]) {
			actions.editAppointments = true;
		}
	}

	return actions;
});

const showPatients = ref(false);

const remainingSpace = computed(() => {
	let result = 0;
	if (props.session.Patients.length != undefined) {
		result = props.session.maxAttendance - props.session.Patients.length;
		if (result < 0) {
			result = 0;
		}
	} else {
		result = 0;
	}
	return result;
});

const duration = computed(() => {
	const date = new Date(props.session.time);
	const startHour = date.getHours();
	const startMins = date.getMinutes();

	// get end time
	let endTime = getSessionEndTime(date, props.session.duration);
	const endHour = endTime.getHours();
	const endMins = endTime.getMinutes();

	const result =
		startHour +
		":" +
		(startMins > 10 ? startMins : "0" + startMins) +
		"-" +
		endHour +
		":" +
		(endMins > 10 ? endMins : "0" + endMins);
	return result;
});

function getSessionEndTime(d: Date, sessionLength: number): Date {
	let endTime = new Date(d.getTime());
	endTime.setMinutes(d.getMinutes() + sessionLength);
	return endTime;
}

const showEdit = ref(false);

function showEditAppointment() {
	showEdit.value = !showEdit.value;
}

async function goToPatient(id: string) {
	let name = "bad";
	if (access.value[AccessPermission.PARENT]) {
		name = "childProfile-id";
	}
	if (access.value[AccessPermission.STAFF]) {
		name = "patientProfile-id";
	}
	await navigateTo({
		name: name,
		params: { id: id },
	});
}

function getAge(bday: Date) {
	const d = new Date(bday);
	const today = new Date(Date.now());
	let age = today.getFullYear() - d.getFullYear();

	if (
		today.getMonth() < d.getMonth() ||
		(today.getMonth() == d.getMonth() && today.getDate() < d.getDate())
	) {
		age--;
	}
	return age;
}

function getGender(g: Gender) {
	switch (g) {
		case Gender.MALE:
			return "Male";
		case Gender.FEMALE:
			return "Female";
		case Gender.Other:
			return "Other";
		default:
			return "-";
	}
}
</script>
