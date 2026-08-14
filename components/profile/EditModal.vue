<!-- Edit patient profile. Static NuxtUI form (replaces the dynamic Form engine).
     Field keys are preserved exactly so useProfileSave still maps them. Parent
     controls visibility via v-model; emits `save` with the form data. -->
<script setup lang="ts">
import type { FormFieldValue } from "~/types/FormConfig/formConfig";
import type { Profile } from "~/types/formTypes";

const props = defineProps<{
	modelValue: boolean;
	profile: Profile;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
	save: [data: Record<string, FormFieldValue>];
}>();

const { t } = useI18n();

const formData = ref<Record<string, FormFieldValue>>({});

const genderOptions = computed(() => [
	{ label: t("profile.female"), value: "FEMALE" },
	{ label: t("profile.male"), value: "MALE" },
	{ label: t("profile.other"), value: "OTHER" },
]);

watch(
	() => props.modelValue,
	(open) => {
		if (!open || !props.profile) return;
		const p = props.profile;
		const ne = p.NonEmployee;
		formData.value = {
			firstName: p.firstName || "",
			middleName: p.middleInitial || "",
			lastName: p.lastName || "",
			email: p.email || "",
			phone: p.phone || "",
			whatsapp: p.whatsApp || "",
			DOB: ne?.dob ? ne.dob.split("T")[0] : "",
			gender: ne?.gender || "",
			address: `${ne?.streetNum || ""} ${ne?.streetName || ""}`.trim(),
			postcode: ne?.postCode || "",
			city: ne?.PostCodeCity?.city || "",
		};
	}
);

function submit() {
	emit("save", formData.value);
}
</script>

<template>
	<UModal
		:open="modelValue"
		:title="t('profile.editTitle')"
		:ui="{ content: 'max-w-2xl' }"
		@update:open="(v) => emit('update:modelValue', v)"
	>
		<template #body>
			<form
				id="edit-profile-form"
				class="grid grid-cols-1 gap-4 sm:grid-cols-2"
				@submit.prevent="submit"
			>
				<UFormField :label="t('profile.firstName')" name="firstName">
					<UInput
						v-model="formData.firstName as string"
						class="w-full"
					/>
				</UFormField>
				<UFormField :label="t('profile.middleName')" name="middleName">
					<UInput
						v-model="formData.middleName as string"
						class="w-full"
					/>
				</UFormField>
				<UFormField :label="t('profile.lastName')" name="lastName">
					<UInput
						v-model="formData.lastName as string"
						class="w-full"
					/>
				</UFormField>
				<UFormField :label="t('profile.email')" name="email">
					<UInput
						v-model="formData.email as string"
						type="email"
						class="w-full"
					/>
				</UFormField>
				<UFormField :label="t('profile.phone')" name="phone">
					<UInput v-model="formData.phone as string" class="w-full" />
				</UFormField>
				<UFormField :label="t('profile.whatsApp')" name="whatsapp">
					<UInput
						v-model="formData.whatsapp as string"
						class="w-full"
					/>
				</UFormField>
				<UFormField :label="t('profile.dob')" name="DOB">
					<UInput
						v-model="formData.DOB as string"
						type="date"
						class="w-full"
					/>
				</UFormField>
				<UFormField :label="t('profile.sex')" name="gender">
					<USelect
						v-model="formData.gender as string"
						:items="genderOptions"
						class="w-full"
					/>
				</UFormField>
				<UFormField
					:label="t('profile.address')"
					name="address"
					class="sm:col-span-2"
				>
					<UInput
						v-model="formData.address as string"
						class="w-full"
					/>
				</UFormField>
				<UFormField :label="t('profile.postcode')" name="postcode">
					<UInput
						v-model="formData.postcode as string"
						class="w-full"
					/>
				</UFormField>
				<UFormField :label="t('profile.city')" name="city">
					<UInput v-model="formData.city as string" class="w-full" />
				</UFormField>
			</form>
		</template>

		<template #footer>
			<div class="flex w-full justify-end gap-3">
				<UButton
					color="neutral"
					variant="outline"
					:label="t('profile.cancel')"
					@click="emit('update:modelValue', false)"
				/>
				<UButton
					type="submit"
					form="edit-profile-form"
					:label="t('profile.save')"
				/>
			</div>
		</template>
	</UModal>
</template>
