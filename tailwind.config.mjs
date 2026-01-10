/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F5',
          200: '#F5F0E8',
          300: '#E8E0D0',
          400: '#D4C8B0',
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
          light: '#2D2D2D',
          muted: '#4A4A4A',
        },
        // Dark mode colors
        ink: {
          DEFAULT: '#0D0D0C',
          light: '#1A1918',
          lighter: '#252422',
        },
        sand: {
          DEFAULT: '#E8E4DC',
          muted: '#B8B4AC',
          dark: '#8A8680',
        },
        // Accent colors - Berkeley Blue
        accent: {
          DEFAULT: '#003262',
          light: '#3B7EA1',
          dark: '#002244',
          muted: '#4A90B8',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.charcoal.DEFAULT'),
            '--tw-prose-headings': theme('colors.charcoal.DEFAULT'),
            '--tw-prose-lead': theme('colors.charcoal.muted'),
            '--tw-prose-links': theme('colors.accent.DEFAULT'),
            '--tw-prose-bold': theme('colors.charcoal.DEFAULT'),
            '--tw-prose-counters': theme('colors.charcoal.muted'),
            '--tw-prose-bullets': theme('colors.charcoal.muted'),
            '--tw-prose-hr': theme('colors.cream[300]'),
            '--tw-prose-quotes': theme('colors.charcoal.DEFAULT'),
            '--tw-prose-quote-borders': theme('colors.accent.DEFAULT'),
            '--tw-prose-captions': theme('colors.charcoal.muted'),
            '--tw-prose-code': theme('colors.charcoal.DEFAULT'),
            '--tw-prose-pre-code': theme('colors.sand.DEFAULT'),
            '--tw-prose-pre-bg': theme('colors.ink.DEFAULT'),
            '--tw-prose-th-borders': theme('colors.cream[300]'),
            '--tw-prose-td-borders': theme('colors.cream[200]'),
            // Dark mode
            '--tw-prose-invert-body': theme('colors.sand.DEFAULT'),
            '--tw-prose-invert-headings': theme('colors.sand.DEFAULT'),
            '--tw-prose-invert-lead': theme('colors.sand.muted'),
            '--tw-prose-invert-links': theme('colors.accent.light'),
            '--tw-prose-invert-bold': theme('colors.sand.DEFAULT'),
            '--tw-prose-invert-counters': theme('colors.sand.muted'),
            '--tw-prose-invert-bullets': theme('colors.sand.muted'),
            '--tw-prose-invert-hr': theme('colors.ink.lighter'),
            '--tw-prose-invert-quotes': theme('colors.sand.DEFAULT'),
            '--tw-prose-invert-quote-borders': theme('colors.accent.light'),
            '--tw-prose-invert-captions': theme('colors.sand.muted'),
            '--tw-prose-invert-code': theme('colors.sand.DEFAULT'),
            '--tw-prose-invert-pre-code': theme('colors.sand.DEFAULT'),
            '--tw-prose-invert-pre-bg': theme('colors.ink.light'),
            '--tw-prose-invert-th-borders': theme('colors.ink.lighter'),
            '--tw-prose-invert-td-borders': theme('colors.ink.light'),
            // Base styles
            maxWidth: '65ch',
            fontSize: '1.125rem',
            lineHeight: '1.75',
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            code: {
              fontFamily: theme('fontFamily.mono').join(', '),
              fontWeight: '400',
              backgroundColor: theme('colors.cream[200]'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
            a: {
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              '&:hover': {
                color: theme('colors.accent.dark'),
              },
            },
            h1: {
              fontFamily: theme('fontFamily.serif').join(', '),
              fontWeight: '600',
            },
            h2: {
              fontFamily: theme('fontFamily.serif').join(', '),
              fontWeight: '600',
            },
            h3: {
              fontFamily: theme('fontFamily.serif').join(', '),
              fontWeight: '500',
            },
          },
        },
        invert: {
          css: {
            code: {
              backgroundColor: theme('colors.ink.lighter'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
