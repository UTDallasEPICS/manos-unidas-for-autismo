<!-- Role-aware appointment calendar. USER_SERVICE/ADMIN get full CRUD (click to
     view/edit, click an empty slot or "New Session" to create, drag/resize to
     reschedule, delete). EVALUATOR/THERAPIST/PATIENT get a read-only view of
     their own sessions — click still opens the detail modal, just without the
     edit/delete/add-patient affordances (SessionDetailModal gates those itself). -->
<script setup lang="ts">
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type {
	DateSelectArg,
	DatesSetArg,
	EventClickArg,
	EventDropArg,
	EventInput,
	EventSourceFuncArg,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import { AccessPermission } from "~/types/permissions";
import SessionDetailModal from "~/components/schedule/SessionDetailModal.vue";
import type { SessionWithAttendance } from "~/components/schedule/sessionTypes";

const props = defineProps<{ filter?: string[] }>();

const { t, locale } = useI18n();
const { access, userId } = useAuthState();
const toast = useToast();

const canManage = computed(
	() =>
		!!access.value &&
		!!(
			access.value[AccessPermission.USER_SERVICE] ||
			access.value[AccessPermission.ADMIN]
		)
);

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);
const rangeTitle = ref("");
const currentViewType = ref("timeGridWeek");

const modalOpen = ref(false);
const activeSession = ref<SessionWithAttendance | null>(null);
const createInitialTime = ref<Date | null>(null);

function openView(session: SessionWithAttendance) {
	activeSession.value = session;
	createInitialTime.value = null;
	modalOpen.value = true;
}
function openCreate(date: Date) {
	if (!canManage.value) return;
	activeSession.value = null;
	createInitialTime.value = date;
	modalOpen.value = true;
}
function closeModal() {
	modalOpen.value = false;
}
function handleChanged() {
	calendarRef.value?.getApi().refetchEvents();
}

const TYPE_COLORS: Record<string, string> = {
	BLUE: "#3b82f6",
	GREEN: "#22c55e",
	ORANGE: "#f97316",
	PURPLE: "#a855f7",
	RED: "#ef4444",
	TEAL: "#0d9488",
	YELLOW: "#ca8a04",
};
const DEFAULT_EVENT_COLOR = "#4171b0"; // midnight-500 fallback

function toEvent(session: SessionWithAttendance): EventInput {
	const start = new Date(session.time);
	const end = new Date(start.getTime() + session.duration * 60 * 1000);
	return {
		id: session.id,
		title: session.Type?.name ?? t("calendar.session"),
		start,
		end,
		backgroundColor:
			TYPE_COLORS[session.Type?.color ?? ""] ?? DEFAULT_EVENT_COLOR,
		borderColor: "transparent",
		extendedProps: { session },
	};
}

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

async function loadSessions(
	startStr: string,
	endStr: string
): Promise<SessionWithAttendance[]> {
	if (!access.value) return [];

	if (
		access.value[AccessPermission.ADMIN] ||
		access.value[AccessPermission.USER_SERVICE]
	) {
		return await $fetch<SessionWithAttendance[]>(
			"/api/session/schedule/all",
			{
				query: {
					start: startStr,
					end: endStr,
					filter: props.filter?.length ? props.filter : undefined,
				},
			}
		);
	}

	if (
		(access.value[AccessPermission.THERAPIST] ||
			access.value[AccessPermission.EVALUATOR]) &&
		userId.value
	) {
		return await $fetch<SessionWithAttendance[]>(
			"/api/session/schedule/therapist",
			{ query: { userId: userId.value, start: startStr, end: endStr } }
		);
	}

	if (userId.value) {
		return await $fetch<SessionWithAttendance[]>(
			"/api/session/schedule/patient",
			{ query: { userId: userId.value, start: startStr, end: endStr } }
		);
	}

	return [];
}

async function fetchEvents(arg: EventSourceFuncArg): Promise<EventInput[]> {
	try {
		const sessions = await loadSessions(arg.startStr, arg.endStr);
		return sessions.map(toEvent);
	} catch (err) {
		toast.add({
			title: extractErrorMessage(err, t("calendar.loadError")),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
		return [];
	}
}

async function persistReschedule(
	session: SessionWithAttendance,
	start: Date,
	end: Date,
	revert: () => void
) {
	const duration = Math.round((end.getTime() - start.getTime()) / 60000);
	try {
		await $fetch("/api/session/info", {
			method: "PUT",
			body: { id: session.id, time: start.toISOString(), duration },
		});
		toast.add({
			title: t("calendar.rescheduleSuccess"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
	} catch (err) {
		revert();
		toast.add({
			title: extractErrorMessage(err, t("calendar.rescheduleError")),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	}
}

function handleEventDrop(info: EventDropArg) {
	if (!info.event.start || !info.event.end) return;
	const session = info.event.extendedProps.session as SessionWithAttendance;
	void persistReschedule(
		session,
		info.event.start,
		info.event.end,
		info.revert
	);
}
function handleEventResize(info: EventResizeDoneArg) {
	if (!info.event.start || !info.event.end) return;
	const session = info.event.extendedProps.session as SessionWithAttendance;
	void persistReschedule(
		session,
		info.event.start,
		info.event.end,
		info.revert
	);
}
function handleEventClick(info: EventClickArg) {
	openView(info.event.extendedProps.session as SessionWithAttendance);
}
function handleSelect(info: DateSelectArg) {
	openCreate(info.start);
	calendarRef.value?.getApi().unselect();
}
function handleDatesSet(arg: DatesSetArg) {
	rangeTitle.value = arg.view.title;
	currentViewType.value = arg.view.type;
}

const calendarOptions = computed(() => ({
	plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
	initialView: "timeGridWeek",
	headerToolbar: false as const,
	// Fill the calendar shell (which is sized to the viewport below) and let the
	// rows expand to fit, so the whole week is visible without scrolling. Hours
	// are trimmed to the clinic window and the all-day row is dropped to keep the
	// time grid compact.
	height: "100%" as const,
	expandRows: true,
	allDaySlot: false,
	slotMinTime: "07:00:00",
	slotMaxTime: "20:00:00",
	firstDay: 1,
	nowIndicator: true,
	selectable: canManage.value,
	selectMirror: true,
	editable: canManage.value,
	eventStartEditable: canManage.value,
	eventDurationEditable: canManage.value,
	events: fetchEvents,
	select: handleSelect,
	eventClick: handleEventClick,
	eventDrop: handleEventDrop,
	eventResize: handleEventResize,
	datesSet: handleDatesSet,
	locale: locale.value === "es" ? esLocale : "en",
}));

function goPrev() {
	calendarRef.value?.getApi().prev();
}
function goNext() {
	calendarRef.value?.getApi().next();
}
function goToday() {
	calendarRef.value?.getApi().today();
}
function setView(view: string) {
	calendarRef.value?.getApi().changeView(view);
}
</script>

<template>
	<div class="flex flex-col gap-3">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-1">
					<UButton
						icon="i-lucide-chevron-left"
						color="neutral"
						variant="outline"
						:aria-label="t('calendar.previous')"
						@click="goPrev"
					/>
					<UButton
						:label="t('calendar.today')"
						color="neutral"
						variant="outline"
						@click="goToday"
					/>
					<UButton
						icon="i-lucide-chevron-right"
						color="neutral"
						variant="outline"
						:aria-label="t('calendar.next')"
						@click="goNext"
					/>
				</div>
				<h2 class="text-highlighted text-lg font-semibold">
					{{ rangeTitle }}
				</h2>
			</div>

			<div class="flex items-center gap-3">
				<div class="flex items-center gap-1">
					<UButton
						:label="t('calendar.month')"
						:color="
							currentViewType === 'dayGridMonth'
								? 'primary'
								: 'neutral'
						"
						variant="outline"
						@click="setView('dayGridMonth')"
					/>
					<UButton
						:label="t('calendar.week')"
						:color="
							currentViewType === 'timeGridWeek'
								? 'primary'
								: 'neutral'
						"
						variant="outline"
						@click="setView('timeGridWeek')"
					/>
					<UButton
						:label="t('calendar.day')"
						:color="
							currentViewType === 'timeGridDay'
								? 'primary'
								: 'neutral'
						"
						variant="outline"
						@click="setView('timeGridDay')"
					/>
				</div>
				<UButton
					v-if="canManage"
					icon="i-lucide-plus"
					:label="t('calendar.newSession')"
					@click="openCreate(new Date())"
				/>
			</div>
		</div>

		<div
			class="calendar-shell border-default h-[calc(100vh-12rem)] rounded-lg border p-2"
		>
			<!-- FullCalendar manipulates the DOM directly and isn't SSR-safe
			     (crashes on the server: "Class constructor ... cannot be invoked
			     without 'new'"), so it's client-only. -->
			<ClientOnly>
				<FullCalendar ref="calendarRef" :options="calendarOptions" />
				<template #fallback>
					<div class="flex h-96 items-center justify-center">
						<UIcon
							name="i-lucide-loader-circle"
							class="text-muted size-6 animate-spin"
						/>
					</div>
				</template>
			</ClientOnly>
		</div>

		<SessionDetailModal
			v-if="modalOpen"
			:session="activeSession"
			:initial-time="createInitialTime"
			@close="closeModal"
			@changed="handleChanged"
		/>
	</div>
</template>

<style scoped>
/* Align FullCalendar's default palette with the NuxtUI midnight theme +
   dark-mode tokens (assets/css/main.css / @nuxt/ui), instead of its own
   default blue/gray look. */
.calendar-shell :deep(.fc) {
	--fc-border-color: var(--ui-border);
	--fc-page-bg-color: var(--ui-bg);
	--fc-neutral-bg-color: var(--ui-bg-elevated);
	--fc-list-event-hover-bg-color: var(--ui-bg-elevated);
	--fc-today-bg-color: var(--ui-bg-accented);
	--fc-event-selected-overlay-color: var(--ui-primary, #4171b0);
	color: var(--ui-text);
}
.calendar-shell :deep(.fc .fc-timegrid-slot-label),
.calendar-shell :deep(.fc .fc-col-header-cell-cushion),
.calendar-shell :deep(.fc .fc-daygrid-day-number) {
	color: var(--ui-text-muted);
}
.calendar-shell :deep(.fc-event) {
	cursor: pointer;
	border-radius: 0.25rem;
}
</style>
