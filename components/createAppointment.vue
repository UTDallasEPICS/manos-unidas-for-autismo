<template>
	<div>
		<!-- Button to open modal -->
		<button class="btn cursor-pointer" @click="showModal = true">
			Create Appointment
		</button>

		<!-- Modal -->
		<div
			v-if="showModal"
			class="font-sc-encode fixed inset-0 z-50 flex items-center justify-center"
			aria-modal="true"
			role="dialog"
		>
			<!-- Dimmed background -->
			<div
				class="absolute inset-0 bg-black/70"
				@click.self="closeModal"
			></div>

			<!-- Modal content box -->
			<div
				class="relative z-10 w-full max-w-md bg-white p-6 shadow-md"
				@click.stop
			>
				<h2 class="mb-4 text-xl font-bold">New Appointment</h2>

				<form @submit.prevent="submitForm">
					<!-- Therapist (required) -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="therapist"
							>Therapist
							<span class="text-red-500">*</span></label
						>
						<input
							type="text"
							id="therapist"
							v-model="form.therapist"
							required
							class="input w-full"
							placeholder="Enter therapist name"
						/>
					</div>

					<!-- Session Type (required) -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="sessionType"
							>Session Type
							<span class="text-red-500">*</span></label
						>
						<select
							id="sessionType"
							v-model="form.sessionType"
							required
							class="input w-full"
						>
							<option disabled value="">
								Select a session type
							</option>
							<option>Learning Therapy</option>
							<option>Behavior Therapy</option>
							<option>Speech Therapy</option>
						</select>
					</div>

					<div class="mb-4 flex grow place-content-between gap-5">
						<!-- Date Picker -->
						<div class="w-1/2 grow flex-row">
							<label class="mb-1 block font-medium" for="date"
								>Date
								<span class="text-red-500">*</span>
							</label>
							<input
								type="date"
								v-model="form.date"
								required
								class="input w-full"
							/>
						</div>

						<!-- Time Picker -->
						<div class="w-1/2 grow flex-row">
							<label class="mb-1 block font-medium" for="time"
								>Time
								<span class="text-red-500">*</span>
							</label>
							<input
								type="time"
								v-model="form.time"
								required
								class="input w-full"
							/>
						</div>
					</div>

					<!-- Duration (optional, defaults to 1) -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="max"
							>Duration (Minutes)
						</label>
						<input
							type="number"
							id="duration"
							v-model.number="form.duration"
							min="1"
							@blur="enforceMin()"
							class="input w-full"
						/>
					</div>

					<!-- Max (optional, defaults to 1) -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="max"
							>Max Patient Attendance (Min. 1)</label
						>
						<input
							type="number"
							id="max"
							v-model.number="form.max"
							min="1"
							@blur="enforceMin()"
							class="input w-full"
						/>
					</div>

					<!-- Comments (optional) -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="comments"
							>Comments</label
						>
						<textarea
							id="comments"
							v-model="form.comments"
							class="input w-full"
							placeholder="Additional details..."
						></textarea>
					</div>

					<!-- Action buttons -->
					<div class="flex justify-end space-x-2">
						<button
							type="button"
							class="bg-blay cursor-pointer px-2"
							@click="closeModal"
						>
							Cancel
						</button>
						<button type="submit" class="btn cursor-pointer">
							Save
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

// Whether to show the modal
const showModal = ref(false);

// The form data
const form = reactive({
	therapist: "",
	sessionType: "",
	date: "",
	time: "",
	duration: 60,
	max: 1, // defaults to 1
	comments: "",
});

function enforceMin() {
	if (form.max < 1 || isNaN(form.max)) form.max = 1;
	if (form.duration < 1 || isNaN(form.duration)) form.duration = 1;
}

// Submit form handler
function submitForm() {
	// Validate required fields
	if (!form.therapist || !form.sessionType || !form.time) {
		alert("Please fill out all required fields.");
		return;
	}

	// Placeholder for database submission logic
	console.log("Form submitted:", form);

	// Close modal after submission
	closeModal();
}

// Close modal and reset form (optional)
function closeModal() {
	showModal.value = false;

	Object.assign(form, {
		therapist: "",
		sessionType: "",
		time: "",
		duration: 60,
		max: 1,
		comments: "",
	});
}
</script>

<style scoped>
/* Add or adjust styles to match your design. */
</style>
