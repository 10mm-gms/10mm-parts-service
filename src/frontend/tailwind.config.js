/** @type {import('tailwindcss').Config} */
import gmsPreset from "./tailwind.preset.js";

export default {
    presets: [gmsPreset],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../../libraries/ui-core/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
