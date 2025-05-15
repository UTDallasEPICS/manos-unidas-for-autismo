<template>
	<div class="flex flex-col">
		<div class="grow">
			<div
				v-if="error"
				class="mb-4 rounded border bg-red-100 p-4 text-red-500"
			>
				<p>{{ error }}</p>
				<button
					@click="$router.go(0)"
					class="bg-blay mt-3 cursor-pointer px-2"
				>
					Try Again
				</button>
			</div>

			<form @submit.prevent="submitForm" class="max-w-md space-y-4">
				<div>
					<label class="block font-medium">Therapist:</label>
					<select
						v-model="form.therapist"
						class="input w-full"
						required
					>
						<option disabled value="">Select therapist</option>
						<option
							v-for="therapist in therapists"
							:key="therapist.id"
							:value="therapist.id"
						>
							{{ therapist.fName || "(Missing)" }}
							{{ therapist.lName || "" }}
						</option>
					</select>
				</div>

				<div>
					<label class="block font-medium">Session Type:</label>
					<select
						v-model="form.sessionType"
						class="input w-full"
						required
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
							class="input w-1/2"
							required
						/>
						<input
							v-model="form.time"
							type="time"
							class="input w-1/2"
							required
						/>
					</div>
				</div>

				<div>
					<label class="block font-medium">Duration (minutes):</label>
					<input
						v-model.number="form.duration"
						type="number"
						min="1"
						class="input w-full"
						required
					/>
				</div>

				<div>
					<label class="block font-medium">Max Patients:</label>
					<input
						v-model.number="form.max"
						type="number"
						min="1"
						class="input w-full"
						required
					/>
				</div>

				<div>
					<label class="block font-medium">Comments:</label>
					<textarea
						v-model="form.comments"
						class="input w-full"
						placeholder="Additional details..."
					></textarea>
				</div>

				<div class="flex justify-center space-x-2">
					<button
						type="button"
						class="bg-blay cursor-pointer px-2"
						@click="close()"
					>
						Cancel
					</button>
					<button type="submit" class="btn cursor-pointer">
						Save Changes
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useFetch } from "#app";
import { $fetch } from "ofetch";
import type { Session } from "@prisma/client";

interface Therapist {
	id: string;
	fName: string | null;
	lName: string | null;
}

interface SessionType {
	id: string;
	name: string;
}

const props = defineProps<{
	session: Session;
}>();

const emit = defineEmits(["closeEdit"]);
function close() {
	emit("closeEdit");
}

const therapists = ref<Therapist[]>([]);
const sessionTypes = ref<SessionType[]>([]);
const error = ref<string | null>(null);

const form = reactive({
	therapist: props.session.therapistId,
	sessionType: props.session.typeId,
	date: "",
	time: "",
	duration: props.session.duration,
	max: props.session.maxAttendance,
	comments: props.session.comment,
});

onMounted(async () => {
	try {
		const therapistResult = await $fetch<Therapist[]>("/api/therapists");
		const sessionTypeResult =
			await $fetch<SessionType[]>("/api/sessionTypes");

		console.log("Therapists:", therapistResult);
		console.log("SessionTypes:", sessionTypeResult);

		if (therapistResult) therapists.value = therapistResult;
		if (sessionTypeResult) sessionTypes.value = sessionTypeResult;

		if (!props.session.id) return;

		setFormTime();
	} catch (e) {
		error.value = `Unexpected error: ${e instanceof Error ? e.message : String(e)}`;
		console.error("Failed to load data:", e);
	}
});

async function submitForm() {
	const sessionTime = new Date(
		form.date && form.time ? `${form.date}T${form.time}:00` : ""
	);
	const sessionData = {
		id: props.session.id,
		therapistId: form.therapist,
		typeId: form.sessionType,
		time: sessionTime.toISOString(),
		duration: form.duration,
		maxAttendance: form.max,
		comment: form.comments,
	};

	console.log("Submitted session data:", sessionData);

	const { error: putError } = await useFetch(
		`/api/session/${props.session.id}`,
		{
			method: "PUT",
			body: sessionData,
		}
	);

	if (putError.value) {
		alert("Failed to save changes.");
		console.error("PUT error:", putError.value);
	} else {
		alert("Changes saved successfully.");
	}

	location.reload();
}

// set form time
function setFormTime() {
	if (!props.session.time) {
		return;
	}

	const sessionTime = new Date(props.session.time);

	// gets date and time in local time
	form.date =
		sessionTime.getFullYear() +
		"-" +
		(sessionTime.getMonth() + 1 < 10
			? "0" + (sessionTime.getMonth() + 1)
			: sessionTime.getMonth() + 1) +
		"-" +
		(sessionTime.getDate() < 10
			? "0" + sessionTime.getDate()
			: sessionTime.getDate());
	form.time =
		(sessionTime.getHours() < 10
			? "0" + sessionTime.getHours()
			: sessionTime.getHours()) +
		":" +
		(sessionTime.getMinutes() < 10
			? "0" + sessionTime.getMinutes()
			: sessionTime.getMinutes());
}
</script>
