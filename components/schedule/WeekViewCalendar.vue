<template>
	<div class="font-sc-encode overflow-auto">
		<div class="grid min-w-[980px] grid-cols-6 text-center">
			<div class="bg-blay border-smoky border p-2 text-lg font-semibold">
				Time
			</div>
			<div
				v-for="day in dayNames"
				:key="day"
				class="bg-blay border-smoky border p-2 text-lg font-semibold"
			>
				{{ day }}
			</div>

			<div class="border-smoky border">
				<div
					v-for="hour in hours"
					:key="`time-${hour}`"
					class="border-smoky h-[104px] border-b px-2 py-1 text-left text-sm"
				>
					{{ militaryTimeToTwelveHr(hour) }}
				</div>
			</div>

			<div
				v-for="dayIndex in 5"
				:key="`day-col-${dayIndex}`"
				class="border-smoky relative border"
			>
				<div
					v-for="hour in hours"
					:key="`grid-${dayIndex}-${hour}`"
					class="border-smoky h-[104px] border-b"
				></div>

				<div
					v-for="session in thisWeekSessions[dayIndex - 1]"
					:key="session.id"
					class="absolute right-0 left-0 mx-1 rounded border-2 border-blue-950/50 bg-blue-100 px-2 py-1 text-left text-xs shadow-sm"
					:style="{
						top: getSessionTop(session),
						height: getSessionHeight(session),
					}"
				>
					<div class="truncate font-bold">
						{{ session.Type?.name }}
					</div>
					<div class="truncate">
						{{ session.Therapist?.fName }}
						{{ session.Therapist?.lName }}
					</div>
					<div>{{ getSessionDurationLabel(session) }}</div>
				</div>

				<div
					v-for="session in combinedReferrals[dayIndex - 1]"
					:key="session.id"
					class="absolute right-0 left-0 mx-1 flex cursor-pointer items-center justify-center rounded px-2 py-1 text-xs shadow-sm"
					:style="{
						top: getSessionTop(session),
						height: getSessionHeight(session),
						backgroundColor: getReferralColor(session.id).bg,
						color: getReferralColor(session.id).text,
					}"
					@click="selectReferral(session)"
				>
					<span class="text-center text-[30px] font-semibold">
						{{ session.patient.firstName }}
					</span>
				</div>
			</div>
		</div>

		<div
			v-if="selectedReferral"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
			@click.self="selectedReferral = null"
		>
			<div
				class="flex h-[400px] w-96 flex-col rounded bg-white shadow-xl"
			>
				<div class="border-b border-gray-200 px-6 pt-6 pb-4">
					<div class="text-xl font-bold text-gray-800">
						Referral Details
					</div>
				</div>

				<div class="flex flex-col gap-4 px-6 py-4">
					<div class="flex flex-col gap-1">
						<span class="text-sm font-medium text-gray-500"
							>Patient</span
						>
						<span class="text-sm text-gray-800">{{
							selectedReferral.patient.firstName
						}}</span>
					</div>

					<div class="flex flex-col gap-1">
						<span class="text-sm font-medium text-gray-500"
							>Time</span
						>
						<span class="text-sm text-gray-800">{{
							formatReferralTime(selectedReferral.time)
						}}</span>
					</div>

					<div
						v-if="selectedReferral.therapyRecommendation"
						class="flex flex-col gap-1"
					>
						<span class="text-sm font-medium text-gray-500"
							>Therapy Recommendation</span
						>
						<span class="text-sm text-gray-800">{{
							selectedReferral.therapyRecommendation
						}}</span>
					</div>

					<div
						v-if="selectedReferral.therapistType"
						class="flex flex-col gap-1"
					>
						<span class="text-sm font-medium text-gray-500"
							>Therapist Type</span
						>
						<span class="text-sm text-gray-800">{{
							selectedReferral.therapistType
						}}</span>
					</div>
				</div>

				<div
					class="flex justify-end border-t border-gray-200 px-6 py-4"
				>
					<button
						class="cursor-pointer rounded px-5 py-2 text-sm text-white"
						style="background-color: #1e3a5f"
						@click="selectedReferral = null"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useFetch, watch } from "#imports";
import { AccessPermission } from "~/types/permissions";

type SessionDetails = {
	id: string;
	time: string | Date;
	duration: number;
	typeId: string;
	Type: { name: string } | null;
	Therapist: { fName: string | null; lName: string | null } | null;
};

type ReferralItem = {
	id: string;
	time: string;
	duration: number;
	patient: { firstName: string };
	therapyRecommendation?: string;
	therapistType?: string;
	isReferral: true;
};

const props = defineProps<{
	week: Date;
	filter?: string[];
}>();

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const { access, userId } = useAuthState();

const sessions = ref<SessionDetails[]>([]);

watch(
	() => [props.week, props.filter, access.value, userId.value],
	() => {
		void refreshSessions();
	},
	{ immediate: true, deep: true }
);

async function refreshSessions() {
	const queryBase = { date: props.week.toISOString() };

	if (!access.value) {
		sessions.value = [];
		return;
	}

	if (
		access.value[AccessPermission.ADMIN] ||
		access.value[AccessPermission.USER_SERVICE]
	) {
		const query = {
			...queryBase,
			filter: props.filter?.length ? props.filter : undefined,
		};
		const { data } = await useFetch<SessionDetails[]>(
			"/api/session/schedule/all",
			{
				method: "GET",
				query,
				default: () => [],
			}
		);
		sessions.value = data.value ?? [];
		return;
	}

	if (access.value[AccessPermission.THERAPIST] && userId.value) {
		const { data } = await useFetch<SessionDetails[]>(
			"/api/session/schedule/therapist",
			{
				method: "GET",
				query: { ...queryBase, userId: userId.value },
				default: () => [],
			}
		);
		sessions.value = data.value ?? [];
		return;
	}

	if (userId.value) {
		const { data } = await useFetch<SessionDetails[]>(
			"/api/session/schedule/patient",
			{
				method: "GET",
				query: { ...queryBase, userId: userId.value },
				default: () => [],
			}
		);
		sessions.value = data.value ?? [];
		return;
	}

	sessions.value = [];
}

const thisWeekSessions = computed(() => {
	const grouped: SessionDetails[][] = [[], [], [], [], []];

	for (const session of sessions.value) {
		const day = new Date(session.time).getDay();
		if (day >= 1 && day <= 5) {
			grouped[day - 1]?.push(session);
		}
	}

	for (let i = 0; i < grouped.length; i++) {
		grouped[i]?.sort(
			(a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
		);
	}

	return grouped;
});

function getMonday(date: Date): Date {
	const d = new Date(date);
	const day = (d.getDay() + 6) % 7;
	d.setDate(d.getDate() - day);
	return d;
}

function getWeekDayIndex(date: Date): number {
	return (date.getDay() + 6) % 7;
}

const { data: referrals } = await useFetch("/api/session/referrals", {
	default: () => [],
});

const combinedReferrals = computed(() => {
	const grouped: ReferralItem[][] = [[], [], [], [], []];
	const refs = referrals.value ?? [];

	const weekStart = getMonday(new Date(props.week));
	weekStart.setHours(0, 0, 0, 0);

	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekStart.getDate() + 6);
	weekEnd.setHours(23, 59, 59, 999);

	for (const r of refs) {
		const date = new Date(r.scheduledDate);
		const referralMonday = getMonday(date);
		referralMonday.setHours(0, 0, 0, 0);

		if (referralMonday.getTime() !== weekStart.getTime()) continue;

		const day = getWeekDayIndex(date);
		if (day >= 0 && day < 5) {
			grouped[day].push({
				id: r.id,
				time: new Date(r.scheduledDate).toISOString(),
				duration: 60,
				patient: r.patient,
				therapyRecommendation: r.therapyRecommendation,
				therapistType: r.therapistType,
				isReferral: true,
			});
		}
	}

	return grouped;
});

const referralColors = [
	{ bg: "#bfdbfe", text: "#1e3a5f" },
	{ bg: "#bbf7d0", text: "#14532d" },
	{ bg: "#fde68a", text: "#713f12" },
	{ bg: "#fecaca", text: "#7f1d1d" },
	{ bg: "#e9d5ff", text: "#4c1d95" },
	{ bg: "#fed7aa", text: "#7c2d12" },
	{ bg: "#a5f3fc", text: "#164e63" },
	{ bg: "#fbcfe8", text: "#831843" },
];

const colorMap = new Map<string, { bg: string; text: string }>();

function getReferralColor(id: string) {
	if (!colorMap.has(id)) {
		colorMap.set(id, referralColors[colorMap.size % referralColors.length]);
	}
	return colorMap.get(id)!;
}

const selectedReferral = ref<ReferralItem | null>(null);

function selectReferral(session: ReferralItem) {
	selectedReferral.value = session;
}

function formatReferralTime(isoTime: string): string {
	return new Date(isoTime).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

const startHr = computed(() => {
	let earliest = 23;
	let found = false;

	for (const day of thisWeekSessions.value) {
		for (const session of day) {
			found = true;
			earliest = Math.min(earliest, new Date(session.time).getHours());
		}
	}

	for (const day of combinedReferrals.value) {
		for (const session of day) {
			found = true;
			earliest = Math.min(earliest, new Date(session.time).getHours());
		}
	}

	return found ? earliest : 8;
});

const endHr = computed(() => {
	let latest = 0;
	let found = false;

	for (const day of thisWeekSessions.value) {
		for (const session of day) {
			found = true;
			const start = new Date(session.time);
			const end = new Date(
				start.getTime() + session.duration * 60 * 1000
			);
			latest = Math.max(
				latest,
				end.getHours() + (end.getMinutes() > 0 ? 1 : 0)
			);
		}
	}

	for (const day of combinedReferrals.value) {
		for (const session of day) {
			found = true;
			const start = new Date(session.time);
			const end = new Date(
				start.getTime() + session.duration * 60 * 1000
			);
			latest = Math.max(
				latest,
				end.getHours() + (end.getMinutes() > 0 ? 1 : 0)
			);
		}
	}

	return found ? Math.max(latest, startHr.value + 1) : 17;
});

const hours = computed(() => {
	const list: number[] = [];
	for (let hr = startHr.value; hr <= endHr.value; hr++) {
		list.push(hr);
	}
	return list;
});

const pixelsPer15Min = 26;

function getSessionTop(session: { time: string | Date }): string {
	const date = new Date(session.time);
	const minutesFromTop =
		(date.getHours() - startHr.value) * 60 + date.getMinutes();
	return `${(minutesFromTop / 15) * pixelsPer15Min}px`;
}

function getSessionHeight(session: { duration: number }): string {
	return `${Math.max((session.duration / 15) * pixelsPer15Min, 24)}px`;
}

function getSessionDurationLabel(session: SessionDetails): string {
	const start = new Date(session.time);
	const end = new Date(start.getTime() + session.duration * 60 * 1000);
	const sMin = String(start.getMinutes()).padStart(2, "0");
	const eMin = String(end.getMinutes()).padStart(2, "0");
	return `${start.getHours()}:${sMin} - ${end.getHours()}:${eMin}`;
}

function militaryTimeToTwelveHr(h: number): string {
	if (h < 0 || h > 23) return "ERROR";
	if (h === 0) return "12 AM";
	if (h < 12) return `${h} AM`;
	if (h === 12) return "12 PM";
	return `${h - 12} PM`;
}
</script>
