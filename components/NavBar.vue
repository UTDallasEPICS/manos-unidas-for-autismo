<template>
	<nav class="flex items-center justify-between p-4 shadow-md">
		<!-- Logo -->
		<div class="text-xl font-bold">Connected Care</div>

		<!-- Hamburger menu button: visible only on mobile -->
		<div class="sm:hidden">
			<button @click="toggleMenu" aria-label="Toggle menu">
				<!-- Simple hamburger icon -->
				<svg
					class="h-6 w-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
		</div>

		<!-- Desktop Navigation Links -->
		<div class="hidden gap-4 sm:flex">
			<NuxtLink
				v-for="(link, idx) in userLinks[userType]"
				:key="idx"
				:to="link.path"
				class="hover:underline"
			>
				{{ link.label }}
			</NuxtLink>
		</div>
	</nav>

	<!-- Mobile Pop-Out Menu -->
	<transition name="slide">
		<div
			v-if="isMenuOpen"
			class="fixed inset-0 z-50 flex"
			aria-modal="true"
			role="dialog"
		>
			<!-- Backdrop -->
			<div class="fixed inset-0 z-10" @click="toggleMenu"></div>

			<!-- Slide-out Menu Panel -->
			<div
				class="relative z-20 ml-auto w-2/3 max-w-xs bg-white p-4 shadow-lg"
			>
				<button
					@click="toggleMenu"
					class="mb-4 text-xl"
					aria-label="Close menu"
				>
					&times;
				</button>
				<nav class="flex flex-col gap-4">
					<NuxtLink
						v-for="(link, idx) in userLinks[userType]"
						:key="idx"
						:to="link.path"
						class="hover:underline"
						@click="toggleMenu"
					>
						{{ link.label }}
					</NuxtLink>
				</nav>
			</div>
		</div>
	</transition>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Replace this with the actual user role from auth/session
const userType = ref<"user support" | "it support" | "other">("user support");

const userLinks = {
	"user support": [
		{ path: "/schedule", label: "Manage Schedule" },
		{ path: "/patients", label: "Patient Info" },
		{ path: "/forms", label: "Contact Forms" },
	],
	"it support": [
		{ path: "/users", label: "User Accounts" },
		{ path: "/settings", label: "System Settings" },
	],
	other: [
		{ path: "/my-schedule", label: "My Schedule" },
		{ path: "/notes", label: "Therapy Notes" },
		{ path: "/profile", label: "Profile" },
	],
};

const isMenuOpen = ref(false);
function toggleMenu() {
	isMenuOpen.value = !isMenuOpen.value;
}
</script>

<style scoped>
/* Slide transition for the mobile menu */
.slide-enter-active,
.slide-leave-active {
	transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
	transform: translateX(100%);
}
.slide-enter-to,
.slide-leave-from {
	transform: translateX(0);
}
</style>
