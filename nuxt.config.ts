// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: false },
	css: ["~/assets/css/main.css"],
	vite: {
		plugins: [tailwindcss()],
	},
	hooks: {
		"pages:extend"(pages) {
			pages.push({
				name: "myProfile-id",
				path: "/myProfile/:id",
				file: "~/pages/patientProfile/[id].vue",
			});
			pages.push({
				name: "childProfile-id",
				path: "/childProfile/:id",
				file: "~/pages/patientProfile/[id].vue",
			});
			pages.push({
				name: "childSearch",
				path: "/myChildren",
				file: "~/pages/patientSearch.vue",
			});
		},
	},
});
