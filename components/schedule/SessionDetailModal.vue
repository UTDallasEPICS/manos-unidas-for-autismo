<template>
	<div
		class="font-sc-encode fixed inset-0 z-50 flex items-center justify-center bg-black/40"
		@click.self="emit('close')"
	>
		<div
			class="flex max-h-[85vh] w-[480px] flex-col rounded bg-white shadow-xl"
		>
			<div class="border-b border-gray-200 px-6 pt-6 pb-4">
				<div class="text-xl font-bold text-gray-800">
					{{ session.Type?.name ?? "Session" }}
				</div>
				<div class="mt-1 text-sm text-gray-500">
					{{ formattedTime }}
				</div>
			</div>

			<div class="flex flex-col gap-4 overflow-y-auto px-6 py-4">
				<div class="flex flex-col gap-1">
					<span class="text-sm font-medium text-gray-500"
						>Therapist</span
					>
					<span class="text-sm text-gray-800">{{
						therapistName
					}}</span>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-gray-500"
						>Attendance</span
					>
					<span
						class="text-sm font-semibold"
						:class="isFull ? 'text-red-600' : 'text-gray-800'"
					>
						{{ session.Patients.length }}/{{
							session.maxAttendance
						}}
						<span v-if="isFull">(Full)</span>
					</span>
				</div>

				<div
					v-if="errorMessage"
					class="rounded bg-red-50 px-3 py-2 text-sm text-red-700"
				>
					{{ errorMessage }}
				</div>

				<div class="flex flex-col gap-2">
					<span class="text-sm font-medium text-gray-500"
						>Patients</span
					>
					<div
						v-if="!session.Patients.length"
						class="text-sm text-gray-400"
					>
						No patients added yet.
					</div>
					<div
						v-for="sp in session.Patients"
						:key="sp.patientId"
						class="flex items-center justify-between rounded border border-gray-200 px-3 py-2"
					>
						<span class="text-sm text-gray-800">{{
							patientName(sp)
						}}</span>
						<button
							v-if="canManage"
							class="cursor-pointer text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
							:disabled="removingPatientId === sp.patientId"
							@click="removePatient(sp.patientId)"
						>
							{{
								removingPatientId === sp.patientId
									? "Removing..."
									: "Remove"
							}}
						</button>
					</div>
				</div>

				<div
					v-if="canManage"
					class="flex flex-col gap-2 border-t border-gray-200 pt-4"
				>
					<span class="text-sm font-medium text-gray-500"
						>Add Patient</span
					>
					<div v-if="isFull" class="text-sm text-gray-400">
						This session is full.
					</div>
					<template v-else>
						<input
							v-model="searchQuery"
							type="text"
							placeholder="Search by name..."
							class="input w-full"
						/>
						<div
							class="flex max-h-40 flex-col gap-1 overflow-y-auto"
						>
							<button
								v-for="p in availablePatients"
								:key="p.id"
								class="flex cursor-pointer items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
								:disabled="addingPatientId === p.id"
								@click="addPatient(p)"
							>
								<span>{{ p.name }}</span>
								<span class="text-blue-600">{{
									addingPatientId === p.id
										? "Adding..."
										: "Add"
								}}</span>
							</button>
							<div
								v-if="searchQuery && !availablePatients.length"
								class="px-3 py-2 text-sm text-gray-400"
							>
								No matching patients.
							</div>
							<div
								v-if="!searchQuery"
								class="px-3 py-2 text-sm text-gray-400"
							>
								Start typing to search patients.
							</div>
						</div>
					</template>
				</div>
			</div>

			<div class="flex justify-end border-t border-gray-200 px-6 py-4">
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
import { computed, onMounted, ref, useFetch } from "#imports";
import { AccessPermission } from "~/types/permissions";
import type {
	SessionPatientDetails,
	SessionWithAttendance,
} from "~/components/schedule/sessionTypes";

interface PatientRow {
	id: string;
	name: string;
	type: string;
	age: number | null;
	gender: string | null;
}

const props = defineProps<{ session: SessionWithAttendance }>();
const emit = defineEmits<{ close: []; changed: [] }>();

const { access } = useAuthState();

// Mirrors the USER_SERVICE-only "editAppointments" gate already used for
// CreateAppointment.vue (pages/admin/scheduleView.vue) — kept consistent
// rather than also exposing this to THERAPIST, since /api/search/all (the
// patient search used below) is itself staff-only and would 403 for them.
const canManage = computed(
	() =>
		!!access.value &&
		!!(
			access.value[AccessPermission.USER_SERVICE] ||
			access.value[AccessPermission.ADMIN]
		)
);

const searchQuery = ref("");
const errorMessage = ref("");
const addingPatientId = ref<string | null>(null);
const removingPatientId = ref<string | null>(null);

const { data: allPatients, execute: loadPatients } = useFetch<PatientRow[]>(
	"/api/search/all",
	{ immediate: false, default: () => [] }
);

onMounted(() => {
	if (canManage.value) {
		void loadPatients();
	}
});

const isFull = computed(
	() => props.session.Patients.length >= props.session.maxAttendance
);

const therapistName = computed(() => {
	const t = props.session.Therapist;
	return t ? `${t.fName ?? ""} ${t.lName ?? ""}`.trim() : "—";
});

const formattedTime = computed(() => {
	const start = new Date(props.session.time);
	const end = new Date(start.getTime() + props.session.duration * 60 * 1000);
	const dateStr = start.toLocaleDateString([], {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
	const startStr = start.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
	const endStr = end.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
	return `${dateStr}, ${startStr} - ${endStr}`;
});

function patientName(sp: SessionPatientDetails): string {
	const u = sp.Patient?.User?.User;
	return u ? `${u.fName} ${u.lName}` : "Unknown patient";
}

const existingPatientIds = computed(
	() => new Set(props.session.Patients.map((sp) => sp.patientId))
);

const availablePatients = computed(() => {
	const q = searchQuery.value.trim().toLowerCase();
	if (!q) return [];
	return (allPatients.value ?? [])
		.filter((p) => !existingPatientIds.value.has(p.id))
		.filter((p) => p.name.toLowerCase().includes(q));
});

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

async function addPatient(patient: PatientRow) {
	errorMessage.value = "";
	addingPatientId.value = patient.id;
	try {
		await $fetch("/api/session/attendance", {
			method: "POST",
			body: { sessionId: props.session.id, patientId: patient.id },
		});
		searchQuery.value = "";
		emit("changed");
	} catch (err) {
		errorMessage.value = extractErrorMessage(err, "Failed to add patient.");
	} finally {
		addingPatientId.value = null;
	}
}

async function removePatient(patientId: string) {
	errorMessage.value = "";
	removingPatientId.value = patientId;
	try {
		await $fetch("/api/session/attendance", {
			method: "DELETE",
			body: { sessionId: props.session.id, patientId },
		});
		emit("changed");
	} catch (err) {
		errorMessage.value = extractErrorMessage(
			err,
			"Failed to remove patient."
		);
	} finally {
		removingPatientId.value = null;
	}
}
</script>
