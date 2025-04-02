<!-- 2 Apr 2025 coder-Mika
	Appointment box displays an overview of the session details: the appointment name, the therapist, and the duration of the session. It's position and size depends on the duration and on the hour the calendar starts with.
-->
<template>
	<div
		class="absolute w-full overflow-hidden rounded-md border-4 text-center"
		:style="{ backgroundColor: boxColor, height: boxHeight, top: boxTop }"
	>
		<div class="truncate">{{ props.session.Type.name }}</div>
		<div class="truncate" v-if="props.session.duration > 49">
			{{ props.session.Therapist.fName }}
		</div>
		<div v-if="props.session.duration > 29">
			{{ duration }}
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Session } from "@prisma/client";
import { Color } from "@prisma/client";

const props = defineProps<{
	session: Session;
	calendarStartHour: number;
	rowHeight: number;
}>();

// gets the session duration string
const date = new Date(props.session.time);
const duration = computed(() => {
	const startHour = date.getHours();
	const startMins = date.getMinutes();

	// get end time
	let endTime = getSessionEndTime(date, props.session.duration);
	const endHour = endTime.getHours();
	const endMins = endTime.getMinutes();

	const result =
		startHour +
		":" +
		(startMins > 10 ? startMins : "0" + startMins) +
		"-" +
		endHour +
		":" +
		(endMins > 10 ? endMins : "0" + endMins);
	return result;
});

// style
const boxColor = computed(() => {
	// needs to be replaced with tailwind values later
	switch (props.session.Type.color) {
		case Color.BLUE:
			return "#3878c2";
		case Color.GREEN:
			return "#4cc255";
		case Color.ORANGE:
			return "#e87d25";
		case Color.PURPLE:
			return "#d4a1f0";
		case Color.RED:
			return "#e34229";
		case Color.TEAL:
			return "#5aeddc";
		case Color.YELLOW:
			return "#f7d439";
		default:
			return "#c0e9ed";
	}
});

const boxHeight = computed(() => {
	const rowHeightPerMinute = props.rowHeight / 15; // one row is 15 minutes
	const height = props.session.duration * rowHeightPerMinute + "px";
	return height;
});

const boxTop = computed(() => {
	const rowHeightPerMinute = props.rowHeight / 15;
	const sessionStartHr = date.getHours();
	const sessionStartMin = date.getMinutes();
	const top =
		((sessionStartHr - props.calendarStartHour) * 60 + sessionStartMin) *
			rowHeightPerMinute +
		"px";
	return top;
});

// given a time and a duration, return the end of the session time
function getSessionEndTime(d: Date, sessionLength: number): Date {
	let endTime = new Date(d.getTime());
	endTime.setMinutes(d.getMinutes() + sessionLength);
	return endTime;
}
</script>
