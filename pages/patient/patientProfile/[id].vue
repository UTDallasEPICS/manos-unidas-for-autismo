<!-- Patient profile page. Composes the read-only Details with PatientSection
     (which holds the edit / recommendations / therapy-note modals). Header
     actions are role-gated. Rebuilt on NuxtUI. -->
<script setup lang="ts">
import PatientSection from "~/components/patient/Section.vue";

definePageMeta({
	title: "profile.title",
});

const { t } = useI18n();
const route = useRoute();
const uId = route.params.id as string;

const { can } = useAccess();
const { profile, nonEmployee, patient, getProfile, paid } =
	usePatientProfile(uId);

const patientSection = ref<InstanceType<typeof PatientSection> | null>(null);

getProfile();
</script>

<template>
	<div class="mx-auto w-full max-w-4xl">
		<div class="mb-6 flex flex-wrap items-center justify-end gap-3">
			<div class="flex flex-wrap gap-2">
				<template v-if="can('PATIENT')">
					<UButton
						icon="i-lucide-pencil"
						:label="t('profile.editProfile')"
						@click="patientSection?.openEditModal()"
					/>
					<UButton
						color="neutral"
						variant="outline"
						icon="i-lucide-clipboard-list"
						:label="t('profile.therapistRecommendations')"
						@click="patientSection?.openRecommendationsModal()"
					/>
				</template>
				<UButton
					v-if="can('THERAPIST')"
					icon="i-lucide-file-plus"
					:label="t('profile.writeTherapyNotes')"
					@click="patientSection?.handleNewNote()"
				/>
			</div>
		</div>

		<ProfileDetails
			:profile="profile"
			:non-employee="nonEmployee"
			:patient="patient"
			:paid="paid"
		/>

		<PatientSection
			ref="patientSection"
			:patient-id="uId"
			:profile="profile"
			@profile-updated="getProfile"
		/>
	</div>
</template>
