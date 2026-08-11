<!-- Admin employee directory. Rebuilt on NuxtUI (UTable). The old row-click
     navigated to a non-existent employee-profile route, so it's dropped until
     that page exists. -->
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

const { t } = useI18n();

interface Employee {
	id: string;
	name: string;
	type: string | null;
	contactPref: string | null;
	email: string | null;
}

const { data, status, error } = await useFetch<Employee[]>(
	"/api/search/employees",
	{ default: () => [] }
);

const searchQuery = ref("");
const rows = computed(() =>
	(data.value ?? []).filter((u) =>
		u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
	)
);

const columns = computed<TableColumn<Employee>[]>(() => [
	{ accessorKey: "name", header: t("employees.colName") },
	{ accessorKey: "type", header: t("employees.colType") },
	{ accessorKey: "email", header: t("employees.colEmail") },
]);
</script>

<template>
	<div class="mx-auto w-full max-w-5xl">
		<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
			<h1 class="text-highlighted text-xl font-semibold">
				{{ t("employees.title") }}
			</h1>
			<UInput
				v-model="searchQuery"
				icon="i-lucide-search"
				:placeholder="t('employees.searchPlaceholder')"
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
			{{ t("employees.empty") }}
		</div>
		<UTable
			v-else
			:data="rows"
			:columns="columns"
			:loading="status === 'pending'"
		>
			<template #type-cell="{ row }">{{
				row.original.type || "—"
			}}</template>
			<template #email-cell="{ row }">
				{{ row.original.email || "—" }}
			</template>
		</UTable>
	</div>
</template>
