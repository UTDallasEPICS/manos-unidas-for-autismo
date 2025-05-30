<!-- 27 Apr 2025
 schedule view page, clicking the buttons changes the week that's being displayed -->
<template>
	<div class="font-sc-encode pb-8">
		<!-- Filter modal window -->
		<FilterAppointments
			:filter="filters"
			v-if="showFilterWindow"
			@close-filter-window="showFilterWindow = false"
			@add-filters="(filter) => addFilters(filter)"
		/>

		<!-- Page -->
		<div class="mx-10">
			<!-- Title part + option buttons -->
			<div class="my-5 flex justify-between">
				<div
					class="font-cormorant-garamond flex flex-col justify-center"
				>
					<div class="text-2xl">Schedule for</div>
					<div class="text-3xl">{{ currentWeek }}</div>
				</div>
				<div class="justify-right flex flex-col gap-2">
					<createAppointment v-if="permissions.editAppointments" />
					<!-- placeholder style for the button so it's not just text lmao -->
					<button
						@click="showFilterWindow = true"
						class="btn cursor-pointer"
						v-if="permissions.filter"
					>
						Filter
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

				<WeekViewCalendar :week="date" :filter="filters" class="grow" />
				<div class="pl-3 align-top text-3xl">
					<button class="cursor-pointer" @click="changeWeek(true)">
						&#x25B6;
					</button>
				</div>
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
		if (access.value[AccessPermission.USER_SERVICE]) {
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

const filters = ref<string[]>([]);

function addFilters(filter: string[]) {
	filters.value = filter;
}
</script>
