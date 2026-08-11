// NuxtUI theme. `primary` aliases the `midnight` color ramp defined in
// assets/css/main.css (@theme). `neutral` drives all the gray surfaces/text,
// which is what makes light/dark mode coherent across every component.
export default defineAppConfig({
	ui: {
		colors: {
			primary: "midnight",
			neutral: "slate",
		},
		button: {
			// Solid buttons should "light up" (brighten) on hover. NuxtUI's
			// default fades the fill toward the page background
			// (hover:bg-{color}/75), which reads as washed-out rather than lit.
			// We drop that transparency and brighten the fill via a filter, so it
			// genuinely lightens in both light and dark mode. (Colored solids
			// only; neutral solid keeps its default subtle lightening — brightness
			// can't lighten a near-black fill.) `transition` is widened so the
			// brightness change animates smoothly.
			slots: {
				base: "transition-[color,background-color,border-color,box-shadow,filter,opacity]",
			},
			variants: {
				variant: {
					solid: "hover:brightness-110 active:brightness-105",
				},
			},
			compoundVariants: [
				{
					color: "primary",
					variant: "solid",
					class: "hover:bg-primary active:bg-primary",
				},
				{
					color: "secondary",
					variant: "solid",
					class: "hover:bg-secondary active:bg-secondary",
				},
				{
					color: "success",
					variant: "solid",
					class: "hover:bg-success active:bg-success",
				},
				{
					color: "info",
					variant: "solid",
					class: "hover:bg-info active:bg-info",
				},
				{
					color: "warning",
					variant: "solid",
					class: "hover:bg-warning active:bg-warning",
				},
				{
					color: "error",
					variant: "solid",
					class: "hover:bg-error active:bg-error",
				},
			],
		},
	},
});
