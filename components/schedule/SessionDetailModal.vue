<!-- Session detail + manage attendance, plus create/edit/delete for managers.
     Rendered by CalendarView via v-if; `session: null` means create-mode
     (prefilled from `initialTime`, e.g. a clicked empty calendar slot).
     Emits `close` (when dismissed) and `changed` (after any write). -->
<script setup lang="ts">
import { AccessPermission } from "~/types/permissions";
import type {
	SessionPatientDetails,
	SessionWithAttendance,
} from "~/components/schedule/sessionTypes";
import type { TherapyNote } from "~/types/formTypes";

interface PatientRow {
	id: string;
	name: string;
	type: string;
	age: number | null;
	gender: string | null;
}
interface SessionTypeRow {
	id: string;
	name: string;
}
interface StaffRow {
	id: string;
	fName: string;
	lName: string;
	type: string;
}
interface PickerItem {
	label: string;
	id: string;
}

const props = defineProps<{
	session: SessionWithAttendance | null;
	initialTime?: Date | null;
}>();
const emit = defineEmits<{ close: []; changed: [] }>();

const { t, locale } = useI18n();
const { access } = useAuthState();
const toast = useToast();

// Open on mount; emit `close` when dismissed so the parent's v-if unmounts us.
const open = ref(true);
watch(open, (v) => {
	if (!v) emit("close");
});

const isCreating = computed(() => props.session === null);

// USER_SERVICE/ADMIN only — matches the session-write access gate on the
// backend endpoints this drives; /api/search/all and /api/session/staff are
// both staff-only and would 403 for therapists/evaluators.
const canManage = computed(
	() =>
		!!access.value &&
		!!(
			access.value[AccessPermission.USER_SERVICE] ||
			access.value[AccessPermission.ADMIN]
		)
);

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

// ---------------------------------------------------------------------------
// Attendance (add/remove patients) — existing sessions only.
// ---------------------------------------------------------------------------
const searchQuery = ref("");
const attendanceError = ref("");
const addingPatientId = ref<string | null>(null);
const removingPatientId = ref<string | null>(null);

const { data: allPatients, execute: loadPatients } = useFetch<PatientRow[]>(
	"/api/search/all",
	{ immediate: false, default: () => [] }
);

const isFull = computed(
	() =>
		!!props.session &&
		props.session.Patients.length >= props.session.maxAttendance
);
const therapistName = computed(() => {
	const th = props.session?.Therapist;
	return th ? `${th.fName ?? ""} ${th.lName ?? ""}`.trim() : "—";
});
const formattedTime = computed(() => {
	if (!props.session) return "";
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
	() => new Set((props.session?.Patients ?? []).map((sp) => sp.patientId))
);
const availablePatients = computed(() => {
	const q = searchQuery.value.trim().toLowerCase();
	if (!q) return [];
	return (allPatients.value ?? [])
		.filter((p) => !existingPatientIds.value.has(p.id))
		.filter((p) => p.name.toLowerCase().includes(q));
});

async function addPatient(patient: PatientRow) {
	if (!props.session) return;
	attendanceError.value = "";
	addingPatientId.value = patient.id;
	try {
		await $fetch("/api/session/attendance", {
			method: "POST",
			body: { sessionId: props.session.id, patientId: patient.id },
		});
		searchQuery.value = "";
		emit("changed");
	} catch (err) {
		attendanceError.value = extractErrorMessage(
			err,
			t("sessionModal.addError")
		);
	} finally {
		addingPatientId.value = null;
	}
}

async function removePatient(patientId: string) {
	if (!props.session) return;
	attendanceError.value = "";
	removingPatientId.value = patientId;
	try {
		await $fetch("/api/session/attendance", {
			method: "DELETE",
			body: { sessionId: props.session.id, patientId },
		});
		emit("changed");
	} catch (err) {
		attendanceError.value = extractErrorMessage(
			err,
			t("sessionModal.removeError")
		);
	} finally {
		removingPatientId.value = null;
	}
}

// ---------------------------------------------------------------
// Create / edit patient therapy note for session
// ---------------------------------------------------------------
// Allow THERAPIST and ADMIN to create/view notes
const canWriteNotes = computed(
	() =>
		!!access.value &&
		!!(
			access.value[AccessPermission.THERAPIST] ||
			access.value[AccessPermission.ADMIN]
		)
);

const notesUrl = computed(() =>
	props.session ? `/api/session/${props.session.id}/notes` : ""
);

const { data: sessionNotes, refresh: refreshSessionNotes } = await useFetch<
	TherapyNote[]
>(notesUrl, {
	// Don't fire if there is no session or URL is empty
	immediate: !!props.session,
	default: () => [],
});

const notesByPatientId = computed(() => {
	const map = new Map<string, TherapyNote>();
	for (const note of sessionNotes.value ?? []) {
		if (note?.patientId) {
			const pId =
				typeof note.patientId === "string"
					? note.patientId
					: String(note.patientId);
			map.set(pId, note as TherapyNote);
		}
	}
	return map;
});

function getNoteForPatient(patientId: string): TherapyNote | undefined {
	return notesByPatientId.value.get(patientId);
}

const activePatientId = ref<string>("");
const activeSessionId = ref<string | null>(null);
const activeNote = ref<TherapyNote | null>(null);
const editingNote = ref<TherapyNote | null>(null);

const { saveTherapyNote } = useTherapyNoteForm();

const noteModals = reactive({
	progressReport: false,
	viewNote: false,
});

function handleViewNote(note: TherapyNote) {
	// ViewNoteModal reads the raw TherapyNote fields (reinforcersUsed,
	// familyRecommendations, generalObservations, …) directly — the same raw
	// record the profile page passes it. No remapping needed.
	activeNote.value = note;
	noteModals.viewNote = true;
}

function handleEditNote(note: TherapyNote) {
	if (!props.session) return;

	activePatientId.value = String(note.patientId ?? "");
	activeSessionId.value = props.session.id;

	// Pass the raw note object directly from sessionNotes (same as profile page)
	editingNote.value = note;
	noteModals.progressReport = true;
}

function handleAddNote(patientId: string) {
	if (!props.session) return;
	activePatientId.value = patientId;
	activeSessionId.value = props.session.id;
	editingNote.value = null;
	noteModals.progressReport = true;
}

// ---------------------------------------------------------------
// Create patient report (tests used + diagnosis) for session
// ---------------------------------------------------------------
interface TherapyReportRow {
	id: string;
	patientId: string;
	deliveredAt: string | null;
}

const reportsUrl = computed(() =>
	props.session ? `/api/session/${props.session.id}/reports` : ""
);

const { data: sessionReports, refresh: refreshSessionReports } = await useFetch<
	TherapyReportRow[]
>(reportsUrl, {
	immediate: !!props.session,
	default: () => [],
});

const reportsByPatientId = computed(() => {
	const map = new Map<string, TherapyReportRow>();
	for (const report of sessionReports.value ?? []) {
		if (report?.patientId) map.set(report.patientId, report);
	}
	return map;
});

function getReportForPatient(patientId: string): TherapyReportRow | undefined {
	return reportsByPatientId.value.get(patientId);
}

const createReportModalOpen = ref(false);
const reportPatientId = ref("");

function handleCreateReport(patientId: string) {
	if (!props.session) return;
	reportPatientId.value = patientId;
	createReportModalOpen.value = true;
}

async function handleReportSave(data: {
	testsUsed: string;
	diagnosis: string;
}) {
	if (!props.session) return;
	try {
		await $fetch("/api/session/reports", {
			method: "POST",
			body: {
				patientId: reportPatientId.value,
				sessionId: props.session.id,
				testsUsed: data.testsUsed,
				diagnosis: data.diagnosis,
			},
		});
		await refreshSessionReports();
		createReportModalOpen.value = false;
		toast.add({
			title: t("report.submitSuccess"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
	} catch {
		toast.add({
			title: t("report.submitError"),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	}
}

async function handleNoteSave(formData: Record<string, unknown>) {
	const result = await saveTherapyNote(
		formData,
		activePatientId.value,
		editingNote.value?.id ?? null,
		async () => {
			await refreshSessionNotes();
			emit("changed");
		},
		activeSessionId.value,
		// Pass the note being edited so unchanged dates keep their original
		// timestamp instead of being re-stamped to "now".
		editingNote.value as Record<string, unknown> | null
	);

	if (result.success) {
		noteModals.progressReport = false;
		editingNote.value = null;
		activeSessionId.value = null;
		toast.add({
			title: t("sessionModal.updateSuccess"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
	} else {
		// Ensure result.error is evaluated as a string fallback
		const errorMessage =
			typeof result.error === "string"
				? result.error
				: t("sessionModal.updateError");

		toast.add({
			title: errorMessage,
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	}
}

// ---------------------------------------------------------------------------
// Create / edit session details.
// ---------------------------------------------------------------------------
const isEditingDetails = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const showDeleteConfirm = ref(false);

const { data: sessionTypes, execute: loadSessionTypes } = useFetch<
	SessionTypeRow[]
>("/api/session/types", { immediate: false, default: () => [] });
const { data: staffRows, execute: loadStaff } = useFetch<StaffRow[]>(
	"/api/session/staff",
	{ immediate: false, default: () => [] }
);

const typeItems = computed<PickerItem[]>(() =>
	(sessionTypes.value ?? []).map((ty) => ({ label: ty.name, id: ty.id }))
);
const staffItems = computed<PickerItem[]>(() =>
	(staffRows.value ?? []).map((s) => ({
		label:
			`${s.fName} ${s.lName}`.trim() +
			(s.type === "EVALUATOR" ? ` (${t("sessionModal.evaluator")})` : ""),
		id: s.id,
	}))
);

const selectedType = ref<PickerItem | undefined>();
const selectedStaff = ref<PickerItem | undefined>();
const form = reactive({
	date: "",
	time: "",
	duration: 60,
	maxAttendance: 1,
	comment: "",
});

function toDateInput(d: Date): string {
	return d.toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
}
function toTimeInput(d: Date): string {
	return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function resetFormFromSession() {
	const base = props.session
		? new Date(props.session.time)
		: (props.initialTime ?? new Date(Date.now() + 60 * 60 * 1000));
	form.date = toDateInput(base);
	form.time = toTimeInput(base);
	form.duration = props.session?.duration ?? 60;
	form.maxAttendance = props.session?.maxAttendance ?? 1;
	form.comment = props.session?.comment ?? "";
	selectedType.value = props.session?.Type?.id
		? { label: props.session.Type.name, id: props.session.Type.id }
		: undefined;
	selectedStaff.value = props.session?.Therapist?.id
		? {
				label: therapistName.value,
				id: props.session.Therapist.id,
			}
		: undefined;
}

async function ensurePickerDataLoaded() {
	await Promise.all([loadSessionTypes(), loadStaff()]);
}

onMounted(async () => {
	if (!canManage.value) return;
	if (isCreating.value) {
		isEditingDetails.value = true;
		resetFormFromSession();
		await ensurePickerDataLoaded();
		return;
	}
	void loadPatients();
});

function combinedDateTime(): Date {
	return new Date(`${form.date}T${form.time}`);
}

// The server rejects a session whose time is not strictly in the future
// (session/create + session/info both enforce `time > now`). Mirror that here
// so a past slot — e.g. an earlier day in the visible week — surfaces inline
// instead of failing with a generic 400 on submit.
const isTimeInFuture = computed(() => {
	if (!form.date || !form.time) return false;
	const dt = combinedDateTime();
	return !Number.isNaN(dt.getTime()) && dt.getTime() > Date.now();
});

const canSubmitDetails = computed(
	() =>
		!!selectedType.value &&
		!!selectedStaff.value &&
		!!form.date &&
		!!form.time &&
		isTimeInFuture.value &&
		form.duration > 0 &&
		form.maxAttendance >= 1
);

async function startEditing() {
	resetFormFromSession();
	if (!sessionTypes.value?.length || !staffRows.value?.length) {
		await ensurePickerDataLoaded();
	}
	isEditingDetails.value = true;
}

async function submitCreate() {
	if (!selectedType.value || !selectedStaff.value) return;
	isSaving.value = true;
	try {
		await $fetch("/api/session/create", {
			method: "POST",
			body: {
				typeId: selectedType.value.id,
				therapistId: selectedStaff.value.id,
				time: combinedDateTime().toISOString(),
				duration: form.duration,
				maxAttendance: form.maxAttendance,
				comment: form.comment || undefined,
			},
		});
		toast.add({
			title: t("sessionModal.createSuccess"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
		emit("changed");
		open.value = false;
	} catch (err) {
		toast.add({
			title: extractErrorMessage(err, t("sessionModal.createError")),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	} finally {
		isSaving.value = false;
	}
}

async function submitEdit() {
	if (!props.session || !selectedType.value || !selectedStaff.value) return;
	isSaving.value = true;
	try {
		await $fetch("/api/session/info", {
			method: "PUT",
			body: {
				id: props.session.id,
				typeId: selectedType.value.id,
				therapistId: selectedStaff.value.id,
				time: combinedDateTime().toISOString(),
				duration: form.duration,
				maxAttendance: form.maxAttendance,
				comment: form.comment || null,
			},
		});
		toast.add({
			title: t("sessionModal.updateSuccess"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
		isEditingDetails.value = false;
		emit("changed");
	} catch (err) {
		toast.add({
			title: extractErrorMessage(err, t("sessionModal.updateError")),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	} finally {
		isSaving.value = false;
	}
}

async function confirmDelete() {
	if (!props.session) return;
	isDeleting.value = true;
	try {
		await $fetch(`/api/session/${props.session.id}`, { method: "DELETE" });
		toast.add({
			title: t("sessionModal.deleteSuccess"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
		emit("changed");
		open.value = false;
	} catch (err) {
		toast.add({
			title: extractErrorMessage(err, t("sessionModal.deleteError")),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	} finally {
		isDeleting.value = false;
		showDeleteConfirm.value = false;
	}
}

const modalTitle = computed(() => {
	if (isCreating.value) return t("sessionModal.newSession");
	return props.session?.Type?.name ?? t("sessionModal.session");
});
const modalDescription = computed(() =>
	isCreating.value ? undefined : formattedTime.value
);
</script>

<template>
	<UModal
		v-model:open="open"
		:title="modalTitle"
		:description="modalDescription"
	>
		<template #body>
			<div class="space-y-4">
				<!-- Editable details: create mode, or edit mode on an existing session -->
				<div v-if="isEditingDetails" class="space-y-3">
					<UFormField :label="t('sessionModal.sessionType')" required>
						<USelectMenu
							v-model="selectedType"
							:items="typeItems"
							:placeholder="t('sessionModal.selectType')"
							class="w-full"
						/>
					</UFormField>
					<UFormField :label="t('sessionModal.staff')" required>
						<USelectMenu
							v-model="selectedStaff"
							:items="staffItems"
							:placeholder="t('sessionModal.selectStaff')"
							class="w-full"
						/>
					</UFormField>
					<div class="grid grid-cols-2 gap-3">
						<UFormField :label="t('sessionModal.date')" required>
							<UInput
								v-model="form.date"
								type="date"
								class="w-full"
							/>
						</UFormField>
						<UFormField :label="t('sessionModal.time')" required>
							<UInput
								v-model="form.time"
								type="time"
								class="w-full"
							/>
						</UFormField>
					</div>
					<p
						v-if="form.date && form.time && !isTimeInFuture"
						class="text-error text-xs"
					>
						{{ t("sessionModal.timeMustBeFuture") }}
					</p>
					<div class="grid grid-cols-2 gap-3">
						<UFormField
							:label="t('sessionModal.duration')"
							required
						>
							<UInput
								v-model.number="form.duration"
								type="number"
								:min="1"
								class="w-full"
							/>
						</UFormField>
						<UFormField
							:label="t('sessionModal.maxAttendance')"
							required
						>
							<UInput
								v-model.number="form.maxAttendance"
								type="number"
								:min="1"
								:max="50"
								class="w-full"
							/>
						</UFormField>
					</div>
					<UFormField :label="t('sessionModal.comment')">
						<UTextarea
							v-model="form.comment"
							:rows="3"
							class="w-full"
						/>
					</UFormField>
				</div>

				<!-- Read view: therapist row (existing session, not editing) -->
				<div v-else-if="session" class="flex flex-col gap-0.5">
					<span class="text-muted text-sm font-medium">
						{{ t("sessionModal.therapist") }}
					</span>
					<span class="text-default text-sm">{{
						therapistName
					}}</span>
				</div>

				<template v-if="session">
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
						v-if="attendanceError"
						color="error"
						variant="subtle"
						icon="i-lucide-triangle-alert"
						:title="attendanceError"
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
							<NuxtLink
								:to="`/patientProfile/${sp.patientId}`"
								class="text-default hover:text-primary flex items-center gap-1 text-sm font-medium hover:underline"
							>
								{{ patientName(sp) }}
								<UIcon
									name="i-lucide-external-link"
									class="size-3 text-gray-400"
								/>
							</NuxtLink>

							<div class="flex items-center gap-1.5">
								<!-- NEW: Note actions for Therapists/Admins -->
								<template v-if="canWriteNotes">
									<template
										v-if="getNoteForPatient(sp.patientId)"
									>
										<UButton
											size="xs"
											color="success"
											variant="soft"
											icon="i-lucide-eye"
											@click="
												handleViewNote(
													getNoteForPatient(
														sp.patientId
													)!
												)
											"
										>
											{{ t("profile.columns.viewNote") }}
										</UButton>
										<UButton
											size="xs"
											color="primary"
											variant="soft"
											icon="i-lucide-pencil"
											@click="
												handleEditNote(
													getNoteForPatient(
														sp.patientId
													)!
												)
											"
										>
											{{ t("profile.columns.editNote") }}
										</UButton>
									</template>

									<UButton
										v-else
										size="xs"
										color="primary"
										variant="soft"
										icon="i-lucide-file-plus"
										@click="handleAddNote(sp.patientId)"
									>
										{{ t("profile.columns.addNote") }}
									</UButton>

									<UButton
										v-if="
											!getReportForPatient(sp.patientId)
										"
										size="xs"
										color="primary"
										variant="soft"
										icon="i-lucide-clipboard-plus"
										@click="
											handleCreateReport(sp.patientId)
										"
									>
										{{ t("report.createButton") }}
									</UButton>
									<UBadge
										v-else
										color="neutral"
										variant="subtle"
										:label="t('report.reportSubmitted')"
									/>
								</template>

								<UButton
									v-if="canManage"
									color="error"
									variant="ghost"
									size="xs"
									:loading="
										removingPatientId === sp.patientId
									"
									:label="t('sessionModal.remove')"
									@click="removePatient(sp.patientId)"
								/>
							</div>
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
								:placeholder="
									t('sessionModal.searchPlaceholder')
								"
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
									v-if="
										searchQuery && !availablePatients.length
									"
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
				</template>

				<div
					v-if="showDeleteConfirm"
					class="border-error/50 bg-error/5 flex flex-col gap-2 rounded-md border p-3"
				>
					<p class="text-default text-sm">
						{{ t("sessionModal.deleteConfirm") }}
					</p>
					<div class="flex justify-end gap-2">
						<UButton
							color="neutral"
							variant="ghost"
							size="xs"
							:label="t('sessionModal.cancel')"
							@click="showDeleteConfirm = false"
						/>
						<UButton
							color="error"
							size="xs"
							:loading="isDeleting"
							:label="t('sessionModal.confirmDelete')"
							@click="confirmDelete"
						/>
					</div>
				</div>
			</div>
		</template>

		<template #footer>
			<div class="flex w-full items-center justify-between gap-2">
				<div class="flex gap-2">
					<template v-if="canManage && session && !isEditingDetails">
						<UButton
							color="neutral"
							variant="outline"
							icon="i-lucide-pencil"
							:label="t('sessionModal.edit')"
							@click="startEditing"
						/>
						<UButton
							color="error"
							variant="outline"
							icon="i-lucide-trash-2"
							:label="t('sessionModal.delete')"
							@click="showDeleteConfirm = true"
						/>
					</template>
				</div>
				<div class="flex gap-2">
					<UButton
						v-if="isEditingDetails && session"
						color="neutral"
						variant="ghost"
						:label="t('sessionModal.cancel')"
						@click="isEditingDetails = false"
					/>
					<UButton
						v-if="isEditingDetails"
						:loading="isSaving"
						:disabled="!canSubmitDetails"
						:label="
							isCreating
								? t('sessionModal.create')
								: t('sessionModal.save')
						"
						@click="isCreating ? submitCreate() : submitEdit()"
					/>
					<UButton
						v-if="!isEditingDetails"
						color="neutral"
						variant="outline"
						:label="t('sessionModal.close')"
						@click="open = false"
					/>
				</div>
			</div>
		</template>
	</UModal>

	<!-- Therapy Note Modals -->
	<TherapyReportModal
		v-if="canWriteNotes"
		v-model="noteModals.progressReport"
		:patient-id="activePatientId"
		:editing-note="editingNote ?? undefined"
		@save="handleNoteSave"
	/>

	<TherapyViewNoteModal
		v-if="canWriteNotes"
		v-model="noteModals.viewNote"
		:note="activeNote"
	/>

	<TherapyCreateReportModal
		v-if="canWriteNotes"
		v-model="createReportModalOpen"
		:patient-id="reportPatientId"
		@save="handleReportSave"
	/>
</template>
