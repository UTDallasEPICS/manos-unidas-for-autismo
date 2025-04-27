<!-- 26 Apr 2025

	Calendar displays days from Monday-Friday given a list of appointments. The hours adjust to the earliest and latest times of all the appointments being displayed. Given a string array of filters, it will only show appointments with the same session types in the filters.
-->
<template>
	<div class="overflow-auto">
		<!-- Header part -->
		<div class="grid min-w-2xl grid-cols-11 text-center">
			<div class="col-span-1 min-w-15">
				<div class="row-span-1 overflow-hidden">Time</div>
			</div>
			<div class="col-span-2" v-for="day in dayNames" :key="day">
				<div class="row-span-1 overflow-hidden">
					{{ day }}
				</div>
			</div>
			<!-- Times -->
			<div class="col-span-1 min-w-15">
				<div class="row-span-4 flex-none" v-for="hr in hours" :key="hr">
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
					v-for="(session, index) in thisWeekSessions[day - 1]"
					:key="session.id"
					class="relative w-full"
				>
					<div
						class="absolute end-0 w-full hover:z-50"
						:style="{ width: boxWidths[day - 1][index] }"
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
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, useCookie, useFetch } from "#imports";
import type { Session } from "@prisma/client";
import { AccessPermission } from "~/permissions";

const props = defineProps<{
	week: Date; // any day in the week wanted to be displayed. week starts at monday
	filter?: string[]; // filters using session type ids
}>();

// get new sessions when week chances
watch(
	() => props.week,
	() => {
		fetchSessions().then((value) => {
			allSessions.value = value;
			setHours();
			thisWeekSessions.value = getFilteredSessions();
		});
	}
);

// watch when filters change
watch(
	() => props.filter,
	() => {
		fetchSessions().then((value) => {
			allSessions.value = value;
			setHours();
			thisWeekSessions.value = getFilteredSessions();
		});
	}
);

// get sessions
const access = useCookie("AccessPermission");
const userId = useCookie("userId");

// a 2d array holding all the sessions that should be displayed. [day-1][session in the list]
const thisWeekSessions = ref([[]]);

// fetches all the sessions
const allSessions = ref<Session[]>([]);
fetchSessions().then((value) => {
	allSessions.value = value;
	setHours();
	thisWeekSessions.value = getFilteredSessions();
});
// gets the available sessions from the database
async function fetchSessions() {
	try {
		if (
			access.value[AccessPermission.ADMIN] ||
			access.value[AccessPermission.USER_SUPPORT]
		) {
			const { data: sessions } = await useFetch(
				"/api/session/allSessions",
				{
					method: "GET",
					query: {
						date: props.week.toISOString(),
						filter: props.filter,
					},
				}
			);
			return sessions.value;
		} else if (access.value[AccessPermission.THERAPIST]) {
			const sessions = await useFetch("/api/session/therapistSessions", {
				method: "GET",
				query: { userId: userId, date: props.week.toISOString() },
			});
			return sessions.data.value;
		} else {
			const sessions = await useFetch("/api/session/patientSessions", {
				method: "GET",
				query: { userId: userId, date: props.week.toISOString() },
			});
			return sessions.data.value;
		}
	} catch (e) {
		console.log(e);
		return Promise.reject(new Error("Could not get sessions"));
	}
}

// 2d array holding the widths for each session that should be displayed. indexes correspond to thisWeekSessions
const boxWidths: string[][] = computed(() => {
	let result: string[][] = [];
	for (let i = 0; i < 5; i++) {
		result.push([]);
		result[i] = getBoxWidths(thisWeekSessions.value[i]);
	}
	return result;
});

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// hours to display
const startHr = ref(23);
const endHr = ref(0);
const hours = ref<number[]>([]);
setHours();

function setHours() {
	startHr.value = getStartHour();
	endHr.value = getEndHour();
	hours.value = getAllHours();
}

watch(
	() => startHr,
	() => {
		setHours();
	}
);
watch(
	() => endHr,
	() => {
		setHours();
	}
);

function getStartHour() {
	let earliestHr = 23;

	if (allSessions.value == null) {
		return 0;
	}

	for (let i = 0; i < allSessions.value.length; i++) {
		let sessionTime = new Date(allSessions.value[i].time);
		//check its starting hour
		if (sessionTime.getHours() < earliestHr) {
			earliestHr = sessionTime.getHours();
		}
	}

	return earliestHr;
}

function getEndHour() {
	let latestHr = 0;
	if (allSessions.value == null) {
		return 23;
	}

	for (let i = 0; i < allSessions.value.length; i++) {
		let sessionTime = new Date(allSessions.value[i].time);
		// get the end time
		let sessionEnd = getSessionEndTime(
			sessionTime,
			allSessions.value[i].duration
		);

		//check its ending hour
		if (sessionEnd.getHours() > latestHr) {
			latestHr = sessionEnd.getHours();
		}
	}

	return latestHr;
}

function getAllHours() {
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
}

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
/*
function getMonday(d: Date): Date {
	// if day is sunday, go back to the monday of that week
	const firstDay = d.getDate() - d.getDay() + (d.getDay() == 0 ? -6 : 1);
	let monday = new Date(d.getTime());
	monday.setDate(firstDay);
	return monday;
}*/

// given a time and a duration, return the end of the session time
function getSessionEndTime(d: Date, sessionLength: number): Date {
	let endTime = new Date(d.getTime());
	endTime.setMinutes(d.getMinutes() + sessionLength);
	return endTime;
}

// filters sessions into the day of the week they belong to
function getFilteredSessions(): Session[][] {
	let filteredSessions: Session[][] = [];
	for (let i = 0; i < 5; i++) {
		filteredSessions.push([]);
	}

	if (allSessions.value == null) {
		return filteredSessions;
	}

	console.log("all sessions:");
	console.log(allSessions.value);

	for (let i = 0; i < allSessions.value.length; i++) {
		let currSessionDay = new Date(allSessions.value[i].time);

		// append to the filtered sessions
		filteredSessions[currSessionDay.getDay() - 1].push(
			allSessions.value[i]
		);
	}

	// sort sessions
	for (let i = 0; i < 5; i++) {
		filteredSessions[i] = sortSessions(filteredSessions[i]);
	}

	return filteredSessions;
}

// uses merge sort to sort sessions by start time
function sortSessions(unsorted: Session[]): Session[] {
	let sorted: Session[] = [];

	if (unsorted.length <= 1) {
		// base case: only 1 session or is empty
		return (sorted = unsorted);
	} else {
		// recursive case: multiple sessions
		const middle = Math.floor(unsorted.length / 2);

		let leftHalf = sortSessions(unsorted.slice(0, middle)); // sort left half
		let rightHalf = sortSessions(unsorted.slice(middle)); // sort right half

		// merge halves
		let leftIdx = 0;
		let rightIdx = 0;

		while (leftIdx < leftHalf.length && rightIdx < rightHalf.length) {
			let leftTime = new Date(leftHalf[leftIdx].time);
			let rightTime = new Date(rightHalf[rightIdx].time);

			if (leftTime.getTime() < rightTime.getTime()) {
				sorted.push(leftHalf[leftIdx]);
				leftIdx++;
			} else if (rightTime.getTime() < leftTime.getTime()) {
				sorted.push(rightHalf[rightIdx]);
				rightIdx++;
			} else {
				// if start time is the same, then sort by duration
				if (leftHalf[leftIdx].duration > rightHalf[rightIdx].duration) {
					sorted.push(leftHalf[leftIdx]);
					leftIdx++;
				} else {
					sorted.push(rightHalf[rightIdx]);
					rightIdx++;
				}
			}
		}
		// concatenate any remaining sessions into sorted list
		sorted = sorted.concat(
			leftHalf.slice(leftIdx),
			rightHalf.slice(rightIdx)
		);
	}

	return sorted;
}

// determines the width for each session given a list for 1 day (if sessions overlap, the session occuring later has a shorter width)
function getBoxWidths(sessions: Session[]) {
	let startedSessions: Session[] = [];
	let result: string[] = [];

	for (let i = 0; i < sessions.length; i++) {
		// for each started appointment
		let currSessionStartTime = new Date(sessions[i].time);
		let overlaps = false;

		// check if current session overlaps with another session in the set of started sessions
		for (let j = 0; j < startedSessions.length; j++) {
			let startedSessionEndTime = getSessionEndTime(
				new Date(startedSessions[j].time),
				startedSessions[j].duration
			);

			// if that a started session ends after current session's start time
			if (
				startedSessionEndTime.getTime() > currSessionStartTime.getTime()
			) {
				overlaps = true;
				break;
			}
		}

		// if there is an overlap
		if (overlaps) {
			// add current session to started sessions
			startedSessions.push(sessions[i]);
		} else {
			// if not, current started sessions group won't overlap with any other session
			// calculate style widths for each box
			result = result.concat(calculateWidths(startedSessions));

			// set started sessions to empty & add current session to started sessions
			startedSessions = [sessions[i]];
		}
	}
	// in case there is a remaining group, add it to the result
	result = result.concat(calculateWidths(startedSessions));
	return result;
}
// given a list of sessions that overlap, it calculates and returns the session's width
function calculateWidths(sessions: Session[]): string[] {
	let result: string[] = [];
	for (let i = 0; i < sessions.length; i++) {
		result.push(((sessions.length - i) / sessions.length) * 100 + "%");
	}
	return result;
}
</script>
