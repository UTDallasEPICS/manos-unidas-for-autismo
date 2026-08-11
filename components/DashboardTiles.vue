<!-- Canonical role-dashboard grid: responsive, navigable NuxtUI cards.
     Replaces the old custom Dashboard/ButtonGrid. Pass tiles with an i18n label,
     an iconify icon name (e.g. "i-lucide-calendar-days"), and a route target. -->
<script setup lang="ts">
interface Tile {
	to: string | { name: string; params?: Record<string, unknown> };
	icon: string;
	label: string;
}

defineProps<{ tiles: Tile[] }>();

const keyOf = (to: Tile["to"]) => (typeof to === "string" ? to : to.name);
</script>

<template>
	<UPageGrid class="gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<UPageCard
			v-for="tile in tiles"
			:key="keyOf(tile.to)"
			:to="tile.to"
			:icon="tile.icon"
			:title="tile.label"
			class="hover:bg-primary/5 hover:ring-primary transition-colors hover:ring-2"
		/>
	</UPageGrid>
</template>
