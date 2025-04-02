<!-- 1 Apr 2025 coder-Mika
	Appointment box displays an overview of the session details: the appointment name, the therapist, and the duration of the session. It's position and size depends on the duration and on the hour the calendar starts with.
-->
<template>
	<div
		class="relative overflow-hidden rounded-md border-4 text-center"
		:style="{ backgroundColor: boxColor, height: boxHeight, top: boxTop }"
	>
		<div>{{ appointmentType }}</div>
		<div class="hidden md:inline">{{ therapistName }}</div>
		<div>{{ duration }}</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Session } from "@prisma/client";

const props = defineProps<{
	session: Session;
	calendarStartHour: number;
	rowHeight: number;
}>();

const appointmentType = props.session.Type.name;
const therapistName = props.session.Therapist.fName;

// gets the session duration string
const date = new Date(props.session.time);
const duration = computed(() => {
	const startHour = date.getHours();
	const startMins = date.getMinutes();

	// get end time
	let endTime = new Date(date.getTime());
	endTime.setMinutes(startMins + props.session.duration);
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
const boxColor = props.session.Type.color;

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
		rowHeightPerMinute;
	const result = top + "px";
	return result;
});
</script>
