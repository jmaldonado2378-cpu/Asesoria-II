export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Crimson Text', 'Georgia', 'serif'],
            },
            colors: {
                /* Dark Neon Green — Design System */
                panel: '#1e293b',
                sidebar: '#020617',
                neon: '#4ade80',
                'neon-dim': '#14532d',
                hover: '#253347',
            },
            boxShadow: {
                neon: '0 0 12px rgba(74,222,128,0.25)',
            },
        },
    },
    plugins: [],
}
