# SIRIN E-Commerce Demo — Backend API Memory

## Project Layout
- Root-level `app/` directory (NO `src/`)
- Path alias: `@/*` maps to project root
- Next.js 16.1.6, React 19, TypeScript strict, Mongoose 9

## API Route Conventions
- Uses `NextRequest` and `NextResponse` from `next/server`
- Dynamic route params are `Promise` in Next.js 16: `{ params: Promise<{ id: string }> }`
- DB connection: `await connectDB()` from `@/lib/mongodb` at top of every handler
- Models imported as default: `import Product from '@/models/Product'`
- Error format: `{ error: { code: string, message: string } }` with proper HTTP status
- Success format: direct JSON response (no wrapper for list/detail endpoints)
- `.lean()` on all read queries for performance
- Try/catch around full handler body; log errors server-side, return generic message to client

## Session Handling
- Cookie: `sirin-session` (httpOnly, 30-day maxAge, secure in prod, sameSite: lax)
- `cookies()` returns a Promise in Next.js 16 — must `await cookies()`
- Helper: `getSessionId()` reads or creates UUID cookie per route file

## Key Files
- `lib/mongodb.ts` — cached Mongoose connection singleton
- `models/Product.ts` — exports `IProduct` interface + default model
- `models/Cart.ts` — exports `ICart`, `ICartItem` interfaces + default model
- `types/index.ts` — shared frontend types (`Product`, `Cart`, `Promotion`, etc.)
- `app/api/products/route.ts` — GET all products with category/search/tag filters
- `app/api/products/[id]/route.ts` — GET single product by slug or ObjectId
- `app/api/cart/route.ts` — GET/POST/PUT/DELETE cart (session-based)
- `app/api/cart/items/[itemId]/route.ts` — PATCH qty / DELETE item
- `app/api/promotions/route.ts` — GET active promotions (date+usage filtered)
- `app/api/promotions/calculate/route.ts` — POST promo engine calculation
- `app/api/coupons/validate/route.ts` — POST coupon validation (bilingual errors)
- `app/api/shipping/calculate/route.ts` — POST shipping cost calculation
- `app/api/addresses/route.ts` — GET/POST session addresses
- `app/api/addresses/[id]/route.ts` — PUT/DELETE address by ID

## Mongoose Subdocument Pattern (Cart Items)
- Cart items are embedded subdocuments with auto-generated `_id`
- Access by id: `cart.items.id(itemId)`
- Remove by id: `cart.items.pull({ _id: itemId })`
- Populate refs: `.populate('items.productId')`

## Seed System
- Shared seed data: `lib/seedData.ts` — exports `seedProducts`, `buildPromotions()`, `seedCoupons`, `seedAddresses`
- API endpoint: `POST /api/seed?key=sirin-seed-2024` — clears all collections, inserts seed data
- CLI script: `scripts/seed.ts` — uses `process.loadEnvFile('.env.local')` with fallback
- npm script: `npm run seed` (runs `tsx scripts/seed.ts`)
- `buildPromotions()` accepts inserted product docs to resolve ObjectId references
- 11 products (product 11 is GWP gift, isActive: false), 6 promotions, 3 coupons, 2 addresses
- Cart collection also cleared during seed

## Validation Pattern
- Query params validated against allowed value arrays before applying to filter
- `mongoose.Types.ObjectId.isValid()` used before attempting _id lookup
- `isActive: true` always included in product queries
- Request body validated inline with early-return 400 responses
