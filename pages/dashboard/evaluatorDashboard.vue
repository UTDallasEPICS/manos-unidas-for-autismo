<template>
	<DashboardTiles :tiles="tiles" />
</template>

<script lang="ts" setup>
definePageMeta({
	title: "nav.dashboard",
});

const { t } = useI18n();
useDashboardGuard("EVALUATOR");

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
	{
		to: "/viewContactForms",
		icon: "i-lucide-file-text",
		label: t("dash.contactForms"),
	},
	{
		to: { name: "evaluator-createReferral" },
		icon: "i-lucide-clipboard-plus",
		label: t("dash.createReferral"),
	},
	{
		to: { name: "evaluator-myReferrals" },
		icon: "i-lucide-list-checks",
		label: t("dash.myReferrals"),
	},
]);
</script>
