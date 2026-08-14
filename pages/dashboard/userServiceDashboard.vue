<template>
	<DashboardTiles :tiles="tiles" />
</template>

<script lang="ts" setup>
definePageMeta({
	title: "nav.dashboard",
});

const { t } = useI18n();
useDashboardGuard("USER_SERVICE");

const tiles = computed(() => [
	{
		to: "/scheduleView",
		icon: "i-lucide-calendar-days",
		label: t("dash.schedule"),
	},
	{
		to: "/patientSearch",
		icon: "i-lucide-users-round",
		label: t("dash.viewPatients"),
	},
	{
		to: "/viewContactForms",
		icon: "i-lucide-file-text",
		label: t("dash.contactForms"),
	},
	{
		to: "/viewAppointmentRequests",
		icon: "i-lucide-calendar-plus",
		label: t("dash.appointmentRequests"),
	},
	{
		to: "/assignNeuroSpecialist",
		icon: "i-lucide-clipboard-check",
		label: t("dash.assignSpecialist"),
	},
]);
</script>
