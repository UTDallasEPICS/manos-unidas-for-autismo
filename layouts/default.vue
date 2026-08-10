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
		const meta = NAV_META[link.to];
		items.push({
			label: meta ? t(meta.key) : link.label,
			icon: meta?.icon ?? "i-lucide-circle-dot",
			to: localePath({ name: link.to, params: link.params }),
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

const pageTitle = computed(
	() => (route.meta.title as string | undefined) ?? ""
);
</script>

<template>
	<UDashboardGroup storage-key="fmua-dashboard">
		<UDashboardSidebar
			collapsible
			resizable
			:min-size="14"
			:default-size="17"
			:max-size="22"
		>
			<template #header>
				<NuxtLink
					:to="dashboardPath"
					class="flex items-center gap-2.5 overflow-hidden"
				>
					<img
						src="/fmua-logo.png"
						alt="FMUA"
						class="size-9 shrink-0"
					/>
					<span
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
				<div class="flex w-full flex-col gap-2">
					<div class="flex items-center justify-between gap-2 px-1">
						<LangSwitch />
						<UColorModeButton />
					</div>
					<UDropdownMenu
						:items="userMenuItems"
						:content="{ align: 'start' }"
						class="w-full"
					>
						<UButton
							:label="displayName"
							icon="i-lucide-user"
							trailing-icon="i-lucide-chevron-up"
							color="neutral"
							variant="ghost"
							block
							class="justify-start"
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
