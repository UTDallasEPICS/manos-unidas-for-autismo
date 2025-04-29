<template>
	<div class="w-full p-4">
		<!-- Header + Search -->
		<div class="mb-4 flex items-center">
			<h1 class="text-2xl font-bold">View All Users</h1>
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

		<!-- Users Table -->
		<table class="w-full table-auto border-collapse">
			<thead class="bg-gray-100">
				<tr>
					<th class="px-4 py-2 text-left">Name</th>
					<th class="px-4 py-2 text-left">Type</th>
					<th class="px-4 py-2 text-left">Age</th>
					<th class="px-4 py-2 text-left">Gender</th>
					<th class="px-4 py-2"></th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="user in filteredUsers"
					:key="user.id"
					class="border-t"
				>
					<td class="px-4 py-2">{{ user.name }}</td>
					<td class="px-4 py-2">{{ user.type }}</td>
					<td class="px-4 py-2">{{ user.age }}</td>
					<td class="px-4 py-2">{{ user.gender }}</td>
				</tr>
				<tr v-if="!filteredUsers.length">
					<td colspan="5" class="px-4 py-2 text-center">
						No users found.
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Search } from "lucide-vue-next";

interface User {
	id: number;
	name: string;
	type: string;
	age: number;
	gender: string;
}

const searchQuery = ref("");

// dummy data, fetch real data
const users = ref<User[]>([
	{ id: 1, name: "Alice Johnson", type: "patient", age: 9, gender: "Female" },
	{ id: 2, name: "Marcus Lee", type: "parent", age: 42, gender: "Male" },
	{ id: 3, name: "Dr. Patel", type: "therapist", age: 36, gender: "Female" },
	// …fetch real list here
]);

const filteredUsers = computed(() =>
	users.value.filter((u) =>
		u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
	)
);
</script>

<style scoped></style>
