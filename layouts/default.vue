<!-- Default app shell: responsive sidebar dashboard. Every authenticated page
     renders inside this frame automatically. Nav links come from the existing
     role logic in useUserLinks() — this layout only adds presentation (icons,
     i18n labels, the role "Dashboard" home) on top of that. On mobile the
     sidebar collapses to an off-canvas drawer opened from the navbar toggle. -->
<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const { user, access } = useAuthState();
const { userLinks } = useUserLinks();
const { logout } = useLogout();

// Presentation metadata keyed by the stable route name each nav link targets.
// Keeps the "which links show" decision in useUserLinks (role logic) and the
// "how they look" decision here.
const NAV_META: Record<string, { icon: string; key: string }> = {
	"admin-scheduleView": {
		icon: "i-lucide-calendar-days",
		key: "nav.schedule",
	},
	"myProfile-id": { icon: "i-lucide-user", key: "nav.profile" },
	childSearch: { icon: "i-lucide-users", key: "nav.children" },
	"patient-patientSearch": {
		icon: "i-lucide-users-round",
		key: "nav.patients",
	},
	"patient-viewContactForms": {
		icon: "i-lucide-clipboard-list",
		key: "nav.reviewForms",
	},
	"userService-assignNeuroSpecialist": {
		icon: "i-lucide-user-plus",
		key: "nav.assignSpecialist",
	},
	"admin-employeeSearch": {
		icon: "i-lucide-briefcase",
		key: "nav.employees",
	},
	"dashboard-evaluatorDashboard": {
		icon: "i-lucide-clipboard-check",
		key: "nav.evaluators",
	},
};

// Role "home" dashboard target — mirrors useDashboardNavigation().
const dashboardPath = computed(() => {
	const v = access.value;
	if (!v) return localePath("index");
	if (v.ADMIN) return "/admin";
	if (v.USER_SERVICE) return "/userServiceDashboard";
	if (v.IT_SERVICE) return "/iTServiceDashboard";
	if (v.PARENT) return "/parentDashboard";
	if (v.PATIENT) return "/patientDashboard";
	if (v.THERAPIST) return "/therapistDashboard";
	if (v.EVALUATOR) return "/dashboard/evaluatorDashboard";
	return "/dashboard";
});

const navItems = computed<NavigationMenuItem[][]>(() => {
	const items: NavigationMenuItem[] = [
		{
			label: t("nav.dashboard"),
			icon: "i-lucide-layout-dashboard",
			to: dashboardPath.value,
		},
	];
	for (const link of userLinks.value) {
		// Public / logged-out links (login, request form) never appear in the
		// authenticated shell.
		if (!link.to) continue;
		const to = localePath({ name: link.to, params: link.params });
		// Dedupe the role's own dashboard: it's already the "Dashboard" item
		// above, so evaluators no longer get both "Dashboard" and "Evaluations".
		if (to === dashboardPath.value) continue;
		const meta = NAV_META[link.to];
		items.push({
			label: meta ? t(meta.key) : link.label,
			icon: meta?.icon ?? "i-lucide-circle-dot",
			to,
		});
	}
	return [items];
});

const userMenuItems = computed(() => [
	[
		{
			label: t("nav.logout"),
			icon: "i-lucide-log-out",
			onSelect: () => logout(),
		},
	],
]);

const displayName = computed(() =>
	user.value ? `${user.value.fName} ${user.value.lName}`.trim() : ""
);

// Pages declare their title as an i18n key in definePageMeta({ title }); the
// navbar renders the translated string (t() falls back to the raw value for a
// non-key, and to "" when a page sets no title). This is the single place a
// page title lives on desktop — pages no longer render their own <h1>.
const pageTitle = computed(() => {
	const key = route.meta.title as string | undefined;
	return key ? t(key) : "";
});

// Track the sidebar's collapsed state so the header shows just the centered
// icon on the rail (the label would otherwise widen the row and clip the logo).
const sidebarCollapsed = ref(false);
</script>

<template>
	<UDashboardGroup storage-key="fmua-dashboard">
		<UDashboardSidebar
			v-model:collapsed="sidebarCollapsed"
			collapsible
			resizable
			:min-size="14"
			:default-size="17"
			:max-size="22"
		>
			<template #header>
				<NuxtLink
					:to="dashboardPath"
					class="flex w-full min-w-0 items-center justify-center gap-2.5 overflow-hidden"
				>
					<!-- Square puzzle-circle mark: scales crisply at any sidebar
					     width and stays centered. The label truncates away as the
					     rail narrows / collapses, leaving just the centered icon. -->
					<img
						src="/fmua-icon.png"
						alt="FMUA"
						class="size-8 shrink-0"
					/>
					<span
						v-if="!sidebarCollapsed"
						class="text-highlighted truncate text-sm font-semibold"
					>
						Connected Care
					</span>
				</NuxtLink>
			</template>

			<template #default>
				<UNavigationMenu
					orientation="vertical"
					highlight
					:items="navItems"
				/>
			</template>

			<template #footer>
				<!-- Collapsed rail: stack the controls vertically and drop the
				     account label so nothing overflows the ~64px width. -->
				<div class="flex w-full flex-col items-center gap-2">
					<div
						class="flex gap-2"
						:class="
							sidebarCollapsed
								? 'flex-col items-center'
								: 'w-full items-center justify-between px-1'
						"
					>
						<LangSwitch :vertical="sidebarCollapsed" />
						<UColorModeButton />
					</div>
					<UDropdownMenu
						:items="userMenuItems"
						:content="{ align: 'start' }"
						:class="sidebarCollapsed ? '' : 'w-full'"
					>
						<UButton
							:label="sidebarCollapsed ? undefined : displayName"
							icon="i-lucide-user"
							:trailing-icon="
								sidebarCollapsed
									? undefined
									: 'i-lucide-chevron-up'
							"
							color="neutral"
							variant="ghost"
							:block="!sidebarCollapsed"
							:square="sidebarCollapsed"
							:class="sidebarCollapsed ? '' : 'justify-start'"
							:aria-label="displayName"
						/>
					</UDropdownMenu>
				</div>
			</template>
		</UDashboardSidebar>

		<UDashboardPanel>
			<template #header>
				<UDashboardNavbar :title="pageTitle" />
			</template>
			<template #body>
				<slot />
			</template>
		</UDashboardPanel>
	</UDashboardGroup>
</template>
