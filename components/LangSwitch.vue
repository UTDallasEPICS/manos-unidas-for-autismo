<!-- Compact EN/ES language switcher. Foundation component — use this instead of
     hand-rolling locale buttons. Real strings live in i18n/locales/*. -->
<script setup lang="ts">
// `vertical` stacks EN over ES — used in the collapsed sidebar rail so the
// switcher fits the narrow width.
defineProps<{ vertical?: boolean }>();

const { locale, setLocale } = useI18n();

const langs = [
	{ code: "en", label: "EN" },
	{ code: "es", label: "ES" },
] as const;
</script>

<template>
	<div
		class="bg-elevated flex items-center gap-0.5 rounded-md p-0.5"
		:class="vertical ? 'flex-col' : ''"
	>
		<UButton
			v-for="l in langs"
			:key="l.code"
			:label="l.label"
			size="xs"
			color="neutral"
			:variant="locale === l.code ? 'solid' : 'ghost'"
			:aria-pressed="locale === l.code"
			@click="setLocale(l.code)"
		/>
	</div>
</template>
