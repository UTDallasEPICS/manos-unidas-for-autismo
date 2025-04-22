<!-- 9 Apr 2025
 schedule view page, clicking the buttons changes the week that's being displayed -->
<template>
	<div class="mx-10 h-full">
		<!-- Title part + option buttons -->
		<div class="my-5 flex justify-between">
			<div class="flex flex-col justify-center">
				<div class="text-xl">Schedule for</div>
				<div class="text-3xl">{{ currentWeek }}</div>
			</div>
			<div class="justify-right flex flex-col gap-2">
				<createAppointment v-if="permissions.editAppointments" />
				<!-- placeholder style for the button so it's not just text lmao -->
				<button
					@click="showFilterWindow = true"
					class="cursor-pointer bg-blue-950 p-2 text-white"
					v-if="permissions.filter"
				>
					Filter
					<div v-if="showFilterWindow">
						<FilterAppointments
							@close-filter-window="showFilterWindow = false"
						/>
					</div>
				</button>
			</div>
		</div>

		<!-- Calendar part -->
		<div class="flex w-full justify-center">
			<div class="pr-3 align-top text-3xl">
				<button class="cursor-pointer" @click="changeWeek(false)">
					&#x25C0;
				</button>
			</div>

			<WeekViewCalendar :week="date" class="grow" />
			<div class="pl-3 align-top text-3xl">
				<button class="cursor-pointer" @click="changeWeek(true)">
					&#x25B6;
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, useCookie } from "#imports";
import { AccessPermission } from "~/permissions";

const access = useCookie("AccessPermission");

const permissions = computed(() => {
	let actions = {
		filter: false, // user service/admin = true, admin/patient/therapist = false
		editAppointments: false, // user service = true, admin/patient/therapist = false
	};

	if (access.value) {
		if (access.value[AccessPermission.USER_SUPPORT]) {
			actions.filter = true;
			actions.editAppointments = true;
		}
		if (access.value[AccessPermission.ADMIN]) {
			actions.filter = true;
		}
	}

	return actions;
});

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

// for showing the filter window
const showFilterWindow = ref(false);
</script>
