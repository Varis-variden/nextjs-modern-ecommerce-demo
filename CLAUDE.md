# CLAUDE.md — SIRIN Premium Thai Skincare E-Commerce Demo

## Dev Commands

```bash
npm run dev      # Start dev server (Next.js 16)
npm run build    # Production build
npm run lint     # ESLint (v9 flat config)
npm start        # Serve production build
```

No test framework configured yet.

## Tech Stack

- **Next.js 16.1.6** — App Router (root-level `app/` directory)
- **React 19.2.3** — RSC and Server Actions
- **TypeScript 5** — strict mode
- **Tailwind CSS v4** — uses `@theme inline` in `app/globals.css`, no `tailwind.config` file
- **MongoDB Atlas + Mongoose** — planned, not yet installed
- **Deployment:** Vercel with `MONGODB_URI` env var

## Project Structure

```
app/                    # Next.js App Router (root-level, NOT src/)
  layout.tsx
  page.tsx              # Homepage
  globals.css           # Tailwind v4 theme
  products/             # (planned) Product listing + detail pages
  api/                  # (planned) Route Handlers
components/             # (planned) UI components
lib/                    # (planned) DB connection, promotion engine, shipping calc
models/                 # (planned) Mongoose models
types/                  # (planned) Shared TypeScript types
scripts/                # (planned) DB seed script
```

## Key Config

- **Path alias:** `@/*` maps to project root (`./`) — import as `@/app/...`, `@/components/...`, etc.
- **Tailwind v4:** Theme defined via `@theme inline` block in `app/globals.css`. No `tailwind.config.ts`.
- **ESLint v9:** Flat config in `eslint.config.mjs` — extends `next/core-web-vitals` and `next/typescript`
- **No `src/` directory** — app and all code live at the project root

## Design System

- **Aesthetic:** Luxury minimalist, editorial — inspired by Blue Lagoon Skincare and PAÑPURI
- **Palette:** Warm neutrals — stone-50 through stone-900 base, amber/gold accents, rose for sale tags
- **Typography:**
  - Headings: `Cormorant Garamond` (Google Fonts, luxury serif)
  - Body: `DM Sans` (clean sans-serif)
  - Navigation/labels: wide letter-spacing (`tracking-widest`)
- **Layout:** Generous whitespace, asymmetric hero, 3-4 col product grids (desktop), 2-col (mobile)
- **Interactions:** Hover zoom + overlay on product cards, slide-in cart drawer, fade-up on scroll, rotating announcement bar
- **Header:** Sticky with `backdrop-blur` + shadow on scroll, centered brand name

## Architecture (Planned)

- **State:** React Context for cart + language (bilingual TH/EN)
- **Cart:** Session-based via `sirin-session` httpOnly cookie (UUID), stored in MongoDB
- **Promotion Engine:** Server-side calculation (`lib/promotionEngine.ts`) — supports BOGO, GWP, bundles, tier discounts, category discounts, cashback
- **i18n:** Context-based language toggle (Thai/English), all content stored as `{ th, en }` objects
- **Images:** Unsplash URLs via `next/image` with `unoptimized: true`
- **DB Seed:** Via `POST /api/seed?key=sirin-seed-2024` or CLI script

## Master Specification

See **`prompt-fullstack.md`** for the authoritative, detailed implementation guide — includes all Mongoose schemas, API route contracts, promotion engine logic, seed data, and UI component specs.
