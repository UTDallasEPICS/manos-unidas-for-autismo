<template>
	<div class="flex h-full items-center justify-center gap-16">
		<form class="flex w-70 flex-col gap-5" @submit.prevent="handleSubmit">
			<input
				required
				type="text"
				v-model="email"
				placeholder="User's Email"
				class="rounded-md bg-slate-100 p-2 outline-2 outline-blue-950 outline-solid"
			/>
			<button class="rounded-md bg-blue-950 p-2 text-white">
				Submit
			</button>
		</form>
		<p>or</p>
		<NuxtLink
			class="w-70 rounded-md bg-blue-950 p-2 text-center text-white"
			to="/ContactForm"
		>
			Submit Contact Form
		</NuxtLink>
	</div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { $fetch } from "ofetch";
import {
	ref,
	useCookie,
	refreshCookie,
	reloadNuxtApp,
	useFetch,
	navigateTo,
} from "#imports";

const email = ref("");

const userId = useCookie("userId");

onMounted(async () => {
	await $fetch("/api/updatePermissions", {
		method: "GET",
	});
	refreshCookie("AccessPermission");
	if (userId.value) {
		await navigateTo("/Dashboard");
	}
});

async function handleSubmit() {
	await useFetch("/api/login", {
		method: "GET",
		query: { email },
	});
	refreshCookie("userId");
	refreshCookie("AccessPermission");
	reloadNuxtApp();
}
</script>
