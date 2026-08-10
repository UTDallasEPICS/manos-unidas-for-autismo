<!-- Compact EN/ES language switcher. Foundation component — use this instead of
     hand-rolling locale buttons. Real strings live in i18n/locales/*. -->
<script setup lang="ts">
const { locale, setLocale } = useI18n();

const langs = [
	{ code: "en", label: "EN" },
	{ code: "es", label: "ES" },
] as const;
</script>

<template>
	<div class="bg-elevated flex items-center gap-0.5 rounded-md p-0.5">
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
