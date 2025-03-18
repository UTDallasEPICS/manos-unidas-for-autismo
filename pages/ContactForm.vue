<template>
	<!-- 3/10/25 coder-Lewis, 
    Could not get the server to run, but coded anyway. Everything should...work. and look decent..
    either way, all the questions are being asked and getting filed into strings & such for the database. 
    CSS could be worked on as all the fonts & colors are place holders for now & need to be synced with our
    color palette & fonts once we decide on them. 
    -->
	<div class="flex h-full w-full flex-col">
		<NavBar></NavBar>
		<div class="cormorant-garamond mt-4 flex flex-col justify-center">
			<h1 class="start-10 p-5 text-xl">Patient Contact Form</h1>
			<div class="flex justify-start">
				<form
					@submit.prevent="handleSubmit"
					class="flex flex-col flex-wrap justify-center bg-white px-10"
				>
					<div class="flex flex-wrap justify-between">
						<div class="flex flex-col">
							<label>First name:</label>
							<!--takes a string, type/enter box-->
							<input
								type="text"
								class=""
								required
								v-model="firstName"
							/>
						</div>

						<div class="flex flex-col">
							<label>Middle name:</label>
							<!--takes a string, type/enter box-->
							<input type="middleName" v-model="middleName" />
						</div>

						<div class="flex flex-col">
							<label>Last name:</label>
							<!--takes a string, type/enter box-->
							<input
								type="lastName"
								required
								v-model="lastName"
							/>
						</div>

						<div class="flex flex-col">
							<label>Gender:</label>
							<!--select box-->
							<select v-model="gender">
								<option value="female">Female</option>
								<option value="male">Male</option>
								<option value="nonBinary">Non-Binary</option>
							</select>
						</div>

						<div class="flex flex-col">
							<label>Date of Birth (xx/xx/xxxx):</label>
							<input type="DOB" required v-model="DOB" />
						</div>

						<div class="flex flex-col">
							<label>ParentName:</label>
							<input type="parent" required v-model="parent" />
						</div>

						<div class="flex flex-col">
							<label>ID card:</label>
							<input type="ID" required v-model="ID" />
						</div>

						<div class="flex flex-col">
							<label>Record Number:</label>
							<input type="record" required v-model="record" />
						</div>

						<div class="flex flex-col">
							<label>Country/City:</label>
							<input type="city" required v-model="city" />
						</div>
						<div class="flex flex-col">
							<label>Medical Insurance:</label>
							<input
								type="insurance"
								required
								v-model="insurance"
							/>
						</div>

						<div class="flex flex-col">
							<label>Address:</label>
							<input type="address" required v-model="address" />
						</div>

						<div class="flex flex-col">
							<label>Email:</label>
							<input type="email" required v-model="email" />
						</div>

						<div class="flex flex-col">
							<label>Phone Number/Whatsapp:</label>
							<input type="phone" required v-model="phone" />
						</div>
					</div>

					<div class="flex flex-col">
						<div class="prevPaitent">
							<!-- Check box-->
							<input
								type="checkbox"
								v-model="prevPaitent"
								required
							/>
							<label
								>Have you been a paitent previously with
								us?</label
							>
						</div>

						<div class="diagnosis">
							<!-- Check box-->
							<input
								type="checkbox"
								v-model="diagnosis"
								required
							/>
							<label>Have you been formally daignosed?</label>
						</div>

						<div class="evalution">
							<!-- Check box-->
							<input
								type="checkbox"
								v-model="evalution"
								required
							/>
							<label
								>Do you want to perform a Diagnostic Evaluation
								on the patient?</label
							>
						</div>

						<div class="submit">
							<button>Submit form</button>
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

<style>
/* form {
	max-width: 420px;
	margin: 30px auto;
	background: white;
	text-align: left;
	padding: 40px;
	border-radius: 10px;
} */
label {
	color: #aaa;
	display: inline-block;
	margin: 25px 0 15px;
	font-size: 0.6em;
	text-transform: uppercase;
	letter-spacing: 1px;
	font-weight: bold;
}
input,
select {
	display: block;
	padding: 10px 6px;
	width: 100%;
	box-sizing: border-box;
	border: none;
	border-bottom: 1px solid #ddd;
	color: #555;
}
input[type="checkbox"] {
	display: inline-block;
	width: 16px;
	margin: 0 10px 0 0;
	position: relative;
	top: 2px;
}
button {
	background: #0b6dff;
	border: 0;
	padding: 10px 20px;
	margin-top: 20px;
	color: white;
	border-radius: 20px;
}
sumbit {
	text-align: center;
}
</style>
