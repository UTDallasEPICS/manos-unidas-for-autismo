<template>
	<ProfileEditModal
		v-model="modals.edit"
		:profile="profile"
		@save="handleEditProfileSave"
	/>
</template>

<script setup lang="ts">
import { computed } from "#imports";
import { useProfileSave } from "~/composables/patient/useProfileSave";
import { useModalToggle } from "~/composables/ui/useModalToggle";

const props = defineProps<{
	patientId: string;
	profile: Record<string, unknown>;
}>();

const emit = defineEmits<{
	"profile-updated": [];
}>();

const { t } = useI18n();
const toast = useToast();

const { saveProfile } = useProfileSave(
	props.patientId,
	computed(() => props.profile),
	async () => {
		emit("profile-updated");
	}
);
const { modals, openModal, closeModal } = useModalToggle("edit");

// --- Exposed for parent to call ---
function openEditModal() {
	openModal("edit");
}

defineExpose({ openEditModal });

// --- Internal handlers ---
async function handleEditProfileSave(formData: Record<string, unknown>) {
	try {
		await saveProfile(formData);
		closeModal("edit");
		toast.add({
			title: t("profile.savedSuccess"),
			color: "success",
			icon: "i-lucide-check",
		});
	} catch (err) {
		console.error("Could not save profile changes:", err);
		toast.add({
			title: t("profile.savedError"),
			color: "error",
			icon: "i-lucide-triangle-alert",
		});
	}
}
</script>
