<template>
	<!-- 3/10/25 coder-Lewis, 
    Could not get the server to run, but coded anyway. Everything should...work. and look decent..
    either way, all the questions are being asked and getting filed into strings & such for the database. 
    CSS could be worked on as all the fonts & colors are place holders for now & need to be synced with our
    color palette & fonts once we decide on them. 
    -->
	<div class="flex h-full w-full flex-col">
		<NavBar></NavBar>

		<div class="cormorant-garamond mt-5 flex flex-col justify-center px-5">
			<h1 class="text-xl">Patient Contact Form</h1>
			<div class="flex justify-start">
				<form
					@submit.prevent="handleSubmit"
					class="flex flex-col flex-wrap justify-center bg-white"
				>
					<div class="justify-space-evenly flex flex-wrap">
						<div
							class="mr-5 flex w-2/5 max-w-100 min-w-30 flex-col"
						>
							<label class="contactLabel">First name:</label>
							<!--takes a string, type/enter box-->
							<input
								type="text"
								class="bg-color2 w-full"
								required
								v-model="firstName"
							/>
						</div>

						<div class="mr-5 flex w-1/5 max-w-50 min-w-20 flex-col">
							<label class="contactLabel">Middle name:</label>
							<!--takes a string, type/enter box-->
							<input
								type="middleName"
								class="bg-color2"
								v-model="middleName"
							/>
						</div>

						<div
							class="mr-5 flex w-2/5 max-w-100 min-w-30 flex-col"
						>
							<label class="contactLabel">Last name:</label>
							<!--takes a string, type/enter box-->
							<input
								type="lastName"
								class="bg-color2"
								required
								v-model="lastName"
							/>
						</div>

						<div class="mr-5 flex flex-col">
							<label class="contactLabel">Gender:</label>
							<!--select box-->
							<select class="bg-color2" v-model="gender">
								<option class="bg-white" value="female">
									Female
								</option>
								<option class="bg-white" value="male">
									Male
								</option>
								<option class="bg-white" value="nonBinary">
									Non-Binary
								</option>
							</select>
						</div>

						<div class="mr-5 flex flex-col">
							<label class="contactLabel"
								>Date of Birth (xx/xx/xxxx):</label
							>
							<input
								class="bg-color2"
								type="DOB"
								required
								v-model="DOB"
							/>
						</div>

						<div class="mr-5 flex flex-col">
							<label class="contactLabel">ParentName:</label>
							<input
								class="bg-color2"
								type="parent"
								required
								v-model="parent"
							/>
						</div>

						<div class="mr-5 flex flex-col">
							<label class="contactLabel">ID card:</label>
							<input
								class="bg-color2"
								type="ID"
								required
								v-model="ID"
							/>
						</div>

						<div class="mr-5 flex flex-col">
							<label class="contactLabel">Record Number:</label>
							<input
								class="bg-color2"
								type="record"
								required
								v-model="record"
							/>
						</div>

						<div class="mr-5 flex flex-col">
							<label class="contactLabel">Country/City:</label>
							<input
								class="bg-color2"
								type="city"
								required
								v-model="city"
							/>
						</div>
						<div class="mr-5 flex flex-col">
							<label class="contactLabel"
								>Medical Insurance:</label
							>
							<input
								class="bg-color2"
								type="insurance"
								required
								v-model="insurance"
							/>
						</div>

						<div class="mr-5 flex flex-col">
							<label class="contactLabel">Address:</label>
							<input
								class="bg-color2"
								type="address"
								required
								v-model="address"
							/>
						</div>

						<div class="mr-5 flex flex-col">
							<label class="contactLabel">Email:</label>
							<input
								class="bg-color2"
								type="email"
								required
								v-model="email"
							/>
						</div>

						<div class="mr-5 flex flex-col">
							<label class="contactLabel"
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

					<div class="flex flex-col">
						<div class="prevPaitent">
							<!-- Check box-->
							<input type="checkbox" v-model="prevPaitent" />
							<label class="contactLabel">
								Have you been a paitent previously with us?
							</label>
						</div>

						<div class="diagnosis">
							<!-- Check box-->
							<input type="checkbox" v-model="diagnosis" />
							<label class="contactLabel"
								>Have you been formally daignosed?</label
							>
						</div>

						<div class="evalution">
							<!-- Check box-->
							<input type="checkbox" v-model="evalution" />
							<label class="contactLabel"
								>Do you want to perform a Diagnostic Evaluation
								on the patient?</label
							>
						</div>

						<div class="submit">
							<button class="contactSubmit">Submit form</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			//empty strings that will take the entered data. keep empty.
			firstName: "",
			middleName: "",
			lastName: "",
			age: "",
			gender: "",
			DOB: "",
			parent: "",
			ID: "",
			record: "",
			city: "",
			insurance: "",
			address: "",
			email: "",
			phone: "",
			prevPaitent: false,
			diagnosis: false,
			evalution: false,
		};
	},
	methods: {
		handleSubmit() {
			console.log("form submitted"); //might need to adjust this with database
		},
	},
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&display=swap");
</style>

<style></style>
