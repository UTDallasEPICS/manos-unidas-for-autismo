<template>
	<!--div container for the whole app-->
	<div class="font-cormorant-garamond">
		<!--div container for the contact form-->
		<div class="flex h-auto place-content-center">
			<div class="flex-col flex-wrap font-light md:w-180">
				<!--Title of contact form-->
				<h1 class="mt-5 ml-5 text-4xl sm:mr-5 sm:ml-0">
					Patient Contact Form
				</h1>

				<!--div container for the form-->
				<div class="justify-start p-5 text-lg">
					<!--Form for contact form-->
					<form
						@submit.prevent="handleSubmit"
						class="flex w-full flex-col flex-wrap bg-white"
					>
						<!-- div class for the short answer type of responses-->
						<div class="flex w-full flex-wrap gap-5 py-5">
							<!--div class for the name portion (the name components should occupy the same line)-->
							<div
								class="flex h-auto w-9/10 flex-col gap-3 sm:flex-row md:w-full md:gap-7"
							>
								<div class="flex flex-col">
									<label class=""
										>Patient First name:<span
											class="text-red-500"
											>*</span
										></label
									>

									<input
										type="text"
										class="input w-70 sm:w-full"
										required
										v-model="data.firstName"
									/>
								</div>

								<div class="flex flex-col">
									<label class="">Patient Middle name:</label>
									<!--takes a string, type/enter box-->
									<input
										type="middleName"
										class="input w-70 sm:w-full"
										v-model="data.middleName"
									/>
								</div>

								<div class="flex flex-col">
									<label class=""
										>Patient Last name:<span
											class="text-red-500"
											>*</span
										></label
									>
									<!--takes a string, type/enter box-->
									<input
										type="lastName"
										class="input w-70 sm:w-full"
										required
										v-model="data.lastName"
									/>
								</div>
							</div>

							<div
								class="flex h-auto w-full flex-col gap-7 sm:flex-row"
							>
								<div class="relative flex flex-col sm:w-1/5">
									<label class=""
										>Gender:<span class="text-red-500"
											>*</span
										></label
									>

									<Listbox
										v-model="gender"
										as="div"
										class="fill-smoky bg-smoky flex w-40 flex-col overflow-auto sm:w-full"
									>
										<div>
											<ListboxButton
												class="flex w-full cursor-pointer items-start px-2"
												>{{
													gender == ""
														? "Select Gender:"
														: gender
												}}</ListboxButton
											>
											<ListboxOptions
												as="div"
												class="bg-blay absolute flex w-full flex-col"
											>
												<ListboxOption
													as="div"
													class="flex w-full cursor-pointer hover:bg-blue-500"
													v-for="(
														g, index
													) in genders"
													:key="index"
													:value="g"
												>
													<div class="px-5">
														{{ g }}
													</div>
												</ListboxOption>
											</ListboxOptions>
										</div>
									</Listbox>
								</div>

								<div class="flex flex-col">
									<label class=""
										>Date of Birth:<span
											class="text-red-500"
											>*</span
										></label
									>
									<input
										class="input w-70 sm:w-full"
										type="date"
										required
										v-model="data.DOB"
									/>
								</div>

								<div class="flex flex-col">
									<label class=""
										>Nationality:<span class="text-red-500"
											>*</span
										></label
									>
									<input
										class="input w-70 sm:w-full"
										type="nationality"
										required
										v-model="data.nationality"
									/>
								</div>
							</div>

							<div
								class="flex h-auto w-full flex-col gap-3 sm:flex-row sm:gap-7"
							>
								<div class="flex flex-col">
									<label class=""
										>ID Number:<span class="text-red-500"
											>*</span
										></label
									>
									<input
										class="input w-70 sm:w-full"
										type="ID"
										required
										v-model="data.ID"
									/>
								</div>
							</div>

							<div
								class="flex h-auto w-4/5 flex-col content-start gap-1 md:w-full"
							>
								<div class="flex flex-col">
									<label class=""
										>Address Line 1:<span
											class="text-red-500"
											>*</span
										></label
									>
									<input
										class="input w-90 sm:w-full"
										type="address1"
										required
										v-model="data.address1"
									/>
								</div>

								<div class="flex flex-col">
									<label class="">Address Line 2:</label>
									<input
										class="input w-90 sm:w-full"
										type="address2"
										v-model="data.address2"
									/>
								</div>

								<div class="flex flex-col sm:flex-row sm:gap-5">
									<div class="flex flex-col">
										<label class=""
											>Postal Code:<span
												class="text-red-500"
												>*</span
											></label
										>
										<input
											class="input w-70 sm:w-full"
											type="postalCode"
											required
											v-model="data.postalCode"
										/>
									</div>
									<div class="flex flex-col">
										<label class=""
											>Locality:<span class="text-red-500"
												>*</span
											></label
										>
										<input
											class="input w-70 sm:w-full"
											type="locality"
											required
											v-model="data.locality"
										/>
									</div>
									<div class="flex flex-col">
										<label class=""
											>Country:<span class="text-red-500"
												>*</span
											></label
										>
										<input
											class="input w-70 sm:w-full"
											type="country"
											required
											v-model="data.country"
										/>
									</div>
								</div>
							</div>

							<div
								class="flex h-auto w-full flex-col gap-3 sm:flex-row sm:gap-7"
							>
								<div class="flex flex-col">
									<label class="">Parent First Name:</label>
									<input
										class="input w-70 sm:w-full"
										type="parentFirstName"
										v-model="data.parentFirstName"
									/>
								</div>
								<div class="flex flex-col">
									<label class="">Parent Last Name:</label>
									<input
										class="input w-70 sm:w-full"
										type="parentLastName"
										v-model="data.parentLastName"
									/>
								</div>
							</div>

							<div
								class="flex h-auto w-full flex-col gap-3 sm:flex-row sm:gap-7"
							>
								<div class="flex flex-col">
									<label class="">Email:</label>
									<input
										class="input w-70 sm:w-full"
										type="email"
										v-model="data.email"
									/>
								</div>

								<div class="flex flex-col">
									<label class=""
										>Phone Number/Whatsapp:<span
											class="text-red-500"
											>*</span
										></label
									>
									<input
										class="input w-70 sm:w-full"
										type="phone"
										required
										v-model="data.phone"
									/>
								</div>
							</div>

							<div
								class="flex h-auto w-9/10 flex-col gap-7 sm:flex-row md:w-full"
							>
								<div
									class="relative flex w-50 flex-col sm:w-1/2"
								>
									<label class=""
										>Medical Insurance:<span
											class="text-red-500"
											>*</span
										></label
									>

									<Listbox
										v-model="insurance"
										as="div"
										class="fill-smoky bg-smoky flex w-full flex-col overflow-auto"
									>
										<div>
											<ListboxButton
												class="flex w-full cursor-pointer items-start px-2"
												>{{
													insurance == ""
														? "Select the insurance:"
														: insurance
												}}</ListboxButton
											>
											<ListboxOptions
												as="div"
												class="bg-blay absolute flex w-full flex-col"
												style="z-index: 20"
											>
												<ListboxOption
													as="div"
													class="flex w-full cursor-pointer hover:bg-blue-500"
													style="z-index: 20"
													v-for="(
														ins, index
													) in insuranceOptions"
													:key="index"
													:value="ins"
												>
													<div class="px-5">
														{{ ins }}
													</div>
												</ListboxOption>
											</ListboxOptions>
										</div>
									</Listbox>
								</div>

								<div
									class="relative flex w-70 flex-col sm:w-1/2"
								>
									<label class=""
										>Preferred Services/Therapies:</label
									>
									<Listbox
										v-model="therapies"
										multiple
										as="div"
										class="fill-smoky bg-smoky flex w-full flex-col content-start overflow-y-scroll"
									>
										<div>
											<ListboxButton
												class="flex w-full cursor-pointer items-start px-2"
												>{{
													therapies.length > 0
														? therapies
																.map(
																	(therapy) =>
																		therapy
																)
																.join(", ")
														: "Select different therapies:"
												}}</ListboxButton
											>
											<ListboxOptions
												as="div"
												class="bg-blay absolute flex w-full flex-col"
												style="z-index: 10"
											>
												<ul>
													<ListboxOption
														as="div"
														class="flex w-full cursor-pointer hover:bg-blue-500"
														v-for="therapy in therapyOptions"
														:key="therapy.name"
														:value="therapy.name"
														style="z-index: 10"
													>
														<div class="px-5">
															{{ therapy.name }}
														</div>
													</ListboxOption>
												</ul>
											</ListboxOptions>
										</div>
									</Listbox>
								</div>
							</div>
						</div>

						<div class="flex flex-col gap-5">
							<div class="flex flex-col">
								<p>Please sumbit any medical records.</p>
								<label class="">
									<input
										v-on:change="handleFileUpload"
										class="btn h-full w-40 cursor-pointer p-2 sm:w-2/5"
										ref="fileInputRef"
										type="file"
										name="file"
										accept=".jpg, .jpeg, .png, .pdf"
										multiple
									/>
								</label>
								<div
									class="bg-smoky w-90 sm:w-3/5"
									v-if="data.medicalRecordFiles.length > 0"
								>
									<div
										class="bg-color2 flex flex-col justify-between p-2 md:flex-row"
										v-for="(
											rec, idx
										) in data.medicalRecordFiles"
										:key="idx"
									>
										<div>
											{{ rec }}
										</div>
										<button
											class="btn w-1/10 cursor-pointer"
											type="button"
											@click="handleDeleteFile(rec)"
											v-if="
												data.medicalRecordFiles.length >
												0
											"
										>
											X
										</button>
									</div>
								</div>
							</div>

							<div class="flex flex-col">
								<label
									>Have you been a paitent previously with us?
									<span class="text-red-500">*</span>
								</label>
								<div class="flex flex-row gap-5 text-xl">
									<label>
										<input
											type="radio"
											name="prevPatient"
											v-model="data.prevPatient"
											value="true"
										/>Yes
									</label>
									<label>
										<input
											type="radio"
											name="prevPatient"
											v-model="data.prevPatient"
											value="false"
										/>No
									</label>
								</div>
							</div>

							<div class="">
								<label class=""
									>Have you been formally daignosed?</label
								>
								<span class="text-red-500">*</span>
								<div class="flex flex-row gap-5 text-xl">
									<label>
										<input
											type="radio"
											name="diagnosis"
											v-model="data.diagnosis"
											value="true"
										/>Yes
									</label>
									<label>
										<input
											type="radio"
											name="diagnosis"
											v-model="data.diagnosis"
											value="false"
										/>No
									</label>
								</div>
							</div>

							<div class="">
								<label class=""
									>Do you want to perform a Diagnostic
									Evaluation on the patient?</label
								>
								<span class="text-red-500">*</span>
								<div class="flex flex-row gap-5 text-xl">
									<label>
										<input
											type="radio"
											name="evaluation"
											v-model="data.evaluation"
											value="true"
										/>Yes
									</label>
									<label>
										<input
											type="radio"
											name="evaluation"
											v-model="data.evaluation"
											value="false"
										/>No
									</label>
								</div>
							</div>

							<div class="flex flex-col">
								<label class=""
									>Any Comments for the therapist?</label
								>
								<textarea
									class="bg-smoky w-90 px-2 sm:w-full"
									type="comments"
									v-model="data.comments"
								>
								</textarea>
							</div>

							<div class="">
								<button class="btn mt-5 flex flex-col">
									Submit form
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { reactive } from "vue";
import {
	Listbox,
	ListboxButton,
	ListboxOptions,
	ListboxOption,
} from "@headlessui/vue";
import { $fetch } from "ofetch";

const genders = ["Male", "Female", "Other"];
const gender = ref("");

const insuranceOptions = [
	"SENASA contributivo",
	"SENASA subsidiado",
	"ARS HUMANO",
	"MAPFRE",
	"LA MONUMENTAL",
	"ARS Universal",
	"ARS Meta Salud",
	"ARS Plan Salud Banco Central",
	"RENACER",
	"Otro",
	"Not Listed",
];
const insurance = ref("");

const therapyOptions = [
	{ name: "Social Skills Workshop" },
	{ name: "Assessment & Diagnosis" },
	{ name: "Occupational Therapy" },
	{ name: "Language Therapy" },
	{ name: "Behavioral Therapy" },
	{ name: "Learning Therapy" },
	{ name: "Parental Support Group" },
	{ name: "Preparation for Adult Life" },
];
const therapies = ref([]); //types of therapies

const data = reactive<{
	firstName: string;
	middleName: string;
	lastName: string;
	age: string;
	DOB: string;
	nationality: string;
	parentFirstName: string;
	parentLastName: string;
	ID: string;
	record: string;
	address1: string;
	address2: string;
	postalCode: string;
	locality: string;
	country: string;
	email: string;
	comments: string;
	phone: string;
	prevPatient: string;
	diagnosis: string;
	evaluation: string;
	medicalRecordFiles: string[]; // Explicitly typed as an array of strings
}>({
	//empty strings that will take the entered data. keep empty.
	firstName: "",
	middleName: "",
	lastName: "",
	age: "",
	DOB: "",
	nationality: "",
	parentFirstName: "",
	parentLastName: "",
	ID: "",
	record: "",
	address1: "",
	address2: "",
	postalCode: "",
	locality: "",
	country: "",
	email: "",
	comments: "",
	phone: "",
	prevPatient: "",
	diagnosis: "",
	evaluation: "",
	medicalRecordFiles: [],
});

const fileInputRef = ref<HTMLInputElement | null>(null);

function handleFileUpload() {
	if (!fileInputRef.value) return;
	let files = fileInputRef.value.files;
	if (!files) return;
	let formData = new FormData();

	for (let i = 0; i < files.length; i++) {
		if (data.medicalRecordFiles.indexOf(files[i].name) < 0) {
			formData.append("files[" + i + "]", files[i]);
			data.medicalRecordFiles.push(files[i].name);
		}
	}
}

function handleDeleteFile(rec: string) {
	data.medicalRecordFiles.splice(data.medicalRecordFiles.indexOf(rec), 1);
}

async function handleSubmit() {
	const formData = {
		fName: data.firstName,
		mInit: data.middleName.substring(0, 1),
		lName: data.lastName,
		gender: gender.value.toUpperCase(),
		dob: new Date(data.DOB),
		nationality: data.nationality,
		streetName: data.address1.substring(data.address1.indexOf(" ") + 1),
		streetNum: Number(
			data.address1.substring(0, data.address1.indexOf(" "))
		),
		postcode: Number(data.postalCode),
		identification: data.ID,
		city: data.locality,
		insurance: insurance.value.toUpperCase().replace(" ", "_"),
		email: data.email,
		phone: data.phone,
		isDiagnosed: data.diagnosis === "true",
		status: "PROCESSING",
		hasBeenPatient: data.prevPatient === "true",
		wantsEval: data.evaluation === "true",
		comment: data.comments,
	};

	try {
		const response = await $fetch("/api/contactForm/form", {
			method: "POST",
			body: formData,
		});

		console.log(response);

		if (response == null || !response) {
			throw new Error("Could not submit form");
		}

		clearForm();
	} catch (e) {
		// TODO make better than bandaid
		console.log(formData.email);
		console.log(e.statusMessage + ":");
		console.log(e.data);
		alert("Form sumbit encounered an error, check console");
	}
}

function clearForm() {
	data.firstName = "";
	data.middleName = "";
	data.lastName = "";
	data.age = "";
	data.DOB = "";
	data.nationality = "";
	data.parentFirstName = "";
	data.parentLastName = "";
	data.ID = "";
	data.record = "";
	data.address1 = "";
	data.address2 = "";
	data.postalCode = "";
	data.locality = "";
	data.country = "";
	data.email = "";
	data.comments = "";
	data.phone = "";
	data.prevPatient = "";
	data.diagnosis = "";
	data.evaluation = "";
	data.medicalRecordFiles = [];
	gender.value = "";
	therapies.value = [];
	insurance.value = "";
}
</script>
