<template>
	<button
		class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
		type="button"
		@click="onRefresh"
	>
		{{ label }}
	</button>
</template>

<script setup lang="ts">
const props = defineProps<{
	label?: string;
	onRefresh: () => void | Promise<void>;
}>();

const label = props.label ?? "Refresh";
</script>
