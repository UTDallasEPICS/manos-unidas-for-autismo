<!-- /dev — ADMIN/IT-only diagnostics + route index. Env-agnostic (ships to
     stage/prod; NOT gated on import.meta.dev) and guarded by middleware/dev.ts.
     Purpose: a live map of the app for the team — every route, who can reach
     it, and a jump-off launcher — plus a reconciliation of the actual router
     against pageAccessMap (surfaces UNGATED and STALE entries). Internal
     tooling, so intentionally English-only (excluded from the i18n guardrail).
     The pages it links to still enforce their own server-side authorization. -->
<script setup lang="ts">
import { pageAccessMap, AccessPermission } from "~/types/permissions";

definePageMeta({ middleware: "dev", layout: "default" });

const { user, access } = useAuthState();
const router = useRouter();
const build = useRuntimeConfig().public.build as {
	sha: string;
	branch: string;
	time: string;
	env: string;
};
const isProd = build.env === "production";

// ---- Route audit -------------------------------------------------------
type RouteRow = {
	name: string;
	path: string;
	dynamic: boolean;
	required: AccessPermission | null;
	status: "mapped" | "ungated";
	allowed: boolean;
};

const allRows = computed<RouteRow[]>(() => {
	const seen = new Set<string>();
	const out: RouteRow[] = [];
	for (const r of router.getRoutes()) {
		const name = typeof r.name === "string" ? r.name : "";
		if (!name || seen.has(name)) continue;
		seen.add(name);
		const required = pageAccessMap[name] ?? null;
		const isPublic =
			required === null || required === AccessPermission.PUBLIC;
		const allowed =
			isPublic ||
			!!(access.value && access.value[required as AccessPermission]);
		out.push({
			name,
			path: r.path,
			dynamic: r.path.includes(":"),
			required,
			status: required === null ? "ungated" : "mapped",
			allowed,
		});
	}
	return out.sort((a, b) => a.path.localeCompare(b.path));
});

// Entries in pageAccessMap that no longer resolve to a real route.
const staleEntries = computed(() => {
	const names = new Set(
		router
			.getRoutes()
			.map((r) => (typeof r.name === "string" ? r.name : ""))
	);
	return Object.keys(pageAccessMap).filter((k) => !names.has(k));
});

const counts = computed(() => ({
	total: allRows.value.length,
	ungated: allRows.value.filter((r) => r.status === "ungated").length,
	stale: staleEntries.value.length,
}));

// ---- Filters -----------------------------------------------------------
const q = ref("");
const onlyMine = ref(false);
const onlyUngated = ref(false);
const rows = computed(() =>
	allRows.value.filter((r) => {
		if (
			q.value &&
			!`${r.path} ${r.name}`.toLowerCase().includes(q.value.toLowerCase())
		)
			return false;
		if (onlyMine.value && !r.allowed) return false;
		if (onlyUngated.value && r.status !== "ungated") return false;
		return true;
	})
);

// ---- Dynamic-route params (seeded with known sample ids) ---------------
const seedIds: Record<string, string> = {
	"myProfile-id": "c9074538-92c2-492f-9961-1744ca80ddaf",
	"patientProfile-id": "c9074538-92c2-492f-9961-1744ca80ddaf",
	"childProfile-id": "c9074538-92c2-492f-9961-1744ca80ddaf",
	"request-id": "1",
	"intake-id": "5c99f46e-50a2-4314-ba1b-75af78f59437",
};
const paramValues = reactive<Record<string, string>>({});

function resolvedPath(r: RouteRow): string {
	if (!r.dynamic) return r.path;
	const val = paramValues[r.name] || seedIds[r.name] || "";
	return r.path.replace(/:([^/]+)/g, () => encodeURIComponent(val));
}
function canOpen(r: RouteRow): boolean {
	if (!r.dynamic) return true;
	return !!(paramValues[r.name] || seedIds[r.name]);
}

function permColor(p: AccessPermission | null) {
	if (p === null) return "warning" as const;
	if (p === AccessPermission.PUBLIC) return "neutral" as const;
	if (p === AccessPermission.ADMIN) return "error" as const;
	return "primary" as const;
}

// ---- Seed users (reference; hidden in production) ----------------------
const seedUsers = [
	{ email: "admin@email.com", role: "ADMIN" },
	{ email: "user-service@email.com", role: "USER_SERVICE" },
	{ email: "it-service@email.com", role: "IT_SERVICE" },
	{ email: "therapist@email.com", role: "THERAPIST" },
	{ email: "evaluator@email.com", role: "EVALUATOR" },
	{ email: "parent@email.com", role: "PARENT" },
	{ email: "patient@email.com", role: "PATIENT" },
];

const myPermissions = computed(() =>
	access.value
		? Object.entries(access.value)
				.filter(([, v]) => v)
				.map(([k]) => k)
		: []
);
</script>

<template>
	<div class="mx-auto w-full max-w-6xl space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h1 class="text-highlighted text-xl font-semibold">
					Developer diagnostics
				</h1>
				<p class="text-muted text-sm">
					Route map, access-model audit and environment info. ADMIN/IT
					only.
				</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<UBadge color="neutral" variant="subtle">
					{{ counts.total }} routes
				</UBadge>
				<UBadge
					:color="counts.ungated ? 'warning' : 'neutral'"
					variant="subtle"
				>
					{{ counts.ungated }} ungated
				</UBadge>
				<UBadge
					:color="counts.stale ? 'error' : 'neutral'"
					variant="subtle"
				>
					{{ counts.stale }} stale
				</UBadge>
			</div>
		</div>

		<!-- Environment & build -->
		<UCard>
			<template #header>
				<h2 class="text-highlighted font-semibold">Environment</h2>
			</template>
			<dl class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
				<div>
					<dt class="text-muted">Deploy env</dt>
					<dd class="text-highlighted mt-0.5">
						<UBadge
							:color="isProd ? 'error' : 'primary'"
							variant="subtle"
						>
							{{ build.env }}
						</UBadge>
					</dd>
				</div>
				<div>
					<dt class="text-muted">Branch</dt>
					<dd class="text-highlighted mt-0.5 font-mono">
						{{ build.branch }}
					</dd>
				</div>
				<div>
					<dt class="text-muted">Commit</dt>
					<dd class="text-highlighted mt-0.5 font-mono">
						{{ build.sha }}
					</dd>
				</div>
				<div>
					<dt class="text-muted">Built</dt>
					<dd class="text-highlighted mt-0.5">{{ build.time }}</dd>
				</div>
			</dl>
		</UCard>

		<!-- Current session -->
		<UCard>
			<template #header>
				<h2 class="text-highlighted font-semibold">Current session</h2>
			</template>
			<div v-if="user" class="space-y-4">
				<dl class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
					<div>
						<dt class="text-muted">Name</dt>
						<dd class="text-highlighted mt-0.5">
							{{ user.fName }} {{ user.lName }}
						</dd>
					</div>
					<div>
						<dt class="text-muted">Email</dt>
						<dd class="text-highlighted mt-0.5">
							{{ user.email }}
						</dd>
					</div>
					<div>
						<dt class="text-muted">User type</dt>
						<dd class="text-highlighted mt-0.5">
							{{ user.type ?? "—" }}
						</dd>
					</div>
					<div>
						<dt class="text-muted">User id</dt>
						<dd class="text-highlighted mt-0.5 font-mono text-xs">
							{{ user.id }}
						</dd>
					</div>
				</dl>
				<div>
					<dt class="text-muted mb-1 text-sm">
						Resolved permissions
					</dt>
					<dd class="flex flex-wrap gap-1.5">
						<UBadge
							v-for="p in myPermissions"
							:key="p"
							color="primary"
							variant="subtle"
						>
							{{ p }}
						</UBadge>
					</dd>
				</div>
			</div>
			<p v-else class="text-muted text-sm">No active session.</p>
		</UCard>

		<!-- Route index -->
		<UCard>
			<template #header>
				<div class="flex flex-wrap items-center justify-between gap-3">
					<h2 class="text-highlighted font-semibold">Route index</h2>
					<div class="flex flex-wrap items-center gap-3">
						<UInput
							v-model="q"
							icon="i-lucide-search"
							placeholder="Filter routes…"
							size="sm"
						/>
						<USwitch v-model="onlyMine" label="My access" />
						<USwitch v-model="onlyUngated" label="Ungated" />
					</div>
				</div>
			</template>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="text-muted border-default border-b text-left">
						<tr>
							<th class="py-2 pr-3 font-medium">Path</th>
							<th class="py-2 pr-3 font-medium">Access</th>
							<th class="py-2 pr-3 font-medium">You</th>
							<th class="py-2 pr-3 font-medium">Status</th>
							<th class="py-2 pl-3 text-right font-medium">
								Open
							</th>
						</tr>
					</thead>
					<tbody class="divide-default divide-y">
						<tr v-for="r in rows" :key="r.name">
							<td class="py-2 pr-3">
								<div class="text-highlighted font-mono">
									{{ r.path }}
								</div>
								<div class="text-dimmed text-xs">
									{{ r.name }}
								</div>
							</td>
							<td class="py-2 pr-3">
								<UBadge
									:color="permColor(r.required)"
									variant="subtle"
								>
									{{ r.required ?? "—" }}
								</UBadge>
							</td>
							<td class="py-2 pr-3">
								<UIcon
									v-if="r.allowed"
									name="i-lucide-check"
									class="text-success size-4"
								/>
								<UIcon
									v-else
									name="i-lucide-x"
									class="text-dimmed size-4"
								/>
							</td>
							<td class="py-2 pr-3">
								<UBadge
									:color="
										r.status === 'ungated'
											? 'warning'
											: 'neutral'
									"
									variant="subtle"
								>
									{{ r.status }}
								</UBadge>
							</td>
							<td class="py-2 pl-3">
								<div
									class="flex items-center justify-end gap-2"
								>
									<UInput
										v-if="r.dynamic"
										v-model="paramValues[r.name]"
										:placeholder="seedIds[r.name] ?? 'id'"
										size="xs"
										class="w-48"
									/>
									<UButton
										:to="resolvedPath(r)"
										target="_blank"
										:disabled="!canOpen(r)"
										color="neutral"
										variant="outline"
										size="xs"
										icon="i-lucide-external-link"
										label="Open"
									/>
								</div>
							</td>
						</tr>
						<tr v-if="!rows.length">
							<td colspan="5" class="text-muted py-6 text-center">
								No routes match.
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</UCard>

		<!-- Stale map entries -->
		<UCard v-if="staleEntries.length">
			<template #header>
				<h2 class="text-highlighted font-semibold">
					Stale pageAccessMap entries
				</h2>
			</template>
			<p class="text-muted mb-3 text-sm">
				These route names are gated in <code>pageAccessMap</code> but no
				longer resolve to a route — safe to remove.
			</p>
			<div class="flex flex-wrap gap-1.5">
				<UBadge
					v-for="name in staleEntries"
					:key="name"
					color="error"
					variant="subtle"
					class="font-mono"
				>
					{{ name }}
				</UBadge>
			</div>
		</UCard>

		<!-- Seed users (non-production only) -->
		<UCard v-if="!isProd">
			<template #header>
				<h2 class="text-highlighted font-semibold">Seed users</h2>
			</template>
			<p class="text-muted mb-3 text-sm">
				Local/stage seed logins (email OTP). Hidden in production.
			</p>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="text-muted border-default border-b text-left">
						<tr>
							<th class="py-2 pr-3 font-medium">Email</th>
							<th class="py-2 font-medium">Role</th>
						</tr>
					</thead>
					<tbody class="divide-default divide-y">
						<tr v-for="u in seedUsers" :key="u.email">
							<td class="text-highlighted py-2 pr-3 font-mono">
								{{ u.email }}
							</td>
							<td class="py-2">
								<UBadge color="neutral" variant="subtle">
									{{ u.role }}
								</UBadge>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</UCard>
	</div>
</template>
