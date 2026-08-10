<template>
	<DashboardTiles :tiles="tiles" />
</template>

<script lang="ts" setup>
const { t } = useI18n();
useDashboardGuard("IT_SERVICE");

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
		to: "/admin/employeeSearch",
		icon: "i-lucide-users",
		label: t("dash.employees"),
	},
	{
		to: "/admin/createAccount",
		icon: "i-lucide-user-plus",
		label: t("dash.createAccount"),
	},
]);
</script>
