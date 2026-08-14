<!-- Therapist recommendations list. Click a row to view the full note. Rebuilt
     on NuxtUI (UModal). -->
<script setup lang="ts">
import type { Recommendation } from "~/types/formTypes";

const props = defineProps<{
	modelValue: boolean;
	recommendations: Recommendation[];
}>();

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
	"view-recommendation": [note: Recommendation];
}>();

const { t } = useI18n();

function formatDate(value?: string | Date | null) {
	return value ? new Date(value).toLocaleDateString() : "—";
}

const open = computed({
	get: () => props.modelValue,
	set: (v) => emit("update:modelValue", v),
});
</script>

<template>
	<UModal v-model:open="open" :title="t('profile.recommendationsTitle')">
		<template #body>
			<ul
				v-if="recommendations.length"
				class="divide-default divide-y text-sm"
			>
				<li
					v-for="rec in recommendations"
					:key="rec.id"
					class="hover:bg-elevated -mx-2 cursor-pointer rounded px-2 py-2"
					@click="emit('view-recommendation', rec)"
				>
					<span class="text-highlighted font-medium">
						{{ formatDate(rec.familyRecommendationsDate) }}:
					</span>
					<span class="text-default">
						{{
							rec.familyRecommendations.length > 60
								? rec.familyRecommendations.slice(0, 60) + "…"
								: rec.familyRecommendations
						}}
					</span>
				</li>
			</ul>
			<p v-else class="text-muted text-sm">
				{{ t("profile.noRecommendations") }}
			</p>
		</template>

		<template #footer>
			<div class="flex w-full justify-end">
				<UButton
					color="neutral"
					variant="outline"
					:label="t('profile.close')"
					@click="open = false"
				/>
			</div>
		</template>
	</UModal>
</template>
