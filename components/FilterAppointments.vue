<!-- 22 Apr 2025
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
			class="text-md relative z-52 m-7 flex flex-col bg-white p-4 text-black"
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
				<!-- below is temporary for testing only -->
				filtered types:
				<div v-for="(i, idx) in filteredTypes" :key="i">
					{{ idx }}:{{ i }}
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
import { ref } from "vue";
import type { SessionType } from "@prisma/client";
import { X } from "lucide-vue-next";

const emit = defineEmits(["closeFilterWindow", "addFilters"]);

function closeWindow() {
	emit("closeFilterWindow");
}

// temporary object, later should get the appointment types from database
const sessionTypes: SessionType[] = [
	{ name: "type 1", id: "123", color: "BLUE" },
	{ name: "type 2", id: "245", color: "BLUE" },
	{ name: "type 3", id: "456", color: "BLUE" },
];

// the filtered sessions, object should be returned to scheduleview page and be sent to calendar component
const filteredTypes = ref([]);

function submitForm() {
	let result = filteredTypes.value.slice();
	// remove any null, undefined, empty, or false
	for (let i = 0; i < result.length; i++) {
		if (result[i] == null || result[i] == undefined) {
			result.splice(i, 1);
		}
	}

	console.log("submitted");
	console.log(result);

	// emit the filter options to week view calendar
	emit("addFilters", result);
	closeWindow();
}
</script>
