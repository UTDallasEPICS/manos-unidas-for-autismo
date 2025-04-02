<template>
	<nav
		class="flex flex-wrap items-center justify-between gap-4 p-4 shadow-md sm:flex-nowrap sm:gap-8"
	>
		<!-- Logo -->
		<div class="text-xl font-bold">Connected Care</div>

		<!-- Navigation Links -->
		<div class="flex flex-wrap gap-4" v-if="userType === 'user support'">
			<a href="/schedule" class="hover:underline">Manage Schedule</a>
			<a href="/patients" class="hover:underline">Patient Info</a>
			<a href="/forms" class="hover:underline">Contact Forms</a>
		</div>

		<div class="flex flex-wrap gap-4" v-else-if="userType === 'it support'">
			<a href="/users" class="hover:underline">User Accounts</a>
			<a href="/settings" class="hover:underline">System Settings</a>
		</div>

		<div class="flex flex-wrap gap-4" v-else>
			<a href="/my-schedule" class="hover:underline">My Schedule</a>
			<a href="/notes" class="hover:underline">Therapy Notes</a>
			<a href="/profile" class="hover:underline">Profile</a>
		</div>
	</nav>
</template>

<script lang="ts" setup>
import { ref } from "vue";

// Replace this with actual user role from auth/session
const userType = ref<"user support" | "it support" | "other">("user support");
</script>
