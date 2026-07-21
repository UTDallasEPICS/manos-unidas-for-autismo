<template>
	<div class="font-sc-encode p-4">
		<!-- Header + Search -->
		<div class="mb-4 flex items-center">
			<h1 class="font-cormorant-garamond text-2xl font-bold">
				View All Employees
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

		<!-- Employees Table -->
		<table class="w-full table-auto border-collapse">
			<thead class="bg-gray-100">
				<tr>
					<th class="px-4 py-2 text-left">Name</th>
					<th class="px-4 py-2 text-left">Type</th>
					<th class="px-4 py-2 text-left">Email</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="user in filteredUsers"
					:key="user.id"
					class="cursor-pointer border-t hover:bg-gray-100"
					@click="goToProfile(user.id)"
				>
					<td class="px-4 py-2">{{ user.name }}</td>
					<td class="px-4 py-2">{{ user.type || "—" }}</td>
					<td class="px-4 py-2">{{ user.email || "—" }}</td>
				</tr>
				<tr v-if="!filteredUsers.length" class="border-t">
					<td colspan="3" class="px-4 py-2 text-center">
						No employees found.
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
import { useFetch, navigateTo } from "#imports";
import { Search } from "lucide-vue-next";
import { AccessPermission } from "~/types/permissions";

// typed cookie: map of permission enum -> boolean, or null when not present
const { access } = useAuthState();

interface User {
	id: string;
	name: string;
	type: string | null;
	contactPref: string | null;
	email: string | null;
}

const goToProfile = async (id: string) => {
	let name = "bad";
	if (access.value?.[AccessPermission.ADMIN]) {
		name = "employees-id";
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
	if (access.value?.[AccessPermission.ADMIN]) {
		return useFetch<User[]>("/api/search/employees");
	}
	return {
		data: { value: [] },
		error: "User not authorized to view employees",
	};
}

// Filter Employees on search query
const filteredUsers = computed(() => {
	const list: User[] = usersData?.value ?? [];
	return list.filter((u) =>
		u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
	);
});
</script>
