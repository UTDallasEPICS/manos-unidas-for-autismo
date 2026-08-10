<template>
	<div
		v-if="modelValue"
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
	>
		<div
			class="absolute inset-0 bg-black/50"
			@click.self="closeModal"
		></div>
		<div
			class="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded bg-white shadow-xl"
		>
			<div class="border-b px-6 py-4">
				<h2 class="text-xl font-semibold">
					Assign
					{{ mode === "appointment" ? "Evaluator" : "Therapist" }}
				</h2>
				<p class="mt-1 text-sm text-gray-600">
					Review this request and assign the right professional, or
					decline the time.
				</p>
			</div>
			<div class="space-y-4 px-6 py-5">
				<div class="rounded border border-gray-200 bg-gray-50 p-4">
					<div class="text-sm font-semibold text-gray-700">
						Request Details
					</div>
					<div
						class="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-2"
					>
						<div>
							<div class="font-medium">Request ID</div>
							<div>{{ item?.id ?? "—" }}</div>
						</div>
						<div>
							<div class="font-medium">Type</div>
							<div>
								{{
									mode === "appointment"
										? "Appointment"
										: "Referral"
								}}
							</div>
						</div>
						<div v-if="mode === 'appointment'">
							<div class="font-medium">Patient</div>
							<div>
								{{ item?.firstName ?? "" }}
								{{ item?.lastName ?? "" }}
							</div>
						</div>
						<div v-if="mode === 'appointment'">
							<div class="font-medium">Service Type</div>
							<div>{{ item?.serviceType ?? "—" }}</div>
						</div>
						<div v-if="mode === 'referral'">
							<div class="font-medium">Patient ID</div>
							<div>{{ item?.patientId ?? "—" }}</div>
						</div>
						<div v-if="mode === 'referral'">
							<div class="font-medium">Therapist Type</div>
							<div>{{ item?.therapistType ?? "—" }}</div>
						</div>
						<div v-if="mode === 'referral'">
							<div class="font-medium">Recommendation</div>
							<div>{{ item?.therapyRecommendation ?? "—" }}</div>
						</div>
						<div class="sm:col-span-2">
							<div class="font-medium">Submitted At</div>
							<div>{{ formatDate(item?.submittedAt) }}</div>
						</div>
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">
						Assign
						{{
							mode === "appointment"
								? "Evaluator ID"
								: "Therapist ID"
						}}
					</label>
					<input
						v-model="assigneeId"
						type="text"
						class="mt-2 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
						placeholder="Enter user ID"
					/>
				</div>
				<div
					v-if="errorMessage"
					class="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
				>
					{{ errorMessage }}
				</div>
			</div>
			<div
				class="flex flex-wrap items-center justify-end gap-3 border-t px-6 py-4"
			>
				<button
					type="button"
					class="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
					@click="cancel"
				>
					Cancel
				</button>
				<button
					type="button"
					class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
					:disabled="!assigneeId || isSubmitting"
					@click="submitAssignment"
				>
					{{ isSubmitting ? "Submitting..." : "Submit" }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
	modelValue: boolean;
	mode: "appointment" | "referral";
	item: Record<string, unknown> | null;
}>();

const emit = defineEmits<{
	(event: "update:modelValue", value: boolean): void;
	(event: "assigned"): void;
}>();

const assigneeId = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

const assignmentLabel = computed(() =>
	props.mode === "appointment" ? "Evaluator ID" : "Therapist ID"
);

watch(
	() => props.modelValue,
	(val) => {
		if (val) {
			assigneeId.value = "";
			errorMessage.value = "";
		}
	}
);

function closeModal() {
	emit("update:modelValue", false);
	errorMessage.value = "";
}

function cancel() {
	closeModal();
}

async function submitAssignment() {
	if (!props.item) {
		errorMessage.value = "No request selected.";
		return;
	}

	if (!assigneeId.value) {
		errorMessage.value = `${assignmentLabel.value} is required.`;
		return;
	}

	isSubmitting.value = true;
	errorMessage.value = "";

	const endpoint =
		props.mode === "appointment"
			? "/api/session/appointments"
			: "/api/session/referrals";
	const payload =
		props.mode === "appointment"
			? {
					appointmentRequestId: String(props.item.id),
					evaluatorId: assigneeId.value,
				}
			: {
					therapistReferralId: String(props.item.id),
					therapistId: assigneeId.value,
				};

	try {
		await $fetch(endpoint, {
			method: "PUT",
			body: payload,
		});
		emit("assigned");
		closeModal();
	} catch (err) {
		errorMessage.value =
			(err instanceof Error && err.message) ||
			"Failed to complete assignment. Please try again.";
	} finally {
		isSubmitting.value = false;
	}
}
</script>
