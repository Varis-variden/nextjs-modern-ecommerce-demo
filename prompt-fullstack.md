# Claude Code Prompt: SIRIN — Premium Thai Skincare E-Commerce Demo (Full Stack)

## Context

I'm building a **full-stack demo e-commerce storefront** to pitch a client on building them a custom e-commerce platform. The client sells premium skincare/wellness products in Thailand. This demo needs to prove I can handle their complex promotion system and deliver a luxury shopping experience.

The demo must feel **real** — products load from a database, cart persists, promotions calculate server-side, addresses save properly. The client will click around and test it. No fake/static data on the frontend.

---

## Design References & Mood

The client loves these two sites — match this **luxury minimalist, editorial** aesthetic:

- **Blue Lagoon Skincare** (https://skincare.bluelagoon.com/) — Clean white space, elegant serif headlines, minimal navigation, full-bleed hero images, muted earth tones, product cards with hover overlays, sticky header that shrinks on scroll, rotating announcement bar at top
- **PAÑPURI** (https://panpuri.com/) — Thai luxury brand, bilingual TH/EN, warm neutral palette (cream/stone/gold accents), refined typography with wide letter-spacing for navigation, "complimentary gifts with purchase" banner, editorial product photography

### Design Rules

- **Palette:** warm neutrals — stone-50 through stone-900 as base, subtle amber/gold accents for highlights, rose for sale tags
- **Fonts:** Google Font `Cormorant Garamond` for headings (luxury serif), `DM Sans` for body (clean sans-serif). Wide letter-spacing (`tracking-widest`) on navigation and labels
- **Layout:** Generous white space, asymmetric hero, 3-4 column product grids on desktop, 2-col on mobile
- **Interactions:** Smooth hover zoom + overlay on product cards, slide-in cart drawer from right, subtle fade-up on scroll (use CSS animations or framer-motion), rotating announcement bar
- **Header:** Sticky, gains `backdrop-blur` + shadow on scroll. Centered brand name, nav left, cart + language toggle right
- **DO NOT** make it look generic/Bootstrap-y. This must feel like a real luxury brand.

---

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS**
- **MongoDB Atlas** (free tier) with **Mongoose**
- **API Routes** via Next.js Route Handlers (`app/api/...`)
- State management: React Context for cart + language
- Images: Unsplash URLs with `next/image` (`unoptimized: true`)
- Deploy to **Vercel** with `MONGODB_URI` env var

---

## Project Structure

```
src/
  app/
    layout.tsx
    page.tsx                        — Homepage
    products/
      page.tsx                      — Product listing
      [slug]/page.tsx               — Product detail
    api/
      products/
        route.ts                    — GET all products (with filters)
        [id]/route.ts               — GET single product
      cart/
        route.ts                    — GET cart, POST add item, PUT update, DELETE clear
        items/[itemId]/route.ts     — PATCH update qty, DELETE remove item
      promotions/
        route.ts                    — GET active promotions
        calculate/route.ts          — POST calculate promotions for cart
      coupons/
        validate/route.ts           — POST validate coupon code
      shipping/
        calculate/route.ts          — POST calculate shipping for cart
      addresses/
        route.ts                    — GET all, POST new address
        [id]/route.ts               — PUT update, DELETE remove
      seed/route.ts                 — POST seed database (one-time setup endpoint)
  components/
    layout/
      AnnouncementBar.tsx
      Header.tsx
      Footer.tsx
      MobileMenu.tsx
    product/
      ProductCard.tsx
      ProductGrid.tsx
      QuickViewModal.tsx
    cart/
      CartDrawer.tsx                — THE hero feature
      CartItem.tsx
      CartSummary.tsx
      CouponInput.tsx
      ShippingProgress.tsx
      GWPProgress.tsx
      FreeGiftCard.tsx
    promotion/
      PromoBanner.tsx
      PromoTag.tsx
    address/
      AddressSelector.tsx
      AddressForm.tsx
    ui/
      Toast.tsx
      Modal.tsx
      LoadingSpinner.tsx
    i18n/
      LanguageContext.tsx
      translations.ts
  lib/
    mongodb.ts                      — Mongoose connection singleton
    promotionEngine.ts              — Core promotion logic
    shippingCalculator.ts
  models/
    Product.ts
    Cart.ts
    Promotion.ts
    Coupon.ts
    Address.ts
  types/
    index.ts
scripts/
  seed.ts                           — CLI seed script (also available via API)
```

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/sirin-demo
```

---

## MongoDB Connection (`lib/mongodb.ts`)

Use the standard cached connection pattern for serverless:

```ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
}
```

---

## Mongoose Models

### Product (`models/Product.ts`)

```ts
{
  slug: { type: String, unique: true, required: true },
  sku: String,
  name: {
    th: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: { th: String, en: String },
  ingredients: { th: String, en: String },
  category: { type: String, enum: ["face", "body", "hair", "home", "sets"], required: true },
  price: { type: Number, required: true },     // THB
  originalPrice: Number,                        // strikethrough price
  images: [String],                             // Unsplash URLs
  sizes: [String],                              // ["30ml", "50ml"]
  tags: [{ type: String, enum: ["new", "bestSeller", "limited"] }],
  stock: { type: Number, default: 100 },
  reservedStock: [{                             // frozen stock per promotion
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion" },
    qty: Number,
  }],
  weight: { type: Number, default: 200 },       // grams
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}
```

### Cart (`models/Cart.ts`)

```ts
{
  sessionId: { type: String, required: true, unique: true },  // use a cookie or generated ID
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    size: String,
    qty: { type: Number, min: 1 },
    addedAt: { type: Date, default: Date.now },
  }],
  couponCode: String,
  selectedAddressId: String,
  updatedAt: { type: Date, default: Date.now },
}
```

### Promotion (`models/Promotion.ts`)

```ts
{
  slug: { type: String, unique: true },
  type: {
    type: String,
    enum: ["bogo", "gwp", "bundle", "tier_discount", "tier_gwp", "category_discount", "cashback"],
    required: true,
  },
  name: { th: String, en: String },
  description: { th: String, en: String },
  isActive: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date,
  conditions: {
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categoryIds: [String],
    minQty: Number,
    minSpend: Number,
    tiers: [{
      threshold: Number,           // qty or spend amount
      discountPercent: Number,
      discountFixed: Number,
      giftProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    }],
  },
  rewards: {
    discountPercent: Number,
    discountFixed: Number,
    freeProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    freeProductQty: { type: Number, default: 1 },
    cashbackPercent: Number,
    bundlePrice: Number,
    bundleProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  stockAllocation: Number,
  usageCount: { type: Number, default: 0 },
  maxUsage: Number,
}
```

### Coupon (`models/Coupon.ts`)

```ts
{
  code: { type: String, uppercase: true, unique: true, required: true },
  type: { type: String, enum: ["percent", "fixed", "free_shipping"], required: true },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: Number,
  conditions: {
    categoryIds: [String],
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  usageLimit: { type: Number, default: 9999 },
  usageCount: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
}
```

### Address (`models/Address.ts`)

```ts
{
  sessionId: String,             // same session as cart
  label: String,                 // "บ้าน", "ออฟฟิศ"
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  district: String,              // แขวง/ตำบล
  subDistrict: String,           // เขต/อำเภอ
  province: String,              // จังหวัด
  postalCode: String,
  isDefault: { type: Boolean, default: false },
}
```

---

## API Routes

### Products

- `GET /api/products` — Returns all active products. Query params: `?category=face`, `?search=serum`, `?tag=bestSeller`
- `GET /api/products/[id]` — Returns single product by ID or slug

### Cart

- `GET /api/cart` — Get cart for session (use cookie `sirin-session` or generate UUID, stored in cookie)
- `POST /api/cart` — Add item: `{ productId, size, qty }`
- `PATCH /api/cart/items/[itemId]` — Update qty: `{ qty }`
- `DELETE /api/cart/items/[itemId]` — Remove item
- `DELETE /api/cart` — Clear entire cart
- `PUT /api/cart` — Update cart metadata: `{ couponCode?, selectedAddressId? }`

**Session handling:** On first request, generate a UUID and set it as an httpOnly cookie `sirin-session`. All cart/address operations use this sessionId. No auth needed.

### Promotions

- `GET /api/promotions` — Get all active promotions (for display on homepage/product pages)
- `POST /api/promotions/calculate` — **The key endpoint.** Takes the current cart, runs promotion engine, returns all applicable discounts, free gifts, and cashback. Body: `{ cartItems, couponCode? }`. This gets called every time the cart changes.

### Coupons

- `POST /api/coupons/validate` — Validate code: `{ code, subtotal }`. Returns coupon details or error.

### Shipping

- `POST /api/shipping/calculate` — Calculate shipping: `{ items, subtotalAfterDiscount }`. Returns `{ cost, tier, freeShippingThreshold, amountToFreeShipping }`.

### Addresses

- `GET /api/addresses` — Get saved addresses for session
- `POST /api/addresses` — Create new address
- `PUT /api/addresses/[id]` — Update address
- `DELETE /api/addresses/[id]` — Delete address

### Seed

- `POST /api/seed` — Clears database and inserts all seed data. Protected with a simple query param: `?key=sirin-seed-2024`. Returns `{ success: true, counts: { products, promotions, coupons, addresses } }`.

---

## Promotion Engine (`lib/promotionEngine.ts`)

This is the **most critical piece**. Called by `POST /api/promotions/calculate`.

Input:

```ts
interface CartForCalculation {
  items: {
    productId: string;
    product: Product; // populated
    size: string;
    qty: number;
  }[];
  couponCode?: string;
}
```

Output:

```ts
interface PromotionResult {
  appliedPromotions: {
    promoId: string;
    type: string;
    label: { th: string; en: string };
    discountAmount: number;
    affectedItems: string[]; // product IDs affected
    details: string; // e.g. "1 free item"
  }[];
  freeGifts: {
    productId: string;
    name: { th: string; en: string };
    image: string;
    qty: number;
    reason: { th: string; en: string };
  }[];
  couponDiscount: {
    code: string;
    amount: number;
    label: { th: string; en: string };
  } | null;
  couponError?: { th: string; en: string };
  cashbackEarned: number;
  subtotal: number;
  totalDiscount: number;
  shippingCost: number;
  total: number;
}
```

### Engine Rules (process in this order):

**1. BOGO (Buy One Get One)**

- Match cart items against BOGO promotions by productId
- Free qty = `Math.floor(item.qty / 2)`
- Discount = freeQty × item.price
- Tag affected items

**2. GWP — Product Level (Gift With Purchase)**

- If cart contains qualifying productId with qty >= minQty → add free gift
- Support combos: "Buy Product A + B → get gift"

**3. GWP — Category Level**

- Count items in qualifying category
- If count >= minQty → add free gift

**4. Bundle**

- Check if ALL bundleProductIds are present in cart
- If yes, apply bundle price: discount = sum(individual prices) - bundlePrice
- Only apply once per complete set in cart

**5. Tier Discount (ส่วนลดขั้นบันได)**

- Calculate subtotal after above discounts
- Find highest matching tier: `tiers.filter(t => subtotal >= t.threshold).pop()`
- Apply discountPercent to subtotal

**6. Cashback**

- Calculate subtotal after all discounts
- If >= minSpend, calculate cashbackPercent (display only — "You'll earn ฿X on next order")

**7. Coupon**

- Validate code exists, is active, within date range, usage not exceeded
- Check minOrderAmount against subtotal after promos
- Calculate discount:
  - `percent`: `Math.min(subtotal * value / 100, maxDiscount || Infinity)`
  - `fixed`: `value`
  - `free_shipping`: set shipping to ฿0
- Return couponError if invalid

**8. Shipping**

- Calculate total weight: `sum(item.qty * product.weight)`
- Find matching shipping tier
- If subtotal after all discounts >= FREE_SHIPPING_THRESHOLD → ฿0
- If coupon is free_shipping → ฿0

**All promotions stack.** Each is a separate line item in the cart summary.

---

## Tiered Shipping (`lib/shippingCalculator.ts`)

```ts
const SHIPPING_TIERS = [
  { maxWeight: 500, cost: 40, label: { en: 'Light parcel', th: 'พัสดุเบา' } },
  { maxWeight: 1000, cost: 60, label: { en: 'Standard', th: 'มาตรฐาน' } },
  { maxWeight: 3000, cost: 90, label: { en: 'Medium', th: 'ขนาดกลาง' } },
  { maxWeight: 5000, cost: 120, label: { en: 'Heavy', th: 'ขนาดใหญ่' } },
  {
    maxWeight: Infinity,
    cost: 150,
    label: { en: 'Extra heavy', th: 'น้ำหนักมาก' },
  },
];
const FREE_SHIPPING_THRESHOLD = 2000;
```

---

## Seed Data (`scripts/seed.ts` + `POST /api/seed`)

### Products (10 items, Thai botanical luxury theme)

Use Unsplash URLs with `?w=600&h=750&fit=crop` for product images.

| #   | Name (EN)                     | Name (TH)                 | Category | Price | Original | Tags       | Promo         | Weight |
| --- | ----------------------------- | ------------------------- | -------- | ----- | -------- | ---------- | ------------- | ------ |
| 1   | Botanical Radiance Serum      | เซรั่มผิวเปล่งประกาย      | face     | 1890  | —        | bestSeller | —             | 150g   |
| 2   | Golden Orchid Night Cream     | ครีมกลางคืนกล้วยไม้ทอง    | face     | 2450  | —        | new        | BOGO          | 200g   |
| 3   | Jasmine Body Oil              | น้ำมันบำรุงผิวมะลิ        | body     | 1590  | —        | —          | —             | 250g   |
| 4   | Lemongrass Purifying Cleanser | คลีนเซอร์ตะไคร้           | face     | 890   | 1190     | —          | GWP           | 180g   |
| 5   | Coconut Silk Hair Mask        | มาสก์ผมมะพร้าวซิลค์       | hair     | 1290  | —        | —          | —             | 200g   |
| 6   | Siamese Water Reed Diffuser   | ก้านหอมสยามวอเตอร์        | home     | 1990  | —        | new        | —             | 400g   |
| 7   | Turmeric Glow Mask            | มาสก์ขมิ้นผิวเรืองแสง     | face     | 1490  | —        | —          | —             | 150g   |
| 8   | Mangosteen Body Scrub         | สครับมังคุด               | body     | 1190  | —        | bestSeller | —             | 300g   |
| 9   | **Radiance Ritual Set**       | **เซ็ตผิวเปล่งประกาย**    | sets     | 3990  | 5630     | limited    | Bundle(1+2+4) | 530g   |
| 10  | Thai Herb Scalp Treatment     | ทรีตเมนต์สมุนไพรหนังศีรษะ | hair     | 1690  | —        | —          | —             | 180g   |

**GWP gift item (not sold separately):**
| — | Mini Jasmine Hand Cream | ครีมมือมะลิ มินิ | body | 0 | — | — | GWP gift | 50g |

Each product needs a full Thai description and ingredients list — write them to sound like a real luxury brand (think THANN / Harnn / PAÑPURI style).

Unsplash search terms per product:

1. `photo-1620916566398-39f1143ab7be` (serum bottle)
2. `photo-1570194065650-d99fb4a38691` (cream jar)
3. `photo-1608571423902-eed4a5ad8108` (body oil)
4. `photo-1556228578-0d85b1a4d571` (cleanser)
5. `photo-1535585209827-a15fcdbc4c2d` (hair product)
6. `photo-1602928321679-560bb453f190` (reed diffuser)
7. `photo-1596755389378-c31d21fd1273` (face mask)
8. `photo-1570172619644-dfd03ed5d881` (body scrub)
9. `photo-1571781926291-c477ebfd024b` (skincare set)
10. `photo-1527799820374-dcf8d9d4a388` (scalp treatment)

### Promotions (6 active)

1. **BOGO** — Buy Golden Orchid Night Cream (product 2), get 1 free per pair
2. **GWP Product** — Buy Lemongrass Cleanser (product 4) → get Mini Jasmine Hand Cream free
3. **GWP Category** — Buy 2+ face category products → get Mini Turmeric Glow Mask sample free
4. **Bundle** — Radiance Ritual Set: products 1+2+4 = ฿3,990 (save ฿1,640). Reserve 50 sets of stock.
5. **Tier Discount** — Spend ฿3,000→5% | ฿5,000→10% | ฿8,000→15%
6. **Cashback** — Spend ฿4,000+ → earn 3% cashback

### Coupons (3 codes)

1. `WELCOME10` — 10% off, min ฿1,000, max discount ฿500
2. `FREESHIP` — Free shipping, min ฿800
3. `BEAUTY200` — ฿200 off, min ฿2,000

### Mock Addresses (2)

1. Label: "บ้าน" / fullName: "สมศรี รุ่งเรือง" / Bangkok address / default: true
2. Label: "ออฟฟิศ" / fullName: "สมศรี รุ่งเรือง" / Sathorn office address / default: false

---

## Smart Cart Drawer — THE Demo's Hero Feature

### Visual Layout (slides in from right, ~420px wide desktop, full-width mobile):

```
┌──────────────────────────────────┐
│ 🛍 Cart (3 items)            ✕   │
├──────────────────────────────────┤
│                                  │
│ [img] Golden Orchid Night Cream  │
│       50ml        ฿2,450        │
│       Qty: [–] 2 [+]    [Del]  │
│       🔴 BOGO: 1 Free!          │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│ [img] Lemongrass Cleanser        │
│       120ml       ฿890          │
│       Qty: [–] 1 [+]    [Del]  │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│ [img] Botanical Serum            │
│       30ml        ฿1,890        │
│       Qty: [–] 1 [+]    [Del]  │
│                                  │
├──── 🎁 FREE GIFTS ──────────────┤
│ [img] Mini Jasmine Hand Cream    │
│       FREE — with Cleanser       │
│                                  │
├──── 🎯 Almost there! ───────────┤
│ Spend ฿210 more for free gift!   │
│ [████████████░░░░] 78%           │
│                                  │
├──── 🚚 Shipping ────────────────┤
│ Spend ฿X more for FREE shipping! │
│ [██████████░░░░░░] 65%           │
│                                  │
├──── 🏷 Coupon ──────────────────┤
│ [______________] [Apply]         │
│ ✅ WELCOME10 applied    [✕]      │
│                                  │
├──── 📍 Deliver to ──────────────┤
│ [บ้าน — สมศรี รุ่งเ... ▾]       │
│ + Add new address                │
│                                  │
├──── Order Summary ──────────────┤
│ Subtotal              ฿7,680    │
│ 🔴 BOGO Night Cream   -฿2,450   │
│ 📊 Tier discount 5%   -฿261     │
│ 🏷 Coupon WELCOME10   -฿497     │
│ 🚚 Shipping            ฿60      │
│ ────────────────────────────    │
│ Total                 ฿4,532    │
│                                  │
│ 💰 You'll earn ฿136 cashback!   │
│                                  │
│ [       CHECKOUT        ]        │
│ ฿1,148 saved on this order      │
└──────────────────────────────────┘
```

### Cart Drawer Behaviors:

- **Opens automatically** when an item is added (with slide-in animation)
- **Calls `POST /api/promotions/calculate`** on every cart change (add, remove, qty change, coupon apply)
- Free gifts appear/disappear dynamically based on promo engine response
- GWP progress bar: shows nearest GWP threshold and how close user is
- Shipping progress bar: shows how much more to spend for free shipping
- Coupon: validate via `POST /api/coupons/validate`, show success or error toast
- Address dropdown: loads from `GET /api/addresses`, option to add new via modal
- Checkout button: show a styled toast "✨ This is a demo — checkout coming soon!"
- Close: click backdrop, click ✕, or press Escape
- Animation: `translateX(100%)` → `translateX(0)` over 300ms ease-out
- Scrollable content area if cart is tall, summary section sticky at bottom

---

## Bilingual System (TH / EN)

### LanguageContext (`components/i18n/LanguageContext.tsx`)

```ts
interface LanguageContextType {
  lang: 'th' | 'en';
  setLang: (lang: 'th' | 'en') => void;
  t: typeof translations.th; // current language strings
}
```

- Wrap app in `<LanguageProvider>`
- Persist to `localStorage`
- Default: `th`
- Toggle button in header: shows "EN" when in TH mode, "TH" when in EN mode

### translations.ts

All UI strings in both languages. Includes: navigation, cart labels, promo names, form labels, error messages, toasts, empty states, footer text, etc. At least 60-80 string keys.

### Product/Promo data

All name, description, ingredients fields are `{ th: string, en: string }`. Access via `product.name[lang]`.

---

## Frontend Pages

### Homepage (`/`)

Sections in order:

1. **AnnouncementBar** — dark stone-900 bg, rotating messages every 4s with crossfade
2. **Hero** — asymmetric grid (left: tagline + serif headline + 2 CTAs, right: large lifestyle image with decorative shapes)
3. **Promo Banner** — 4 cards showing active promos with colored borders (rose/amber/emerald/blue)
4. **Bestsellers** — section header + 4-col product grid (fetch products with `bestSeller` tag)
5. **Bundle Feature** — wide card: image left, details right, "Save ฿1,640" callout, "Shop Set" CTA
6. **Category Browse** — row of category image cards (Face, Body, Hair, Home)
7. **Footer** — brand tagline, nav columns, social icons, language, copyright

### Product Listing (`/products`)

- Fetch products from `GET /api/products`
- Filter tabs: All | Face | Body | Hair | Home | Sets (use query param `?category=face`)
- Search input (sends `?search=` to API)
- 3-col grid desktop, 2-col mobile
- ProductCards with hover overlays
- PromoTags on qualifying products (BOGO, GWP, Bundle badges)
- Loading skeleton while fetching

### Product Detail (`/products/[slug]`)

- Fetch from `GET /api/products/[slug]`
- Left: Image gallery with thumbnails
- Right: Name, price (strikethrough if originalPrice), size pills, qty selector, Add to Cart button
- Below: Description + Ingredients in tabs
- Active promotions for this product shown as colored info banners
- "You may also like" section: 4 related products from same category

### Quick View Modal

- Triggered by "Quick View" button on product card hover
- Compact version of product detail: main image, name, price, size select, qty, Add to Cart
- Modal overlay with close on backdrop or ✕

---

## Key UX Polish

- Fade-up animations on scroll (Intersection Observer or framer-motion)
- Product image hover: `scale-105` over 700ms
- Cart drawer: smooth `translateX` slide
- Announcement bar: crossfade between messages
- Add to cart: pulse animation on cart icon + cart drawer opens
- Toast system for: coupon success/error, add to cart confirmation, checkout demo message
- Loading skeletons for product grid while API loads
- All transitions 300ms ease
- Fully responsive: 375px / 768px / 1280px breakpoints
- Number formatting: `฿1,890` with thousands separator
- Empty cart state with illustration and "Continue Shopping" link

---

## Deployment

### Vercel Config

`next.config.js`:

```js
module.exports = {
  images: { unoptimized: true },
};
```

### Setup Steps

```bash
npm install
# Create MongoDB Atlas free cluster
# Set MONGODB_URI in .env.local (and in Vercel env vars)
npm run seed        # or POST /api/seed?key=sirin-seed-2024
npm run dev         # localhost:3000
npx vercel          # deploy
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "seed": "tsx scripts/seed.ts"
  }
}
```

Dependencies: `next`, `react`, `react-dom`, `mongoose`, `tailwindcss`, `typescript`, `tsx` (dev), `@types/node`, `@types/react`

Optional: `framer-motion` for animations, `sonner` for toasts, `lucide-react` for icons

---

## What NOT to Build

- User auth / registration / login
- Real payment processing
- Order creation / confirmation / email
- Admin dashboard
- Server-side full-text search (client filter is fine)
- Reviews / ratings
- Inventory management UI
- Real image uploads

---

## Summary

The client will visit the demo, switch between Thai/English, browse products, add items to cart, see promotions auto-apply in real-time, try coupon codes, pick a delivery address, and see the full pricing breakdown — all backed by a real database. The **smart cart with stacking promotions** is what sells them. Make it feel premium, make it feel real.

# Always use "front-end design skill" when implement front end part
