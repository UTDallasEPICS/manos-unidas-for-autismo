<template>
	<div class="h-full p-4">
		<!-- Dashboard Header -->
		<div class="mb-4 flex flex-row items-center">
			<h1 class="text-2xl font-bold text-nowrap">User Profile</h1>
			<!-- Edit Profile Button -->
			<div class="w-full"></div>
			<button
				v-if="access[AccessPermission.PATIENT]"
				class="btn text-nowrap hover:cursor-pointer"
				@click="openEditModal"
			>
				Edit Profile
			</button>
			<button
				v-if="access[AccessPermission.THERAPIST]"
				class="btn text-nowrap hover:cursor-pointer"
				@click="showProgressReportModal = true"
			>
				Write Progress Report
			</button>
		</div>

		<!-- Patient / Parent Section -->
		<section class="mb-6 rounded border p-4">
			<h2 class="mb-2 text-xl font-semibold">Profile Details</h2>
			<p class="mb-2">
				<strong>Name:</strong> {{ profile.fName }} {{ profile.mInit }}
				{{ profile.lName }}
			</p>
			<p class="mb-2"><strong>Email:</strong> {{ profile.email }}</p>
			<p class="mb-2"><strong>Phone</strong> {{ profile.phone }}</p>
			<div class="mb-2">
				<strong>Address:</strong>
				<div class="pl-7">
					<div>
						{{ profile?.NonEmployee?.streetNum }}
						{{ profile?.NonEmployee?.streetName }}
						{{ profile?.NonEmployee?.buildingNum }}
					</div>
					<div>
						{{ profile?.NonEmployee?.PostCodeCity?.city }},
						{{ profile?.NonEmployee?.postCode }}
					</div>
				</div>
			</div>
			<p class="mb-2">
				<strong>All Sessions Paid?</strong>
				{{ paid }}
			</p>

			<!-- Progress Reports (View Only) -->
			<div class="mt-6">
				<h2 class="mb-2 text-xl font-semibold">Progress Reports</h2>
				<ul class="list-disc pl-6">
					<li
						v-for="(report, index) in profile?.NonEmployee?.Patient
							?.ProgressReports"
						:key="index"
					>
						<strong
							>{{ new Date(report.date).toDateString() }}:</strong
						>
						<ul class="pl-6">
							<li
								v-for="(question, index) in report?.Questions"
								:key="index"
							>
								{{ index + 1 }}.
								<strong>{{ question.question }}:</strong>
								{{ question.answer }}
							</li>
						</ul>
					</li>
				</ul>
				<p
					v-if="
						!profile?.NonEmployee?.Patient?.ProgressReports.length
					"
				>
					No progress reports available.
				</p>
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
import {
	computed,
	ref,
	useCookie,
	useFetch,
	reactive,
	useRoute,
} from "#imports";
import { AccessPermission } from "~/permissions";

const access = useCookie("AccessPermission");

const route = useRoute();
const uId = route.params.id;

const profile = ref({});

async function getProfile() {
	const { data: test } = await useFetch("/api/profile/patient", {
		query: { id: uId },
	});
	profile.value = test.value;
}

getProfile();

const paid = computed(() => {
	if (profile.value?.NonEmployee?.Patient?.Appointments) {
		let inFull = true;
		for (const session of profile.value.NonEmployee.Patient.Appointments) {
			if (!session.paid) {
				inFull = false;
			}
		}
		return inFull;
	}
	return false;
});

// Modal control flags.
const showEditModal = ref(false);
const showProgressReportModal = ref(false);

// Form object for editing the profile.
const editForm = reactive({});

// Form object for a new progress report (for therapists).
const progressReportForm = reactive({
	title: "",
	details: "",
});

// Methods to open/close modals.
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

// Update the profile data from the edit form.
function updateProfile() {
	Object.assign(profile, { ...editForm });
	console.log("Profile updated:", profile);
	closeEditModal();
}

// Submit a new progress report (for therapists).
function submitProgressReport() {
	if (!progressReportForm.title) {
		alert("Please provide a report title.");
		return;
	}
	// For demonstration, add the report with today's date.
	console.log("Progress report submitted:", progressReportForm);
	closeProgressReportModal();
}
</script>
