<template>
	<div class="font-karla">
		<div
			class="flex min-h-[70vh] flex-col items-center justify-center gap-8"
		>
			<!-- Logo -->
			<img src="/manos-unidas-logo.jpg" alt="Logo" class="w-60" />

			<!-- Login Form -->
			<form
				v-if="step === 'email'"
				class="flex w-70 flex-col gap-5"
				@submit.prevent="handleSendOtp"
			>
				<input
					required
					type="text"
					v-model="email"
					placeholder="User's Email"
					class="rounded-md bg-slate-100 p-2 outline-2 outline-blue-950 outline-solid"
				/>
				<button
					:disabled="loading"
					class="rounded-md bg-blue-950 p-2 text-white"
				>
					{{ loading ? "Sending..." : "Send code" }}
				</button>
				<p v-if="error" class="text-sm text-red-600">{{ error }}</p>
			</form>

			<form
				v-else
				class="flex w-70 flex-col gap-5"
				@submit.prevent="handleVerifyOtp"
			>
				<p class="text-sm text-slate-600">
					Enter the code sent to {{ email }}
				</p>
				<input
					required
					type="text"
					v-model="otp"
					placeholder="6-digit code"
					inputmode="numeric"
					autocomplete="one-time-code"
					class="rounded-md bg-slate-100 p-2 outline-2 outline-blue-950 outline-solid"
				/>
				<button
					:disabled="loading"
					class="rounded-md bg-blue-950 p-2 text-white disabled:opacity-50"
				>
					{{ loading ? "Verifying..." : "Log in" }}
				</button>
				<p v-if="error" class="text-sm text-red-600">{{ error }}</p>
				<button
					type="button"
					class="text-sm text-blue-950 underline"
					:disabled="loading"
					@click="handleSendOtp"
				>
					Resend code
				</button>
				<button
					type="button"
					class="text-sm text-slate-500 underline"
					@click="step = 'email'"
				>
					Use a different email
				</button>
			</form>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "#imports";
import { authClient } from "~/utils/auth-client";
import { useDashboardNavigation } from "~/composables/auth/useDashboardNavigation";

const email = ref("");
const otp = ref("");
const step = ref<"email" | "otp">("email");
const loading = ref(false);
const error = ref("");

async function handleSendOtp() {
	error.value = "";
	loading.value = true;
	try {
		const { error: sendError } =
			await authClient.emailOtp.sendVerificationOtp({
				email: email.value,
				type: "sign-in",
			});
		if (sendError) {
			error.value = sendError.message ?? "Failed to send code.";
			return;
		}
		step.value = "otp";
	} finally {
		loading.value = false;
	}
}

async function handleVerifyOtp() {
	error.value = "";
	loading.value = true;
	try {
		const { error: verifyError } = await authClient.signIn.emailOtp({
			email: email.value,
			otp: otp.value,
		});
		if (verifyError) {
			error.value = verifyError.message ?? "Invalid or expired code.";
			return;
		}

		// Fetch fresh permissions after login
		const { fetchMe } = useAuthState();
		await fetchMe();

		const { dashboardNavigation } = useDashboardNavigation();
		dashboardNavigation();
	} finally {
		loading.value = false;
	}
}
</script>
