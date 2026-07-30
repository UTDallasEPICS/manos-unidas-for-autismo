<template>
	<div class="font-sc-encode p-4">
		<!-- Header -->
		<div class="mb-2">
			<h1 class="font-cormorant-garamond text-2xl font-bold">
				Evaluation Appointment Requests
			</h1>
		</div>
		<div class="mb-4 flex justify-end">
			<RefreshButton :onRefresh="refreshAppointments" />
		</div>
		<AssignModal
			v-model:modelValue="isAssignModalOpen"
			:mode="assignMode"
			:item="selectedAppointment"
			@assigned="handleAppointmentAssigned"
		/>

		<!-- Appointments Table -->
		<table class="w-full table-auto border-collapse">
			<thead class="bg-gray-100">
				<tr>
					<th class="px-4 py-2 text-left">Name</th>
					<th class="px-4 py-2 text-left">Email</th>
					<th class="px-4 py-2 text-left">Phone</th>
					<th class="px-4 py-2 text-left">Service Type</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="appointment in appointmentRequests"
					:key="appointment.id"
					class="cursor-pointer border-t hover:bg-gray-100"
					@click="openAssignModal(appointment)"
				>
					<td class="px-4 py-2">
						<span
							class="cursor-pointer text-blue-600 hover:underline"
						>
							{{ appointment.firstName }}
							{{ appointment.lastName }}
						</span>
					</td>
					<td class="px-4 py-2">{{ appointment.email || "—" }}</td>
					<td class="px-4 py-2">{{ appointment.phone || "—" }}</td>
					<td class="px-4 py-2">
						{{ appointment.serviceType || "—" }}
					</td>
				</tr>
				<tr v-if="!appointmentRequests.length" class="border-t">
					<td colspan="4" class="px-4 py-2 text-center">
						No appointment requests found.
					</td>
				</tr>
			</tbody>
		</table>

		<!-- Error State -->
		<div v-if="error" class="mt-4 text-red-600">
			Failed to load appointment requests.
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AssignModal from "./assignModal.vue";
import RefreshButton from "./refreshButton.vue";
import { useFetch } from "#imports";
import { AccessPermission } from "~/types/permissions";

const { access } = useAuthState();

interface Appointment {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	serviceType: string;
}

const {
	data: appointmentData,
	error,
	refresh: refreshAppointmentData,
} = await getAppointments();

async function getAppointments() {
	if (access.value?.[AccessPermission.USER_SERVICE]) {
		return useFetch<Appointment[]>("/api/session/appointments");
	}
	return {
		data: { value: [] as Appointment[] },
		error: "User not authorized to view appointment requests",
		refresh: async () => {},
	};
}

const appointmentRequests = computed(() => appointmentData?.value ?? []);
const isAssignModalOpen = ref(false);
const selectedAppointment = ref<Appointment | null>(null);
const assignMode = ref<"appointment" | "referral">("appointment");

function openAssignModal(appointment: Appointment) {
	selectedAppointment.value = appointment;
	assignMode.value = "appointment";
	isAssignModalOpen.value = true;
}

async function handleAppointmentAssigned() {
	await refreshAppointmentData();
}

async function refreshAppointments() {
	await refreshAppointmentData();
}
</script>
