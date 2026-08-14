<template>
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="text-center">
			<UIcon
				name="i-lucide-layout-dashboard"
				class="text-muted mx-auto mb-3 size-10"
			/>
			<h1 class="text-highlighted text-xl font-semibold">
				{{ t("dash.welcome") }}
			</h1>
		</div>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({
	title: "nav.dashboard",
});

const { t } = useI18n();
</script>
