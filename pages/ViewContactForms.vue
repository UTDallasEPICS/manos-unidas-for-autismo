<template>
	<div class="flex h-auto justify-center">
		<div class="flex flex-col gap-10">
			<div
				class="flex w-4/5 flex-col justify-between md:w-200 md:flex-row"
			>
				<div class="cormorant-garamond">
					<h1 class="text-2xl">View Contact Forms</h1>
				</div>
				<div class="flex w-full flex-row md:w-1/3">
					<Listbox v-model="sortBy" as="div" class="w-2/3 md:w-66">
						<div>
							<ListboxButton
								class="bg-color2 w-full cursor-pointer py-2"
								>{{
									sortBy == ""
										? "Sort By:"
										: "Sort By: " + sortBy
								}}</ListboxButton
							>
							<ListboxOptions
								as="div"
								class="bg-color2 absolute w-91/200 md:w-44"
							>
								<ListboxOption
									as="div"
									class="bg-color2 w-full cursor-pointer px-5 hover:bg-blue-500"
									v-for="(option, index) in sortOptions"
									:key="index"
									:value="option"
								>
									<div class="">
										{{ option }}
									</div>
								</ListboxOption>
							</ListboxOptions>
						</div>
					</Listbox>
					<button @click="getPatients" class="manosSubmit w-1/2">
						Sort
					</button>
				</div>
			</div>
			<div>
				<table
					class="cormorant-garamond w-full border-collapse border-2 border-b-black"
				>
					<tr class="border-collapse border-2 border-b-black">
						<th class="border-collapse border-2 border-b-black">
							First Name
						</th>
						<th class="border-collapse border-2 border-b-black">
							Last Name
						</th>
						<th class="border-collapse border-2 border-b-black">
							Processing Status
						</th>
						<th class="border-collapse border-2 border-b-black">
							More Details
						</th>
					</tr>
				</table>
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

const sortOptions = ["SSN", "Last Name", "ID", ""];
const sortBy = ref("");
import { $fetch } from "ofetch";

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// const users = await prisma.contactForm.findMany();
// console.log(users);

async function getPatients() {
	try {
		const response = await $fetch("/api/contactForm/viewForm", {
			method: "GET",
			body: { term: "patient" },
		});

		console.log(response);

		if (response == null || !response) {
			throw new Error("Could not submit form");
		}
		return "hi";
	} catch {
		console.log("Could not submit form");
	}
}
</script>
