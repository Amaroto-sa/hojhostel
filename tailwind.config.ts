import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: "#0a0a0c",
                    soft: "#121216"
                },
                panel: {
                    DEFAULT: "rgba(255,255,255,0.06)",
                    2: "rgba(255,255,255,0.09)"
                },
                line: "rgba(255,255,255,0.1)",
                text: {
                    DEFAULT: "#f5f5f7",
                    muted: "#b1b1ba"
                },
                orange: {
                    DEFAULT: "#ff7a1a",
                    2: "#ff9f5a",
                    soft: "rgba(255,122,26,0.15)"
                }
            },
            fontFamily: {
                sans: ["var(--font-inter)"],
                display: ["var(--font-clash-display)"],
            },
            boxShadow: {
                glow: "0 10px 30px rgba(255,122,26,0.28)",
                card: "0 25px 70px rgba(0,0,0,0.35)",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            }
        },
    },
    plugins: [],
};
export default config;
