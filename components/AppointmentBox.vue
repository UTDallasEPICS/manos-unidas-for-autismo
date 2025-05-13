<!-- 14 Apr 2025 
	Appointment box displays an overview of the session details: the appointment name, the therapist, and the duration of the session. It's position and size depends on the duration and on the hour the calendar starts with. When clicked, it displays the details of the session
-->
<template>
	<AppointmentModalWindow
		:session="props.session"
		@close-window="showWindow = false"
		v-if="showWindow"
	/>
	<div
		ref="container"
		class="font-sc-encode absolute grid w-full cursor-pointer grid-cols-2 grid-rows-3 overflow-hidden rounded-md border-4 text-center"
		:class="boxColor"
		:style="{
			height: boxHeight,
			top: boxTop,
		}"
		@click="showWindow = true"
	>
		<div
			ref="sessionTypeBox"
			class="flex flex-col justify-center"
			:class="{
				'col-span-1': props.session.duration < 50,
				'col-span-2': props.session.duration >= 50,
				'row-span-3': props.session.duration < 50,
				'row-span-1': props.session.duration >= 50,
			}"
			:style="{ fontSize: sessionTypeFontSize }"
		>
			<span class="line-clamp-2 font-bold">{{
				props.session.Type.name
			}}</span>
		</div>
		<div
			ref="therapistBox"
			class="col-span-2 row-span-1 line-clamp-2 flex flex-col justify-center"
			:style="{ fontSize: therapistFontSize }"
			v-if="props.session.duration > 49"
		>
			{{ props.session.Therapist.fName }}
		</div>
		<div
			ref="durationBox"
			class="flex flex-col justify-center"
			:class="{
				'col-span-1': props.session.duration < 50,
				'col-span-2': props.session.duration >= 50,
				'row-span-3': props.session.duration < 50,
				'row-span-1': props.session.duration >= 50,
			}"
			:style="{ fontSize: durationFontSize }"
		>
			{{ duration }}
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useResizeObserver } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import type { Session } from "@prisma/client";
import { Color } from "@prisma/client";

const props = defineProps<{
	session: Session;
	calendarStartHour: number;
	rowHeight: number;
}>();

defineEmits(["showAppointmentDetails"]);

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
	switch (props.session.Type.color) {
		case Color.BLUE:
			return "bg-sky";
		case Color.GREEN:
			return "bg-lime";
		case Color.ORANGE:
			return "bg-salmon";
		case Color.PURPLE:
			return "bg-lilac";
		case Color.RED:
			return "bg-rose";
		case Color.TEAL:
			return "bg-blue-green";
		case Color.YELLOW:
			return "bg-buttercup";
		default:
			return "bg-peach";
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

// font sizes for each element
const container = ref<HTMLElement | undefined>();
const sessionTypeBox = ref<HTMLElement | undefined>();
const sessionTypeFontSize = ref("1em");
const therapistBox = ref<HTMLElement | undefined>();
const therapistFontSize = ref("1em");
const durationBox = ref<HTMLElement | undefined>();
const durationFontSize = ref("1em");

onMounted(() => {
	getFontSize();
});
useResizeObserver(container, getFontSize);

function getFontSize() {
	// get size of session type text
	let fontSize = 1;

	if (sessionTypeBox.value) {
		if (props.session.Type.name.length > 15) {
			fontSize = 0.75;
		}
		if (sessionTypeBox.value.clientWidth < 150) {
			fontSize = fontSize * (sessionTypeBox.value.clientWidth / 150);
		}
	}
	sessionTypeFontSize.value = fontSize + "em";

	fontSize = 1;
	if (therapistBox.value) {
		if (props.session.Therapist.fName.length > 15) {
			fontSize = 0.75;
		}
		if (therapistBox.value.clientWidth < 150) {
			fontSize = fontSize * (therapistBox.value.clientWidth / 150);
		}
	}
	therapistFontSize.value = fontSize + "em";

	fontSize = 1;
	if (durationBox.value) {
		if (durationBox.value.clientWidth < 150) {
			fontSize = durationBox.value.clientWidth / 150;
		}
	}
	durationFontSize.value = fontSize + "em";
}

// given a time and a duration, return the end of the session time
function getSessionEndTime(d: Date, sessionLength: number): Date {
	let endTime = new Date(d.getTime());
	endTime.setMinutes(d.getMinutes() + sessionLength);
	return endTime;
}

const showWindow = ref(false);
</script>
