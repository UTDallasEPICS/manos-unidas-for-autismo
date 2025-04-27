<!-- 27 Apr 2025
    A window for users to filter sessions. Currently has a temporary session types object. After submitting, the window should emit the filters to the schedule view and then to the calendar component
 -->
<template>
	<div class="fixed top-0 right-0 z-50 h-full w-full items-center text-left">
		<!-- Background -->
		<div
			class="fixed z-51 h-full w-full bg-black/70"
			@click="closeWindow"
		></div>

		<!-- Window -->
		<div
			class="text-md relative z-52 m-7 flex max-h-full flex-col overflow-y-auto bg-white p-4 text-black"
		>
			<div
				class="flex cursor-pointer justify-end pr-2 text-right"
				@click="closeWindow"
			>
				<X :size="30" />
			</div>
			<!-- Information -->
			<div class="m-3 flex flex-col gap-3">
				<h1>Filter Appointments</h1>
				Tick to hide appointment:
				<div v-for="(type, index) in sessionTypes" :key="type">
					<input
						type="checkbox"
						v-model="filteredTypes[index]"
						id="index"
						:true-value="type.id"
						:false-value="null"
					/>{{ type.name }}
				</div>
			</div>

			<!-- Submit button -->
			<div class="flex flex-col justify-center gap-3">
				<div class="flex justify-center">
					<button
						class="cursor-pointer bg-blue-950 p-2 text-center text-white"
						@click="submitForm"
					>
						Submit
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, useFetch } from "#imports";
import type { SessionType } from "@prisma/client";
import { X } from "lucide-vue-next";

const emit = defineEmits(["closeFilterWindow", "addFilters"]);

function closeWindow() {
	emit("closeFilterWindow");
}

const sessionTypes = ref<SessionType[]>([]);
// the filtered sessions, object should be returned to scheduleview page and be sent to calendar component
const filteredTypes = ref<string[]>([]);

fetchSessionTypes().then((value) => {
	sessionTypes.value = value;
});

// gets the available session types from the database
async function fetchSessionTypes(): Promise<SessionType[]> {
	try {
		const types = await useFetch("./api/session/sessionType", {
			method: "GET",
		});

		return types.data.value;
	} catch {
		return Promise.reject(new Error("Could not get session types"));
	}
}

function submitForm() {
	let result: string[] = [];

	for (let i = 0; i < filteredTypes.value.length; i++) {
		if (
			filteredTypes.value[i] != null ||
			filteredTypes.value[i] != undefined
		) {
			result.push(filteredTypes.value[i]);
		}
	}

	// emit the filter options to week view calendar
	emit("addFilters", result);
	closeWindow();
}
</script>
