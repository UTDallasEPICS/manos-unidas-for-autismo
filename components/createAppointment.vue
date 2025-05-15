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
						<select
							v-model="form.therapist"
							required
							class="input w-full"
						>
							<option disabled value="">Pick a therapist</option>
							<option
								v-for="t in therapistOptions"
								:key="t.id"
								:value="t.id"
							>
								{{ t.name }}
							</option>
						</select>
					</div>

					<!-- Session Type (required) -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="sessionType"
							>Session Type
							<span class="text-red-500">*</span></label
						>
						<select
							v-model="form.sessionType"
							required
							class="input w-full"
						>
							<option disabled value="">
								Pick a session type
							</option>
							<option
								v-for="st in typeOptions"
								:key="st.id"
								:value="st.id"
							>
								{{ st.name }}
							</option>
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
import { ref, reactive, computed } from "vue";
import { useFetch } from "#imports";
import { reloadNuxtApp } from "#app";

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

interface Therapist {
	id: string;
	fName: string;
	lName: string;
}
interface SessionType {
	id: string;
	name: string;
}

const { data: therapistsData = ref([] as Therapist[]) } = await useFetch<
	Therapist[]
>("/api/therapists", { default: () => [] });

const { data: typesData = ref([] as SessionType[]) } = await useFetch<
	SessionType[]
>("/api/session/sessionType", { default: () => [] });

const therapistOptions = computed(() =>
	therapistsData.value.map((t) => ({
		id: t.id,
		name: `${t.fName} ${t.lName}`,
	}))
);

const typeOptions = computed(() =>
	(typesData.value || []).map((st) => ({
		id: st.id,
		name: st.name,
	}))
);

function enforceMin() {
	if (form.max < 1 || isNaN(form.max)) form.max = 1;
	if (form.duration < 1 || isNaN(form.duration)) form.duration = 1;
}

// Submit form handler
async function submitForm() {
	// 1) basic client-side validation
	if (!form.therapist || !form.sessionType || !form.date || !form.time) {
		alert("Please fill out all required fields.");
		return;
	}

	// 2) build the create.post.ts payload
	const dateTime = new Date(`${form.date}T${form.time}`);

	const payload = {
		therapistId: form.therapist, // string
		typeId: form.sessionType, // string
		time: dateTime, // JS Date
		duration: form.duration, // number ≥1
		maxAttendance: form.max, // number ≥1
		comment: form.comments || undefined,
	};

	try {
		// 3) send it off
		const res = await fetch("/api/session/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err.statusMessage || `HTTP ${res.status}`);
		}

		// 4) reset and close
		closeModal();
		reloadNuxtApp();
	} catch (err) {
		console.error("Could not save session:", err);
		alert("Failed to create appointment.");
	}
}

// Close modal and reset
function closeModal() {
	showModal.value = false;
	Object.assign(form, {
		therapist: "",
		sessionType: "",
		date: "",
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
