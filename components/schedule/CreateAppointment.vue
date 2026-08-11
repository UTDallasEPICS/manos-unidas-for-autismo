<!-- Create a session/appointment (user-service). Rebuilt on NuxtUI (UModal +
     UForm-style fields). Refetches the schedule after a successful create. -->
<script setup lang="ts">
const { t } = useI18n();
const toast = useToast();

const open = ref(false);

const form = reactive({
	therapist: "",
	sessionType: "",
	date: "",
	time: "",
	duration: 60,
	max: 1,
	comments: "",
});

interface Therapist {
	id: string;
	fName: string;
	lName: string;
}
interface SessionType {
	id: string;
	name: string;
}

const { data: therapistsData } = await useFetch<Therapist[]>(
	"/api/session/therapists",
	{ default: () => [] }
);
const { data: typesData } = await useFetch<SessionType[]>(
	"/api/session/types",
	{
		default: () => [],
	}
);

const therapistOptions = computed(() =>
	(therapistsData.value ?? []).map((th) => ({
		label: `${th.fName} ${th.lName}`.trim(),
		value: th.id,
	}))
);
const typeOptions = computed(() =>
	(typesData.value ?? []).map((st) => ({ label: st.name, value: st.id }))
);
const hasSessionTypes = computed(() => typeOptions.value.length > 0);

const minDate = computed(() => new Date().toLocaleDateString("en-CA"));

function enforceMin() {
	if (form.max < 1 || isNaN(form.max)) form.max = 1;
	if (form.duration < 1 || isNaN(form.duration)) form.duration = 1;
}

function reset() {
	Object.assign(form, {
		therapist: "",
		sessionType: "",
		date: "",
		time: "",
		duration: 60,
		max: 1,
		comments: "",
	});
}

async function submitForm() {
	if (!form.therapist || !form.sessionType || !form.date || !form.time) {
		toast.add({ title: t("schedule.fillRequired"), color: "error" });
		return;
	}
	const dateTime = new Date(`${form.date}T${form.time}`);
	if (dateTime < new Date()) {
		toast.add({ title: t("schedule.pastError"), color: "error" });
		return;
	}

	try {
		const res = await fetch("/api/session/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				therapistId: form.therapist,
				typeId: form.sessionType,
				time: dateTime,
				duration: form.duration,
				maxAttendance: form.max,
				comment: form.comments || undefined,
			}),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err.statusMessage || `HTTP ${res.status}`);
		}
		open.value = false;
		reset();
		await refreshNuxtData();
	} catch (err) {
		console.error("Could not save session:", err);
		toast.add({ title: t("schedule.createError"), color: "error" });
	}
}
</script>

<template>
	<div>
		<UButton
			icon="i-lucide-plus"
			:label="t('schedule.createAppointment')"
			@click="open = true"
		/>

		<UModal v-model:open="open" :title="t('schedule.newAppointment')">
			<template #body>
				<form
					id="create-appointment-form"
					class="space-y-4"
					@submit.prevent="submitForm"
				>
					<UFormField
						:label="t('schedule.therapist')"
						name="therapist"
						required
					>
						<USelect
							v-model="form.therapist"
							:items="therapistOptions"
							:placeholder="t('schedule.pickTherapist')"
							class="w-full"
						/>
					</UFormField>

					<UFormField
						:label="t('schedule.sessionType')"
						name="sessionType"
						required
					>
						<p v-if="!hasSessionTypes" class="text-error text-sm">
							{{ t("schedule.noSessionTypes") }}
						</p>
						<USelect
							v-else
							v-model="form.sessionType"
							:items="typeOptions"
							:placeholder="t('schedule.pickSessionType')"
							class="w-full"
						/>
					</UFormField>

					<div class="flex gap-4">
						<UFormField
							:label="t('schedule.date')"
							name="date"
							required
							class="flex-1"
						>
							<UInput
								v-model="form.date"
								type="date"
								:min="minDate"
								class="w-full"
							/>
						</UFormField>
						<UFormField
							:label="t('schedule.time')"
							name="time"
							required
							class="flex-1"
						>
							<UInput
								v-model="form.time"
								type="time"
								class="w-full"
							/>
						</UFormField>
					</div>

					<div class="flex gap-4">
						<UFormField
							:label="t('schedule.duration')"
							name="duration"
							class="flex-1"
						>
							<UInput
								v-model.number="form.duration"
								type="number"
								:min="1"
								class="w-full"
								@blur="enforceMin"
							/>
						</UFormField>
						<UFormField
							:label="t('schedule.maxAttendance')"
							name="max"
							class="flex-1"
						>
							<UInput
								v-model.number="form.max"
								type="number"
								:min="1"
								:max="50"
								class="w-full"
								@blur="enforceMin"
							/>
						</UFormField>
					</div>

					<UFormField :label="t('schedule.comments')" name="comments">
						<UTextarea
							v-model="form.comments"
							:placeholder="t('schedule.commentsPlaceholder')"
							class="w-full"
						/>
					</UFormField>
				</form>
			</template>

			<template #footer>
				<div class="flex w-full justify-end gap-3">
					<UButton
						color="neutral"
						variant="outline"
						:label="t('schedule.cancel')"
						@click="open = false"
					/>
					<UButton
						type="submit"
						form="create-appointment-form"
						:label="t('schedule.save')"
					/>
				</div>
			</template>
		</UModal>
	</div>
</template>
