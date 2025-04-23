/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./components/**/*.{js,vue,ts}",
		"./layouts/**/*.vue",
		"./pages/**/*.vue",
		"./plugins/**/*.{js,ts}",
		"./app.vue",
		"./error.vue",
	],
	theme: {
		extend: {
			colors: {
				/* main colors */
				pearl: "#FFFFFF",
				smoky: "#D9D9D9",
				midnight: "#06234F",
				/* extras */
				blay: "#B4BBC9",
				lilac: "#E3CBF8",
				salmon: "#EEB586",
				peach: "#FFE1B8",
				lime: "#DDF492",
				sky: "#B8D3FB",
				buttercup: "#F6E274",
				sandy: "#ECE4B9",
			},
			fontFamily: {
				serif: ['"Cormorant Garamond"', "serif"],
				sans: ['"Encode Sans SC"', "sans-serif"],
			},
		},
	},
	plugins: [],
};
