<template>
	<WeekViewCalendar :week="date" />
</template>

<script setup lang="ts">
const date = new Date("March 31, 2025 13:00:00");
</script>
