<!-- Admin: create a new account. Rebuilt on NuxtUI. NOTE: there is no
     account-creation endpoint yet, so submit only surfaces that — the original
     was a non-functional stub (dead button, unbound inputs). Fields are now
     bound so wiring a POST later is trivial. -->
<script setup lang="ts">
definePageMeta({
	title: "createAccount.title",
});

const { t } = useI18n();
const toast = useToast();

const form = reactive({
	firstName: "",
	middleInitial: "",
	lastName: "",
	email: "",
	phone: "",
	whatsapp: "",
	gender: "",
	contactPref: "",
	accountType: "",
});

const genderItems = computed(() => [
	{ label: t("createAccount.male"), value: "Male" },
	{ label: t("createAccount.female"), value: "Female" },
	{ label: t("createAccount.other"), value: "Other" },
]);
const contactItems = computed(() => [
	{ label: t("createAccount.prefEmail"), value: "Email" },
	{ label: t("createAccount.prefText"), value: "Text" },
	{ label: t("createAccount.prefOther"), value: "Other" },
]);
const typeItems = computed(() => [
	{ label: t("createAccount.typePatient"), value: "Patient" },
	{ label: t("createAccount.typeTherapist"), value: "Therapist" },
	{ label: t("createAccount.typeAdmin"), value: "Admin" },
	{ label: t("createAccount.typeParent"), value: "Parent" },
]);

function submit() {
	// No backend endpoint for account creation exists yet.
	toast.add({
		title: t("createAccount.notAvailable"),
		color: "warning",
		icon: "i-lucide-info",
	});
}
</script>

<template>
	<div class="mx-auto w-full max-w-3xl">
		<form class="space-y-6" @submit.prevent="submit">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<UFormField
					:label="t('createAccount.firstName')"
					name="firstName"
					required
				>
					<UInput v-model="form.firstName" class="w-full" />
				</UFormField>
				<UFormField
					:label="t('createAccount.middleInitial')"
					name="middleInitial"
				>
					<UInput
						v-model="form.middleInitial"
						maxlength="1"
						class="w-full"
					/>
				</UFormField>
				<UFormField
					:label="t('createAccount.lastName')"
					name="lastName"
					required
				>
					<UInput v-model="form.lastName" class="w-full" />
				</UFormField>
				<UFormField
					:label="t('createAccount.email')"
					name="email"
					required
				>
					<UInput v-model="form.email" type="email" class="w-full" />
				</UFormField>
				<UFormField
					:label="t('createAccount.phone')"
					name="phone"
					required
				>
					<UInput v-model="form.phone" type="tel" class="w-full" />
				</UFormField>
				<UFormField
					:label="t('createAccount.whatsapp')"
					name="whatsapp"
					required
				>
					<UInput v-model="form.whatsapp" type="tel" class="w-full" />
				</UFormField>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<UFormField
					:label="t('createAccount.gender')"
					name="gender"
					required
				>
					<USelect
						v-model="form.gender"
						:items="genderItems"
						:placeholder="t('createAccount.selectGender')"
						class="w-full"
					/>
				</UFormField>
				<UFormField
					:label="t('createAccount.contactPref')"
					name="contactPref"
					required
				>
					<USelect
						v-model="form.contactPref"
						:items="contactItems"
						:placeholder="t('createAccount.selectPref')"
						class="w-full"
					/>
				</UFormField>
				<UFormField
					:label="t('createAccount.accountType')"
					name="accountType"
					required
				>
					<USelect
						v-model="form.accountType"
						:items="typeItems"
						:placeholder="t('createAccount.selectType')"
						class="w-full"
					/>
				</UFormField>
			</div>

			<div class="flex justify-end">
				<UButton
					type="submit"
					size="lg"
					:label="t('createAccount.submit')"
				/>
			</div>
		</form>
	</div>
</template>
