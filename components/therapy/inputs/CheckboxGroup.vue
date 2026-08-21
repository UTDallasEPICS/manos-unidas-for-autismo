<!-- Grouped multi-select checklist for therapy objectives. Migrated from the
     deleted Form engine's Form/Input/CheckboxGroup.vue. Renders the
     `checkboxOptions` list (header / subheader dividers interleaved with
     selectable options) as NuxtUI UCheckboxGroups sharing one string[] model,
     so the saved value set is identical to the old raw-checkbox version. -->
<script setup lang="ts">
import type { CheckboxGroupItem } from "@nuxt/ui";
import type {
	FormFieldConfig,
	CheckboxOption,
} from "~/types/FormConfig/formConfig";

const props = defineProps<{ fieldConfig: FormFieldConfig }>();

// string[] of selected option values — same shape the old widget emitted.
const model = defineModel<string[]>({ default: () => [] });

const { t } = useI18n();

type Segment =
	| { kind: "header"; text: string }
	| { kind: "subheader"; text: string }
	| { kind: "options"; items: CheckboxGroupItem[] };

// Split the flat checkboxOptions array into contiguous segments: header /
// subheader labels, and runs of selectable options. Each options-run becomes
// its own UCheckboxGroup bound to the SAME shared model array, so toggling any
// box adds/removes its `value` from the single string[] — preserving grouping
// visually and the exact value set functionally.
function buildSegments(options: CheckboxOption[] | undefined): Segment[] {
	const segments: Segment[] = [];
	for (const item of options ?? []) {
		if (item.header) {
			segments.push({ kind: "header", text: item.header });
		} else if (item.subheader) {
			segments.push({ kind: "subheader", text: item.subheader });
		} else if (item.value !== undefined) {
			const last = segments[segments.length - 1];
			const entry: CheckboxGroupItem = {
				label: item.label ?? item.value,
				value: item.value,
			};
			if (last && last.kind === "options") last.items.push(entry);
			else segments.push({ kind: "options", items: [entry] });
		}
	}
	return segments;
}

// All selectable values across every group, in order, for the select-all
// toggle — headers/subheaders excluded.
const allValues = computed(() =>
	(props.fieldConfig.checkboxOptions ?? [])
		.filter((item) => item.value !== undefined)
		.map((item) => item.value as string)
);

const allSelected = computed(
	() =>
		allValues.value.length > 0 &&
		allValues.value.every((v) => model.value.includes(v))
);

function toggleSelectAll() {
	model.value = allSelected.value ? [] : [...allValues.value];
}
</script>

<template>
	<div class="flex flex-col gap-1">
		<div class="flex items-center justify-between gap-2">
			<label class="text-default text-sm font-medium">
				{{ fieldConfig.label }}
				<span v-if="fieldConfig.required" class="text-error">*</span>
			</label>
			<UButton
				v-if="allValues.length > 0"
				size="xs"
				color="neutral"
				variant="link"
				:label="
					allSelected
						? t('therapyNote.clearAll')
						: t('therapyNote.selectAll')
				"
				@click="toggleSelectAll"
			/>
		</div>
		<div
			v-if="fieldConfig.checkboxOptions?.length"
			class="border-default max-h-48 space-y-2 overflow-y-auto rounded-md border p-2"
		>
			<template
				v-for="(segment, index) in buildSegments(
					fieldConfig.checkboxOptions
				)"
				:key="index"
			>
				<div
					v-if="segment.kind === 'header'"
					class="border-default text-primary mt-3 border-b text-xs font-bold uppercase"
				>
					{{ segment.text }}
				</div>
				<div
					v-else-if="segment.kind === 'subheader'"
					class="text-muted mt-2 text-sm font-semibold"
				>
					{{ segment.text }}
				</div>
				<UCheckboxGroup
					v-else
					v-model="model"
					:items="segment.items"
					size="sm"
					class="ml-2"
				/>
			</template>
		</div>
		<p v-else class="text-muted text-sm">
			{{ t("therapyNote.noOptions") }}
		</p>
	</div>
</template>
