<template>
	<DashboardButtonGrid :buttons="evaluatorButtons" />
</template>
<script lang="ts" setup>
import {
	Calendar,
	ClipboardPlus,
	FileText,
	ListChecks,
	Users,
} from "lucide-vue-next";
useDashboardGuard("EVALUATOR");

const evaluatorButtons = [
	{
		path: "/scheduleView",
		icon: Calendar,
		label: "VIEW SCHEDULE",
	},
	{
		path: { name: "patient-patientSearch" },
		icon: Users,
		label: "VIEW PATIENTS",
	},
	{
		path: "/viewContactForms",
		icon: FileText,
		label: "VIEW NEW CONTACT FORMS",
	},
	{
		path: { name: "evaluator-createReferral" },
		icon: ClipboardPlus,
		label: "CREATE REFERRAL",
	},
	{
		path: { name: "evaluator-myReferrals" },
		icon: ListChecks,
		label: "MY REFERRALS",
	},
];
</script>
