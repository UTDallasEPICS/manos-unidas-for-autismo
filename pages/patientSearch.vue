<template>
	<div class="flex min-h-screen flex-col p-4">
		<!-- Header + Search -->
		<div class="mb-4 flex items-center">
			<h1 class="text-2xl font-bold">View All Patients</h1>
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
					v-for="user in filteredUsers"
					:key="user.id"
					@click="goToProfile(user.id)"
					class="cursor-pointer border-t hover:bg-gray-100"
				>
					<td class="px-4 py-2">{{ user.name }}</td>
					<td class="px-4 py-2">{{ user.age ?? "—" }}</td>
					<td class="px-4 py-2">{{ user.gender || "—" }}</td>
				</tr>
				<tr v-if="!filteredUsers.length" class="border-t">
					<td colspan="3" class="px-4 py-2 text-center">
						No patients found.
					</td>
				</tr>
			</tbody>
		</table>

		<!-- Error State -->
		<div v-if="error" class="mt-4 text-red-600">
			Failed to load patients.
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useFetch, useCookie, navigateTo } from "#imports";
import { Search } from "lucide-vue-next";
import { AccessPermission } from "~/permissions";

const userId = useCookie("userId");
const access = useCookie("AccessPermission");

interface User {
	id: number;
	name: string;
	type: string;
	age: number | null;
	gender: string;
}

const goToProfile = async (id: number) => {
	let name = "bad";
	if (access.value[AccessPermission.PARENT]) {
		name = "childProfile-id";
	}
	if (access.value[AccessPermission.THERAPIST]) {
		name = "patientProfile-id";
	}
	await navigateTo({
		name: name,
		params: { id: id },
	});
};

const searchQuery = ref("");

// Fetch patients from API
const { data: usersData, error } = await getUsers();

async function getUsers() {
	if (access.value[AccessPermission.THERAPIST]) {
		return useFetch<User[]>("/api/search/all");
	}
	if (access.value[AccessPermission.PARENT]) {
		return useFetch<User[]>("/api/search/children", {
			query: { pId: userId },
		});
	}
	return {
		data: { value: [] },
		error: "User not authorized to view patients",
	};
}

// Filter patients based on search query
const filteredUsers = computed(() => {
	return usersData.value.filter((u) =>
		u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
	);
});
</script>
