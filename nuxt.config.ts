// https://nuxt.com/docs/api/configuration/nuxt-config
import { execSync } from "node:child_process";
import tailwindcss from "@tailwindcss/vite";

// Build-time provenance surfaced on the ADMIN/IT-only /dev diagnostics page.
// Falls back to CI-provided env vars, then "unknown", so a git-less prod build
// (e.g. Docker without .git) never breaks the build.
function buildInfo() {
	const git = (cmd: string, envKey: string) => {
		try {
			return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
				.toString()
				.trim();
		} catch {
			return process.env[envKey] || "unknown";
		}
	};
	return {
		sha: git("git rev-parse --short HEAD", "GIT_SHA"),
		branch: git("git rev-parse --abbrev-ref HEAD", "GIT_BRANCH"),
		time: new Date().toISOString(),
		env: process.env.DEPLOY_ENV || process.env.NODE_ENV || "development",
	};
}

export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			// Read on /dev via useRuntimeConfig().public.build.
			build: buildInfo(),
		},
	},
	app: {
		head: {
			// Favicon = the FMUA multi-colour puzzle circle (public/fmua-icon.png,
			// cropped from the full logo). .ico for legacy, PNG for modern browsers.
			link: [
				{ rel: "icon", href: "/favicon.ico", sizes: "any" },
				{ rel: "icon", type: "image/png", href: "/fmua-icon.png" },
				{ rel: "apple-touch-icon", href: "/fmua-icon.png" },
			],
		},
	},
	modules: ["@nuxtjs/i18n", "@nuxt/eslint", "@nuxt/ui"],
	i18n: {
		locales: [
			{ code: "en", iso: "en-US", file: "en.json" },
			{ code: "es", iso: "es-ES", file: "es.json" },
		],
		defaultLocale: "en",
		langDir: "locales/",
		strategy: "no_prefix",
		vueI18n: "./i18n.config.ts",
	},
	compatibilityDate: "2024-11-01",
	devtools: { enabled: false },
	css: ["~/assets/css/main.css"],
	vite: {
		plugins: [tailwindcss()],
	},
	imports: {
		dirs: ["composables/**"],
	},
	components: [
		{
			path: "~/components",
			pathPrefix: true,
		},
	],
	hooks: {
		"pages:extend"(pages) {
			// Drop duplicate auto-generated routes that are superseded by the
			// explicitly-gated aliases added below. Their page files are still
			// reachable via the canonical gated paths (/myChildren, /myProfile,
			// /patientProfile, /childProfile); these bare routes were ungated
			// (surfaced by /dev) and just duplicated the same pages.
			const dropRoutes = new Set([
				"parent-children",
				"patient-patientProfile-id",
			]);
			for (let i = pages.length - 1; i >= 0; i--) {
				if (dropRoutes.has(pages[i].name || "")) pages.splice(i, 1);
			}

			// Override auto-generated routes for moved pages to maintain backward compatibility
			const routeOverrides: Record<
				string,
				{ path: string; file: string }
			> = {
				"dashboard-admin": {
					path: "/admin",
					file: "~/pages/dashboard/admin.vue",
				},
				"dashboard-parentDashboard": {
					path: "/parentDashboard",
					file: "~/pages/dashboard/parentDashboard.vue",
				},
				"dashboard-patientDashboard": {
					path: "/patientDashboard",
					file: "~/pages/dashboard/patientDashboard.vue",
				},
				"dashboard-therapistDashboard": {
					path: "/therapistDashboard",
					file: "~/pages/dashboard/therapistDashboard.vue",
				},
				"dashboard-userServiceDashboard": {
					path: "/userServiceDashboard",
					file: "~/pages/dashboard/userServiceDashboard.vue",
				},
				"dashboard-iTServiceDashboard": {
					path: "/iTServiceDashboard",
					file: "~/pages/dashboard/iTServiceDashboard.vue",
				},
				"dashboard-dashboard": {
					path: "/dashboard",
					file: "~/pages/dashboard/dashboard.vue",
				},
				"patient-patientSearch": {
					path: "/patientSearch",
					file: "~/pages/patient/patientSearch.vue",
				},
				"patient-contactForm": {
					path: "/contactForm",
					file: "~/pages/patient/contactForm.vue",
				},
				"patient-viewContactForms": {
					path: "/viewContactForms",
					file: "~/pages/patient/viewContactForms.vue",
				},
				"userService-viewAppointmentRequests": {
					path: "/viewAppointmentRequests",
					file: "~/pages/userService/viewAppointmentRequests.vue",
				},
				"userService-assignNeuroSpecialist": {
					path: "/assignNeuroSpecialist",
					file: "~/pages/userService/assignNeuroSpecialist.vue",
				},
				// "admin-employeeSearch": {
				// 	path: "/employeeSearch",
				// 	file: "~/pages/admin/employeeSearch.vue",
				// },
			};

			// Update existing routes
			pages.forEach((page) => {
				const override = routeOverrides[page.name || ""];
				if (override) {
					page.path = override.path;
					page.file = override.file;
				}
			});

			// Add custom patient profile routes
			pages.push({
				name: "myProfile-id",
				path: "/myProfile/:id",
				file: "~/pages/patient/patientProfile/[id].vue",
			});
			// Staff-facing view of any patient's profile (STAFF-gated in
			// pageAccessMap). Same page file; the route param id is a User id.
			pages.push({
				name: "patientProfile-id",
				path: "/patientProfile/:id",
				file: "~/pages/patient/patientProfile/[id].vue",
			});
			// Parent-scoped children list + child profile view (#209). Access is
			// PARENT in pageAccessMap; server enforces parent-of ownership.
			pages.push({
				name: "childSearch",
				path: "/myChildren",
				file: "~/pages/parent/children.vue",
			});
			pages.push({
				name: "childProfile-id",
				path: "/childProfile/:id",
				file: "~/pages/patient/patientProfile/[id].vue",
			});
		},
	},
});
