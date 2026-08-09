// NuxtUI theme. `primary` aliases the `midnight` color ramp defined in
// assets/css/main.css (@theme). `neutral` drives all the gray surfaces/text,
// which is what makes light/dark mode coherent across every component.
export default defineAppConfig({
	ui: {
		colors: {
			primary: "midnight",
			neutral: "slate",
		},
	},
});
