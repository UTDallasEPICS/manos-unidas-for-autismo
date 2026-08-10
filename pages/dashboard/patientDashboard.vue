<template>
	<DashboardButtonGrid :buttons="patientButtons" />
</template>

<script lang="ts" setup>
import { Calendar, Clipboard, History, User } from "lucide-vue-next";

useDashboardGuard("PATIENT");
const { userId } = useAuthState();

const patientButtons = [
	{
		path: "/scheduleView",
		icon: Calendar,
		label: "SCHEDULE",
	},
	{
		path: { name: "myProfile-id", params: { id: userId.value } },
		icon: User,
		label: "VIEW PROFILE",
	},
	{
		path: { name: "requestForm" },
		icon: Clipboard,
		label: "REQUEST SERVICES",
	},
	{
		path: "/patient/appointments",
		icon: History,
		label: "MY APPOINTMENTS",
	},
];
</script>
