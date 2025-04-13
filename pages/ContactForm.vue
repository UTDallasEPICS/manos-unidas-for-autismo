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
	<div class="flex h-full w-full flex-col">
		<!--Navigation bar-->

		<!--div container for the contact form-->
		<div class="flex h-auto place-content-center">
			<div class="inputsBox w-4/5 text-lg md:w-200">
				<!--Title of contact form-->
				<h1 class="mt-5 text-2xl sm:mr-3">Patient Contact Form</h1>

				<!--div container for the form-->
				<div class="flex justify-start p-5">
					<!--Form for contact form-->
					<form
						@submit.prevent="handleSubmit"
						class="flex flex-col flex-wrap justify-center bg-white"
					>
						<!-- div class for the short answer type of responses-->
						<div
							class="justify-space-evenly flex flex-wrap gap-5 py-5"
						>
							<!--div class for the name portion (the name components should occupy the same line)-->
							<div
								class="inputBoxRow flex-col gap-7 sm:flex-col md:flex-row"
							>
								<div
									class="flex w-50 flex-col sm:w-75 md:w-3/10"
								>
									<label class="">Patient First name:</label>

									<input
										type="text"
										class="bg-color2 w-full"
										required
										v-model="firstName"
									/>
								</div>

								<div
									class="flex w-40 flex-col sm:w-60 md:w-1/4"
								>
									<label class="">Patient Middle name:</label>
									<!--takes a string, type/enter box-->
									<input
										type="middleName"
										class="bg-color2"
										v-model="middleName"
									/>
								</div>

								<div
									class="flex w-50 flex-col sm:w-75 md:w-3/10"
								>
									<label class="">Patient Last name:</label>
									<!--takes a string, type/enter box-->
									<input
										type="lastName"
										class="bg-color2"
										required
										v-model="lastName"
									/>
								</div>
							</div>

							<div
								class="inputBoxRow flex-col gap-7 sm:flex-col md:flex-row"
							>
								<div
									class="flex w-40 flex-col sm:w-60 md:w-1/4"
								>
									<label class="">Gender:</label>

									<Listbox
										v-model="gender"
										as="div"
										class="bg-color2 flex flex-col overflow-auto"
									>
										<ListboxButton
											class="flex cursor-pointer content-start px-2"
											>{{
												gender == ""
													? "Select Gender:"
													: gender
											}}</ListboxButton
										>
										<ListboxOptions
											as="div"
											class="flex flex-col bg-gray-100 px-2 text-center"
										>
											<ListboxOption
												as="div"
												class="flex align-middle"
												v-for="(g, index) in genders"
												:key="index"
												:value="g"
												v-slot="{ active, selected }"
											>
												<li
													:class="{
														'cursor-pointer bg-blue-500 text-white':
															active,
														'cursor-pointer bg-gray-100 text-black':
															!active,
													}"
												>
													<CheckIcon
														v-show="selected"
													/>
													{{ g }}
												</li>
											</ListboxOption>
										</ListboxOptions>
									</Listbox>
								</div>

								<div
									class="flex w-40 flex-col sm:w-60 md:w-1/4"
								>
									<label class="">Date of Birth:</label>
									<input
										class="bg-color2"
										type="date"
										required
										v-model="DOB"
									/>
								</div>

								<div
									class="flex w-50 flex-col sm:w-75 md:w-3/10"
								>
									<label class="">Nationality:</label>
									<input
										class="bg-color2"
										type="nationality"
										required
										v-model="nationality"
									/>
								</div>
							</div>

							<div
								class="inputBoxRow flex-col gap-7 sm:flex-col md:flex-row"
							>
								<div
									class="flex w-50 flex-col sm:w-75 md:w-3/10"
								>
									<label class="">ID Number:</label>
									<input
										class="bg-color2"
										type="ID"
										required
										v-model="ID"
									/>
								</div>
								<div
									class="flex w-50 flex-col sm:w-75 md:w-3/10"
								>
									<label class=""
										>Social Security Number:</label
									>
									<input
										class="bg-color2"
										type="SSN"
										required
										v-model="SSN"
									/>
								</div>
							</div>

							<div class="inputBoxRow flex-col gap-1 sm:flex-col">
								<div
									class="flex w-55 flex-col sm:w-100 md:w-7/10"
								>
									<label class="">Address Line 1:</label>
									<input
										class="bg-color2"
										type="address1"
										required
										v-model="address1"
									/>
								</div>

								<div
									class="flex w-55 flex-col sm:w-100 md:w-7/10"
								>
									<label class="">Address Line 2:</label>
									<input
										class="bg-color2"
										type="address2"
										required
										v-model="address2"
									/>
								</div>

								<div class="flex flex-col md:flex-row md:gap-5">
									<div
										class="flex w-30 flex-col sm:w-40 md:w-1/5"
									>
										<label class="">Postal Code:</label>
										<input
											class="bg-color2"
											type="postalCode"
											required
											v-model="postalCode"
										/>
									</div>
									<div
										class="flex w-40 flex-col sm:w-60 md:w-1/4"
									>
										<label class="">Locality:</label>
										<input
											class="bg-color2"
											type="locality"
											required
											v-model="locality"
										/>
									</div>
									<div
										class="flex w-40 flex-col sm:w-60 md:w-1/4"
									>
										<label class="">Country:</label>
										<input
											class="bg-color2"
											type="country"
											required
											v-model="country"
										/>
									</div>
								</div>
							</div>

							<div
								class="inputBoxRow flex-col gap-7 sm:flex-col md:flex-row"
							>
								<div
									class="flex w-50 flex-col sm:w-75 md:w-3/10"
								>
									<label class="">Parent First Name:</label>
									<input
										class="bg-color2"
										type="parentFirstName"
										required
										v-model="parentFirstName"
									/>
								</div>
								<div
									class="flex w-50 flex-col sm:w-75 md:w-3/10"
								>
									<label class="">Parent Last Name:</label>
									<input
										class="bg-color2"
										type="parentLastName"
										required
										v-model="parentLastName"
									/>
								</div>
							</div>

							<div
								class="inputBoxRow flex-col gap-7 sm:flex-col md:flex-row"
							>
								<div
									class="flex w-55 flex-col sm:w-100 md:w-7/10"
								>
									<label class="">Email:</label>
									<input
										class="bg-color2"
										type="email"
										required
										v-model="email"
									/>
								</div>

								<div
									class="flex w-55 flex-col sm:w-100 md:w-7/10"
								>
									<label class=""
										>Phone Number/Whatsapp:</label
									>
									<input
										class="bg-color2"
										type="phone"
										required
										v-model="phone"
									/>
								</div>
							</div>

							<div
								class="inputBoxRow flex-col gap-7 sm:flex-col md:flex-row"
							>
								<div
									class="flex w-55 flex-col sm:w-100 md:w-7/10"
								>
									<label class="">Medical Insurance:</label>

									<Listbox
										v-model="insurance"
										as="div"
										class="bg-color2 flex flex-col overflow-auto"
									>
										<ListboxButton
											class="flex cursor-pointer content-start px-2"
											>{{
												insurance == ""
													? "Select the insurance:"
													: insurance
											}}</ListboxButton
										>
										<ListboxOptions
											as="div"
											class="flex flex-col bg-gray-100 px-2 text-center"
										>
											<ListboxOption
												as="div"
												class="flex align-middle"
												v-for="(
													ins, index
												) in insuranceOptions"
												:key="index"
												:value="ins"
												v-slot="{ active, selected }"
											>
												<li
													:class="{
														'cursor-pointer bg-blue-500 text-white':
															active,
														'cursor-pointer bg-gray-100 text-black':
															!active,
													}"
												>
													<CheckIcon
														v-show="selected"
													/>
													{{ ins }}
												</li>
											</ListboxOption>
										</ListboxOptions>
									</Listbox>
								</div>

								<div
									class="flex w-55 flex-col sm:w-100 md:w-7/10"
								>
									<label class=""
										>Preferred Services/Therapies:</label
									>
									<Listbox
										v-model="therapies"
										multiple
										as="div"
										class="bg-color2 flex flex-col content-start overflow-auto"
									>
										<ListboxButton
											class="flex cursor-pointer content-start px-2"
											>{{
												therapies.length > 0
													? therapies
															.map(
																(therapy) =>
																	therapy.name
															)
															.join(", ")
													: "Select different therapies:"
											}}</ListboxButton
										>
										<ListboxOptions
											as="div"
											class="flex flex-col bg-gray-100 px-2 text-center"
										>
											<ul>
												<ListboxOption
													as="div"
													class="flex align-middle"
													v-for="therapy in therapyOptions"
													:key="therapy.name"
													:value="therapy"
													v-slot="{
														active,
														selected,
													}"
												>
													<div
														:class="{
															'cursor-pointer bg-blue-500 text-white':
																active,
															'cursor-pointer bg-gray-100 text-black':
																!active,
														}"
													>
														<CheckIcon
															v-show="selected"
														/>
														{{ therapy.name }}
													</div>
												</ListboxOption>
											</ul>
										</ListboxOptions>
									</Listbox>
								</div>
							</div>
						</div>

						<div class="flex flex-col gap-5">
							<div class="medicalRecords flex flex-col">
								<!--only takes 1 doc... don't even know if it transfers to database ;;-->
								<p>Please sumbit any medical records.</p>
								<label class="">
									<button
										class="manosSubmit flex w-55 flex-col sm:w-100 md:w-35/100"
									>
										<input
											@change="registerMedRec"
											type="file"
										/>
									</button>
								</label>
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
											v-model="prevPatient"
											value="true"
										/>Yes
									</label>
									<label>
										<input
											type="radio"
											name="prevPatient"
											v-model="prevPatient"
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
											v-model="diagnosis"
											value="true"
										/>Yes
									</label>
									<label>
										<input
											type="radio"
											name="diagnosis"
											v-model="diagnosis"
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
											v-model="evaluation"
											value="true"
										/>Yes
									</label>
									<label>
										<input
											type="radio"
											name="evaluation"
											v-model="evaluation"
											value="false"
										/>No
									</label>
								</div>
							</div>

							<div class="flex w-55 flex-col sm:w-100 md:w-7/10">
								<label class=""
									>Any Comments for the therapist?</label
								>
								<textarea
									class="bg-color2"
									type="comments"
									required
									v-model="comments"
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

<script setup>
import { ref } from "vue";
import {
	Listbox,
	ListboxButton,
	ListboxOptions,
	ListboxOption,
} from "@headlessui/vue";

const genders = ["Male", "Female", "Non-Binary"];
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
</script>

<script>
export default {
	components: {
		Listbox,
		ListboxButton,
		ListboxOptions,
		ListboxOption,
	},
	data() {
		return {
			//empty strings that will take the entered data. keep empty.
			hover: "",
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
			medicalRecordFiles: [],
		};
	},
	methods: {
		registerMedRec(e) {
			//medical rec file checking, should??? work???
			if (e.target.value) {
				for (const f in e.target.files) {
					this.medicalRecordFiles.push(f);
				}
			}
		},
		handleSubmit() {
			console.log("form submitted"); //might need to adjust this with database
		},
	},
};
</script>
