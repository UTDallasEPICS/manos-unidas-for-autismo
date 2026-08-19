<!-- Read-only patient profile details. Therapists see a clinical subset (no
     contact/address/payment). Rebuilt on NuxtUI. -->
<script setup lang="ts">
import type { Profile, NonEmployee, PatientDetails } from "~/types/formTypes";

const props = defineProps<{
	profile: Profile;
	nonEmployee: NonEmployee;
	patient: PatientDetails;
	paid: boolean;
}>();

const { t } = useI18n();
const { can } = useAccess();

const postCodeCity = computed(() => props.nonEmployee?.PostCodeCity ?? {});

const profileFields = computed(() => [
	{
		label: t("profile.fullName"),
		value: [
			props.profile.firstName,
			props.profile.middleInitial,
			props.profile.lastName,
		]
			.filter(Boolean)
			.join(" "),
	},
	{
		label: t("profile.dob"),
		value: props.nonEmployee?.dob
			? new Date(props.nonEmployee.dob).toDateString()
			: null,
	},
	{ label: t("profile.diagnosis"), value: props.patient?.diagnosis },
	{ label: t("profile.recordNumber"), value: props.patient?.recordNumber },
	{ label: t("profile.sex"), value: props.nonEmployee?.gender },
	{ label: t("profile.medication"), value: props.patient?.medication },
	{ label: t("profile.allergies"), value: props.patient?.allergies },
	{ label: t("profile.diet"), value: props.patient?.diet },
	{ label: t("profile.parentGuardian"), value: props.patient?.parentName },
]);

const contactFields = computed(() => [
	{ label: t("profile.email"), value: props.profile.email },
	{
		label: t("profile.contactPreference"),
		value: props.profile.contactPreference,
	},
]);

// WhatsApp/phone are PII restricted to IT support and admin — not visible to
// therapists or the user-service (neurodevelopment) coordinator.
const canSeeRestrictedContact = computed(
	() => can("ADMIN") || can("IT_SERVICE")
);

const restrictedContactFields = computed(() => [
	{ label: t("profile.phone"), value: props.profile.phone },
	{ label: t("profile.whatsApp"), value: props.profile.whatsApp },
]);
</script>

<template>
	<UCard>
		<template #header>
			<h2 class="text-highlighted font-semibold">
				{{ t("profile.detailsTitle") }}
			</h2>
		</template>

		<dl class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
			<div v-for="field in profileFields" :key="field.label">
				<dt class="text-muted">{{ field.label }}</dt>
				<dd class="text-default">{{ field.value || "—" }}</dd>
			</div>

			<template v-if="canSeeRestrictedContact">
				<div v-for="c in restrictedContactFields" :key="c.label">
					<dt class="text-muted">{{ c.label }}</dt>
					<dd class="text-default">{{ c.value || "—" }}</dd>
				</div>
			</template>
			<template v-if="!can('THERAPIST')">
				<div v-for="c in contactFields" :key="c.label">
					<dt class="text-muted">{{ c.label }}</dt>
					<dd class="text-default">{{ c.value || "—" }}</dd>
				</div>
				<div class="sm:col-span-2">
					<dt class="text-muted">{{ t("profile.address") }}</dt>
					<dd class="text-default">
						{{ nonEmployee?.streetNum }}
						{{ nonEmployee?.streetName
						}}<template v-if="nonEmployee?.buildingNum"
							>, {{ nonEmployee.buildingNum }}</template
						>
						<template
							v-if="postCodeCity?.city || nonEmployee?.postCode"
						>
							— {{ postCodeCity?.city }}
							{{ nonEmployee?.postCode }}
						</template>
					</dd>
				</div>
			</template>

			<div>
				<dt class="text-muted">{{ t("profile.diagnosed") }}</dt>
				<dd class="text-default">
					{{ patient?.diagnosed ? t("common.yes") : t("common.no") }}
				</dd>
			</div>
			<div v-if="!can('THERAPIST')">
				<dt class="text-muted">{{ t("profile.allSessionsPaid") }}</dt>
				<dd class="text-default">
					{{ paid ? t("common.yes") : t("common.no") }}
				</dd>
			</div>
		</dl>
	</UCard>
</template>
