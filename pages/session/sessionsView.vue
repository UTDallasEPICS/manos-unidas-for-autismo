<template>
	<div class="p-6">
		<!-- Filters -->
		<div class="mb-6 flex flex-wrap items-center gap-4">
			<!-- Date presets -->
			<div class="flex gap-2">
				<UButton
					size="sm"
					:variant="activePreset === 'week' ? 'solid' : 'soft'"
					color="neutral"
					@click="setPreset('week')"
				>
					{{ t("sessions.weekly") }}
				</UButton>
				<UButton
					size="sm"
					:variant="activePreset === 'month' ? 'solid' : 'soft'"
					color="neutral"
					@click="setPreset('month')"
				>
					{{ t("sessions.monthly") }}
				</UButton>
				<UButton
					size="sm"
					:variant="activePreset === 'all' ? 'solid' : 'soft'"
					color="neutral"
					@click="setPreset('all')"
				>
					{{ t("sessions.allTime") }}
				</UButton>
			</div>

			<!-- Custom date range -->
			<div class="flex items-center gap-2">
				<UInput
					v-model="startDate"
					type="date"
					size="sm"
					@change="
						activePreset = 'custom';
						fetchSessions();
					"
				/>
				<span class="text-gray-500">{{ t("sessions.to") }}</span>
				<UInput
					v-model="endDate"
					type="date"
					size="sm"
					@change="
						activePreset = 'custom';
						fetchSessions();
					"
				/>
			</div>

			<!-- Therapist Multi-Select Dropdown -->
			<USelectMenu
				v-model="selectedTherapistIds"
				:items="therapistMenuOptions"
				value-key="value"
				label-key="label"
				:placeholder="t('sessions.allTherapists')"
				multiple
				size="sm"
				class="w-56"
			>
				<template #item-leading="{ item }">
					<!-- Action row: Clear selection -->
					<template v-if="item.isAction">
						<UButton
							size="xs"
							color="neutral"
							variant="subtle"
							class="w-full justify-center"
							:disabled="selectedTherapistIds.length === 0"
							@click.stop="selectedTherapistIds = []"
						>
							{{ t("sessions.clearFilter") }}
						</UButton>
					</template>
					<!-- Standard item checkbox -->
					<template v-else>
						<UCheckbox
							:model-value="
								selectedTherapistIds.includes(item.value)
							"
							class="pointer-events-none mr-2"
						/>
					</template>
				</template>
			</USelectMenu>

			<!-- Session Type Multi-Select Dropdown -->
			<USelectMenu
				v-model="selectedTypeIds"
				:items="typeMenuOptions"
				value-key="value"
				label-key="label"
				:placeholder="t('sessions.allTypes')"
				multiple
				size="sm"
				class="w-56"
			>
				<template #item-leading="{ item }">
					<!-- Action row: Clear selection -->
					<template v-if="item.isAction">
						<UButton
							size="xs"
							color="neutral"
							variant="subtle"
							class="w-full justify-center"
							:disabled="selectedTypeIds.length === 0"
							@click.stop="selectedTypeIds = []"
						>
							{{ t("sessions.clearFilter") }}
						</UButton>
					</template>
					<!-- Standard item checkbox -->
					<template v-else>
						<UCheckbox
							:model-value="selectedTypeIds.includes(item.value)"
							class="pointer-events-none mr-2"
						/>
					</template>
				</template>
			</USelectMenu>

			<!-- Available spots toggle -->
			<label class="flex items-center gap-2 text-sm">
				<UCheckbox v-model="onlyAvailable" />
				{{ t("sessions.openSpots") }}
			</label>

			<!-- Clear All Filters Global Action -->
			<UButton
				v-if="hasActiveFilters"
				size="sm"
				color="neutral"
				variant="ghost"
				icon="i-heroicons-x-mark"
				@click="clearAllFilters"
			>
				{{ t("sessions.clearAllFilters") }}
			</UButton>
		</div>

		<!-- Table -->
		<UTable
			:data="filteredSessions"
			:columns="columns"
			:loading="loading"
			:empty="t('sessions.noData')"
		>
			<template #time-cell="{ row }">
				{{ formatDate(row.original.time) }}
			</template>

			<template #therapist-cell="{ row }">
				{{ row.original.Therapist?.fName }}
				{{ row.original.Therapist?.lName }}
			</template>

			<template #type-cell="{ row }">
				{{ row.original.Type?.name ?? "—" }}
			</template>

			<template #spots-cell="{ row }">
				<span
					:class="
						spotsAvailable(row.original) > 0
							? 'text-green-600'
							: 'text-red-500'
					"
				>
					{{ row.original.Patients.length }} /
					{{ row.original.maxAttendance }}
				</span>
			</template>

			<template #patients-cell="{ row }">
				<span
					v-if="!row.original.Patients.length"
					class="text-gray-400 italic"
				>
					{{ t("sessions.noPatients") }}
				</span>
				<span v-else>
					{{
						row.original.Patients.map(
							(sp: any) =>
								`${sp.Patient.User.User.fName} ${sp.Patient.User.User.lName}`
						).join(", ")
					}}
				</span>
			</template>
		</UTable>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const { t } = useI18n();

definePageMeta({
	path: "/sessionsView",
	title: "sessions.sessions",
});

interface SessionPatientEntry {
	Patient: {
		User: {
			User: {
				fName: string;
				lName: string;
			};
		};
	};
}

interface SessionEntry {
	id: string;
	time: string;
	duration: number;
	maxAttendance: number;
	Therapist: { id: string; fName: string; lName: string } | null;
	Type: { id: string; name: string } | null;
	Patients: SessionPatientEntry[];
}

interface MenuItemOption {
	value: string;
	label: string;
	isAction?: boolean;
}

const loading = ref(false);
const allSessions = ref<SessionEntry[]>([]);

const startDate = ref("");
const endDate = ref("");

const selectedTherapistIds = ref<string[]>([]);
const selectedTypeIds = ref<string[]>([]);
const onlyAvailable = ref(false);
const activePreset = ref<"week" | "month" | "all" | "custom">("all");

const columns = computed(() => [
	{ id: "time", accessorKey: "time", header: t("sessions.dateTime") },
	{ id: "therapist", header: t("sessions.therapist") },
	{ id: "type", header: t("sessions.type") },
	{ id: "spots", header: t("sessions.spots") },
	{ id: "patients", header: t("sessions.patients") },
]);

// Base option lists derived from fetched sessions
const baseTherapistOptions = computed<MenuItemOption[]>(() => {
	const seen = new Set<string>();
	const options: MenuItemOption[] = [];
	for (const s of allSessions.value) {
		if (s.Therapist && !seen.has(s.Therapist.id)) {
			seen.add(s.Therapist.id);
			options.push({
				value: s.Therapist.id,
				label: `${s.Therapist.fName} ${s.Therapist.lName}`,
			});
		}
	}
	return options;
});

const baseTypeOptions = computed<MenuItemOption[]>(() => {
	const seen = new Set<string>();
	const options: MenuItemOption[] = [];
	for (const s of allSessions.value) {
		if (s.Type && !seen.has(s.Type.id)) {
			seen.add(s.Type.id);
			options.push({ value: s.Type.id, label: s.Type.name });
		}
	}
	return options;
});

// Dropdown menu options with embedded top "Clear Filter" action
const therapistMenuOptions = computed<MenuItemOption[]>(() => {
	if (baseTherapistOptions.value.length === 0) return [];
	return [
		{ value: "__action__", label: "", isAction: true },
		...baseTherapistOptions.value,
	];
});

const typeMenuOptions = computed<MenuItemOption[]>(() => {
	if (baseTypeOptions.value.length === 0) return [];
	return [
		{ value: "__action__", label: "", isAction: true },
		...baseTypeOptions.value,
	];
});

// Active filter detector for global clear button
const hasActiveFilters = computed(() => {
	const hasTherapist = selectedTherapistIds.value.some(
		(id) => id !== "__action__"
	);
	const hasType = selectedTypeIds.value.some((id) => id !== "__action__");
	const hasDateRange =
		activePreset.value !== "all" ||
		Boolean(startDate.value) ||
		Boolean(endDate.value);

	return hasTherapist || hasType || onlyAvailable.value || hasDateRange;
});

function clearAllFilters() {
	selectedTherapistIds.value = [];
	selectedTypeIds.value = [];
	onlyAvailable.value = false;

	if (activePreset.value !== "all" || startDate.value || endDate.value) {
		setPreset("all");
	}
}

const filteredSessions = computed(() => {
	const therapistIds = selectedTherapistIds.value.filter(
		(id) => id !== "__action__"
	);
	const typeIds = selectedTypeIds.value.filter((id) => id !== "__action__");

	return allSessions.value.filter((s) => {
		if (
			therapistIds.length > 0 &&
			(!s.Therapist || !therapistIds.includes(s.Therapist.id))
		) {
			return false;
		}

		if (typeIds.length > 0 && (!s.Type || !typeIds.includes(s.Type.id))) {
			return false;
		}

		if (onlyAvailable.value && spotsAvailable(s) <= 0) {
			return false;
		}

		return true;
	});
});

function spotsAvailable(session: SessionEntry): number {
	return session.maxAttendance - session.Patients.length;
}

function formatDate(isoString: string): string {
	const d = new Date(isoString);
	return (
		d.toLocaleDateString() +
		" " +
		d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
	);
}

function setPreset(preset: "week" | "month" | "all") {
	activePreset.value = preset;
	const now = new Date();

	if (preset === "all") {
		startDate.value = "";
		endDate.value = "";
	} else if (preset === "week") {
		const day = (now.getDay() + 6) % 7;
		const monday = new Date(now);
		monday.setDate(now.getDate() - day);
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);
		startDate.value = monday.toISOString().split("T")[0]!;
		endDate.value = sunday.toISOString().split("T")[0]!;
	} else if (preset === "month") {
		const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
		const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		startDate.value = firstDay.toISOString().split("T")[0]!;
		endDate.value = lastDay.toISOString().split("T")[0]!;
	}

	fetchSessions();
}

async function fetchSessions() {
	loading.value = true;
	try {
		const query: Record<string, string> = {};
		if (startDate.value) query.startDate = startDate.value;
		if (endDate.value) query.endDate = endDate.value;

		allSessions.value = await $fetch<SessionEntry[]>("/api/session", {
			query,
		});
	} catch (err) {
		console.error("Failed to fetch sessions:", err);
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	fetchSessions();
});
</script>
