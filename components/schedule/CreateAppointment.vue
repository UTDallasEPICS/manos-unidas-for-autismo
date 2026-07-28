<template>
	<div>
		<button class="btn cursor-pointer" @click="showModal = true">
			{{ $t("Create Appointment") }}
		</button>

		<div
			v-if="showModal"
			class="font-sc-encode fixed inset-0 z-50 flex items-center justify-center"
			aria-modal="true"
			role="dialog"
		>
			<div
				class="absolute inset-0 bg-black/70"
				@click.self="closeModal"
			></div>

			<div
				class="relative z-10 w-full max-w-md bg-white p-6 shadow-md"
				@click.stop
			>
				<h2 class="mb-4 text-xl font-bold">
					{{ $t("New Appointment") }}
				</h2>

				<form @submit.prevent="submitForm">
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="therapist"
							>{{ $t("Therapist") }}
							<span class="text-red-500">*</span></label
						>
						<select
							v-model="form.therapist"
							required
							class="input w-full"
						>
							<option disabled value="">
								{{ $t("Pick a therapist") }}
							</option>
							<option
								v-for="t in therapistOptions"
								:key="t.id"
								:value="t.id"
							>
								{{ t.name }}
							</option>
						</select>
					</div>

					<div class="mb-4">
						<label class="mb-1 block font-medium" for="sessionType"
							>{{ $t("Session Type") }}
							<span class="text-red-500">*</span></label
						>
						<p v-if="!hasSessionTypes" class="text-sm text-red-600">
							{{ $t("No session types configured") }}
						</p>
						<select
							v-else
							v-model="form.sessionType"
							required
							class="input w-full"
						>
							<option disabled value="">
								{{ $t("Pick a session type") }}
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
						<div class="w-1/2 grow flex-row">
							<label class="mb-1 block font-medium" for="date"
								>{{ $t("Date") }}
								<span class="text-red-500">*</span>
							</label>
							<input
								type="date"
								v-model="form.date"
								:min="minDate"
								required
								class="input w-full"
							/>
						</div>

						<div class="w-1/2 grow flex-row">
							<label class="mb-1 block font-medium" for="time"
								>{{ $t("Time") }}
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

					<div class="mb-4">
						<label class="mb-1 block font-medium" for="max"
							>{{ $t("Duration (Minutes)") }}
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

					<div class="mb-4">
						<label class="mb-1 block font-medium" for="max">{{
							$t("Max Patient Attendance (Min. 1)")
						}}</label>
						<input
							type="number"
							id="max"
							v-model.number="form.max"
							min="1"
							@blur="enforceMin()"
							class="input w-full"
						/>
					</div>

					<div class="mb-4">
						<label class="mb-1 block font-medium" for="comments">{{
							$t("Comments")
						}}</label>
						<textarea
							id="comments"
							v-model="form.comments"
							class="input w-full"
							placeholder="Additional details..."
						></textarea>
					</div>

					<div class="flex justify-end space-x-2">
						<button
							type="button"
							class="bg-blay cursor-pointer px-2"
							@click="closeModal"
						>
							{{ $t("Cancel") }}
						</button>
						<button type="submit" class="btn cursor-pointer">
							{{ $t("Save") }}
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

const showModal = ref(false);

const form = reactive({
	therapist: "",
	sessionType: "",
	date: "",
	time: "",
	duration: 60,
	max: 1,
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
>("/api/session/therapists", { default: () => [] });

const { data: typesData = ref([] as SessionType[]) } = await useFetch<
	SessionType[]
>("/api/session/types", { default: () => [] });

const therapistOptions = computed(() =>
	therapistsData.value.map((t) => ({
		id: t.id,
		name: `${t.fName} ${t.lName}`,
	}))
);

const minDate = computed(() => {
	const today = new Date();
	//return today.toISOString().split("T")[0]; // "YYYY-MM-DD"
	return today.toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local time
});

const hasSessionTypes = computed(() => {
	return typeOptions.value && typeOptions.value.length > 0;
});

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

async function submitForm() {
	if (!form.therapist || !form.sessionType || !form.date || !form.time) {
		alert("Please fill out all required fields.");
		return;
	}

	const dateTime = new Date(`${form.date}T${form.time}`);

	if (dateTime < new Date()) {
		alert("Cannot create appointments in the past.");
		return;
	}

	const payload = {
		therapistId: form.therapist,
		typeId: form.sessionType,
		time: dateTime,
		duration: form.duration,
		maxAttendance: form.max,
		comment: form.comments || undefined,
	};

	try {
		const res = await fetch("/api/session/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err.statusMessage || `HTTP ${res.status}`);
		}

		closeModal();
		reloadNuxtApp();
	} catch (err) {
		console.error("Could not save session:", err);
		alert("Failed to create appointment.");
	}
}

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
