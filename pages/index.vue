<!-- Landing = login. Logged-out visitors see this (middleware routes anonymous
     users here); logged-in users are redirected to their dashboard (#210). Also
     points new patients at the public service-request form. The old home.png
     hero returns as a fixed, scrimmed full-screen background behind the card. -->
<script setup lang="ts">
import { authClient } from "~/utils/auth-client";
import { useDashboardNavigation } from "~/composables/auth/useDashboardNavigation";

definePageMeta({ layout: "auth" });

const { t } = useI18n();
const localePath = useLocalePath();

const email = ref("");
const otp = ref("");
const step = ref<"email" | "otp">("email");
const loading = ref(false);
const error = ref("");

async function sendCode() {
	error.value = "";
	loading.value = true;
	try {
		const { error: e } = await authClient.emailOtp.sendVerificationOtp({
			email: email.value,
			type: "sign-in",
		});
		if (e) {
			error.value = e.message ?? t("login.sendError");
			return;
		}
		step.value = "otp";
	} finally {
		loading.value = false;
	}
}

async function verify() {
	error.value = "";
	loading.value = true;
	try {
		const { error: e } = await authClient.signIn.emailOtp({
			email: email.value,
			otp: otp.value,
		});
		if (e) {
			error.value = e.message ?? t("login.invalidCode");
			return;
		}
		const { refresh } = useAuthState();
		await refresh();
		const { dashboardNavigation } = useDashboardNavigation();
		dashboardNavigation();
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<div>
		<!-- Fixed full-viewport background image + scrim (sits behind the solid
		     header and the login content). -->
		<div
			class="fixed inset-0 z-0 bg-[url('/home.png')] bg-cover bg-center"
		/>
		<div class="bg-default/90 fixed inset-0 z-0" />

		<div
			class="relative z-10 mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center gap-6 py-8"
		>
			<div class="text-center">
				<img
					src="/fmua-logo.svg"
					alt="FMUA"
					class="mx-auto mb-6 h-auto w-64 max-w-[80%] sm:w-72"
				/>
				<h1 class="text-highlighted text-2xl font-semibold">
					{{ t("login.title") }}
				</h1>
				<p class="text-default mt-1 text-sm">
					{{ t("login.subtitle") }}
				</p>
			</div>

			<UCard>
				<form
					v-if="step === 'email'"
					class="space-y-4"
					@submit.prevent="sendCode"
				>
					<UFormField :label="t('login.email')" name="email">
						<UInput
							v-model="email"
							type="email"
							autofocus
							required
							class="w-full"
						/>
					</UFormField>
					<UAlert
						v-if="error"
						color="error"
						variant="subtle"
						icon="i-lucide-triangle-alert"
						:title="error"
					/>
					<UButton
						type="submit"
						block
						size="lg"
						:loading="loading"
						:label="t('login.sendCode')"
					/>
				</form>

				<form v-else class="space-y-4" @submit.prevent="verify">
					<p class="text-muted text-sm">
						{{ t("login.codeSentTo", { email }) }}
					</p>
					<UFormField :label="t('login.code')" name="otp">
						<UInput
							v-model="otp"
							inputmode="numeric"
							autocomplete="one-time-code"
							autofocus
							required
							class="w-full"
						/>
					</UFormField>
					<UAlert
						v-if="error"
						color="error"
						variant="subtle"
						icon="i-lucide-triangle-alert"
						:title="error"
					/>
					<UButton
						type="submit"
						block
						size="lg"
						:loading="loading"
						:label="t('login.verify')"
					/>
					<div class="flex items-center justify-between">
						<UButton
							variant="link"
							color="neutral"
							size="sm"
							:label="t('login.resend')"
							@click="sendCode"
						/>
						<UButton
							variant="link"
							color="neutral"
							size="sm"
							:label="t('login.differentEmail')"
							@click="step = 'email'"
						/>
					</div>
				</form>
			</UCard>

			<UCard>
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="min-w-0">
						<p class="text-highlighted font-medium">
							{{ t("login.newPatientTitle") }}
						</p>
						<p class="text-muted text-sm">
							{{ t("login.newPatientBody") }}
						</p>
					</div>
					<UButton
						:to="localePath('requestForm')"
						color="neutral"
						variant="outline"
						icon="i-lucide-clipboard-plus"
						:label="t('login.requestServices')"
					/>
				</div>
			</UCard>
		</div>
	</div>
</template>
