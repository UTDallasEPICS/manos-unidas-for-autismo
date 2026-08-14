<template>
	<DashboardTiles :tiles="tiles" />
</template>

<script lang="ts" setup>
definePageMeta({
	title: "nav.dashboard",
});

const { t } = useI18n();
useDashboardGuard("PARENT");

const tiles = computed(() => [
	{
		to: "/scheduleView",
		icon: "i-lucide-calendar-days",
		label: t("dash.schedule"),
	},
	{
		to: { name: "childSearch" },
		icon: "i-lucide-users",
		label: t("dash.children"),
	},
]);
</script>
