<template>
	<DashboardTiles :tiles="tiles" />
</template>

<script lang="ts" setup>
const { t } = useI18n();
useDashboardGuard("THERAPIST");

const tiles = computed(() => [
	{
		to: "/scheduleView",
		icon: "i-lucide-calendar-days",
		label: t("dash.schedule"),
	},
	{
		to: { name: "patient-patientSearch" },
		icon: "i-lucide-users-round",
		label: t("dash.viewPatients"),
	},
]);
</script>
