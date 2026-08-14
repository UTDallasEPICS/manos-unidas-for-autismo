<!-- Public service-request form. NuxtUI UForm + Zod. Adult/child branch, DR Cédula
     (Luhn) + phone validation, and three enum multi-selects (therapies /
     complementary services / workshops). Posts to /api/sendRequest/form (PUBLIC). -->
<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({ layout: "auth" });

const { t } = useI18n();
const localePath = useLocalePath();
const toast = useToast();

const THERAPIES = [
	"DIAGNOSTIC_ASSESSMENT",
	"EARLY_INTERVENTION",
	"BEHAVIORAL_THERAPY",
	"LEARNING_THERAPY",
	"SPEECH_THERAPY",
	"SOCIAL_SKILLS",
	"SEFVI",
] as const;
const COMPLEMENTARY = [
	"MUSICAL_STIMULATION",
	"PHYSICAL_COGNITIVE_ACTIVITY",
	"LEARNING_IN_MOTION",
	"DYNAMIC_THINKING",
	"FAMILY_THERAPY",
	"COUPLES_THERAPY",
	"SEXUALITY_THERAPY",
	"CHILD_ADOLESCENT_PSYCHOLOGICAL_THERAPY",
	"NUTRITIONAL_CONSULTATION",
	"SCHOOL_VISIT",
] as const;
const WORKSHOPS = ["THEATRE_COMMUNICATION", "TALKS_AND_WORKSHOPS"] as const;

const items = (vals: readonly string[]) =>
	vals.map((v) => ({ label: t(`request.svc_${v}`), value: v }));
const therapyItems = computed(() => items(THERAPIES));
const complementaryItems = computed(() => items(COMPLEMENTARY));
const workshopItems = computed(() => items(WORKSHOPS));
const yesNo = computed(() => [
	{ label: t("request.yes"), value: true },
	{ label: t("request.no"), value: false },
]);
const whoForItems = computed(() => [
	{ label: t("request.whoForSelf"), value: true },
	{ label: t("request.whoForChild"), value: false },
]);

const digits = (v?: string) => (v ?? "").replace(/\D/g, "");
function validCedula(id: string): boolean {
	const clean = digits(id);
	if (!/^\d{11}$/.test(clean)) return false;
	const w = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
	let sum = 0;
	for (let i = 0; i < 10; i++) {
		let p = Number(clean[i]) * w[i]!;
		if (p > 9) p = Math.floor(p / 10) + (p % 10);
		sum += p;
	}
	return (10 - (sum % 10)) % 10 === Number(clean[10]);
}
const phone10 = (v?: string) => /^\d{10}$/.test(digits(v));

const schema = z
	.object({
		isAdult: z.boolean(),
		contactFirstName: z.string().min(1),
		contactMiddleName: z.string().optional(),
		contactLastName: z.string().min(1),
		idNumber: z
			.string()
			.refine(validCedula, { message: t("request.idInvalid") }),
		email: z.string().email(),
		primaryPhone: z
			.string()
			.refine(phone10, { message: t("request.phoneInvalid") }),
		secondaryPhone: z
			.string()
			.optional()
			.refine((v) => !v || phone10(v), {
				message: t("request.phoneInvalid"),
			}),
		whatsapp: z
			.string()
			.refine(phone10, { message: t("request.phoneInvalid") }),
		streetName: z.string().min(1),
		streetNum: z.string().min(1),
		buildingNum: z.string().optional(),
		postCode: z.string().min(1),
		patientFirstName: z.string().optional(),
		patientMiddleName: z.string().optional(),
		patientLastName: z.string().optional(),
		patientAge: z.number().int().min(0),
		diagnosed: z.boolean(),
		returnPatient: z.boolean(),
		previousVisitDate: z.string().optional(),
		wantsEval: z.boolean(),
		hasReferral: z.boolean(),
		therapies: z.array(z.string()).default([]),
		complementaryServices: z.array(z.string()).default([]),
		workshops: z.array(z.string()).default([]),
	})
	.superRefine((d, ctx) => {
		if (d.isAdult === false) {
			if (!d.patientFirstName)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["patientFirstName"],
					message: t("request.required"),
				});
			if (!d.patientLastName)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["patientLastName"],
					message: t("request.required"),
				});
		}
		if (
			!d.therapies.length &&
			!d.complementaryServices.length &&
			!d.workshops.length
		)
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["services"],
				message: t("request.servicesRequired"),
			});
	});
type Schema = z.output<typeof schema>;

function blank() {
	return {
		isAdult: undefined,
		contactFirstName: "",
		contactMiddleName: "",
		contactLastName: "",
		idNumber: "",
		email: "",
		primaryPhone: "",
		secondaryPhone: "",
		whatsapp: "",
		streetName: "",
		streetNum: "",
		buildingNum: "",
		postCode: "",
		patientFirstName: "",
		patientMiddleName: "",
		patientLastName: "",
		patientAge: undefined,
		diagnosed: undefined,
		returnPatient: undefined,
		previousVisitDate: "",
		wantsEval: undefined,
		hasReferral: undefined,
		therapies: [],
		complementaryServices: [],
		workshops: [],
	} as Partial<Schema>;
}
const state = reactive(blank());
const submitting = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
	const d = event.data;
	submitting.value = true;
	try {
		await $fetch("/api/sendRequest/form", {
			method: "POST",
			body: {
				contactFirstName: d.contactFirstName,
				contactMiddleName: d.contactMiddleName || null,
				contactLastName: d.contactLastName,
				idNumber: d.idNumber,
				email: d.email,
				phone: [
					digits(d.primaryPhone),
					digits(d.secondaryPhone),
				].filter(Boolean),
				whatsapp: digits(d.whatsapp),
				streetName: d.streetName,
				streetNum: d.streetNum,
				buildingNum: d.buildingNum || null,
				postCode: d.postCode,
				isAdult: d.isAdult,
				patientFirstName: d.isAdult
					? d.contactFirstName
					: d.patientFirstName,
				patientMiddleName: d.isAdult
					? d.contactMiddleName
					: d.patientMiddleName,
				patientLastName: d.isAdult
					? d.contactLastName
					: d.patientLastName,
				patientAge: d.patientAge,
				diagnosed: d.diagnosed,
				returnPatient: d.returnPatient,
				previousVisitDate: d.previousVisitDate || null,
				wantsEval: d.wantsEval,
				hasReferral: d.hasReferral,
				therapies: d.therapies,
				complementaryServices: d.complementaryServices,
				workshops: d.workshops,
			},
		});
		toast.add({
			title: t("request.success"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
		await navigateTo(localePath("index"));
	} catch {
		toast.add({
			title: t("request.error"),
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
		<h1 class="text-highlighted mb-1 text-2xl font-semibold">
			{{ t("request.title") }}
		</h1>
		<p class="text-muted mb-6 text-sm">{{ t("request.subtitle") }}</p>

		<UForm
			:schema="schema"
			:state="state"
			class="space-y-6"
			@submit="onSubmit"
		>
			<UCard>
				<UFormField
					:label="t('request.whoFor')"
					name="isAdult"
					required
				>
					<URadioGroup v-model="state.isAdult" :items="whoForItems" />
				</UFormField>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{
							state.isAdult === false
								? t("request.sectionContactGuardian")
								: t("request.sectionContact")
						}}
					</h2>
				</template>
				<div class="grid gap-4 sm:grid-cols-3">
					<UFormField
						:label="t('request.firstName')"
						name="contactFirstName"
						required
					>
						<UInput
							v-model="state.contactFirstName"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('request.middleName')"
						name="contactMiddleName"
					>
						<UInput
							v-model="state.contactMiddleName"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('request.lastName')"
						name="contactLastName"
						required
					>
						<UInput
							v-model="state.contactLastName"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						class="sm:col-span-3"
						:label="t('request.id')"
						name="idNumber"
						required
					>
						<UInput
							v-model="state.idNumber"
							placeholder="000-0000000-0"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						class="sm:col-span-3"
						:label="t('request.email')"
						name="email"
						required
					>
						<UInput
							v-model="state.email"
							type="email"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('request.phonePrimary')"
						name="primaryPhone"
						required
					>
						<UInput v-model="state.primaryPhone" class="w-full" />
					</UFormField>
					<UFormField
						:label="t('request.phoneSecondary')"
						name="secondaryPhone"
					>
						<UInput v-model="state.secondaryPhone" class="w-full" />
					</UFormField>
					<UFormField
						:label="t('request.whatsapp')"
						name="whatsapp"
						required
					>
						<UInput v-model="state.whatsapp" class="w-full" />
					</UFormField>
				</div>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("request.sectionAddress") }}
					</h2>
				</template>
				<div class="grid gap-4 sm:grid-cols-3">
					<UFormField
						class="sm:col-span-2"
						:label="t('request.streetName')"
						name="streetName"
						required
					>
						<UInput v-model="state.streetName" class="w-full" />
					</UFormField>
					<UFormField
						:label="t('request.streetNum')"
						name="streetNum"
						required
					>
						<UInput v-model="state.streetNum" class="w-full" />
					</UFormField>
					<UFormField
						:label="t('request.buildingNum')"
						name="buildingNum"
					>
						<UInput v-model="state.buildingNum" class="w-full" />
					</UFormField>
					<UFormField
						:label="t('request.postCode')"
						name="postCode"
						required
					>
						<UInput v-model="state.postCode" class="w-full" />
					</UFormField>
				</div>
			</UCard>

			<UCard v-if="state.isAdult === false">
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("request.sectionPatient") }}
					</h2>
				</template>
				<div class="grid gap-4 sm:grid-cols-3">
					<UFormField
						:label="t('request.patientFirstName')"
						name="patientFirstName"
						required
					>
						<UInput
							v-model="state.patientFirstName"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('request.patientMiddleName')"
						name="patientMiddleName"
					>
						<UInput
							v-model="state.patientMiddleName"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('request.patientLastName')"
						name="patientLastName"
						required
					>
						<UInput
							v-model="state.patientLastName"
							class="w-full"
						/>
					</UFormField>
				</div>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("request.sectionDetails") }}
					</h2>
				</template>
				<div class="space-y-4">
					<UFormField
						:label="
							state.isAdult === false
								? t('request.ageChild')
								: t('request.age')
						"
						name="patientAge"
						required
						class="sm:max-w-40"
					>
						<UInput
							v-model.number="state.patientAge"
							type="number"
							:min="0"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="
							state.isAdult === false
								? t('request.diagnosedChild')
								: t('request.diagnosed')
						"
						name="diagnosed"
						required
					>
						<URadioGroup
							v-model="state.diagnosed"
							:items="yesNo"
							orientation="horizontal"
						/>
					</UFormField>
				</div>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("request.sectionHistory") }}
					</h2>
				</template>
				<div class="space-y-4">
					<UFormField
						:label="t('request.returnPatient')"
						name="returnPatient"
						required
					>
						<URadioGroup
							v-model="state.returnPatient"
							:items="yesNo"
							orientation="horizontal"
						/>
					</UFormField>
					<UFormField
						v-if="state.returnPatient"
						:label="t('request.previousVisitDate')"
						name="previousVisitDate"
						class="sm:max-w-60"
					>
						<UInput
							v-model="state.previousVisitDate"
							type="date"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('request.wantsEval')"
						name="wantsEval"
						required
					>
						<URadioGroup
							v-model="state.wantsEval"
							:items="yesNo"
							orientation="horizontal"
						/>
					</UFormField>
					<UFormField
						:label="t('request.hasReferral')"
						name="hasReferral"
						required
					>
						<URadioGroup
							v-model="state.hasReferral"
							:items="yesNo"
							orientation="horizontal"
						/>
					</UFormField>
				</div>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("request.sectionServices") }}
					</h2>
				</template>
				<UFormField name="services">
					<div class="space-y-5">
						<UCheckboxGroup
							v-model="state.therapies"
							:items="therapyItems"
							:legend="t('request.therapiesLabel')"
						/>
						<UCheckboxGroup
							v-model="state.complementaryServices"
							:items="complementaryItems"
							:legend="t('request.complementaryLabel')"
						/>
						<UCheckboxGroup
							v-model="state.workshops"
							:items="workshopItems"
							:legend="t('request.workshopsLabel')"
						/>
					</div>
				</UFormField>
			</UCard>

			<div class="flex justify-end">
				<UButton
					type="submit"
					size="lg"
					:loading="submitting"
					:label="t('request.submit')"
				/>
			</div>

			<p class="text-muted pt-2 text-center text-sm">
				{{ t("request.footer") }}
			</p>
		</UForm>
	</div>
</template>
