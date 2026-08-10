<!-- Parent's children list (#209). Lists the guardian's children and links to
     each child's profile via the PARENT-scoped /childProfile/:id route. Server
     enforces parent-of ownership; this is UX. Also a small reference page for
     the loading / empty / error states pattern. -->
<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const { userId } = useAuthState();

const {
	data: children,
	status,
	error,
	refresh,
} = await useFetch("/api/search/children", {
	query: computed(() => ({ pId: userId.value })),
});
</script>

<template>
	<div class="mx-auto w-full max-w-4xl">
		<h1 class="text-highlighted mb-6 text-xl font-semibold">
			{{ t("nav.children") }}
		</h1>

		<!-- Loading -->
		<div v-if="status === 'pending'" class="grid gap-3 sm:grid-cols-2">
			<USkeleton v-for="n in 4" :key="n" class="h-24 w-full" />
		</div>

		<!-- Error -->
		<UAlert
			v-else-if="error"
			color="error"
			variant="subtle"
			icon="i-lucide-triangle-alert"
			:title="t('common.loadError')"
			:actions="[
				{
					label: t('common.retry'),
					color: 'neutral',
					variant: 'outline',
					onClick: () => refresh(),
				},
			]"
		/>

		<!-- Empty -->
		<div
			v-else-if="!children?.length"
			class="border-default text-muted rounded-lg border border-dashed py-12 text-center"
		>
			{{ t("children.empty") }}
		</div>

		<!-- Children -->
		<div v-else class="grid gap-3 sm:grid-cols-2">
			<UPageCard
				v-for="child in children"
				:key="child.id"
				:title="child.name"
				:description="
					[
						child.age != null ? `${t('Age')}: ${child.age}` : null,
						child.gender,
					]
						.filter(Boolean)
						.join(' · ')
				"
				icon="i-lucide-user"
				:to="
					localePath({
						name: 'childProfile-id',
						params: { id: child.id },
					})
				"
			/>
		</div>
	</div>
</template>
