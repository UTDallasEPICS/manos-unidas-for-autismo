<template>
	<div class="font-sc-encode p-4">
		<div class="mb-6 flex flex-row items-center">
			<h1 class="font-cormorant-garamond text-3xl font-bold text-nowrap">
				My Appointments
			</h1>
			<div class="w-full"></div>
			<NuxtLink :to="{ name: 'requestForm' }" class="btn text-nowrap">
				Request Appointment
			</NuxtLink>
		</div>

		<section class="mb-8">
			<h2 class="mb-3 text-xl font-semibold text-gray-800">
				Upcoming Appointments
			</h2>
			<div v-if="!upcoming.length" class="text-sm text-gray-400">
				No upcoming appointments.
			</div>
			<div class="flex flex-col gap-2">
				<div
					v-for="session in upcoming"
					:key="session.id"
					class="rounded border border-gray-200 px-4 py-3"
				>
					<div class="font-bold">
						{{ session.Type?.name ?? "Session" }}
					</div>
					<div class="text-sm text-gray-600">
						{{ formatSessionTime(session) }}
					</div>
					<div class="text-sm text-gray-600">
						{{ therapistName(session) }}
					</div>
				</div>
			</div>
		</section>

		<section>
			<h2 class="mb-3 text-xl font-semibold text-gray-800">
				Past Appointments
			</h2>
			<div v-if="!past.length" class="text-sm text-gray-400">
				No past appointments.
			</div>
			<div class="flex flex-col gap-2">
				<div
					v-for="session in past"
					:key="session.id"
					class="rounded border border-gray-200 bg-gray-50 px-4 py-3"
				>
					<div class="font-bold">
						{{ session.Type?.name ?? "Session" }}
					</div>
					<div class="text-sm text-gray-600">
						{{ formatSessionTime(session) }}
					</div>
					<div class="text-sm text-gray-600">
						{{ therapistName(session) }}
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { computed, useFetch } from "#imports";
import type { SessionWithAttendance } from "~/components/schedule/sessionTypes";

useDashboardGuard("PATIENT");
const { userId } = useAuthState();

const { data } = await useFetch<SessionWithAttendance[]>(
	"/api/session/schedule/patient-all",
	{
		query: { userId: userId.value },
		default: () => [],
	}
);

const sessions = computed(() => data.value ?? []);

const upcoming = computed(() =>
	sessions.value
		.filter((s) => new Date(s.time) >= new Date())
		.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
);

const past = computed(() =>
	sessions.value
		.filter((s) => new Date(s.time) < new Date())
		.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
);

function therapistName(session: SessionWithAttendance): string {
	const t = session.Therapist;
	return t ? `${t.fName ?? ""} ${t.lName ?? ""}`.trim() : "—";
}

function formatSessionTime(session: SessionWithAttendance): string {
	const start = new Date(session.time);
	const end = new Date(start.getTime() + session.duration * 60 * 1000);
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
}
</script>
