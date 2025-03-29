<!-- 30 Mar 2025 coder-Mika
	Appointment box displays an overview of the session details: the appointment name, the therapist, and the duration of the session. It's position and size depends on the duration, but position changing based on start time hasn't been implemented yet.
-->
<template>
	<div
		class="relative overflow-hidden border-4 text-center"
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
}>();

const appointmentType = props.session.Type.name;
const therapistName = props.session.Therapist.fName;

// gets the session duration string
const date = new Date(props.session.time);
const duration = computed(() => {
	const startHour = date.getHours();
	const startMins = date.getMinutes();

	let endHour = startHour;
	let endMins = startMins + props.session.duration;

	// theres probably a better way to do this
	while (endMins >= 60) {
		endMins -= 60;
		endHour++;
		if (endHour > 23) {
			endHour = 0;
		}
	}
	const result = startHour + ":" + startMins + "-" + endHour + ":" + endMins;
	return result;
});

// style
const boxColor = props.session.Type.color;
const boxHeight = computed(() => {
	const rowHeightPerMinute = 24.5 / 15; // one row is 24.5 pixels per 15 minutes
	const height = props.session.duration * rowHeightPerMinute + "px";
	return height;
});
const boxTop = computed(() => {
	// will need to be calculated once added into the weekviewcalendar component, so this is a placeholder for now
	const top = 0 + "px";
	return top;
});
</script>
