<template>
	<DashboardButtonGrid :buttons="adminButtons" />
</template>

<script lang="ts" setup>
import { Calendar, FileText, Users, UserPlus } from "lucide-vue-next";

useDashboardGuard("ADMIN");

const adminButtons = [
	{
		path: "/scheduleView",
		icon: Calendar,
		label: "Schedule",
	},
	{
		path: "/viewContactForms",
		icon: FileText,
		label: "View New Contact Forms",
	},
	{
		path: "/admin/employeeSearch",
		icon: Users,
		label: "View Employees",
	},
	{
		path: "/admin/createAccount",
		icon: UserPlus,
		label: "Create Account",
	},
];
</script>
