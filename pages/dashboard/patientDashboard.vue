<template>
	<DashboardTiles :tiles="tiles" />
</template>

<script lang="ts" setup>
definePageMeta({
	title: "nav.dashboard",
});

const { t } = useI18n();
useDashboardGuard("PATIENT");
const { userId } = useAuthState();

const tiles = computed(() => [
	{
		to: "/scheduleView",
		icon: "i-lucide-calendar-days",
		label: t("dash.schedule"),
	},
	{
		to: { name: "myProfile-id", params: { id: userId.value } },
		icon: "i-lucide-user",
		label: t("dash.profile"),
	},
	{
		to: { name: "requestForm" },
		icon: "i-lucide-clipboard",
		label: t("dash.requestServices"),
	},
	{
		to: "/patient/appointments",
		icon: "i-lucide-history",
		label: t("dash.appointments"),
	},
]);
</script>
