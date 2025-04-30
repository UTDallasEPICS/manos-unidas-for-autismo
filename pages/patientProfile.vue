<template>
	<div class="p-4">
		<!-- DEV‐ONLY role selector -->
		<div class="mb-4">
			<label class="mr-2 font-medium">Simulate role:</label>
			<select v-model="user.role" class="rounded border px-2 py-1">
				<option disabled value="">— select role —</option>
				<option value="patient">Patient</option>
				<option value="parent">Parent</option>
				<option value="therapist">Therapist</option>
			</select>
		</div>
		<!-- Dashboard Header -->
		<h1 class="mb-4 text-2xl font-bold">User Profile</h1>

		<!-- Patient / Parent Section -->
		<section
			v-if="user.role === 'patient' || user.role === 'parent'"
			class="mb-6 rounded border p-4"
		>
			<h2 class="mb-2 text-xl font-semibold">Profile Details</h2>
			<p class="mb-2"><strong>Name:</strong> {{ profile.name }}</p>
			<p class="mb-2"><strong>Email:</strong> {{ profile.email }}</p>
			<p class="mb-2"><strong>Phone:</strong> {{ profile.phone }}</p>
			<p class="mb-2"><strong>Address:</strong> {{ profile.address }}</p>
			<p class="mb-2">
				<strong>Medical Records:</strong> {{ profile.medicalRecords }}
			</p>
			<p class="mb-2">
				<strong>Dues Paid:</strong>
				{{ profile.duesPaid ? "Yes" : "No" }}
			</p>
			<p>
				<strong>Reminder Notifications:</strong>
				{{ profile.notificationsOptIn ? "Opted In" : "Opted Out" }}
			</p>
			<!-- Edit Profile Button -->
			<div class="mt-4">
				<button
					class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					@click="openEditModal"
				>
					Edit Profile
				</button>
			</div>

			<!-- Progress Reports (View Only) -->
			<div class="mt-6">
				<h2 class="mb-2 text-xl font-semibold">Progress Reports</h2>
				<div v-if="progressReports.length">
					<ul class="list-disc pl-6">
						<li
							v-for="(report, index) in progressReports"
							:key="index"
						>
							<strong>{{ report.title }}</strong> -
							{{ report.date }}
						</li>
					</ul>
				</div>
				<p v-else>No progress reports available.</p>
			</div>
		</section>

		<!-- Therapist Section -->
		<section
			v-else-if="user.role === 'therapist'"
			class="mb-6 rounded border p-4"
		>
			<h2 class="mb-2 text-xl font-semibold">Session Notes</h2>
			<div v-if="sessionNotes.length">
				<ul class="list-disc pl-6">
					<li v-for="(note, index) in sessionNotes" :key="index">
						<strong>{{ note.patient }}</strong
						>: {{ note.note }} <em>({{ note.date }})</em>
					</li>
				</ul>
			</div>
			<p v-else>No session notes available.</p>

			<!-- Button to write a Progress Report -->
			<div class="mt-4">
				<button
					class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					@click="showProgressReportModal = true"
				>
					Write Progress Report
				</button>
			</div>
		</section>

		<!-- ================= MODAL: Edit Profile (for Patient/Parent) ================= -->
		<div
			v-if="showEditModal"
			class="fixed inset-0 z-50 flex items-center justify-center"
			aria-modal="true"
			role="dialog"
		>
			<!-- Dimmed Background -->
			<div
				class="absolute inset-0 bg-black/70"
				@click.self="closeEditModal"
			></div>

			<!-- Modal Content -->
			<div
				class="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-md"
				@click.stop
			>
				<h2 class="mb-4 text-xl font-bold">Edit Profile</h2>
				<form @submit.prevent="updateProfile">
					<!-- Name -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="name">
							Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="name"
							v-model="editForm.name"
							required
							class="w-full rounded border border-gray-300 px-3 py-2"
							placeholder="Enter your name"
						/>
					</div>

					<!-- Email -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="email">
							Email <span class="text-red-500">*</span>
						</label>
						<input
							type="email"
							id="email"
							v-model="editForm.email"
							required
							class="w-full rounded border border-gray-300 px-3 py-2"
							placeholder="Enter your email"
						/>
					</div>

					<!-- Phone -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="phone">
							Phone <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="phone"
							v-model="editForm.phone"
							required
							class="w-full rounded border border-gray-300 px-3 py-2"
							placeholder="Enter your phone number"
						/>
					</div>

					<!-- Address -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="address">
							Address
						</label>
						<input
							type="text"
							id="address"
							v-model="editForm.address"
							class="w-full rounded border border-gray-300 px-3 py-2"
							placeholder="Enter your address"
						/>
					</div>

					<!-- Medical Records -->
					<div class="mb-4">
						<label
							class="mb-1 block font-medium"
							for="medicalRecords"
						>
							Medical Records
						</label>
						<textarea
							id="medicalRecords"
							v-model="editForm.medicalRecords"
							class="w-full rounded border border-gray-300 px-3 py-2"
							placeholder="Enter your medical records"
						></textarea>
					</div>

					<!-- Dues Paid -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="duesPaid">
							Dues Paid
						</label>
						<select
							id="duesPaid"
							v-model="editForm.duesPaid"
							class="w-full rounded border border-gray-300 px-3 py-2"
						>
							<option :value="true">Yes</option>
							<option :value="false">No</option>
						</select>
					</div>

					<!-- Reminder Notifications -->
					<div class="mb-4 flex items-center">
						<input
							type="checkbox"
							id="notificationsOptIn"
							v-model="editForm.notificationsOptIn"
							class="mr-2"
						/>
						<label for="notificationsOptIn" class="font-medium">
							Opt-in for reminder notifications
						</label>
					</div>

					<!-- Action Buttons -->
					<div class="flex justify-end space-x-2">
						<button
							type="button"
							class="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
							@click="closeEditModal"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						>
							Save
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- ================= MODAL: Write Progress Report (for Therapist) ================= -->
		<div
			v-if="showProgressReportModal"
			class="fixed inset-0 z-50 flex items-center justify-center"
			aria-modal="true"
			role="dialog"
		>
			<!-- Dimmed Background -->
			<div
				class="absolute inset-0 bg-black/70"
				@click.self="closeProgressReportModal"
			></div>

			<!-- Modal Content -->
			<div
				class="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-md"
				@click.stop
			>
				<h2 class="mb-4 text-xl font-bold">Write Progress Report</h2>
				<form @submit.prevent="submitProgressReport">
					<!-- Report Title -->
					<div class="mb-4">
						<label for="reportTitle" class="mb-1 block font-medium">
							Report Title <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="reportTitle"
							v-model="progressReportForm.title"
							required
							class="w-full rounded border border-gray-300 px-3 py-2"
							placeholder="Enter report title"
						/>
					</div>
					<!-- Report Details -->
					<div class="mb-4">
						<label
							for="reportDetails"
							class="mb-1 block font-medium"
						>
							Report Details
						</label>
						<textarea
							id="reportDetails"
							v-model="progressReportForm.details"
							class="w-full rounded border border-gray-300 px-3 py-2"
							placeholder="Enter report details"
						></textarea>
					</div>
					<!-- Action Buttons -->
					<div class="flex justify-end space-x-2">
						<button
							type="button"
							class="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
							@click="closeProgressReportModal"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						>
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

/**
 * Dummy user information.
 * In production, this would be fetched by authentication.
 */
const user = reactive({
	name: "Alex Smith",
	role: "patient", // Options: "patient", "parent", "therapist"
});

/**
 * Dummy profile data for a patient/parent.
 * In production, fetch and sync this data from database.
 */
const profile = reactive({
	name: "Alex Smith",
	email: "alex.smith@example.com",
	phone: "555-6789",
	address: "456 Elm Street",
	medicalRecords: "Patient has a history of seasonal allergies.",
	duesPaid: true,
	notificationsOptIn: true,
});

/**
 * Dummy arrays to hold progress reports (for patients/parents)
 * and session notes (for therapists).
 */
const progressReports = ref([
	{ title: "Q1 Report", date: "2025-03-10" },
	{ title: "Post-Therapy Update", date: "2025-04-05" },
]);
const sessionNotes = ref([
	{
		patient: "Alex Smith",
		note: "Improved response rate to stimuli.",
		date: "2025-04-07",
	},
]);

/**
 * Modal control flags.
 */
const showEditModal = ref(false);
const showProgressReportModal = ref(false);

/**
 * Form object for editing the profile.
 */
const editForm = reactive({
	name: profile.name,
	email: profile.email,
	phone: profile.phone,
	address: profile.address,
	medicalRecords: profile.medicalRecords,
	duesPaid: profile.duesPaid,
	notificationsOptIn: profile.notificationsOptIn,
});

/**
 * Form object for a new progress report (for therapists).
 */
const progressReportForm = reactive({
	title: "",
	details: "",
});

/**
 * Methods to open/close modals.
 */
function openEditModal() {
	// Pre-populate the edit form with current profile data.
	Object.assign(editForm, { ...profile });
	showEditModal.value = true;
}

function closeEditModal() {
	showEditModal.value = false;
}

function closeProgressReportModal() {
	showProgressReportModal.value = false;
	// Reset progress report form.
	Object.assign(progressReportForm, { title: "", details: "" });
}

/**
 * Update the profile data from the edit form.
 */
function updateProfile() {
	Object.assign(profile, { ...editForm });
	console.log("Profile updated:", profile);
	closeEditModal();
}

/**
 * Submit a new progress report (for therapists).
 */
function submitProgressReport() {
	if (!progressReportForm.title) {
		alert("Please provide a report title.");
		return;
	}
	// For demonstration, add the report with today's date.
	progressReports.value.push({
		title: progressReportForm.title,
		date: new Date().toISOString().split("T")[0],
	});
	console.log("Progress report submitted:", progressReportForm);
	closeProgressReportModal();
}
</script>

<style scoped></style>
