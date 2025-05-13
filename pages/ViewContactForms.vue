<template>
	<div class="flex h-auto justify-center">
		<div class="flex flex-col gap-10">
			<div
				class="flex w-4/5 flex-col justify-between md:w-200 md:flex-row"
			>
				<div class="font-cormorant-garamond">
					<h1 class="text-2xl">View Incoming Contact Forms</h1>
				</div>
				<div class="flex w-full flex-row md:w-1/3">
					<Listbox
						v-model="sortBy"
						as="div"
						class="fill-smoky bg-smoky w-2/3 md:w-66"
					>
						<div>
							<ListboxButton
								class="bg-smoky w-full cursor-pointer py-2"
								>{{
									sortBy == ""
										? "Sort By:"
										: "Sort By: " + sortBy
								}}</ListboxButton
							>
							<ListboxOptions
								as="div"
								class="bg-smoky absolute w-1/5 md:w-66"
							>
								<ListboxOption
									as="div"
									class="bg-smoky w-full cursor-pointer px-5 hover:bg-blue-500"
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
				</div>
			</div>
			<div class="flex flex-col gap-5">
				<table
					class="font-cormorant-garamond w-full border-collapse border-2 border-b-black text-2xl"
				>
					<tr class="border-collapse border-2 border-b-black">
						<th
							class="border-collapse border-2 border-b-black px-2"
						>
							First Name
						</th>
						<th
							class="border-collapse border-2 border-b-black px-2"
						>
							Last Name
						</th>
						<th
							class="border-collapse border-2 border-b-black px-2"
						>
							SSN
						</th>
						<th
							class="border-collapse border-2 border-b-black px-2"
						>
							Insurance
						</th>
						<th
							class="border-collapse border-2 border-b-black px-2"
						>
							Comments
						</th>
					</tr>
					<tr
						class="border-collapse border-2 border-b-black"
						v-for="(user, index) in processingPatients"
						:key="index"
					>
						<td
							class="border-collapse border-2 border-b-black px-2"
						>
							{{ user.fName }}
						</td>
						<td
							class="border-collapse border-2 border-b-black px-2"
						>
							{{ user.lName }}
						</td>
						<td
							class="border-collapse border-2 border-b-black px-2"
						>
							{{ user.NonEmployee?.Patient?.identification }}
						</td>
						<td
							class="border-collapse border-2 border-b-black px-2"
						>
							{{
								user.NonEmployee?.Patient?.ContactForm
									?.insurance
							}}
						</td>
						<td
							class="border-collapse border-2 border-b-black px-2"
						>
							{{
								user.NonEmployee?.Patient?.ContactForm
									?.comment == ""
									? "None"
									: user.NonEmployee?.Patient?.ContactForm
											?.comment
							}}
						</td>
					</tr>
				</table>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import {
	Listbox,
	ListboxButton,
	ListboxOptions,
	ListboxOption,
} from "@headlessui/vue";

const sortOptions = ["SSN", "Last Name"];
const sortBy = ref("");
const processingPatients = ref([]);
import { $fetch } from "ofetch";

async function getPatients() {
	try {
		const getData = {
			term: "PROCESSING",
		};
		const response = await $fetch("/api/contactForm/viewForm", {
			method: "GET",
			params: getData,
		});

		processingPatients.value = response;

		if (response == null || !response) {
			throw new Error("Could not submit form");
		}
	} catch {
		console.log("Could not submit form");
	}
}

async function sort(sortByCategory) {
	if (sortByCategory == "Last Name")
		processingPatients.value = processingPatients.value.sort(compareFn1);
	else if (sortByCategory == "SSN")
		processingPatients.value = processingPatients.value.sort(compareFn2);
}

function compareFn1(a, b) {
	if (a.lName < b.lName) {
		return -1;
	} else if (a.lName > b.lName) {
		return 1;
	}
	// a must be equal to b
	return 0;
}

function compareFn2(a, b) {
	if (
		a.NonEmployee?.Patient?.identification <
		b.NonEmployee?.Patient?.identification
	) {
		return -1;
	} else if (
		a.NonEmployee?.Patient?.identification >
		b.NonEmployee?.Patient?.identification
	) {
		return 1;
	}
	// a must be equal to b
	return 0;
}

watch(sortBy, (newSortBy) => {
	sort(newSortBy);
});

onMounted(() => {
	getPatients();
	sort(sortBy);
});
</script>
