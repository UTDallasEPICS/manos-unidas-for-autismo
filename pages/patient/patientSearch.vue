<!-- Staff patient directory: search all patients, open a quick-view modal per
     row (which links to the full profile). Rebuilt on NuxtUI (UTable). -->
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import PatientModal from "~/components/therapy/PatientModal.vue";

const { t } = useI18n();

interface PatientRow {
	id: string;
	name: string;
	type: string;
	age: number | null;
	gender: string | null;
}
interface PatientDetail {
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
	status?: string;
	insurance?: string | null;
}

// Every patient (not just those with a referral). Endpoint is staff-gated and
// returns a minimal projection; full detail is fetched on demand below.
const {
	data: patients,
	status,
	error,
} = await useFetch<PatientRow[]>("/api/search/all", { default: () => [] });

const searchQuery = ref("");
const rows = computed(() =>
	(patients.value ?? []).filter((p) =>
		p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
	)
);

const columns = computed<TableColumn<PatientRow>[]>(() => [
	{ accessorKey: "name", header: t("patients.name") },
	{ accessorKey: "age", header: t("patients.age") },
	{ accessorKey: "gender", header: t("patients.gender") },
	{ accessorKey: "actions", header: "" },
]);

const showModal = ref(false);
const selected = ref<PatientDetail | null>(null);

async function openModal(row: PatientRow) {
	try {
		const u = await $fetch<{
			email: string;
			phone: string;
			whatsApp: string | null;
			contactPref: string | null;
			NonEmployee: {
				Patient: {
					identification: string;
					diagnosed: boolean;
					sponsorId: string | null;
					status: string | null;
					insurance: string | null;
				} | null;
			} | null;
		} | null>("/api/profile/patient", { query: { id: row.id } });

		const pat = u?.NonEmployee?.Patient ?? null;
		selected.value = {
			id: row.id,
			name: row.name,
			gender: row.gender ?? undefined,
			age: row.age ?? undefined,
			identification: pat?.identification,
			email: u?.email,
			phone: u?.phone,
			whatsApp: u?.whatsApp ?? undefined,
			contactPref: u?.contactPref ?? undefined,
			diagnosed: pat?.diagnosed,
			sponsorId: pat?.sponsorId,
			status: pat?.status ?? undefined,
			insurance: pat?.insurance ?? undefined,
		};
		showModal.value = true;
	} catch (err) {
		console.error("Failed to load patient detail:", err);
	}
}
</script>

<template>
	<div class="mx-auto w-full max-w-5xl">
		<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
			<h1 class="text-highlighted text-xl font-semibold">
				{{ t("patients.title") }}
			</h1>
			<UInput
				v-model="searchQuery"
				icon="i-lucide-search"
				:placeholder="t('patients.searchPlaceholder')"
				class="w-64"
			/>
		</div>

		<UAlert
			v-if="error"
			color="error"
			variant="subtle"
			icon="i-lucide-triangle-alert"
			:title="t('common.loadError')"
		/>
		<div
			v-else-if="!rows.length && status !== 'pending'"
			class="border-default text-muted rounded-lg border border-dashed py-12 text-center"
		>
			{{ t("patients.empty") }}
		</div>
		<UTable
			v-else
			:data="rows"
			:columns="columns"
			:loading="status === 'pending'"
		>
			<template #age-cell="{ row }">{{
				row.original.age ?? "—"
			}}</template>
			<template #gender-cell="{ row }">
				{{ row.original.gender ?? "—" }}
			</template>
			<template #actions-cell="{ row }">
				<UButton
					size="xs"
					color="neutral"
					variant="outline"
					icon="i-lucide-eye"
					:label="t('patients.view')"
					@click="openModal(row.original)"
				/>
			</template>
		</UTable>

		<PatientModal
			v-if="showModal && selected"
			:patient="selected"
			@close="showModal = false"
		/>
	</div>
</template>
