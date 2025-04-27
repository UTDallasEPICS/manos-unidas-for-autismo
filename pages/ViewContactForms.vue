<template>
	<div class="flex h-auto justify-center">
		<div class="flex w-4/5 justify-between md:w-200">
			<div class="cormorant-garamond">
				<h1 class="text-2xl">View Contact Forms</h1>
			</div>
			<div class="flex flex-row">
				<Listbox v-model="sortBy" as="div" class="contactFormListbox">
					<div>
						<ListboxButton class="contactFormListboxButton">{{
							sortBy == "" ? "Sort By:" : "Sort By: " + sortBy
						}}</ListboxButton>
						<ListboxOptions
							as="div"
							class="contactFormListboxOptions absolute"
						>
							<ListboxOption
								as="div"
								class="contactFormListboxOption"
								v-for="(option, index) in sortOptions"
								:key="index"
								:value="option"
							>
								<div class="px-5">
									{{ option }}
								</div>
							</ListboxOption>
						</ListboxOptions>
					</div>
				</Listbox>
				<button class="manosSubmit">Sort</button>
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

try {
	const response = await $fetch("/api/contactForm/viewForm", {
		method: "GET",
		body: { term: "patient" },
	});

	console.log(response);

	if (response == null || !response) {
		throw new Error("Could not submit form");
	}
} catch {
	console.log("Could not submit form");
}
</script>
