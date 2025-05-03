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
	<div></div>

	<!--div container for the whole app-->
	<div class="font-cormorant-garamond h-full flex-col">
		<!--Navigation bar-->

		<!--div container for the contact form-->
		<div class="contactFormPage flex h-auto place-content-center">
			<div class="contactFormArea flex-col flex-wrap font-light">
				<!--Title of contact form-->
				<h1 class="mt-5 text-4xl sm:mr-3">Patient Contact Form</h1>

				<!--div container for the form-->
				<div class="contactFormContent justify-start p-5 text-lg">
					<!--Form for contact form-->
					<form
						@submit.prevent="handleSubmit"
						class="contactForm flex w-full flex-col flex-wrap justify-center bg-white"
					>
						<!-- div class for the short answer type of responses-->
						<div class="freeResponseArea flex-wrap gap-5 py-5">
							<!--div class for the name portion (the name components should occupy the same line)-->
							<div class="inputBoxRow flex h-auto w-full gap-7">
								<div class="textLabelBox">
									<label class="">Patient First name:</label>

									<input
										type="text"
										class="input"
										required
										v-model="firstName"
									/>
								</div>

								<div class="textLabelBox">
									<label class="">Patient Middle name:</label>
									<!--takes a string, type/enter box-->
									<input
										type="middleName"
										class="input"
										v-model="middleName"
									/>
								</div>

								<div class="textLabelBox">
									<label class="">Patient Last name:</label>
									<!--takes a string, type/enter box-->
									<input
										type="lastName"
										class="input"
										required
										v-model="lastName"
									/>
								</div>
							</div>

							<div class="inputBoxRow flex h-auto w-full gap-7">
								<div class="textLabelBox relative">
									<label class="">Gender:</label>

									<Listbox
										v-model="gender"
										as="div"
										class="listbox"
									>
										<div>
											<ListboxButton
												class="listboxButton"
												>{{
													gender == ""
														? "Select Gender:"
														: gender
												}}</ListboxButton
											>
											<ListboxOptions
												as="div"
												class="listboxOptions absolute"
											>
												<ListboxOption
													as="div"
													class="listboxOption"
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

								<div class="textLabelBox">
									<label class="">Date of Birth:</label>
									<input
										class="input"
										type="date"
										required
										v-model="DOB"
									/>
								</div>

								<div class="textLabelBox">
									<label class="">Nationality:</label>
									<input
										class="input"
										type="nationality"
										required
										v-model="nationality"
									/>
								</div>
							</div>

							<div class="inputBoxRow flex h-auto w-full gap-7">
								<div class="textLabelBox">
									<label class="">ID Number:</label>
									<input
										class="input"
										type="ID"
										required
										v-model="ID"
									/>
								</div>
								<div class="textLabelBox">
									<label class=""
										>Social Security Number:</label
									>
									<input
										class="input"
										type="SSN"
										required
										v-model="SSN"
									/>
								</div>
							</div>

							<div class="addressInputBoxRow h-auto gap-1">
								<div class="textLabelBox">
									<label class="">Address Line 1:</label>
									<input
										class="input"
										type="address1"
										required
										v-model="address1"
									/>
								</div>

								<div class="textLabelBox">
									<label class="">Address Line 2:</label>
									<input
										class="input"
										type="address2"
										required
										v-model="address2"
									/>
								</div>

								<!-- couldn't transfer this to css from 
								 tailwind (there is something wrong with responsive design)-->
								<div class="flex flex-col md:flex-row md:gap-5">
									<div class="textLabelBox">
										<label class="">Postal Code:</label>
										<input
											class="input"
											type="postalCode"
											required
											v-model="postalCode"
										/>
									</div>
									<div class="textLabelBox">
										<label class="">Locality:</label>
										<input
											class="input"
											type="locality"
											required
											v-model="locality"
										/>
									</div>
									<div class="textLabelBox">
										<label class="">Country:</label>
										<input
											class="input"
											type="country"
											required
											v-model="country"
										/>
									</div>
								</div>
							</div>

							<div class="inputBoxRow flex h-auto w-full gap-7">
								<div class="textLabelBox">
									<label class="">Parent First Name:</label>
									<input
										class="input"
										type="parentFirstName"
										required
										v-model="parentFirstName"
									/>
								</div>
								<div class="textLabelBox">
									<label class="">Parent Last Name:</label>
									<input
										class="input"
										type="parentLastName"
										required
										v-model="parentLastName"
									/>
								</div>
							</div>

							<div class="inputBoxRow flex h-auto w-full gap-7">
								<div class="textLabelBox">
									<label class="">Email:</label>
									<input
										class="input"
										type="email"
										required
										v-model="email"
									/>
								</div>

								<div class="textLabelBox">
									<label class=""
										>Phone Number/Whatsapp:</label
									>
									<input
										class="input"
										type="phone"
										required
										v-model="phone"
									/>
								</div>
							</div>

							<div class="inputBoxRow flex h-auto w-full gap-7">
								<div class="textLabelBox relative">
									<label class="">Medical Insurance:</label>

									<Listbox
										v-model="insurance"
										as="div"
										class="listbox"
									>
										<div>
											<ListboxButton
												class="listboxButton"
												>{{
													insurance == ""
														? "Select the insurance:"
														: insurance
												}}</ListboxButton
											>
											<ListboxOptions
												as="div"
												class="listboxOptions absolute"
											>
												<ListboxOption
													as="div"
													class="listboxOption"
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

								<div class="textLabelBox relative">
									<label class=""
										>Preferred Services/Therapies:</label
									>
									<Listbox
										v-model="therapies"
										multiple
										as="div"
										class="listbox content-start"
									>
										<div>
											<ListboxButton
												class="listboxButton"
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
												class="listboxOptions absolute"
											>
												<ul>
													<ListboxOption
														as="div"
														class="listboxOption"
														v-for="therapy in therapyOptions"
														:key="therapy.name"
														:value="therapy"
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
								<!--only takes 1 doc... don't even know if it transfers to database ;;-->
								<p>Please sumbit any medical records.</p>
								<label class="">
									<button class="btn">
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

							<div class="textLabelBox">
								<label class=""
									>Any Comments for the therapist?</label
								>
								<textarea
									class="bg-smoky px-2"
									type="comments"
									required
									v-model="comments"
								>
								</textarea>
							</div>

							<div class="submit">
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
