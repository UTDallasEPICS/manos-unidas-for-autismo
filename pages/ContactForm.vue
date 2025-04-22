<template>
	<!-- 4/9/25 Sreeja, 

	Items in order:
	1: nav bar
	2: the contact form page

	In contact form, there is
	1. a title
	2. several div containers for inputs


	organization of div containers:
	1. Name div containers
	2. Identifying info div containers (Gender, DOB, Nationality)
	3. ID number div containers (ID, SSN)
	4. Address div containers (Dominican Republic format)
	5. Parent name div containers
	6. Contact info div containers
	7. div containers for selecting insurance and preferred services
	8. upload info button 
	9. Yes/No question div containers
	10. Additional comments div container
	11. Submit button
    
    -->

	<!--div container for the whole app-->
	<div class="fullPage">
		<!--Navigation bar-->

		<!--div container for the contact form-->
		<div class="contactFormPage">
			<div class="contactFormArea">
				<!--Title of contact form-->
				<h1 class="mt-5 text-2xl sm:mr-3">Patient Contact Form</h1>

				<!--div container for the form-->
				<div class="contactFormContent">
					<!--Form for contact form-->
					<form @submit.prevent="handleSubmit" class="contactForm">
						<!-- div class for the short answer type of responses-->
						<div class="freeResponseArea py-5">
							<!--div class for the name portion (the name components should occupy the same line)-->
							<div class="inputBoxRow">
								<div class="textLabelAndBox_Size1">
									<label class="">Patient First name:</label>

									<input
										type="text"
										class="contactInput"
										required
										v-model="data.firstName"
									/>
								</div>

								<div class="textLabelAndBox_Size2">
									<label class="">Patient Middle name:</label>
									<!--takes a string, type/enter box-->
									<input
										type="middleName"
										class="contactInput"
										v-model="data.middleName"
									/>
								</div>

								<div class="textLabelAndBox_Size1">
									<label class="">Patient Last name:</label>
									<!--takes a string, type/enter box-->
									<input
										type="lastName"
										class="contactInput"
										required
										v-model="data.lastName"
									/>
								</div>
							</div>

							<div class="inputBoxRow">
								<div class="textLabelAndBox_Size2 relative">
									<label class="">Gender:</label>

									<Listbox
										v-model="gender"
										as="div"
										class="contactFormListbox"
									>
										<div>
											<ListboxButton
												class="contactFormListboxButton"
												>{{
													gender == ""
														? "Select Gender:"
														: gender
												}}</ListboxButton
											>
											<ListboxOptions
												as="div"
												class="contactFormListboxOptions absolute"
											>
												<ListboxOption
													as="div"
													class="contactFormListboxOption"
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

								<div class="textLabelAndBox_Size2">
									<label class="">Date of Birth:</label>
									<input
										class="contactInput"
										type="date"
										required
										v-model="data.DOB"
									/>
								</div>

								<div class="textLabelAndBox_Size1">
									<label class="">Nationality:</label>
									<input
										class="contactInput"
										type="nationality"
										required
										v-model="data.nationality"
									/>
								</div>
							</div>

							<div class="inputBoxRow">
								<div class="textLabelAndBox_Size1">
									<label class="">ID Number:</label>
									<input
										class="contactInput"
										type="ID"
										required
										v-model="data.ID"
									/>
								</div>
								<div class="textLabelAndBox_Size1">
									<label class=""
										>Social Security Number:</label
									>
									<input
										class="contactInput"
										type="SSN"
										required
										v-model="data.SSN"
									/>
								</div>
							</div>

							<div class="addressInputBoxRow">
								<div class="textLabelAndBox_Size3">
									<label class="">Address Line 1:</label>
									<input
										class="contactInput"
										type="address1"
										required
										v-model="data.address1"
									/>
								</div>

								<div class="textLabelAndBox_Size3">
									<label class="">Address Line 2:</label>
									<input
										class="contactInput"
										type="address2"
										v-model="data.address2"
									/>
								</div>

								<!-- couldn't transfer this to css from 
								 tailwind (there is something wrong with responsive design)-->
								<div class="flex flex-col md:flex-row md:gap-5">
									<div class="textLabelAndBox_Size4">
										<label class="">Postal Code:</label>
										<input
											class="contactInput"
											type="postalCode"
											required
											v-model="data.postalCode"
										/>
									</div>
									<div class="textLabelAndBox_Size2">
										<label class="">Locality:</label>
										<input
											class="contactInput"
											type="locality"
											required
											v-model="data.locality"
										/>
									</div>
									<div class="textLabelAndBox_Size2">
										<label class="">Country:</label>
										<input
											class="contactInput"
											type="country"
											required
											v-model="data.country"
										/>
									</div>
								</div>
							</div>

							<div class="inputBoxRow">
								<div class="textLabelAndBox_Size1">
									<label class="">Parent First Name:</label>
									<input
										class="contactInput"
										type="parentFirstName"
										v-model="data.parentFirstName"
									/>
								</div>
								<div class="textLabelAndBox_Size1">
									<label class="">Parent Last Name:</label>
									<input
										class="contactInput"
										type="parentLastName"
										v-model="data.parentLastName"
									/>
								</div>
							</div>

							<div class="inputBoxRow">
								<div class="textLabelAndBox_Size3">
									<label class="">Email:</label>
									<input
										class="contactInput"
										type="email"
										required
										v-model="data.email"
									/>
								</div>

								<div class="textLabelAndBox_Size3">
									<label class=""
										>Phone Number/Whatsapp:</label
									>
									<input
										class="contactInput"
										type="phone"
										required
										v-model="data.phone"
									/>
								</div>
							</div>

							<div class="inputBoxRow">
								<div class="textLabelAndBox_Size3 relative">
									<label class="">Medical Insurance:</label>

									<Listbox
										v-model="insurance"
										as="div"
										class="contactFormListbox"
									>
										<div>
											<ListboxButton
												class="contactFormListboxButton"
												>{{
													insurance == ""
														? "Select the insurance:"
														: insurance
												}}</ListboxButton
											>
											<ListboxOptions
												as="div"
												class="contactFormListboxOptions absolute"
											>
												<ListboxOption
													as="div"
													class="contactFormListboxOption"
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

								<div class="textLabelAndBox_Size3 relative">
									<label class=""
										>Preferred Services/Therapies:</label
									>
									<Listbox
										v-model="therapies"
										multiple
										as="div"
										class="contactFormListbox content-start"
									>
										<div>
											<ListboxButton
												class="contactFormListboxButton"
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
												class="contactFormListboxOptions absolute"
											>
												<ul>
													<ListboxOption
														as="div"
														class="contactFormListboxOption"
														v-for="therapy in therapyOptions"
														:key="therapy.name"
														:value="therapy.name"
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
							<div class="medicalRecords flex flex-col">
								<p>Please sumbit any medical records.</p>
								<label class="">
									<input
										v-on:change="handleFileUpload"
										class="fileSubmit h-full w-full cursor-pointer p-2"
										ref="fileInputRef"
										type="file"
										name="file"
										accept=".jpg, .jpeg, .png, .pdf"
										multiple
									/>
								</label>
								<div v-if="data.medicalRecordFiles.length > 1">
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
											class="fileSubmit w-3/5 cursor-pointer"
											type="button"
											@click="handleDeleteFile(rec)"
											v-if="
												data.medicalRecordFiles.length >
													1 && rec != ''
											"
										>
											Remove file
										</button>
									</div>
								</div>
							</div>

							<div class="prevPaitent flex flex-col">
								<label
									>Have you been a paitent previously with us?
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

							<div class="diagnosis">
								<label class=""
									>Have you been formally daignosed?</label
								>
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

							<div class="evaluation">
								<label class=""
									>Do you want to perform a Diagnostic
									Evaluation on the patient?</label
								>
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

							<div class="textLabelAndBox_Size3">
								<label class=""
									>Any Comments for the therapist?</label
								>
								<textarea
									class="bg-color2 px-2"
									type="comments"
									v-model="data.comments"
								>
								</textarea>
							</div>

							<div class="submit">
								<button class="manosSubmit mt-5">
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

const data = reactive({
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
	SSN: "",
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
	medicalRecordFiles: [""],
});

const fileInputRef = ref<HTMLInputElement | null>(null);

function handleFileUpload() {
	if (!fileInputRef.value) return;
	let files = fileInputRef.value.files;
	if (!files) return;
	let formData = new FormData();

	for (let i = 0; i < files.length; i++) {
		formData.append("files[" + i + "]", files[i]);
		data.medicalRecordFiles.push(files[i].name);
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

		if (response == null || !response) {
			throw new Error("Could not submit form");
		}

		clearForm();
	} catch {
		throw new Error("Could not submit form");
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
	data.SSN = "";
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
