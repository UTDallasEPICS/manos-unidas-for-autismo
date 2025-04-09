<template>
	<!-- 3/10/25 coder-Lewis, 
    Could not get the server to run, but coded anyway. Everything should...work. and look decent..
    either way, all the questions are being asked and getting filed into strings & such for the database. 
    CSS could be worked on as all the fonts & colors are place holders for now & need to be synced with our
    color palette & fonts once we decide on them. 
    -->

	<!--3/29
	updating design to reflect responsive design and the elements on the figma
	-->

	<!--div container for the whole app-->
	<div class="flex h-full w-full flex-col">
		<!--Navigation bar-->
		<NavBar></NavBar>

		<!--div container for the contact form-->
		<div class="flex h-auto place-content-center">
			<div
				class="cormorant-garamond flex w-4/5 flex-col flex-wrap text-lg md:w-200"
			>
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
								class="flex h-auto w-full flex-col gap-7 sm:flex-col md:flex-row"
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
								class="flex h-auto w-full flex-col gap-7 sm:flex-col md:flex-row"
							>
								<div
									class="flex w-40 flex-col sm:w-60 md:w-1/4"
								>
									<label class="">Gender:</label>
									<!--select box-->
									<select class="bg-color2" v-model="gender">
										<option class="bg-white" value="female">
											Female
										</option>
										<option class="bg-white" value="male">
											Male
										</option>
										<option
											class="bg-white"
											value="nonBinary"
										>
											Non-Binary
										</option>
									</select>
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
								class="flex h-auto w-full flex-col gap-7 sm:flex-col md:flex-row"
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

							<div
								class="flex h-auto w-full flex-col gap-1 sm:flex-col"
							>
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
								class="flex h-auto w-full flex-col gap-7 sm:flex-col md:flex-row"
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
								class="flex h-auto w-full flex-col gap-7 sm:flex-col md:flex-row"
							>
								<div class="flex flex-col">
									<label class="">Email:</label>
									<input
										class="bg-color2"
										type="email"
										required
										v-model="email"
									/>
								</div>

								<div class="flex flex-col">
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
								class="flex h-auto w-full flex-col gap-7 sm:flex-col md:flex-row"
							>
								<div class="flex min-w-33 flex-col">
									<label class="">Medical Insurance:</label>
									<label class="flex flex-col font-bold">
										<multiselect
											class="bg-color2 w-full overflow-y-scroll px-2"
											v-model="insurance"
											:options="insuranceOptions"
											:searchable="false"
											:close-on-select="true"
											:show-labels="false"
											placeholder="Pick a value"
											aria-label="pick a value"
										></multiselect>
									</label>
								</div>

								<div class="flex flex-col">
									<label class=""
										>Preferred Services/Therapies:</label
									>

									<label class="flex flex-col font-bold">
										<!-- FORMATTING HELP HERE-->
										<multiselect
											class="bg-color2 overflow-y-scroll px-2"
											v-model="therapy"
											:options="therapyOptions"
											:multiple="true"
											:close-on-select="false"
											:clear-on-select="false"
											:preserve-search="true"
											placeholder="Our Services"
											label="name"
											track-by="name"
										>
											<template
												#selection="{ values, isOpen }"
											>
												<span
													class="multiselect__single text-md flex flex-col"
													v-if="values.length"
													v-show="!isOpen"
													>{{ values.length }} options
													selected
												</span>
											</template>
										</multiselect>
									</label>
									<pre
										class="language-json bg-color2 cormorant-garamond flex w-full flex-col overflow-y-auto px-2"
									><code class="cormorant-garamond">{{ therapy.map(v => v.name).join('\n') }}</code></pre>
								</div>
							</div>
						</div>

						<div class="flex flex-col gap-5">
							<div class="medicalRecords flex flex-col">
								<!--only takes 1 doc... don't even know if it transfers to database ;;-->
								<p>Please sumbit any medical records.</p>
								<label class="">
									<button class="manosSubmit">
										<input
											@change="updateVal"
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
								<input
									class="bg-color2"
									type="comments"
									required
									v-model="comments"
								/>
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

<script>
import Multiselect from "vue-multiselect";
export default {
	components: {
		Multiselect,
	},
	data() {
		return {
			//empty strings that will take the entered data. keep empty.
			firstName: "",
			middleName: "",
			lastName: "",
			age: "",
			gender: "",
			DOB: "",
			nationality: "",
			parentFirstName: "",
			parentLastName: "",
			ID: "",
			SSN: "",
			record: "",
			insurance: "",
			insuranceOptions: [
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
			],
			address1: "",
			address2: "",
			postalCode: "",
			locality: "",
			country: "",
			email: "",
			comments: "",
			phone: "",
			therapy: [], //types of therapies
			therapyOptions: [
				{ name: "Social Skills Workshop" },
				{ name: "Assessment & Diagnosis" },
				{ name: "Occupational Therapy" },
				{ name: "Language Therapy" },
				{ name: "Behavioral Therapy" },
				{ name: "Learning Therapy" },
				{ name: "Parental Support Group" },
				{ name: "Preparation for Adult Life" },
			],
			prevPatient: "",
			diagnosis: "",
			evaluation: "",
		};
	},
	methods: {
		registerMedRec() {
			//medical rec file checking, should??? work???
			if (this.fileInp) {
				this.inpValSubmitted = this.fileInp;
			}
		},
		updateVal(e) {
			this.fileInp = e.target.value;
		},
		handleSubmit() {
			console.log("form submitted"); //might need to adjust this with database
		},
	},
};
</script>
