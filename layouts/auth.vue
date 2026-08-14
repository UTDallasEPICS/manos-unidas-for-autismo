<!-- Bare layout for public / unauthenticated pages (landing, login, contact,
     request form). No app sidebar — just brand, language + theme toggles, and
     the page content. Pages control their own width. -->
<script setup lang="ts">
const localePath = useLocalePath();
</script>

<template>
	<div class="bg-default text-default flex min-h-screen flex-col">
		<header
			class="border-default bg-default relative z-10 flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-6"
		>
			<NuxtLink
				:to="localePath('index')"
				class="flex items-center gap-2.5"
			>
				<img src="/fmua-logo.png" alt="FMUA" class="size-8 shrink-0" />
				<span class="text-highlighted text-sm font-semibold">
					Connected Care
				</span>
			</NuxtLink>
			<div class="flex items-center gap-2">
				<LangSwitch />
				<UColorModeButton />
			</div>
		</header>

		<main class="flex-1 px-4 py-8 sm:px-6">
			<slot />
		</main>
	</div>
</template>
