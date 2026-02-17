/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563EB', // Finsweet Blue
                    dark: '#3B82F6',
                },
                secondary: {
                    DEFAULT: '#4B5563',
                    dark: '#D1D5DB',
                },
                success: {
                    DEFAULT: '#10B981',
                    dark: '#34D399',
                },
                danger: {
                    DEFAULT: '#EF4444',
                    dark: '#F87171',
                },
                warning: {
                    DEFAULT: '#F59E0B',
                    dark: '#FBBF24',
                },
                info: {
                    DEFAULT: '#3B82F6',
                    dark: '#60A5FA',
                },
                background: {
                    DEFAULT: '#FFFFFF',
                    dark: '#111827',
                },
                text: {
                    DEFAULT: '#1F2937',
                    dark: '#F9FAFB',
                },
                card: {
                    DEFAULT: '#F3F4F6',
                    dark: '#1F2937'
                },
                border: {
                    DEFAULT: '#E5E7EB',
                    dark: '#374151'
                }
            },
        },
    },
    plugins: [],
}
