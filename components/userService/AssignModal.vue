<!-- User-service assignment modal: review an appointment request or a neuro
     referral and assign an evaluator / therapist by user id. Parent controls
     visibility via v-model; emits `assigned` after a successful PUT. Rebuilt on
     NuxtUI (UModal) — same props/emits as the old custom-overlay version. -->
<script setup lang="ts">
const props = defineProps<{
	modelValue: boolean;
	mode: "appointment" | "referral";
	item: Record<string, unknown> | null;
}>();

const emit = defineEmits<{
	(event: "update:modelValue", value: boolean): void;
	(event: "assigned"): void;
}>();

const { t } = useI18n();

const assigneeId = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

const isAppointment = computed(() => props.mode === "appointment");
const roleLabel = computed(() =>
	isAppointment.value ? t("assign.evaluator") : t("assign.therapist")
);
const assigneeLabel = computed(() =>
	isAppointment.value
		? t("assign.assigneeEvaluator")
		: t("assign.assigneeTherapist")
);

function formatDate(value: unknown) {
	return value ? new Date(value as string).toLocaleString() : "—";
}

watch(
	() => props.modelValue,
	(val) => {
		if (val) {
			assigneeId.value = "";
			errorMessage.value = "";
		}
	}
);

function cancel() {
	emit("update:modelValue", false);
}

async function submitAssignment() {
	if (!props.item) {
		errorMessage.value = t("assign.noSelection");
		return;
	}
	if (!assigneeId.value) {
		errorMessage.value = t("assign.required", {
			field: assigneeLabel.value,
		});
		return;
	}

	isSubmitting.value = true;
	errorMessage.value = "";

	const endpoint = isAppointment.value
		? "/api/session/appointments"
		: "/api/session/referrals";
	const payload = isAppointment.value
		? {
				appointmentRequestId: String(props.item.id),
				evaluatorId: assigneeId.value,
			}
		: {
				therapistReferralId: String(props.item.id),
				therapistId: assigneeId.value,
			};

	try {
		await $fetch(endpoint, { method: "PUT", body: payload });
		emit("assigned");
		emit("update:modelValue", false);
	} catch (err) {
		errorMessage.value =
			(err instanceof Error && err.message) || t("assign.submitError");
	} finally {
		isSubmitting.value = false;
	}
}
</script>

<template>
	<UModal
		:open="modelValue"
		:title="t('assign.title', { role: roleLabel })"
		:description="t('assign.subtitle')"
		@update:open="(v) => emit('update:modelValue', v)"
	>
		<template #body>
			<div class="space-y-4">
				<div class="bg-muted rounded-lg p-4">
					<p class="text-highlighted mb-3 text-sm font-semibold">
						{{ t("assign.requestDetails") }}
					</p>
					<dl class="grid gap-3 text-sm sm:grid-cols-2">
						<div>
							<dt class="text-muted">
								{{ t("assign.requestId") }}
							</dt>
							<dd class="text-default">{{ item?.id ?? "—" }}</dd>
						</div>
						<div>
							<dt class="text-muted">{{ t("assign.type") }}</dt>
							<dd class="text-default">
								{{
									isAppointment
										? t("assign.typeAppointment")
										: t("assign.typeReferral")
								}}
							</dd>
						</div>
						<template v-if="isAppointment">
							<div>
								<dt class="text-muted">
									{{ t("assign.patient") }}
								</dt>
								<dd class="text-default">
									{{ item?.firstName ?? "" }}
									{{ item?.lastName ?? "" }}
								</dd>
							</div>
							<div>
								<dt class="text-muted">
									{{ t("assign.serviceType") }}
								</dt>
								<dd class="text-default">
									{{ item?.serviceType ?? "—" }}
								</dd>
							</div>
						</template>
						<template v-else>
							<div>
								<dt class="text-muted">
									{{ t("assign.patientId") }}
								</dt>
								<dd class="text-default">
									{{ item?.patientId ?? "—" }}
								</dd>
							</div>
							<div>
								<dt class="text-muted">
									{{ t("assign.therapistType") }}
								</dt>
								<dd class="text-default">
									{{ item?.therapistType ?? "—" }}
								</dd>
							</div>
							<div class="sm:col-span-2">
								<dt class="text-muted">
									{{ t("assign.recommendation") }}
								</dt>
								<dd class="text-default">
									{{ item?.therapyRecommendation ?? "—" }}
								</dd>
							</div>
						</template>
						<div class="sm:col-span-2">
							<dt class="text-muted">
								{{ t("assign.submittedAt") }}
							</dt>
							<dd class="text-default">
								{{ formatDate(item?.submittedAt) }}
							</dd>
						</div>
					</dl>
				</div>

				<UFormField :label="assigneeLabel" name="assignee">
					<UInput
						v-model="assigneeId"
						:placeholder="t('assign.assigneePlaceholder')"
						class="w-full"
					/>
				</UFormField>

				<UAlert
					v-if="errorMessage"
					color="error"
					variant="subtle"
					icon="i-lucide-triangle-alert"
					:title="errorMessage"
				/>
			</div>
		</template>

		<template #footer>
			<div class="flex w-full justify-end gap-3">
				<UButton
					color="neutral"
					variant="outline"
					:label="t('assign.cancel')"
					@click="cancel"
				/>
				<UButton
					:loading="isSubmitting"
					:disabled="!assigneeId"
					:label="t('assign.submit')"
					@click="submitAssignment"
				/>
			</div>
		</template>
	</UModal>
</template>
