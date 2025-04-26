<template>
	<div class="p-6">
		<h1 class="mb-4 text-2xl font-bold">Edit Appointment</h1>

		<!-- Appointment Edit Form -->
		<form @submit.prevent="submitForm" class="max-w-md space-y-4">
			<div>
				<label class="block font-medium">Therapist:</label>
				<input
					v-model="form.therapist"
					type="text"
					class="w-full rounded border px-3 py-2"
				/>
			</div>

			<div>
				<label class="block font-medium">Session Type:</label>
				<input
					v-model="form.sessionType"
					type="text"
					class="w-full rounded border px-3 py-2"
				/>
			</div>

			<div>
				<label class="block font-medium">Time:</label>
				<input
					v-model="form.time"
					type="time"
					class="w-full rounded border px-3 py-2"
				/>
			</div>

			<div>
				<label class="block font-medium">Duration (minutes):</label>
				<input
					v-model.number="form.duration"
					type="number"
					min="1"
					class="w-full rounded border px-3 py-2"
				/>
			</div>

			<div>
				<label class="block font-medium">Max Patients:</label>
				<input
					v-model.number="form.max"
					type="number"
					min="1"
					class="w-full rounded border px-3 py-2"
				/>
			</div>

			<div>
				<label class="block font-medium">Comments:</label>
				<textarea
					v-model="form.comments"
					class="w-full rounded border px-3 py-2"
					placeholder="Additional details..."
				></textarea>
			</div>

			<button
				type="submit"
				class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				:disabled="!form.therapist"
			>
				Save Changes
			</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { useRoute } from "vue-router";

// Get the appointment ID from the URL (like ?id=123)
const route = useRoute();
const appointmentId = route.query.id;

// Dummy appointment data ONLY for development mode
let dummyAppointment;

if (import.meta.dev) {
	dummyAppointment = {
		id: appointmentId,
		therapist: "Dr. Smith",
		sessionType: "Speech Therapy",
		time: "10:30",
		duration: 60,
		max: 4,
		comments: "Test edit appointment (dev mode)",
	};
} else {
	dummyAppointment = {
		id: appointmentId,
		therapist: "",
		sessionType: "",
		time: "",
		duration: 1,
		max: 1,
		comments: "",
	};
}

// Reactive form object
const form = reactive({
	therapist: "",
	sessionType: "",
	time: "",
	duration: 1,
	max: 1,
	comments: "",
});

// Pre-fill form on mount
onMounted(() => {
	// TODO: Replace dummyAppointment with fetched data once backend is ready
	form.therapist = dummyAppointment.therapist;
	form.sessionType = dummyAppointment.sessionType;
	form.time = dummyAppointment.time;
	form.duration = dummyAppointment.duration;
	form.max = dummyAppointment.max;
	form.comments = dummyAppointment.comments;
});

// Handle form submission
function submitForm() {
	// This is data will be sent to the backend
	console.log("Submitted form data:", form);
	alert("Form submitted! Check the console to see the data.");
}
</script>
