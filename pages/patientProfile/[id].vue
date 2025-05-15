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
			<p class="mb-2">
				<strong>Date of Birth:</strong>
				{{ new Date(profile?.NonEmployee?.dob).toDateString() }}
			</p>
			<p class="mb-2">
				<strong>Gender:</strong> {{ profile?.NonEmployee?.gender }}
			</p>
			<p class="mb-2"><strong>Email:</strong> {{ profile.email }}</p>
			<p class="mb-2"><strong>Phone:</strong> {{ profile.phone }}</p>
			<p class="mb-2">
				<strong>What's App:</strong> {{ profile.whatsApp }}
			</p>
			<p class="mb-2">
				<strong>Contact Preference:</strong> {{ profile.contactPref }}
			</p>
			<div class="mt-8 mb-2">
				<strong>Address:</strong>
				<div class="pl-12">
					<div v-if="profile?.NonEmployee?.buildingNum">
						{{ profile?.NonEmployee?.streetNum }}
						{{ profile?.NonEmployee?.streetName }},
						{{ profile?.NonEmployee?.buildingNum }}
					</div>
					<div v-else>
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
			<p class="mt-8 mb-2">
				<strong>Diagnosed?</strong>
				{{ profile?.NonEmployee?.Patient?.diagnosed }}
			</p>
			<p class="mb-2">
				<strong>All Sessions Paid?</strong>
				{{ paid }}
			</p>

			<!-- Progress Reports (View Only) -->
			<div class="mt-8">
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
				class="relative z-10 w-full max-w-7/12 rounded bg-white p-6 shadow-md"
				@click.stop
			>
				<h2 class="mb-4 text-xl font-bold">Edit Profile</h2>
				<form @submit.prevent="updateProfile">
					<!-- Name -->
					<div
						class="mb-4 flex w-full flex-col justify-between gap-4 lg:flex-row 2xl:gap-8"
					>
						<div class="w-full">
							<label class="mb-1 block font-medium" for="fname">
								First Name <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="fname"
								v-model="profileEdits.fName"
								required
								class="w-full rounded border border-gray-300 px-3 py-2"
								placeholder="Enter your first name"
							/>
						</div>
						<div class="w-full lg:w-lg 2xl:w-xl">
							<label class="mb-1 block font-medium" for="minit">
								Middle Initial
							</label>
							<input
								type="text"
								id="minit"
								v-model="profileEdits.mInit"
								class="w-full rounded border border-gray-300 px-3 py-2"
								placeholder="Enter your initial"
							/>
						</div>
						<div class="w-full">
							<label class="mb-1 block font-medium" for="lname">
								Last Name <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="lname"
								v-model="profileEdits.lName"
								required
								class="w-full rounded border border-gray-300 px-3 py-2"
								placeholder="Enter your last name"
							/>
						</div>
					</div>

					<!-- DOB -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="dob">
							DOB <span class="text-red-500">*</span>
						</label>
						<input
							type="date"
							id="dob"
							v-model="dob"
							required
							class="w-full rounded border border-gray-300 px-3 py-2"
							placeholder="Enter your email"
						/>
					</div>

					<!-- Gender -->
					<div class="mb-4">
						<label class="mb-1 block font-medium">
							Gender <span class="text-red-500">*</span>
						</label>
						<select
							class="w-full rounded-sm border border-gray-300 p-2"
							v-model="genderEdit"
						>
							<option
								v-for="(type, index) in gender"
								:key="index"
							>
								{{ type }}
							</option>
						</select>
					</div>

					<!-- Email -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="email">
							Email <span class="text-red-500">*</span>
						</label>
						<input
							type="email"
							id="email"
							v-model="profileEdits.email"
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
							v-model="profileEdits.phone"
							required
							class="w-full rounded border border-gray-300 px-3 py-2"
							placeholder="Enter your phone number"
						/>
					</div>

					<!-- What's App -->
					<div class="mb-4">
						<label class="mb-1 block font-medium" for="whatsapp">
							What's App <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="whatsapp"
							v-model="profileEdits.whatsApp"
							required
							class="w-full rounded border border-gray-300 px-3 py-2"
							placeholder="Enter your what's app number"
						/>
					</div>

					<!-- Contact Preference -->
					<div class="mb-4">
						<label class="mb-1 block font-medium">
							Contact Preference
							<span class="text-red-500">*</span>
						</label>
						<select
							class="w-full rounded-sm border border-gray-300 p-2"
							v-model="profileEdits.contactPref"
						>
							<option
								v-for="(type, index) in contactType"
								:key="index"
							>
								{{ type }}
							</option>
						</select>
					</div>

					<!-- Address -->
					<div
						class="mb-4 flex w-full flex-col justify-between gap-4 lg:flex-row 2xl:gap-8"
					>
						<div class="w-full">
							<label class="mb-1 block font-medium" for="address">
								Address
							</label>
							<input
								type="text"
								id="address"
								v-model="addressEdit"
								class="w-full rounded border border-gray-300 px-3 py-2"
								placeholder="Enter your address"
							/>
						</div>
						<div class="w-md">
							<label class="mb-1 block font-medium" for="address">
								Building Number
							</label>
							<input
								type="number"
								id="address"
								v-model="buildNumEdit"
								class="w-full rounded border border-gray-300 px-3 py-2"
								placeholder="Enter your address"
							/>
						</div>
					</div>

					<!-- City & Postcode -->
					<div
						class="mb-4 flex w-full flex-col justify-between gap-4 lg:flex-row 2xl:gap-8"
					>
						<div class="w-full">
							<label class="mb-1 block font-medium" for="city">
								City <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="city"
								v-model="cityEdit"
								required
								class="w-full rounded border border-gray-300 px-3 py-2"
								placeholder="Enter your city"
							/>
						</div>
						<div class="w-full">
							<label
								class="mb-1 block font-medium"
								for="postcode"
							>
								Post Code <span class="text-red-500">*</span>
							</label>
							<input
								type="number"
								id="postcode"
								v-model="postCodeEdit"
								required
								class="w-full rounded border border-gray-300 px-3 py-2"
								placeholder="Enter your post code"
							/>
						</div>
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
				class="relative z-10 max-h-9/12 w-full max-w-3/12 overflow-auto rounded bg-white p-6 shadow-md"
				@click.stop
			>
				<h2 class="mb-4 text-xl font-bold">Write Progress Report</h2>
				<form @submit.prevent="submitProgressReport">
					<div
						v-for="(question, index) in progressReportQuestions"
						:key="index"
					>
						<div
							class="mb-4 flex w-full flex-col justify-between gap-4"
						>
							<div class="flex w-full flex-row">
								<label class="text-nowrap">
									Question {{ index + 1 }}
								</label>
								<div class="w-full"></div>
								<button
									class="cursor-pointer"
									type="button"
									@click="removeQuestion(index)"
								>
									<X />
								</button>
							</div>
							<input
								v-model="question.question"
								placeholder="Question"
								class="input w-full"
								required
							/>
							<textarea
								v-model="question.answer"
								placeholder="Answer"
								class="input w-full"
								required
							/>
						</div>
					</div>
					<button
						class="bg-smoky mb-4 flex w-full cursor-pointer justify-center"
						type="button"
						@click="addQuestion"
					>
						<Plus />
					</button>
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
import { computed, ref, useCookie, useFetch, useRoute } from "#imports";
import { AccessPermission } from "~/permissions";
import { Plus, X } from "lucide-vue-next";
import { $fetch } from "ofetch";

const contactType = ["EMAIL", "PHONE", "WHATS_APP"];

const gender = ["MALE", "FEMALE", "OTHER"];

const access = useCookie("AccessPermission");

const route = useRoute();
const uId = route.params.id;

const profile = ref({});
const profileEdits = ref({});
const dob = ref();
const genderEdit = ref();
const addressEdit = ref();
const buildNumEdit = ref();
const cityEdit = ref();
const postCodeEdit = ref();

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

// Form object for a new progress report (for therapists).
const progressReportQuestions = ref([{ question: "", answer: "" }]);

function addQuestion() {
	progressReportQuestions.value.push({ question: "", answer: "" });
}

function removeQuestion(i) {
	progressReportQuestions.value.splice(i, 1);
}

// Methods to open/close modals.
function openEditModal() {
	// Pre-populate the edit form with current profile data.
	Object.assign(profileEdits.value, profile.value);
	if (profileEdits.value?.NonEmployee?.dob) {
		dob.value = profileEdits.value.NonEmployee.dob.split("T")[0];
	}
	if (profileEdits.value?.NonEmployee?.gender) {
		genderEdit.value = profileEdits.value.NonEmployee.gender;
	}
	if (profileEdits.value?.NonEmployee) {
		addressEdit.value = "".concat(
			profileEdits.value.NonEmployee.streetNum,
			" ",
			profileEdits.value.NonEmployee.streetName
		);
	}
	if (profileEdits.value.NonEmployee.PostCodeCity.city) {
		cityEdit.value = profileEdits.value.NonEmployee.PostCodeCity.city;
	}
	if (profileEdits.value.NonEmployee.postCode) {
		postCodeEdit.value = profileEdits.value.NonEmployee.postCode;
	}
	showEditModal.value = true;
}

function closeEditModal() {
	showEditModal.value = false;
}

function closeProgressReportModal() {
	showProgressReportModal.value = false;
	// Reset progress report form.
	progressReportQuestions.value = [{ question: "", answer: "" }];
}

// Update the profile data from the edit form.
async function updateProfile() {
	await $fetch("/api/profile/patient", {
		method: "Put",
		body: {
			id: uId,
			fName: profileEdits.value.fName,
			mInit: profileEdits.value.mInit || "",
			lName: profileEdits.value.lName,
			gender: profileEdits.value.NonEmployee.gender,
			dob: new Date(dob.value).toISOString(),
			streetName: addressEdit.value.substring(
				addressEdit.value.indexOf(" ") + 1
			),
			streetNum: Number(
				addressEdit.value.substring(0, addressEdit.value.indexOf(" "))
			),
			buildingNum: buildNumEdit.value,
			postcode: postCodeEdit.value,
			identification:
				profileEdits.value.NonEmployee.Patient.identification,
			city: cityEdit.value,
			contactPref: profileEdits.value.contactPref,
			email: profileEdits.value.email,
			phone: profileEdits.value.phone,
			whatsapp: profileEdits.value.whatsApp,
			isDiagnosed: profileEdits.value.NonEmployee.Patient.diagnosed,
		},
	});
	getProfile();
	closeEditModal();
}

// Submit a new progress report (for therapists).
async function submitProgressReport() {
	const date = new Date().toISOString();
	await $fetch("/api/profile/report", {
		method: "Post",
		body: {
			date: date,
			pId: uId,
			questions: progressReportQuestions.value,
		},
	});

	getProfile();
	closeProgressReportModal();
}
</script>
