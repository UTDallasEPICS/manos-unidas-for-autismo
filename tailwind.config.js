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
				//normal website colors
				navy: "#06234F",
				smoke: "#D9D9D9",
				blugrey: "#B4BBC9",
				pearl: "#F5F5F5",
				//therapy colors, Below
				darkorange: "#EEB586",
				banana: "#ECE4B9",
				peach: "#FFE1B8",
				lime: "#DDF492",
				buttercup: "#F6E274",
				periwinkle: "#B8D3FB",
				lavender: "#e3cbf8",
			},
			fontFamily: {
				cormor: ["Cormorant Garamond", "serif"], //put font-cormor in CSS body to use???
				encode: ["Encode Sans SC", "sans-serif"],
			},
		},
	},
	plugins: [],
};
