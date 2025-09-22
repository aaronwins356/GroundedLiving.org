# GroundedLiving.org Build Fix Summary

## Overview
- Normalized Next.js app router route props to use the new promise-based `params`/`searchParams` contracts and added guards for array values.
- Updated Sanity schema validation callbacks to use the specific rule types introduced in Sanity v3 for accurate typing.
- Replaced the legacy Tailwind PostCSS wiring with the new `@tailwindcss/postcss` plugin, cleaned up ESLint execution, and refreshed environment examples.

## Tests
- `npm run lint`
- `npm run typecheck`
- `CI=1 npm run build`

All commands pass locally.
