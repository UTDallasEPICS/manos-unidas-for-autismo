<template>
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
		@click.self="emit('close')"
	>
		<div
			class="flex max-h-[85vh] w-[520px] flex-col overflow-hidden rounded bg-white shadow-xl"
		>
			<!-- Header -->
			<div class="border-b border-gray-200 px-6 pt-6 pb-4">
				<div class="text-xl font-bold text-gray-800">
					Patient Information
				</div>
			</div>

			<!-- Body -->
			<div class="flex flex-col gap-5 overflow-y-auto px-6 py-4">
				<!-- Identity -->
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500">Name</span>
					<span class="text-sm text-gray-800">
						{{ patient?.name }}
					</span>
				</div>

				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500"
						>Gender / Age</span
					>
					<span class="text-sm text-gray-800">
						{{ patient?.gender }} • {{ patient?.age }}
					</span>
				</div>

				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500"
						>Identification</span
					>
					<span class="text-sm text-gray-800">
						{{ patient?.identification }}
					</span>
				</div>

				<!-- Contact Info -->
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500">Email</span>
					<span class="text-sm text-gray-800">
						{{ patient?.email }}
					</span>
				</div>

				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500">Phone</span>
					<span class="text-sm text-gray-800">
						{{ patient?.phone }}
					</span>
				</div>

				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500"
						>WhatsApp</span
					>
					<span class="text-sm text-gray-800">
						{{ patient?.whatsApp }}
					</span>
				</div>

				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500"
						>Contact Preference</span
					>
					<span class="text-sm text-gray-800">
						{{ patient?.contactPref }}
					</span>
				</div>

				<!-- Clinical Summary -->
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500"
						>Diagnosed</span
					>
					<span class="text-sm text-gray-800">
						{{ patient?.diagnosed ? "Yes" : "No" }}
					</span>
				</div>

				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500"
						>Sponsor</span
					>
					<span class="text-sm text-gray-800">
						{{ patient?.sponsorId || "None" }}
					</span>
				</div>

				<!-- Related Info -->
				<div v-if="therapist" class="flex flex-col gap-1 border-t pt-3">
					<span class="text-xs font-medium text-gray-500"
						>Assigned Therapist</span
					>
					<span class="text-sm text-gray-800">
						{{ therapist?.name }}
					</span>
				</div>

				<div v-if="therapyRecommendation" class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500"
						>Therapy Recommendation</span
					>
					<span class="text-sm text-gray-800">
						{{ therapyRecommendation }}
					</span>
				</div>

				<div v-if="therapistType" class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500"
						>Therapist Type</span
					>
					<span class="text-sm text-gray-800">
						{{ therapistType }}
					</span>
				</div>

				<div v-if="createdAt" class="flex flex-col gap-1">
					<span class="text-xs font-medium text-gray-500"
						>Record Created</span
					>
					<span class="text-sm text-gray-800">
						{{ createdAt }}
					</span>
				</div>
			</div>

			<!-- Footer -->
			<div
				class="flex items-center justify-between border-t border-gray-200 px-6 py-4"
			>
				<NuxtLink
					v-if="patient?.id"
					:to="
						localePath({
							name: 'patientProfile-id',
							params: { id: patient.id },
						})
					"
					class="rounded border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
				>
					View Profile
				</NuxtLink>
				<button
					class="cursor-pointer rounded px-5 py-2 text-sm text-white"
					style="background-color: #1e3a5f"
					@click="emit('close')"
				>
					Close
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const emit = defineEmits(["close"]);
const localePath = useLocalePath();

defineProps<{
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
	};

	therapist?: {
		id: string;
		name?: string;
	};

	therapyRecommendation?: string;
	therapistType?: string;
	createdAt?: Date | string;
}>();
</script>
