<template>
	<nav
		class="flex items-center justify-between bg-blue-950 p-4 text-white shadow-md"
	>
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

		<!-- Logout Button -->
		<div>
			<button class="cursor-pointer" @click="logout">
				<LogOut />
			</button>
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
			<div
				class="bg-opacity-50 fixed inset-0 z-10"
				@click="toggleMenu"
			></div>

			<!-- Slide-out Menu Panel -->
			<div
				class="relative z-20 ml-auto w-2/3 max-w-xs bg-white p-4 shadow-lg"
			>
				<!-- Close button positioned on the right -->
				<div class="mb-4 flex justify-end">
					<button
						@click="toggleMenu"
						class="p-1"
						aria-label="Close menu"
					>
						<X color="black" :size="30" />
					</button>
				</div>

				<nav class="flex flex-col gap-4">
					<NuxtLink
						v-for="(link, idx) in userLinks[userType]"
						:key="idx"
						:to="link.path"
						class="py-2 text-lg hover:underline"
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
import { X, LogOut } from "lucide-vue-next";
import { ref, useCookie, navigateTo } from "#imports";

// Replace this with the actual user role from auth/session
const userType = ref<"user support" | "it support" | "other">("user support");
const permissions = useCookie("AccessPermission");

const userLinks = {
	"user support": [
		{ path: "/Schedule", label: "Manage Schedule" },
		{ path: "/Patients", label: "Patient Info" },
		{ path: "/ContactForm", label: "Contact Forms" },
	],
	"it support": [
		{ path: "/Users", label: "User Accounts" },
		{ path: "/Settings", label: "System Settings" },
	],
	other: [
		{ path: "/Schedule", label: "My Schedule" },
		{ path: "/Notes", label: "Therapy Notes" },
		{ path: "/Profile", label: "Profile" },
	],
};

const isMenuOpen = ref(false);
function toggleMenu() {
	isMenuOpen.value = !isMenuOpen.value;
}

async function logout() {
	const userId = useCookie("userId");
	userId.value = null;
	permissions.value = null;

	// not having await seems to cause an issue with the order of page components
	//  putting the footer above the page content
	await navigateTo("/");
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
