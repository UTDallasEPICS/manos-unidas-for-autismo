<template>
	<div class="flex min-h-screen flex-col p-6">
		<div class="grow">
			<h1 class="mb-4 text-2xl font-bold">Edit Appointment</h1>

			<form @submit.prevent="submitForm" class="max-w-md space-y-4">
				<div>
					<label class="block font-medium">Therapist:</label>
					<select
						v-model="form.therapist"
						class="w-full rounded border px-3 py-2"
					>
						<option disabled value="">Select therapist</option>
						<option
							v-for="therapist in therapists"
							:key="therapist.id"
							:value="therapist.id"
						>
							{{ therapist.fName }} {{ therapist.lName }}
						</option>
					</select>
				</div>

				<div>
					<label class="block font-medium">Session Type:</label>
					<select
						v-model="form.sessionType"
						class="w-full rounded border px-3 py-2"
					>
						<option disabled value="">Select session type</option>
						<option
							v-for="type in sessionTypes"
							:key="type.id"
							:value="type.id"
						>
							{{ type.name }}
						</option>
					</select>
				</div>

				<div>
					<label class="block font-medium">Date and Time:</label>
					<div class="flex gap-4">
						<input
							v-model="form.date"
							type="date"
							class="w-1/2 rounded border px-3 py-2"
						/>
						<input
							v-model="form.time"
							type="time"
							class="w-1/2 rounded border px-3 py-2"
						/>
					</div>
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
					:disabled="!form.therapist || !form.sessionType"
				>
					Save Changes
				</button>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useFetch } from "#app";

interface Therapist {
	id: string;
	fName: string;
	lName: string;
}

interface SessionType {
	id: string;
	name: string;
}

const route = useRoute();
const appointmentId = route.query.id as string;

const therapists = ref<Therapist[]>([]);
const sessionTypes = ref<SessionType[]>([]);

onMounted(async () => {
	const { data: therapistData } =
		await useFetch<Therapist[]>("/api/therapists");
	const { data: sessionTypeData } =
		await useFetch<SessionType[]>("/api/sessionTypes");

	if (therapistData.value) {
		therapists.value = therapistData.value;
	}
	if (sessionTypeData.value) {
		sessionTypes.value = sessionTypeData.value;
	}

	console.log("Editing appointment ID:", appointmentId);
});

const form = reactive({
	therapist: "",
	sessionType: "",
	date: "",
	time: "",
	duration: 1,
	max: 1,
	comments: "",
});

function submitForm() {
	console.log("Submitted form data:", { ...form });
	alert("Form submitted! Check the console to see the data.");
}
</script>
