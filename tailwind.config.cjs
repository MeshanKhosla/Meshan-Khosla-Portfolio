/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [require("@tailwindcss/typography"),require("daisyui")],
	daisyui: {
		themes: [
			{
				mytheme: {
					"primary": "#64748b",
					"primary-focus": "#475569",
					"primary-content": "#ffffff",
					"base-100": "#1d232a",
					"base-200": "#191e24",
					"base-300": "#15191e",
					"base-content": "#ffffff",
				},
			},
		],
	},
}
