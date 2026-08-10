<!-- Session detail + manage attendance. Rendered by WeekViewCalendar via v-if;
     emits `close` (when the modal is dismissed) and `changed` (after add/remove). -->
<script setup lang="ts">
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

const { t, locale } = useI18n();
const { access } = useAuthState();

// Open on mount; emit `close` when dismissed so the parent's v-if unmounts us.
const open = ref(true);
watch(open, (v) => {
	if (!v) emit("close");
});

// USER_SERVICE/ADMIN only — mirrors CreateAppointment's gate; /api/search/all
// (patient search) is staff-only and would 403 for therapists.
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
	if (canManage.value) void loadPatients();
});

const isFull = computed(
	() => props.session.Patients.length >= props.session.maxAttendance
);
const therapistName = computed(() => {
	const th = props.session.Therapist;
	return th ? `${th.fName ?? ""} ${th.lName ?? ""}`.trim() : "—";
});
const formattedTime = computed(() => {
	const start = new Date(props.session.time);
	const end = new Date(start.getTime() + props.session.duration * 60 * 1000);
	const opts = { hour: "2-digit", minute: "2-digit" } as const;
	return `${start.toLocaleDateString(locale.value, {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	})}, ${start.toLocaleTimeString(locale.value, opts)} - ${end.toLocaleTimeString(locale.value, opts)}`;
});

function patientName(sp: SessionPatientDetails): string {
	const u = sp.Patient?.User?.User;
	return u ? `${u.fName} ${u.lName}` : t("sessionModal.unknownPatient");
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
	} catch {
		errorMessage.value = t("sessionModal.addError");
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
	} catch {
		errorMessage.value = t("sessionModal.removeError");
	} finally {
		removingPatientId.value = null;
	}
}
</script>

<template>
	<UModal
		v-model:open="open"
		:title="session.Type?.name ?? t('sessionModal.session')"
		:description="formattedTime"
	>
		<template #body>
			<div class="space-y-4">
				<div class="flex flex-col gap-0.5">
					<span class="text-muted text-sm font-medium">
						{{ t("sessionModal.therapist") }}
					</span>
					<span class="text-default text-sm">{{
						therapistName
					}}</span>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-muted text-sm font-medium">
						{{ t("sessionModal.attendance") }}
					</span>
					<UBadge
						:color="isFull ? 'error' : 'neutral'"
						variant="subtle"
					>
						{{ session.Patients.length }}/{{
							session.maxAttendance
						}}
						<template v-if="isFull">
							· {{ t("sessionModal.full") }}</template
						>
					</UBadge>
				</div>

				<UAlert
					v-if="errorMessage"
					color="error"
					variant="subtle"
					icon="i-lucide-triangle-alert"
					:title="errorMessage"
				/>

				<div class="flex flex-col gap-2">
					<span class="text-muted text-sm font-medium">
						{{ t("sessionModal.patients") }}
					</span>
					<p
						v-if="!session.Patients.length"
						class="text-dimmed text-sm"
					>
						{{ t("sessionModal.noPatients") }}
					</p>
					<div
						v-for="sp in session.Patients"
						:key="sp.patientId"
						class="border-default flex items-center justify-between rounded-md border px-3 py-2"
					>
						<span class="text-default text-sm">{{
							patientName(sp)
						}}</span>
						<UButton
							v-if="canManage"
							color="error"
							variant="ghost"
							size="xs"
							:loading="removingPatientId === sp.patientId"
							:label="t('sessionModal.remove')"
							@click="removePatient(sp.patientId)"
						/>
					</div>
				</div>

				<div
					v-if="canManage"
					class="border-default flex flex-col gap-2 border-t pt-4"
				>
					<span class="text-muted text-sm font-medium">
						{{ t("sessionModal.addPatient") }}
					</span>
					<p v-if="isFull" class="text-dimmed text-sm">
						{{ t("sessionModal.sessionFull") }}
					</p>
					<template v-else>
						<UInput
							v-model="searchQuery"
							icon="i-lucide-search"
							:placeholder="t('sessionModal.searchPlaceholder')"
						/>
						<div
							class="flex max-h-40 flex-col gap-1 overflow-y-auto"
						>
							<UButton
								v-for="p in availablePatients"
								:key="p.id"
								color="neutral"
								variant="ghost"
								class="justify-between"
								:loading="addingPatientId === p.id"
								@click="addPatient(p)"
							>
								<span>{{ p.name }}</span>
								<span class="text-primary">{{
									t("sessionModal.add")
								}}</span>
							</UButton>
							<p
								v-if="searchQuery && !availablePatients.length"
								class="text-dimmed px-2 py-1 text-sm"
							>
								{{ t("sessionModal.noMatches") }}
							</p>
							<p
								v-if="!searchQuery"
								class="text-dimmed px-2 py-1 text-sm"
							>
								{{ t("sessionModal.startTyping") }}
							</p>
						</div>
					</template>
				</div>
			</div>
		</template>

		<template #footer>
			<div class="flex w-full justify-end">
				<UButton
					color="neutral"
					variant="outline"
					:label="t('sessionModal.close')"
					@click="open = false"
				/>
			</div>
		</template>
	</UModal>
</template>
