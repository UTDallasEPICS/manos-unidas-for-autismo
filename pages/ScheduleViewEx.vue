<template>
	<WeekViewCalendar :week="date" />
</template>

<script setup lang="ts">
import WeekViewCalendar from "../components/WeekViewCalendar.vue";

const date = new Date("March 31, 2025 13:00:00");
</script>
