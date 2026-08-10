<!-- Patient appointments history (#177). Renders inside the default sidebar
     shell. Upcoming + past sessions from /api/session/schedule/patient-all. -->
<script setup lang="ts">
import type { SessionWithAttendance } from "~/components/schedule/sessionTypes";

const { t, locale } = useI18n();
const localePath = useLocalePath();

useDashboardGuard("PATIENT");
const { userId } = useAuthState();

const { data, status, error, refresh } = await useFetch<
	SessionWithAttendance[]
>("/api/session/schedule/patient-all", {
	query: computed(() => ({ userId: userId.value })),
	default: () => [],
});

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
	const th = session.Therapist;
	return th ? `${th.fName ?? ""} ${th.lName ?? ""}`.trim() : "—";
}

function formatSessionTime(session: SessionWithAttendance): string {
	const start = new Date(session.time);
	const end = new Date(start.getTime() + session.duration * 60 * 1000);
	const dateStr = start.toLocaleDateString(locale.value, {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
	const opts = { hour: "2-digit", minute: "2-digit" } as const;
	return `${dateStr}, ${start.toLocaleTimeString(locale.value, opts)} - ${end.toLocaleTimeString(locale.value, opts)}`;
}
</script>

<template>
	<div class="mx-auto w-full max-w-3xl">
		<header class="mb-6 flex flex-wrap items-center justify-between gap-3">
			<h1 class="text-highlighted text-xl font-semibold">
				{{ t("appointments.title") }}
			</h1>
			<UButton
				:to="localePath({ name: 'requestForm' })"
				icon="i-lucide-calendar-plus"
				:label="t('appointments.request')"
			/>
		</header>

		<!-- Loading -->
		<div v-if="status === 'pending'" class="flex flex-col gap-3">
			<USkeleton v-for="n in 4" :key="n" class="h-20 w-full" />
		</div>

		<!-- Error -->
		<UAlert
			v-else-if="error"
			color="error"
			variant="subtle"
			icon="i-lucide-triangle-alert"
			:title="t('common.loadError')"
			:actions="[
				{
					label: t('common.retry'),
					color: 'neutral',
					variant: 'outline',
					onClick: () => refresh(),
				},
			]"
		/>

		<template v-else>
			<section class="mb-8">
				<h2 class="text-muted mb-3 text-sm font-semibold uppercase">
					{{ t("appointments.upcoming") }}
				</h2>
				<p v-if="!upcoming.length" class="text-dimmed text-sm">
					{{ t("appointments.noUpcoming") }}
				</p>
				<div v-else class="flex flex-col gap-2">
					<UCard
						v-for="session in upcoming"
						:key="session.id"
						:ui="{ body: 'sm:p-4' }"
					>
						<p class="text-highlighted font-medium">
							{{
								session.Type?.name ?? t("appointments.session")
							}}
						</p>
						<p class="text-muted text-sm">
							{{ formatSessionTime(session) }}
						</p>
						<p class="text-muted text-sm">
							{{ therapistName(session) }}
						</p>
					</UCard>
				</div>
			</section>

			<section>
				<h2 class="text-muted mb-3 text-sm font-semibold uppercase">
					{{ t("appointments.past") }}
				</h2>
				<p v-if="!past.length" class="text-dimmed text-sm">
					{{ t("appointments.noPast") }}
				</p>
				<div v-else class="flex flex-col gap-2">
					<UCard
						v-for="session in past"
						:key="session.id"
						class="opacity-75"
						:ui="{ body: 'sm:p-4' }"
					>
						<p class="text-highlighted font-medium">
							{{
								session.Type?.name ?? t("appointments.session")
							}}
						</p>
						<p class="text-muted text-sm">
							{{ formatSessionTime(session) }}
						</p>
						<p class="text-muted text-sm">
							{{ therapistName(session) }}
						</p>
					</UCard>
				</div>
			</section>
		</template>
	</div>
</template>
