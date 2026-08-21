<template>
	<DashboardTiles :tiles="tiles" />
</template>

<script lang="ts" setup>
definePageMeta({
	title: "nav.dashboard",
});

const { t } = useI18n();
useDashboardGuard("ADMIN");

const tiles = computed(() => [
	{
		to: "/scheduleView",
		icon: "i-lucide-calendar-days",
		label: t("dash.schedule"),
	},
	{
		to: "/viewContactForms",
		icon: "i-lucide-file-text",
		label: t("dash.contactForms"),
	},
	{
		to: "/employees",
		icon: "i-lucide-users",
		label: t("dash.employees"),
	},
	{
		to: "/employees/create",
		icon: "i-lucide-user-plus",
		label: t("dash.createAccount"),
	},
]);
</script>
