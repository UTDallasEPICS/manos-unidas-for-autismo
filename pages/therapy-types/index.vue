<!-- Admin: manage the therapy-modality catalog (the "therapy types" in the
     therapy-note drilldown) and each type's objectives. ADMIN-gated via
     pageAccessMap. Reads/writes the TherapyModality/TherapyObjective tables. -->
<script setup lang="ts">
definePageMeta({
	title: "therapyAdmin.title",
});

const { t } = useI18n();
const toast = useToast();

type ObjectiveKind = "objective" | "header" | "subheader";
interface Objective {
	kind: ObjectiveKind;
	labelEn: string;
	labelEs: string;
}
interface Modality {
	id: string;
	key: string;
	labelEn: string;
	labelEs: string;
	order: number;
	active: boolean;
	Objectives: Objective[];
}

const { data: modalities, refresh } = await useFetch<Modality[]>(
	"/api/therapy-modality",
	{ default: () => [] }
);

const open = ref(false);
const mode = ref<"create" | "edit">("create");
const editingId = ref<string | null>(null);
const saving = ref(false);
const pendingDelete = ref<Modality | null>(null);
const deleting = ref(false);

const form = reactive<{
	labelEn: string;
	labelEs: string;
	active: boolean;
	objectives: Objective[];
}>({
	labelEn: "",
	labelEs: "",
	active: true,
	objectives: [],
});

const kindItems = computed(() => [
	{ label: t("therapyAdmin.kindObjective"), value: "objective" },
	{ label: t("therapyAdmin.kindHeader"), value: "header" },
	{ label: t("therapyAdmin.kindSubheader"), value: "subheader" },
]);

const canSave = computed(
	() =>
		!!form.labelEn.trim() &&
		!!form.labelEs.trim() &&
		form.objectives.every((o) => o.labelEn.trim() && o.labelEs.trim())
);

function resetForm() {
	form.labelEn = "";
	form.labelEs = "";
	form.active = true;
	form.objectives = [];
}
function openCreate() {
	resetForm();
	mode.value = "create";
	editingId.value = null;
	open.value = true;
}
function openEdit(m: Modality) {
	mode.value = "edit";
	editingId.value = m.id;
	form.labelEn = m.labelEn;
	form.labelEs = m.labelEs;
	form.active = m.active;
	form.objectives = m.Objectives.map((o) => ({
		kind: o.kind,
		labelEn: o.labelEn,
		labelEs: o.labelEs,
	}));
	open.value = true;
}
function addRow() {
	form.objectives.push({ kind: "objective", labelEn: "", labelEs: "" });
}
function removeRow(i: number) {
	form.objectives.splice(i, 1);
}
function moveRow(i: number, dir: -1 | 1) {
	const j = i + dir;
	if (j < 0 || j >= form.objectives.length) return;
	const [row] = form.objectives.splice(i, 1);
	form.objectives.splice(j, 0, row);
}

function extractErrorMessage(err: unknown, fallback: string): string {
	if (err && typeof err === "object" && "data" in err) {
		const data = (
			err as { data?: { statusMessage?: string; message?: string } }
		).data;
		if (data?.statusMessage) return data.statusMessage;
		if (data?.message) return data.message;
	}
	return fallback;
}

async function save() {
	if (!canSave.value || saving.value) return;
	saving.value = true;
	try {
		const body = {
			labelEn: form.labelEn,
			labelEs: form.labelEs,
			active: form.active,
			objectives: form.objectives,
		};
		if (mode.value === "create") {
			await $fetch("/api/admin/therapy-modality", {
				method: "POST",
				body,
			});
		} else {
			await $fetch(`/api/admin/therapy-modality/${editingId.value}`, {
				method: "PUT",
				body,
			});
		}
		toast.add({
			title: t("therapyAdmin.saveSuccess"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
		open.value = false;
		await refresh();
	} catch (err) {
		toast.add({
			title: extractErrorMessage(err, t("therapyAdmin.saveError")),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	} finally {
		saving.value = false;
	}
}

async function confirmDelete() {
	if (!pendingDelete.value || deleting.value) return;
	deleting.value = true;
	try {
		await $fetch(`/api/admin/therapy-modality/${pendingDelete.value.id}`, {
			method: "DELETE",
		});
		toast.add({
			title: t("therapyAdmin.deleteSuccess"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
		pendingDelete.value = null;
		await refresh();
	} catch (err) {
		toast.add({
			title: extractErrorMessage(err, t("therapyAdmin.deleteError")),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	} finally {
		deleting.value = false;
	}
}
</script>

<template>
	<div class="mx-auto w-full max-w-4xl">
		<div class="mb-6 flex justify-end">
			<UButton
				icon="i-lucide-plus"
				:label="t('therapyAdmin.newType')"
				@click="openCreate"
			/>
		</div>

		<div
			v-if="!modalities || !modalities.length"
			class="border-default text-muted rounded-lg border border-dashed py-12 text-center"
		>
			{{ t("therapyAdmin.empty") }}
		</div>
		<div v-else class="flex flex-col gap-2">
			<UCard v-for="m in modalities" :key="m.id">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="min-w-0">
						<div class="text-highlighted font-medium">
							{{ m.labelEn }}
						</div>
						<div class="text-muted truncate text-sm">
							{{ m.labelEs }} ·
							{{ m.Objectives.length }}
							{{ t("therapyAdmin.objectivesLower") }}
						</div>
					</div>
					<div class="flex items-center gap-2">
						<UBadge
							:color="m.active ? 'success' : 'neutral'"
							variant="subtle"
						>
							{{
								m.active
									? t("therapyAdmin.active")
									: t("therapyAdmin.inactive")
							}}
						</UBadge>
						<UButton
							size="xs"
							color="neutral"
							variant="ghost"
							icon="i-lucide-pencil"
							:label="t('therapyAdmin.edit')"
							@click="openEdit(m)"
						/>
						<UButton
							size="xs"
							color="error"
							variant="ghost"
							icon="i-lucide-trash-2"
							:aria-label="t('therapyAdmin.delete')"
							@click="pendingDelete = m"
						/>
					</div>
				</div>
			</UCard>
		</div>

		<!-- Create / edit modal -->
		<UModal
			v-model:open="open"
			:title="
				mode === 'create'
					? t('therapyAdmin.createTitle')
					: t('therapyAdmin.editTitle')
			"
			:ui="{ content: 'max-w-3xl' }"
		>
			<template #body>
				<div class="flex flex-col gap-4">
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<UFormField :label="t('therapyAdmin.labelEn')" required>
							<UInput v-model="form.labelEn" class="w-full" />
						</UFormField>
						<UFormField :label="t('therapyAdmin.labelEs')" required>
							<UInput v-model="form.labelEs" class="w-full" />
						</UFormField>
					</div>
					<UCheckbox
						v-model="form.active"
						:label="t('therapyAdmin.active')"
					/>

					<div>
						<div class="mb-2 flex items-center justify-between">
							<span
								class="text-highlighted text-sm font-medium"
								>{{ t("therapyAdmin.objectives") }}</span
							>
							<UButton
								size="xs"
								variant="soft"
								icon="i-lucide-plus"
								:label="t('therapyAdmin.addObjective')"
								@click="addRow"
							/>
						</div>
						<div class="flex flex-col gap-2">
							<div
								v-for="(row, i) in form.objectives"
								:key="i"
								class="flex items-center gap-2"
							>
								<USelect
									v-model="row.kind"
									:items="kindItems"
									size="sm"
									class="w-36 shrink-0"
								/>
								<UInput
									v-model="row.labelEn"
									size="sm"
									:placeholder="t('therapyAdmin.labelEn')"
									class="flex-1"
								/>
								<UInput
									v-model="row.labelEs"
									size="sm"
									:placeholder="t('therapyAdmin.labelEs')"
									class="flex-1"
								/>
								<UButton
									size="xs"
									color="neutral"
									variant="ghost"
									icon="i-lucide-arrow-up"
									:disabled="i === 0"
									:aria-label="t('therapyAdmin.moveUp')"
									@click="moveRow(i, -1)"
								/>
								<UButton
									size="xs"
									color="neutral"
									variant="ghost"
									icon="i-lucide-arrow-down"
									:disabled="i === form.objectives.length - 1"
									:aria-label="t('therapyAdmin.moveDown')"
									@click="moveRow(i, 1)"
								/>
								<UButton
									size="xs"
									color="error"
									variant="ghost"
									icon="i-lucide-x"
									:aria-label="t('therapyAdmin.remove')"
									@click="removeRow(i)"
								/>
							</div>
							<p
								v-if="!form.objectives.length"
								class="text-muted text-sm"
							>
								{{ t("therapyAdmin.noObjectives") }}
							</p>
						</div>
					</div>
				</div>
			</template>
			<template #footer>
				<div class="flex w-full justify-end gap-2">
					<UButton
						color="neutral"
						variant="ghost"
						:label="t('therapyAdmin.cancel')"
						@click="open = false"
					/>
					<UButton
						:label="t('therapyAdmin.save')"
						:loading="saving"
						:disabled="!canSave"
						@click="save"
					/>
				</div>
			</template>
		</UModal>

		<!-- Delete confirmation -->
		<UModal
			:open="!!pendingDelete"
			:title="t('therapyAdmin.deleteTitle')"
			@update:open="(v: boolean) => !v && (pendingDelete = null)"
		>
			<template #body>
				<p class="text-default text-sm">
					{{ t("therapyAdmin.deleteConfirm") }}
				</p>
			</template>
			<template #footer>
				<div class="flex w-full justify-end gap-2">
					<UButton
						color="neutral"
						variant="ghost"
						:label="t('therapyAdmin.cancel')"
						@click="pendingDelete = null"
					/>
					<UButton
						color="error"
						:label="t('therapyAdmin.delete')"
						:loading="deleting"
						@click="confirmDelete"
					/>
				</div>
			</template>
		</UModal>
	</div>
</template>
