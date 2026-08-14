<!-- Shared appointment calendar (all roles land here via the "Schedule" nav
     link). USER_SERVICE/ADMIN get full CRUD via CalendarView; everyone else
     gets a read-only view of their own sessions. -->
<script setup lang="ts">
import { AccessPermission } from "~/types/permissions";
import FilterAppointments from "~/components/schedule/FilterAppointments.vue";
import CalendarView from "~/components/schedule/CalendarView.vue";

definePageMeta({
	path: "/scheduleView",
	title: "nav.schedule",
});

const { t } = useI18n();
const { access } = useAuthState();

const permissions = computed(() => {
	const actions = { filter: false };
	if (access.value) {
		if (access.value[AccessPermission.USER_SERVICE]) actions.filter = true;
		if (access.value[AccessPermission.ADMIN]) actions.filter = true;
	}
	return actions;
});

const showFilterWindow = ref(false);
const filters = ref<string[]>([]);
function addFilters(filter: string[]) {
	filters.value = filter;
}
</script>

<template>
	<div>
		<FilterAppointments
			v-if="showFilterWindow"
			:filter="filters"
			@close-filter-window="showFilterWindow = false"
			@add-filters="(filter) => addFilters(filter)"
		/>

		<div v-if="permissions.filter" class="mb-4 flex justify-end">
			<UButton
				color="neutral"
				variant="outline"
				icon="i-lucide-filter"
				:label="t('calendar.filter')"
				@click="showFilterWindow = true"
			/>
		</div>

		<CalendarView :filter="filters" />
	</div>
</template>
