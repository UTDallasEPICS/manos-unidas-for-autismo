<template>
	<div class="font-sc-encode p-4">
		<!-- Header + Search -->
		<div class="mb-4 flex items-center">
			<h1 class="font-cormorant-garamond text-2xl font-bold">
				View All Patients
			</h1>

			<div
				class="ml-4 flex flex-1 items-center overflow-hidden rounded border border-gray-300"
			>
				<input
					v-model="searchQuery"
					type="text"
					placeholder="Search by name..."
					class="flex-1 px-3 py-2 focus:outline-none"
				/>
				<button class="px-3">
					<Search class="h-5 w-5" />
				</button>
			</div>
		</div>

		<!-- Patients Table -->
		<table class="w-full table-auto border-collapse">
			<thead class="bg-gray-100">
				<tr>
					<th class="px-4 py-2 text-left">Name</th>
					<th class="px-4 py-2 text-left">Age</th>
					<th class="px-4 py-2 text-left">Gender</th>
				</tr>
			</thead>

			<tbody>
				<tr
					v-for="p in filteredPatients"
					:key="p.id"
					class="cursor-pointer border-t hover:bg-gray-100"
					@click="openModal(p)"
				>
					<td class="px-4 py-2">{{ p.name }}</td>
					<td class="px-4 py-2">{{ p.age ?? "—" }}</td>
					<td class="px-4 py-2">{{ p.gender ?? "—" }}</td>
				</tr>

				<tr v-if="!filteredPatients.length" class="border-t">
					<td colspan="3" class="px-4 py-2 text-center">
						No patients found.
					</td>
				</tr>
			</tbody>
		</table>

		<!-- MODAL -->
		<PatientModal
			v-if="is_clicked && selected"
			:patient="selected"
			@close="is_clicked = false"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Search } from "lucide-vue-next";
import PatientModal from "~/components/therapy/PatientModal.vue";

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
}

const searchQuery = ref("");
const is_clicked = ref(false);
const selected = ref<PatientDetail | null>(null);

// Every patient (not just those with a referral). The endpoint is staff-gated
// and returns a minimal projection; full detail is fetched on click below.
const { data: patients } = await useFetch<PatientRow[]>("/api/search/all", {
	default: () => [],
});

const filteredPatients = computed(() =>
	(patients.value ?? []).filter((p) =>
		p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
	)
);

// Load full patient detail on demand through the ownership-gated profile
// endpoint, then flatten it into the shape PatientModal expects.
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
		};
		is_clicked.value = true;
	} catch (err) {
		console.error("Failed to load patient detail:", err);
	}
}
</script>
