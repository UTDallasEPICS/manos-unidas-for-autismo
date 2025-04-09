<!-- 8 Apr 2025
 schedule view page, clicking the buttons changes the week that's being displayed -->
<template>
	<div class="m-10">
		<!-- Title part + option buttons -->
		<div class="my-5 flex justify-between">
			<div class="flex flex-col justify-center">
				<div class="text-xl">Current Schedule for</div>
				<div class="text-3xl">{{ currentWeek }}</div>
			</div>
			<div>
				<createAppointment />
				<button @click="filterAppointments()">Filter</button>
			</div>
		</div>

		<div class="flex justify-center">
			<div class="px-2 align-top text-xl">
				<button @click="changeWeek(false)">&#x25C0;</button>
			</div>

			<WeekViewCalendar :week="date" />
			<div class="px-2 align-top text-xl">
				<button @click="changeWeek(true)">&#x25B6;</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const date = ref<Date>();
date.value = new Date(Date.now());

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

// gets the monday & friday given the current date
const currentWeek = ref("");
getCurrentWeek();

//updates the current week
function getCurrentWeek() {
	// get monday & friday
	const firstDay =
		date.value.getDate() -
		date.value.getDay() +
		(date.value.getDay() == 0 ? -6 : 1);
	let monday = new Date(date.value.getTime());
	monday.setDate(firstDay);
	let friday = new Date(date.value.getTime());
	friday.setDate(firstDay + 4);

	const result =
		monday.getDate() +
		" " +
		monthNames[monday.getMonth()] +
		" " +
		monday.getFullYear() +
		" to " +
		friday.getDate() +
		" " +
		monthNames[friday.getMonth()] +
		" " +
		friday.getFullYear();

	currentWeek.value = result;
}

// true is moving forward, false is moving back a week
function changeWeek(forward: boolean) {
	if (forward) {
		date.value = new Date(date.value.setDate(date.value.getDate() + 7));
	} else {
		date.value = new Date(date.value.setDate(date.value.getDate() - 7));
	}

	getCurrentWeek();
}

function filterAppointments() {
	console.log("filter button clicky clicky");
}
</script>
