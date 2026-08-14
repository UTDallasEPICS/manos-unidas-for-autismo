<!-- Read-only patient quick-view. Mounted via v-if by the parent; emits `close`
     when dismissed. Links to the full profile. Rebuilt on NuxtUI (UModal). -->
<script setup lang="ts">
const props = defineProps<{
	patient: {
		id: string;
		name: string;
		gender?: string;
		age?: number;
		identification?: string;
		email?: string;
		phone?: string;
		whatsApp?: string;
		contactPref?: string;
		diagnosed?: boolean;
		sponsorId?: string | null;
		status?: string;
		insurance?: string | null;
	};
	therapist?: { id: string; name?: string };
	therapyRecommendation?: string;
	therapistType?: string;
	createdAt?: Date | string;
}>();

const emit = defineEmits<{ close: [] }>();
const { t } = useI18n();
const localePath = useLocalePath();

const open = ref(true);
watch(open, (v) => {
	if (!v) emit("close");
});

const genderAge = computed(() =>
	[props.patient?.gender, props.patient?.age].filter(Boolean).join(" • ")
);
</script>

<template>
	<UModal v-model:open="open" :title="t('patients.modalTitle')">
		<template #body>
			<dl class="grid grid-cols-2 gap-4 text-sm">
				<div class="col-span-2">
					<dt class="text-muted">{{ t("patients.name") }}</dt>
					<dd class="text-default">{{ patient?.name || "—" }}</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("patients.genderAge") }}</dt>
					<dd class="text-default">{{ genderAge || "—" }}</dd>
				</div>
				<div>
					<dt class="text-muted">
						{{ t("patients.identification") }}
					</dt>
					<dd class="text-default">
						{{ patient?.identification || "—" }}
					</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("patients.email") }}</dt>
					<dd class="text-default">{{ patient?.email || "—" }}</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("patients.phone") }}</dt>
					<dd class="text-default">{{ patient?.phone || "—" }}</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("patients.whatsApp") }}</dt>
					<dd class="text-default">{{ patient?.whatsApp || "—" }}</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("patients.contactPref") }}</dt>
					<dd class="text-default">
						{{ patient?.contactPref || "—" }}
					</dd>
				</div>
				<div v-if="patient?.status">
					<dt class="text-muted">{{ t("patients.status") }}</dt>
					<dd class="text-default">{{ patient.status }}</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("patients.diagnosed") }}</dt>
					<dd class="text-default">
						{{
							patient?.diagnosed
								? t("common.yes")
								: t("common.no")
						}}
					</dd>
				</div>
				<div v-if="patient?.insurance">
					<dt class="text-muted">{{ t("patients.insurance") }}</dt>
					<dd class="text-default">{{ patient.insurance }}</dd>
				</div>
				<div>
					<dt class="text-muted">{{ t("patients.sponsor") }}</dt>
					<dd class="text-default">
						{{ patient?.sponsorId || t("patients.none") }}
					</dd>
				</div>
				<div v-if="therapist" class="col-span-2 border-t pt-3">
					<dt class="text-muted">
						{{ t("patients.assignedTherapist") }}
					</dt>
					<dd class="text-default">{{ therapist?.name || "—" }}</dd>
				</div>
				<div v-if="therapyRecommendation">
					<dt class="text-muted">
						{{ t("patients.therapyRecommendation") }}
					</dt>
					<dd class="text-default">{{ therapyRecommendation }}</dd>
				</div>
				<div v-if="therapistType">
					<dt class="text-muted">
						{{ t("patients.therapistType") }}
					</dt>
					<dd class="text-default">{{ therapistType }}</dd>
				</div>
				<div v-if="createdAt">
					<dt class="text-muted">
						{{ t("patients.recordCreated") }}
					</dt>
					<dd class="text-default">{{ createdAt }}</dd>
				</div>
			</dl>
		</template>

		<template #footer>
			<div class="flex w-full items-center justify-between">
				<UButton
					v-if="patient?.id"
					:to="
						localePath({
							name: 'patientProfile-id',
							params: { id: patient.id },
						})
					"
					color="neutral"
					variant="outline"
					icon="i-lucide-external-link"
					:label="t('patients.viewProfile')"
				/>
				<UButton :label="t('patients.close')" @click="open = false" />
			</div>
		</template>
	</UModal>
</template>
