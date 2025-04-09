<!-- 8 Apr 2025 coder-Mika

	Calendar displays days from Monday-Friday given a list of appointments. The hours adjust to the earliest and latest times of all the appointments being displayed.
-->
<template>
	<div class="overflow-auto">
		<!-- Header part -->
		<div class="grid min-w-2xl grid-cols-11 text-center">
			<div class="col-span-1 min-w-15">
				<div class="row-span-1 overflow-hidden">Time</div>
			</div>
			<div
				class="col-span-2"
				v-for="(day, index) in dayNames"
				:key="index"
			>
				<div class="row-span-1 overflow-hidden">
					{{ day }}
				</div>
			</div>
			<!-- Times -->
			<div class="col-span-1 min-w-15">
				<div
					class="row-span-4 flex-none"
					v-for="(hr, index) in hours"
					:key="index"
				>
					<div class="h-24px border-1 border-gray-400">
						<b>{{ militaryTimeToTwelveHr(hr) }}</b>
					</div>
					<div class="h-24px border-1 border-gray-400">
						{{ hr }}:15
					</div>
					<div class="h-24px border-1 border-gray-400">
						{{ hr }}:30
					</div>
					<div class="h-24px border-1 border-gray-400">
						{{ hr }}:45
					</div>
				</div>
			</div>

			<!-- Appointments -->
			<div
				class="col-span-2 overflow-hidden border-1 border-gray-400"
				v-for="day in 5"
				:key="day"
			>
				<div
					v-for="session in thisWeekSessions[day - 1]"
					:key="session.id"
					class="relative"
				>
					<AppointmentBox
						:session="session"
						:calendarStartHour="startHr"
						:rowHeight="rowHeight"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, toRef } from "vue";
import type { Session } from "@prisma/client";

const user = {
	id: "123",
	fName: "UserFName",
	lName: "UserLName",
	email: "user@gmail.com",
	contactPref: "EMAIL",
	Sessions: [
		{
			id: "1",
			time: "April 1, 2025 9:00:00",
			duration: 60,
			comment: "hi",
			maxAttendance: 2,
			typeId: "2",
			Type: {
				id: "2",
				name: "Service for Independent Living",
				color: "BLUE",
			},
			therapistId: "3",
			Therapist: {
				id: "3",
				fName: "FirstName",
				lName: "LastName",
				email: "email@site.com",
				contactPref: "EMAIL",
			},
			Patients: {},
		},
		{
			id: "2",
			time: "March 31, 2025 13:00:00",
			duration: 95,
			comment: "hi",
			maxAttendance: 2,
			typeId: "3",
			Type: {
				id: "3",
				name: "Occupational",
				color: "GREEN",
			},
			therapistId: "4",
			Therapist: {
				id: "4",
				fName: "Very very long therapist name",
				lName: "LastName",
				email: "email@site.com",
				contactPref: "EMAIL",
			},
			Patients: {},
		},
		{
			id: "3",
			time: "April 1, 2025 11:00:00",
			duration: 60,
			comment: "hi",
			maxAttendance: 2,
			typeId: "5",
			Type: {
				id: "5",
				name: "Language",
				color: "YELLOW",
			},
			therapistId: "6",
			Therapist: {
				id: "6",
				fName: "FirstName",
				lName: "LastName",
				email: "email@site.com",
				contactPref: "EMAIL",
			},
			Patients: {},
		},
		{
			id: "4",
			time: "April 8, 2025 12:45:00",
			duration: 50,
			comment: "hi",
			maxAttendance: 2,
			typeId: "7",
			Type: {
				id: "7",
				name: "Evaluation",
				color: "ORANGE",
			},
			therapistId: "8",
			Therapist: {
				id: "8",
				fName: "FirstName",
				lName: "LastName",
				email: "email@site.com",
				contactPref: "EMAIL",
			},
			Patients: {},
		},
		{
			id: "5",
			time: "April 2, 2025 9:00:00",
			duration: 50,
			comment: "hi",
			maxAttendance: 2,
			typeId: "200",
			Type: {
				id: "200",
				name: "Very long therapy name",
				color: "Mmmmm color",
			},
			therapistId: "300",
			Therapist: {
				id: "300",
				fName: "FirstName",
				lName: "LastName",
				email: "email@site.com",
				contactPref: "EMAIL",
			},
			Patients: {},
		},
		{
			id: "6",
			time: "April 3, 2025 9:00:00",
			duration: 20,
			comment: "hi",
			maxAttendance: 2,
			typeId: "2000",
			Type: {
				id: "2000",
				name: "Service for Independent Living",
				color: "Mmmmm color",
			},
			therapistId: "3000",
			Therapist: {
				id: "3000",
				fName: "FirstName",
				lName: "LastName",
				email: "email@site.com",
				contactPref: "EMAIL",
			},
			Patients: {},
		},
	],
};

const props = defineProps<{
	week: Date; // any day in the week wanted to be displayed. week starts at monday
}>();

const weekDate = toRef(props, "week");
watch(weekDate, () => {
	thisWeekSessions.value = getFilteredSessions(user.Sessions);
});

// a 2d array holding all the sessions that should be displayed. [day-1][session in the list]
const thisWeekSessions = ref(getFilteredSessions(user.Sessions));

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const startHr = computed(() => {
	let earliestHr = 23;

	for (let i = 0; i < 5; i++) {
		for (let j of thisWeekSessions.value[i]) {
			let sessionTime = new Date(j.time);
			// check its starting hour
			if (sessionTime.getHours() < earliestHr) {
				earliestHr = sessionTime.getHours();
			}
		}
	}

	return earliestHr;
});

const endHr = computed(() => {
	let latestHr = 0;

	for (let i = 0; i < 5; i++) {
		for (let j of thisWeekSessions.value[i]) {
			let sessionTime = new Date(j.time);
			// get the end time
			let sessionEnd = getSessionEndTime(sessionTime, j.duration);
			// check its starting hour
			if (sessionEnd.getHours() > latestHr) {
				latestHr = sessionEnd.getHours();
			}
		}
	}
	return latestHr;
});

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

const rowHeight = ref(26); // height in pixels of each row of time for the appointment box component

// given a date, gets the monday of that week (assuming the week starts on monday)
function getMonday(d: Date): Date {
	// if day is sunday, go back to the monday of that week
	const firstDay = d.getDate() - d.getDay() + (d.getDay() == 0 ? -6 : 1);
	let monday = new Date(d.getTime());
	monday.setDate(firstDay);
	return monday;
}

// given a time and a duration, return the end of the session time
function getSessionEndTime(d: Date, sessionLength: number): Date {
	let endTime = new Date(d.getTime());
	endTime.setMinutes(d.getMinutes() + sessionLength);
	return endTime;
}

function getFilteredSessions(allSessions: Session[]): Session[][] {
	let filteredSessions: Session[][] = [];
	for (let i = 0; i < 5; i++) {
		filteredSessions.push([]);
	}

	// get the monday of the week
	let monday = getMonday(weekDate.value);
	for (let i = 0; i < allSessions.length; i++) {
		let currSessionDay = new Date(allSessions[i].time);

		// if the session is within the same week
		if (
			monday.getDate() == getMonday(currSessionDay).getDate() &&
			monday.getMonth() == getMonday(currSessionDay).getMonth() &&
			monday.getFullYear() == getMonday(currSessionDay).getFullYear()
		) {
			// append to the filtered sessions
			filteredSessions[currSessionDay.getDay() - 1].push(allSessions[i]);
		}
	}

	return filteredSessions;
}
</script>
