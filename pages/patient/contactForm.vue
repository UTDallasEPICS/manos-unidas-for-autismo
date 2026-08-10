<!-- Public patient registration (contact form). Canonical NuxtUI form reference:
     UForm + Zod validation + UFormField, grouped in UCards, fully i18n'd, with
     inline field errors and toast feedback. Posts to /api/contactForm/form
     (PUBLIC). Enum values mirror the Prisma enums the server validates against. -->
<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({ layout: "auth" });

const { t } = useI18n();
const toast = useToast();

const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
const CONTACT_PREFS = ["EMAIL", "PHONE", "WHATS_APP"] as const;
const INSURANCES = [
	"SENASA_CONTRIBUTIVO",
	"SENASA_SUBSIDIADO",
	"ARS_HUMANO",
	"MAPFRE",
	"LA_MONUMENTAL",
	"ARS_UNIVERSAL",
	"ARS_META_SALUD",
	"ARS_PLAN_SALUD_BANCO_CENTRAL",
	"RENACER",
	"OTRO",
] as const;

// Insurance names are proper nouns — same in both languages, not translated.
const insuranceItems = [
	{ label: "SENASA Contributivo", value: "SENASA_CONTRIBUTIVO" },
	{ label: "SENASA Subsidiado", value: "SENASA_SUBSIDIADO" },
	{ label: "ARS Humano", value: "ARS_HUMANO" },
	{ label: "MAPFRE", value: "MAPFRE" },
	{ label: "La Monumental", value: "LA_MONUMENTAL" },
	{ label: "ARS Universal", value: "ARS_UNIVERSAL" },
	{ label: "ARS Meta Salud", value: "ARS_META_SALUD" },
	{
		label: "ARS Plan Salud Banco Central",
		value: "ARS_PLAN_SALUD_BANCO_CENTRAL",
	},
	{ label: "Renacer", value: "RENACER" },
	{ label: "Otro", value: "OTRO" },
];

const genderItems = computed(() =>
	GENDERS.map((v) => ({ label: t(`signup.gender_${v}`), value: v }))
);
const contactPrefItems = computed(() =>
	CONTACT_PREFS.map((v) => ({ label: t(`signup.pref_${v}`), value: v }))
);

const schema = z.object({
	fName: z.string().min(1),
	mInit: z.string().max(1).optional(),
	lName: z.string().min(1),
	gender: z.enum(GENDERS),
	dob: z.string().min(1),
	nationality: z.string().min(1),
	identification: z.string().min(1),
	streetNum: z.number(),
	streetName: z.string().min(1),
	buildingNum: z.number().optional(),
	postcode: z.number(),
	city: z.string().min(1),
	email: z.string().email(),
	phone: z.string().min(1),
	whatsapp: z.string().optional(),
	contactPref: z.enum(CONTACT_PREFS),
	insurance: z.enum(INSURANCES),
	hasBeenPatient: z.boolean(),
	isDiagnosed: z.boolean(),
	wantsEval: z.boolean(),
	medication: z.string().optional(),
	allergies: z.string().optional(),
	diet: z.string().optional(),
	parentFirstName: z.string().optional(),
	parentLastName: z.string().optional(),
	comment: z.string().optional(),
});
type Schema = z.output<typeof schema>;

function blank() {
	return {
		fName: "",
		mInit: "",
		lName: "",
		gender: undefined,
		dob: "",
		nationality: "",
		identification: "",
		streetNum: undefined,
		streetName: "",
		buildingNum: undefined,
		postcode: undefined,
		city: "",
		email: "",
		phone: "",
		whatsapp: "",
		contactPref: "PHONE",
		insurance: undefined,
		hasBeenPatient: false,
		isDiagnosed: false,
		wantsEval: false,
		medication: "",
		allergies: "",
		diet: "",
		parentFirstName: "",
		parentLastName: "",
		comment: "",
	} as Partial<Schema>;
}

const state = reactive(blank());
const submitting = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
	const d = event.data;
	submitting.value = true;
	try {
		await $fetch("/api/contactForm/form", {
			method: "POST",
			body: {
				fName: d.fName,
				mInit: d.mInit || undefined,
				lName: d.lName,
				gender: d.gender,
				dob: d.dob,
				nationality: d.nationality,
				identification: d.identification,
				streetName: d.streetName,
				streetNum: d.streetNum,
				buildingNum: d.buildingNum ?? undefined,
				postcode: d.postcode,
				city: d.city,
				contactPref: d.contactPref,
				email: d.email,
				phone: d.phone,
				whatsapp: d.whatsapp || undefined,
				isDiagnosed: d.isDiagnosed,
				insurance: d.insurance,
				hasBeenPatient: d.hasBeenPatient,
				wantsEval: d.wantsEval,
				status: "PROCESSING",
				comment: d.comment || undefined,
				medication: d.medication || undefined,
				allergies: d.allergies || undefined,
				diet: d.diet || undefined,
				parentFirstName: d.parentFirstName || undefined,
				parentLastName: d.parentLastName || undefined,
			},
		});
		toast.add({
			title: t("signup.success"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
		Object.assign(state, blank());
	} catch (err: unknown) {
		const e = err as { data?: { message?: string }; statusCode?: number };
		const dup =
			e?.statusCode === 409 ||
			/exists|unique|P2002/i.test(e?.data?.message ?? "");
		toast.add({
			title: dup ? t("signup.errorDuplicate") : t("signup.error"),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<div class="mx-auto w-full max-w-2xl">
		<h1 class="text-highlighted mb-1 text-2xl font-semibold">
			{{ t("signup.title") }}
		</h1>
		<p class="text-muted mb-6 text-sm">{{ t("signup.subtitle") }}</p>

		<UForm
			:schema="schema"
			:state="state"
			class="space-y-6"
			@submit="onSubmit"
		>
			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("signup.sectionPatient") }}
					</h2>
				</template>
				<div class="grid gap-4 sm:grid-cols-2">
					<UFormField
						:label="t('signup.fName')"
						name="fName"
						required
					>
						<UInput v-model="state.fName" class="w-full" />
					</UFormField>
					<UFormField :label="t('signup.mInit')" name="mInit">
						<UInput
							v-model="state.mInit"
							maxlength="1"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('signup.lName')"
						name="lName"
						required
					>
						<UInput v-model="state.lName" class="w-full" />
					</UFormField>
					<UFormField
						:label="t('signup.gender')"
						name="gender"
						required
					>
						<USelect
							v-model="state.gender"
							:items="genderItems"
							class="w-full"
						/>
					</UFormField>
					<UFormField :label="t('signup.dob')" name="dob" required>
						<UInput
							v-model="state.dob"
							type="date"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('signup.nationality')"
						name="nationality"
						required
					>
						<UInput v-model="state.nationality" class="w-full" />
					</UFormField>
					<UFormField
						:label="t('signup.identification')"
						name="identification"
						required
					>
						<UInput v-model="state.identification" class="w-full" />
					</UFormField>
				</div>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("signup.sectionAddress") }}
					</h2>
				</template>
				<div class="grid gap-4 sm:grid-cols-2">
					<UFormField
						:label="t('signup.streetNum')"
						name="streetNum"
						required
					>
						<UInput
							v-model.number="state.streetNum"
							type="number"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('signup.streetName')"
						name="streetName"
						required
					>
						<UInput v-model="state.streetName" class="w-full" />
					</UFormField>
					<UFormField
						:label="t('signup.buildingNum')"
						name="buildingNum"
					>
						<UInput
							v-model.number="state.buildingNum"
							type="number"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('signup.postcode')"
						name="postcode"
						required
					>
						<UInput
							v-model.number="state.postcode"
							type="number"
							class="w-full"
						/>
					</UFormField>
					<UFormField :label="t('signup.city')" name="city" required>
						<UInput v-model="state.city" class="w-full" />
					</UFormField>
				</div>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("signup.sectionContact") }}
					</h2>
				</template>
				<div class="grid gap-4 sm:grid-cols-2">
					<UFormField
						:label="t('signup.email')"
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
						:label="t('signup.phone')"
						name="phone"
						required
					>
						<UInput v-model="state.phone" class="w-full" />
					</UFormField>
					<UFormField :label="t('signup.whatsapp')" name="whatsapp">
						<UInput v-model="state.whatsapp" class="w-full" />
					</UFormField>
					<UFormField
						:label="t('signup.contactPref')"
						name="contactPref"
					>
						<USelect
							v-model="state.contactPref"
							:items="contactPrefItems"
							class="w-full"
						/>
					</UFormField>
				</div>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("signup.sectionGuardian") }}
					</h2>
				</template>
				<div class="grid gap-4 sm:grid-cols-2">
					<UFormField
						:label="t('signup.parentFirstName')"
						name="parentFirstName"
					>
						<UInput
							v-model="state.parentFirstName"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('signup.parentLastName')"
						name="parentLastName"
					>
						<UInput v-model="state.parentLastName" class="w-full" />
					</UFormField>
				</div>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-highlighted font-medium">
						{{ t("signup.sectionServices") }}
					</h2>
				</template>
				<div class="space-y-4">
					<UFormField
						:label="t('signup.insurance')"
						name="insurance"
						required
					>
						<USelect
							v-model="state.insurance"
							:items="insuranceItems"
							class="w-full sm:max-w-sm"
						/>
					</UFormField>
					<div class="flex flex-col gap-3 pt-1">
						<USwitch
							v-model="state.hasBeenPatient"
							:label="t('signup.hasBeenPatient')"
						/>
						<USwitch
							v-model="state.isDiagnosed"
							:label="t('signup.isDiagnosed')"
						/>
						<USwitch
							v-model="state.wantsEval"
							:label="t('signup.wantsEval')"
						/>
					</div>
					<div class="grid gap-4 sm:grid-cols-3">
						<UFormField
							:label="t('signup.medication')"
							name="medication"
						>
							<UInput v-model="state.medication" class="w-full" />
						</UFormField>
						<UFormField
							:label="t('signup.allergies')"
							name="allergies"
						>
							<UInput v-model="state.allergies" class="w-full" />
						</UFormField>
						<UFormField :label="t('signup.diet')" name="diet">
							<UInput v-model="state.diet" class="w-full" />
						</UFormField>
					</div>
					<UFormField :label="t('signup.comment')" name="comment">
						<UTextarea
							v-model="state.comment"
							:rows="3"
							class="w-full"
						/>
					</UFormField>
				</div>
			</UCard>

			<div class="flex justify-end">
				<UButton
					type="submit"
					size="lg"
					:loading="submitting"
					:label="t('signup.submit')"
				/>
			</div>
		</UForm>
	</div>
</template>
