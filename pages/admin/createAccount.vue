<!-- Admin: create a staff account. Posts to POST /api/admin/account (ADMIN-only),
     which creates a User with a real UserType and, for therapists, connects
     Specializations. PATIENT/PARENT are relationship-derived, not account types,
     so they are intentionally not offered here. -->
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
	contactPref: "EMAIL",
	accountType: "",
	specializations: [] as string[],
});

const contactItems = computed(() => [
	{ label: t("createAccount.prefEmail"), value: "EMAIL" },
	{ label: t("createAccount.prefPhone"), value: "PHONE" },
	{ label: t("createAccount.prefWhatsApp"), value: "WHATS_APP" },
]);
const typeItems = computed(() => [
	{ label: t("createAccount.typeAdmin"), value: "ADMIN" },
	{ label: t("createAccount.typeUserService"), value: "USER_SERVICE" },
	{ label: t("createAccount.typeItService"), value: "IT_SERVICE" },
	{ label: t("createAccount.typeTherapist"), value: "THERAPIST" },
	{ label: t("createAccount.typeEvaluator"), value: "EVALUATOR" },
]);

const isTherapist = computed(() => form.accountType === "THERAPIST");

// Existing specialization names for the therapist picker (client-only; the
// endpoint is ADMIN-gated and only relevant once the form is interactive).
const { data: specializationOptions } = useFetch<string[]>(
	"/api/admin/specializations",
	{ server: false, default: () => [] }
);

const submitting = ref(false);
const canSubmit = computed(
	() =>
		!!form.firstName.trim() &&
		!!form.lastName.trim() &&
		!!form.email.trim() &&
		!!form.phone.trim() &&
		!!form.accountType
);

function extractErrorMessage(err: unknown, fallback: string): string {
	if (err && typeof err === "object" && "data" in err) {
		const data = (
			err as { data?: { statusMessage?: string; message?: string } }
		).data;
		if (data?.statusMessage) return data.statusMessage;
		if (data?.message) return data.message;
	}
	return fallback;
}

function resetForm() {
	Object.assign(form, {
		firstName: "",
		middleInitial: "",
		lastName: "",
		email: "",
		phone: "",
		whatsapp: "",
		contactPref: "EMAIL",
		accountType: "",
		specializations: [],
	});
}

async function submit() {
	if (!canSubmit.value || submitting.value) return;
	submitting.value = true;
	try {
		await $fetch("/api/admin/account", {
			method: "POST",
			body: {
				fName: form.firstName,
				mInit: form.middleInitial || undefined,
				lName: form.lastName,
				email: form.email,
				phone: form.phone,
				whatsApp: form.whatsapp || undefined,
				contactPref: form.contactPref,
				type: form.accountType,
				specializations: isTherapist.value ? form.specializations : [],
			},
		});
		toast.add({
			title: t("createAccount.success"),
			color: "success",
			icon: "i-lucide-user-check",
		});
		resetForm();
	} catch (err) {
		toast.add({
			title: extractErrorMessage(err, t("createAccount.error")),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	} finally {
		submitting.value = false;
	}
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
				>
					<UInput v-model="form.whatsapp" type="tel" class="w-full" />
				</UFormField>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

			<UFormField
				v-if="isTherapist"
				:label="t('createAccount.specializations')"
				name="specializations"
			>
				<USelectMenu
					v-model="form.specializations"
					:items="specializationOptions"
					multiple
					create-item
					:placeholder="t('createAccount.selectSpecializations')"
					class="w-full"
				/>
			</UFormField>

			<div class="flex justify-end">
				<UButton
					type="submit"
					size="lg"
					:label="t('createAccount.submit')"
					:loading="submitting"
					:disabled="!canSubmit"
				/>
			</div>
		</form>
	</div>
</template>
