// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
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
				"patient-testingForm": {
					path: "/testingForm",
					file: "~/pages/patient/testingForm.vue",
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
