<!-- 13 Mar 2025 coder-Mika

	Calendar displays days from Monday-Friday, and hours based on fixed values. Later, when we have appointments in a database, the hours should be adjusted to the earliest and latest times of all the appointments displayed to account for appointments added in the future. Does not yet display any appointments.
-->
<template>
	<!-- Header part -->
	<div class="grid grid-cols-11 text-center">
		<div class="w-15">
			<div class="row-span-1 overflow-hidden">Time</div>
		</div>
		<div class="col-span-2" v-for="(day, index) in dayNames" :key="index">
			<div class="row-span-1 overflow-hidden">{{ day }}</div>
		</div>
	</div>

	<!-- Main Body -->
	<div class="grid grid-cols-11 text-center">
		<!-- Times -->
		<div class="w-15">
			<div
				class="row-span-4 flex-none"
				v-for="(hr, index) in hours"
				:key="index"
			>
				<div class="border-1 border-gray-400">
					<b>{{ militaryTimeToTwelveHr(hr) }}</b>
				</div>
				<div class="border-1 border-gray-400">{{ hr }}:15</div>
				<div class="border-1 border-gray-400">{{ hr }}:30</div>
				<div class="border-1 border-gray-400">{{ hr }}:45</div>
			</div>
		</div>

		<!-- Appointments -->
		<div
			class="col-span-2 overflow-hidden"
			v-for="(day, index) in dayNames"
			:key="index"
		>
			<!-- Replace the below with appointment components -->
			{{ day }} appointments go here
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

// values
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const startHr = ref(8); // The start and end hour might be computed in the future once appointments are added in instead of being fixed
const endHr = ref(16);

const hours = computed(() => {
	const hoursBuild = [];
	if (
		startHr.value < endHr.value &&
		startHr.value >= 0 &&
		startHr.value < 24 &&
		endHr.value >= 0 &&
		endHr.value < 24
	) {
		for (let i = startHr.value; i <= endHr.value; i++) {
			hoursBuild.push(i);
		}
	} else {
		// default hours in case of error: show all
		for (let i = 0; i <= 23; i++) {
			hoursBuild.push(i);
		}
	}
	return hoursBuild;
});

// converts 24 hour military time to AM & PM
function militaryTimeToTwelveHr(h: number): string {
	let twelveHrTime = "";
	if (h < 0 || h > 23) {
		twelveHrTime = "ERROR";
	} else if (h < 12) {
		if (h == 0) {
			h = 12;
		}
		twelveHrTime = h + " AM";
	} else {
		if (h > 12) {
			h = h - 12;
		}
		twelveHrTime = h + " PM";
	}
	return twelveHrTime;
}
</script>
