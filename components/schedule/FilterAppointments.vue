<!-- Schedule filter: tick session types to HIDE them from the calendar. Rebuilt
     on NuxtUI (UModal). Parent mounts via v-if; emits closeFilterWindow. -->
<script setup lang="ts">
type SessionType = { id: string; name: string };

const props = defineProps<{ filter?: string[] }>();
const emit = defineEmits<{
	closeFilterWindow: [];
	addFilters: [filter: string[]];
}>();

const { t } = useI18n();

const { data: sessionTypes } = await useFetch<SessionType[]>(
	"/api/session/types",
	{ default: () => [] }
);

const checked = ref<Record<string, boolean>>({});
watch(
	sessionTypes,
	(types) => {
		const init: Record<string, boolean> = {};
		for (const st of types ?? []) {
			init[st.id] = props.filter?.includes(st.id) ?? false;
		}
		checked.value = init;
	},
	{ immediate: true }
);

const open = ref(true);
watch(open, (v) => {
	if (!v) emit("closeFilterWindow");
});

function submit() {
	const hidden = Object.entries(checked.value)
		.filter(([, v]) => v)
		.map(([id]) => id);
	emit("addFilters", hidden);
	open.value = false;
}
</script>

<template>
	<UModal v-model:open="open" :title="t('schedule.filterTitle')">
		<template #body>
			<p class="text-muted mb-3 text-sm">
				{{ t("schedule.filterHint") }}
			</p>
			<div class="flex flex-col gap-2">
				<UCheckbox
					v-for="type in sessionTypes"
					:key="type.id"
					v-model="checked[type.id]"
					:label="type.name"
				/>
			</div>
		</template>

		<template #footer>
			<div class="flex w-full justify-end gap-3">
				<UButton
					color="neutral"
					variant="outline"
					:label="t('schedule.cancel')"
					@click="open = false"
				/>
				<UButton :label="t('schedule.submit')" @click="submit" />
			</div>
		</template>
	</UModal>
</template>
