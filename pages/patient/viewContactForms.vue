<template>
	<div class="font-sc-encode m-5 flex justify-center">
		<div class="flex flex-col gap-10">
			<div
				class="flex w-4/5 flex-col justify-between md:w-200 md:flex-row"
			>
				<div class="font-cormorant-garamond">
					<h1 class="text-2xl">View Incoming Contact Forms</h1>
				</div>
				<div class="flex w-full flex-row md:w-1/3">
					<ViewContactFormSortControl
						v-model="sortBy"
						:options="sortOptions"
					/>
				</div>
			</div>
			<div class="flex flex-col gap-5">
				<RequestViewRequestTable
					:columns="columns"
					:requests="processingRequests"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { $fetch } from "ofetch";

interface Request {
	id: number;
	firstName: string;
	middleName?: string;
	lastName: string;
	email: string;
	phone: { id: number; number: string; requestId: number }[];
	whatsapp: string;
	idNumber: string;
	status: string;
	streetName: string;
	streetNum: string;
	buildingNum?: string;
	postCode: string;
	isAdult: boolean;
	patientFirstName: string;
	patientMiddleName?: string;
	patientLastName: string;
	patientAge: number;
	diagnosed: boolean;
	returnPatient: boolean;
	previousVisitDate?: string;
	wantsEval: boolean;
	hasReferral: boolean;
	createdAt: string;
	therapies: { name: string }[];
	complementaryServices: { name: string }[];
	workshops: { name: string }[];
}

const columns = [
	{ key: "contactName", label: "Contact Name" },
	{ key: "email", label: "Email" },
	{ key: "phone", label: "Phone" },
	{ key: "patientName", label: "Patient Name" },
	{ key: "createdAt", label: "Date Submitted" },
];

const sortOptions = ["Last Name", "Date Submitted"];
const sortBy = ref("");
const processingRequests = ref<Request[]>([]);

async function getRequests() {
	try {
		const response = await $fetch<Request[]>("/api/request/processing", {
			method: "GET",
		});
		processingRequests.value = response;
	} catch {
		console.log("Could not fetch processing requests");
	}
}

function sort(category: string) {
	if (category === "Last Name") {
		processingRequests.value = [...processingRequests.value].sort((a, b) =>
			a.lastName.localeCompare(b.lastName)
		);
	} else if (category === "Date Submitted") {
		processingRequests.value = [...processingRequests.value].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime()
		);
	}
}

watch(sortBy, (newSortBy) => {
	sort(newSortBy);
});

onMounted(() => {
	getRequests();
});
</script>
