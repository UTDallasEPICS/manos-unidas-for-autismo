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
				grey: "#D9D9D9",
				blugrey: "#B4BBC9",
				white: "#F5F5F5",
				//therapy colors?? Below
				darkorange: "#EEB586",
				bannana: "#ECE4B9",
				peach: "#FFE1B8",
				lime: "#DDF492",
				buttercup: "#F6E274",
				periwinkle: "#B8D3FB",
				lavender: "#B8D3FB",
			},
			fontFamily: {
				cormor: ["Cormorant Garamond", "serif"], //put font-cormor in CSS body to use
				encode: ["Encode Sans SC", "sans"],
			},
		},
	},
	plugins: [],
};
