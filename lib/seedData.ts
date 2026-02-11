/**
 * Shared seed data for SIRIN Premium Thai Skincare e-commerce demo.
 *
 * Used by both the API seed endpoint (`POST /api/seed`) and the CLI
 * seed script (`scripts/seed.ts`).  Product descriptions are written
 * in a luxury-brand editorial voice (THANN / Harnn / PANPURI style).
 */

const UNSPLASH_BASE = 'https://images.unsplash.com/';

// ─── Products ────────────────────────────────────────────────────────

export interface SeedProduct {
  slug: string;
  name: { th: string; en: string };
  description: { th: string; en: string };
  ingredients: { th: string; en: string };
  category: 'face' | 'body' | 'hair' | 'home' | 'sets';
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  tags: ('new' | 'bestSeller' | 'limited')[];
  stock: number;
  weight: number;
  isActive: boolean;
}

export const seedProducts: SeedProduct[] = [
  // 1. Botanical Radiance Serum
  {
    slug: 'botanical-radiance-serum',
    name: {
      en: 'Botanical Radiance Serum',
      th: 'เซรั่มผิวเปล่งประกาย',
    },
    description: {
      en: 'A potent blend of native Thai botanicals and advanced peptides that transforms dull, tired skin into a luminous, healthy glow. Infused with Centella Asiatica and Rice Bran extract, this lightweight serum absorbs instantly, delivering deep hydration while visibly reducing fine lines and uneven tone. Crafted for all skin types seeking a natural radiance revival.',
      th: 'เซรั่มสูตรเข้มข้นจากพฤกษศาสตร์ไทยพื้นเมืองผสานเปปไทด์ขั้นสูง ช่วยเปลี่ยนผิวหมองคล้ำให้เปล่งประกายสุขภาพดี อุดมด้วยสารสกัดใบบัวบกและน้ำมันรำข้าว เนื้อเซรั่มบางเบาซึมซาบทันที มอบความชุ่มชื้นอย่างล้ำลึก พร้อมลดเลือนริ้วรอยและสีผิวไม่สม่ำเสมอ เหมาะสำหรับทุกสภาพผิวที่ต้องการผิวเปล่งปลั่งตามธรรมชาติ',
    },
    ingredients: {
      en: 'Centella Asiatica Extract, Rice Bran Oil, Niacinamide, Hyaluronic Acid, Vitamin C, Green Tea Extract, Jasmine Water',
      th: 'สารสกัดใบบัวบก, น้ำมันรำข้าว, ไนอาซินาไมด์, ไฮยาลูรอนิกแอซิด, วิตามินซี, สารสกัดชาเขียว, น้ำมะลิ',
    },
    category: 'face',
    price: 1890,
    images: [`${UNSPLASH_BASE}photo-1620916566398-39f1143ab7be?w=600&h=750&fit=crop`],
    sizes: ['30ml', '50ml'],
    tags: ['bestSeller'],
    stock: 100,
    weight: 150,
    isActive: true,
  },

  // 2. Golden Orchid Night Cream
  {
    slug: 'golden-orchid-night-cream',
    name: {
      en: 'Golden Orchid Night Cream',
      th: 'ครีมกลางคืนกล้วยไม้ทอง',
    },
    description: {
      en: 'Immerse your skin in the restorative luxury of Thailand\'s Golden Orchid. This velvety night cream works while you sleep, harnessing the regenerative power of orchid stem cells and 24K gold micro-particles to firm, plump, and illuminate. Wake to visibly younger, suppler skin — as if you\'d spent the night at a world-class spa.',
      th: 'มอบความหรูหราแห่งการฟื้นบำรุงผิวด้วยกล้วยไม้ทองของไทย ครีมกลางคืนเนื้อเนียนนุ่มทำงานขณะคุณหลับ ด้วยพลังการฟื้นฟูจากสเต็มเซลล์กล้วยไม้และอนุภาคทองคำ 24K ช่วยกระชับ เติมเต็มผิว และเปล่งประกาย ตื่นมาพบผิวอ่อนเยาว์อิ่มเอิบ ดั่งเพิ่งผ่านการดูแลจากสปาระดับโลก',
    },
    ingredients: {
      en: 'Orchid Stem Cell Extract, 24K Gold Micro-Particles, Squalane, Shea Butter, Vitamin E, Rosehip Oil, Collagen Peptide Complex',
      th: 'สารสกัดสเต็มเซลล์กล้วยไม้, อนุภาคทองคำ 24K, สควาเลน, เชียบัตเตอร์, วิตามินอี, น้ำมันโรสฮิป, คอลลาเจนเปปไทด์คอมเพล็กซ์',
    },
    category: 'face',
    price: 2450,
    images: [`${UNSPLASH_BASE}photo-1570194065650-d99fb4a38691?w=600&h=750&fit=crop`],
    sizes: ['30ml', '50ml'],
    tags: ['new'],
    stock: 100,
    weight: 200,
    isActive: true,
  },

  // 3. Jasmine Body Oil
  {
    slug: 'jasmine-body-oil',
    name: {
      en: 'Jasmine Body Oil',
      th: 'น้ำมันบำรุงผิวมะลิ',
    },
    description: {
      en: 'A satin-finish body oil steeped in the intoxicating fragrance of Thai jasmine petals. Cold-pressed coconut and jojoba oils melt effortlessly into the skin, leaving it impossibly soft and wrapped in a delicate floral veil. An evening ritual that transforms the ordinary into the extraordinary.',
      th: 'น้ำมันบำรุงผิวเนื้อสัมผัสซาตินที่อาบด้วยกลิ่นหอมอันเย้ายวนของกลีบมะลิไทย น้ำมันมะพร้าวและโจโจ้บาสกัดเย็นซึมซาบอย่างง่ายดาย มอบผิวเนียนนุ่มดุจกำมะหยี่ ห่อหุ้มด้วยม่านดอกไม้อันละเอียดอ่อน พิธีกรรมยามเย็นที่เปลี่ยนช่วงเวลาธรรมดาให้พิเศษ',
    },
    ingredients: {
      en: 'Jasmine Absolute, Cold-Pressed Coconut Oil, Jojoba Oil, Sweet Almond Oil, Vitamin E, Ylang-Ylang Essential Oil, Argan Oil',
      th: 'สารสกัดมะลิบริสุทธิ์, น้ำมันมะพร้าวสกัดเย็น, น้ำมันโจโจ้บา, น้ำมันอัลมอนด์หวาน, วิตามินอี, น้ำมันหอมระเหยกระดังงา, น้ำมันอาร์แกน',
    },
    category: 'body',
    price: 1590,
    images: [`${UNSPLASH_BASE}photo-1608571423902-eed4a5ad8108?w=600&h=750&fit=crop`],
    sizes: ['100ml', '200ml'],
    tags: [],
    stock: 100,
    weight: 250,
    isActive: true,
  },

  // 4. Lemongrass Purifying Cleanser
  {
    slug: 'lemongrass-purifying-cleanser',
    name: {
      en: 'Lemongrass Purifying Cleanser',
      th: 'คลีนเซอร์ตะไคร้',
    },
    description: {
      en: 'Purify and refresh with the bright, herbaceous essence of Thai lemongrass. This gel-to-foam cleanser gently dissolves impurities, excess sebum, and environmental residue without stripping the skin\'s natural moisture barrier. Enriched with Witch Hazel and Tea Tree, it leaves pores refined and the complexion visibly clearer.',
      th: 'ชำระล้างและสดชื่นด้วยพลังสมุนไพรตะไคร้ไทย คลีนเซอร์เนื้อเจลเปลี่ยนเป็นโฟมอ่อนโยน ขจัดสิ่งสกปรก ความมัน และมลภาวะ โดยไม่ทำลายเกราะป้องกันความชุ่มชื้นตามธรรมชาติของผิว เสริมด้วยวิชฮาเซลและทีทรี ช่วยกระชับรูขุมขน มอบผิวกระจ่างใสอย่างเห็นได้ชัด',
    },
    ingredients: {
      en: 'Lemongrass Essential Oil, Witch Hazel Extract, Tea Tree Oil, Glycerin, Aloe Vera, Salicylic Acid, Chamomile Extract',
      th: 'น้ำมันหอมระเหยตะไคร้, สารสกัดวิชฮาเซล, น้ำมันทีทรี, กลีเซอรีน, ว่านหางจระเข้, กรดซาลิไซลิก, สารสกัดคาโมมายล์',
    },
    category: 'face',
    price: 890,
    originalPrice: 1190,
    images: [`${UNSPLASH_BASE}photo-1556228578-0d85b1a4d571?w=600&h=750&fit=crop`],
    sizes: ['120ml', '200ml'],
    tags: [],
    stock: 100,
    weight: 180,
    isActive: true,
  },

  // 5. Coconut Silk Hair Mask
  {
    slug: 'coconut-silk-hair-mask',
    name: {
      en: 'Coconut Silk Hair Mask',
      th: 'มาสก์ผมมะพร้าวซิลค์',
    },
    description: {
      en: 'Transform brittle, over-processed hair into cascading silk with this deeply nourishing coconut hair mask. Virgin coconut oil from the Southern Thai islands, paired with hydrolyzed keratin and argan oil, penetrates each strand to repair, strengthen, and seal in brilliant shine. Leave on for five minutes and rinse to reveal effortlessly luxurious locks.',
      th: 'เปลี่ยนผมเสียแห้งเปราะให้สวยเรียบลื่นดุจผ้าไหม ด้วยมาสก์บำรุงผมสูตรเข้มข้น น้ำมันมะพร้าวบริสุทธิ์จากหมู่เกาะภาคใต้ของไทย ผสานเคราตินไฮโดรไลซ์และน้ำมันอาร์แกน ซึมลึกเข้าสู่เส้นผมทุกเส้น ซ่อมแซม เสริมความแข็งแรง และผนึกประกายเงางาม ทิ้งไว้ 5 นาทีแล้วล้างออก สัมผัสผมสวยหรูอย่างเป็นธรรมชาติ',
    },
    ingredients: {
      en: 'Virgin Coconut Oil, Hydrolyzed Keratin, Argan Oil, Shea Butter, Panthenol, Silk Amino Acids, Vitamin B5',
      th: 'น้ำมันมะพร้าวบริสุทธิ์, เคราตินไฮโดรไลซ์, น้ำมันอาร์แกน, เชียบัตเตอร์, แพนธีนอล, กรดอะมิโนจากไหม, วิตามินบี 5',
    },
    category: 'hair',
    price: 1290,
    images: [`${UNSPLASH_BASE}photo-1535585209827-a15fcdbc4c2d?w=600&h=750&fit=crop`],
    sizes: ['150ml', '250ml'],
    tags: [],
    stock: 100,
    weight: 200,
    isActive: true,
  },

  // 6. Siamese Water Reed Diffuser
  {
    slug: 'siamese-water-reed-diffuser',
    name: {
      en: 'Siamese Water Reed Diffuser',
      th: 'ก้านหอมสยามวอเตอร์',
    },
    description: {
      en: 'Bring the serene essence of Thailand into your living space. Inspired by the fresh, dewy mornings along the Chao Phraya, this reed diffuser merges aquatic green notes with delicate lotus blossom and white cedar. Handcrafted rattan reeds release the fragrance gradually, creating a calming, spa-like atmosphere for up to eight weeks.',
      th: 'นำแก่นแท้แห่งความสงบของไทยมาสู่พื้นที่อยู่อาศัยของคุณ แรงบันดาลใจจากเช้าอันสดชื่นริมแม่น้ำเจ้าพระยา ก้านหอมปรับอากาศผสานกลิ่นสดชื่นจากพืชน้ำ ดอกบัว และซีดาร์ขาว ก้านหวายทำมือค่อยๆ ปล่อยกลิ่นหอม สร้างบรรยากาศผ่อนคลายดุจสปา นานสูงสุด 8 สัปดาห์',
    },
    ingredients: {
      en: 'Aquatic Green Accord, Lotus Blossom Extract, White Cedar Essential Oil, Bergamot, Vetiver, Rattan Reeds',
      th: 'สารสกัดพืชน้ำ, สารสกัดดอกบัว, น้ำมันหอมระเหยซีดาร์ขาว, เบอร์กามอต, แฝก, ก้านหวายธรรมชาติ',
    },
    category: 'home',
    price: 1990,
    images: [`${UNSPLASH_BASE}photo-1602928321679-560bb453f190?w=600&h=750&fit=crop`],
    sizes: ['100ml', '200ml'],
    tags: ['new'],
    stock: 100,
    weight: 400,
    isActive: true,
  },

  // 7. Turmeric Glow Mask
  {
    slug: 'turmeric-glow-mask',
    name: {
      en: 'Turmeric Glow Mask',
      th: 'มาสก์ขมิ้นผิวเรืองแสง',
    },
    description: {
      en: 'Harness the golden secret cherished by Thai women for centuries. This creamy clay mask blends organic turmeric with Kaolin clay and raw honey to draw out impurities, calm inflammation, and impart a warm, lit-from-within glow. Apply a thin layer, relax for ten minutes, and unveil skin that looks refreshed, even-toned, and unmistakably radiant.',
      th: 'เผยเคล็ดลับสีทองที่หญิงไทยหวงแหนมาหลายศตวรรษ มาสก์ดินเนื้อครีมผสมขมิ้นออร์แกนิกกับดินเคโอลินและน้ำผึ้งดิบ ดึงสิ่งสกปรก ลดการอักเสบ และมอบประกายเรืองแสงจากภายใน ทาบางๆ ผ่อนคลาย 10 นาที แล้วเผยผิวสดใส สม่ำเสมอ และเปล่งปลั่งอย่างไม่ต้องสงสัย',
    },
    ingredients: {
      en: 'Organic Turmeric Extract, Kaolin Clay, Raw Manuka Honey, Yogurt Enzyme, Licorice Root Extract, Rosemary Oil, Vitamin C',
      th: 'สารสกัดขมิ้นออร์แกนิก, ดินเคโอลิน, น้ำผึ้งมานูก้าดิบ, เอนไซม์โยเกิร์ต, สารสกัดรากชะเอม, น้ำมันโรสแมรี่, วิตามินซี',
    },
    category: 'face',
    price: 1490,
    images: [`${UNSPLASH_BASE}photo-1596755389378-c31d21fd1273?w=600&h=750&fit=crop`],
    sizes: ['50ml', '100ml'],
    tags: [],
    stock: 100,
    weight: 150,
    isActive: true,
  },

  // 8. Mangosteen Body Scrub
  {
    slug: 'mangosteen-body-scrub',
    name: {
      en: 'Mangosteen Body Scrub',
      th: 'สครับมังคุด',
    },
    description: {
      en: 'The Queen of Fruits meets the art of exfoliation. Hand-harvested mangosteen rind, rich in xanthones, is finely milled and blended with sea salt and coconut cream to buff away dullness and reveal silken, polished skin. Its naturally sweet, tropical aroma turns every shower into an indulgent spa escape.',
      th: 'ราชินีแห่งผลไม้พบกับศิลปะแห่งการผลัดเซลล์ผิว เปลือกมังคุดเก็บเกี่ยวด้วยมือ อุดมด้วยแซนโทน บดละเอียดผสานเกลือทะเลและครีมมะพร้าว ขัดผิวหมองคล้ำ เผยผิวเนียนเรียบดุจผ้าไหม กลิ่นหอมหวานธรรมชาติแบบเขตร้อน เปลี่ยนทุกการอาบน้ำเป็นช่วงเวลาสปาสุดหรู',
    },
    ingredients: {
      en: 'Mangosteen Rind Powder, Sea Salt, Coconut Cream, Shea Butter, Grapeseed Oil, Lactic Acid, Bergamot Essential Oil',
      th: 'ผงเปลือกมังคุด, เกลือทะเล, ครีมมะพร้าว, เชียบัตเตอร์, น้ำมันเมล็ดองุ่น, กรดแลกติก, น้ำมันหอมระเหยเบอร์กามอต',
    },
    category: 'body',
    price: 1190,
    images: [`${UNSPLASH_BASE}photo-1570172619644-dfd03ed5d881?w=600&h=750&fit=crop`],
    sizes: ['200ml', '350ml'],
    tags: ['bestSeller'],
    stock: 100,
    weight: 300,
    isActive: true,
  },

  // 9. Radiance Ritual Set
  {
    slug: 'radiance-ritual-set',
    name: {
      en: 'Radiance Ritual Set',
      th: 'เซ็ตผิวเปล่งประกาย',
    },
    description: {
      en: 'The complete evening ritual, curated for those who refuse to compromise. This limited-edition set pairs the Botanical Radiance Serum, the Golden Orchid Night Cream, and the Lemongrass Purifying Cleanser — three best-loved formulations united in an elegant keepsake box. A saving of ฿1,640 and the perfect introduction to the SIRIN philosophy.',
      th: 'พิธีกรรมบำรุงผิวยามค่ำอันสมบูรณ์แบบ คัดสรรเพื่อผู้ที่ไม่ยอมประนีประนอม เซ็ตลิมิเต็ดอิดิชั่นรวม เซรั่มผิวเปล่งประกาย ครีมกลางคืนกล้วยไม้ทอง และ คลีนเซอร์ตะไคร้ — สามสูตรยอดนิยมในกล่องของขวัญหรูหรา ประหยัด ฿1,640 และเป็นจุดเริ่มต้นที่สมบูรณ์แบบสู่ปรัชญา SIRIN',
    },
    ingredients: {
      en: 'Includes: Botanical Radiance Serum (30ml), Golden Orchid Night Cream (30ml), Lemongrass Purifying Cleanser (120ml)',
      th: 'ประกอบด้วย: เซรั่มผิวเปล่งประกาย (30ml), ครีมกลางคืนกล้วยไม้ทอง (30ml), คลีนเซอร์ตะไคร้ (120ml)',
    },
    category: 'sets',
    price: 3990,
    originalPrice: 5630,
    images: [`${UNSPLASH_BASE}photo-1571781926291-c477ebfd024b?w=600&h=750&fit=crop`],
    sizes: [],
    tags: ['limited'],
    stock: 50,
    weight: 530,
    isActive: true,
  },

  // 10. Thai Herb Scalp Treatment
  {
    slug: 'thai-herb-scalp-treatment',
    name: {
      en: 'Thai Herb Scalp Treatment',
      th: 'ทรีตเมนต์สมุนไพรหนังศีรษะ',
    },
    description: {
      en: 'Rooted in ancient Thai herbal wisdom, this intensive scalp treatment combines Butterfly Pea, Kaffir Lime, and Ginger to invigorate the scalp, reduce flakiness, and promote thicker, healthier hair growth. The cooling menthol finish provides immediate relief, while botanical actives work over time to rebalance and nourish.',
      th: 'สืบสานภูมิปัญญาสมุนไพรไทยโบราณ ทรีตเมนต์หนังศีรษะสูตรเข้มข้นผสาน อัญชัน มะกรูด และขิง กระตุ้นหนังศีรษะ ลดรังแค และส่งเสริมผมหนาสุขภาพดี เมนทอลเย็นสบายมอบความโล่งทันที ขณะที่สารสกัดจากพฤกษชาติทำงานอย่างต่อเนื่องเพื่อปรับสมดุลและบำรุง',
    },
    ingredients: {
      en: 'Butterfly Pea Extract, Kaffir Lime Oil, Ginger Root Extract, Menthol, Biotin, Peppermint Oil, Saw Palmetto Extract',
      th: 'สารสกัดอัญชัน, น้ำมันมะกรูด, สารสกัดรากขิง, เมนทอล, ไบโอติน, น้ำมันเปปเปอร์มิ้นท์, สารสกัดซอว์พัลเม็ตโต',
    },
    category: 'hair',
    price: 1690,
    images: [`${UNSPLASH_BASE}photo-1527799820374-dcf8d9d4a388?w=600&h=750&fit=crop`],
    sizes: ['100ml', '200ml'],
    tags: [],
    stock: 100,
    weight: 180,
    isActive: true,
  },

  // 11. Mini Jasmine Hand Cream (GWP gift — not sold separately)
  {
    slug: 'mini-jasmine-hand-cream',
    name: {
      en: 'Mini Jasmine Hand Cream',
      th: 'ครีมมือมะลิ มินิ',
    },
    description: {
      en: 'A complimentary miniature of our signature jasmine hand cream. Enriched with shea butter and Thai jasmine absolute, it softens and protects hands with a whisper of floral elegance. The perfect travel companion and a beloved gift-with-purchase.',
      th: 'ครีมบำรุงมือมะลิขนาดพกพาจาก SIRIN อุดมด้วยเชียบัตเตอร์และสารสกัดมะลิไทยบริสุทธิ์ มอบความนุ่มนวลและปกป้องมือพร้อมกลิ่นหอมดอกไม้อันละเอียดอ่อน เหมาะสำหรับพกเดินทางและเป็นของขวัญสุดพิเศษ',
    },
    ingredients: {
      en: 'Shea Butter, Jasmine Absolute, Glycerin, Aloe Vera, Cocoa Butter, Vitamin E, Sweet Almond Oil',
      th: 'เชียบัตเตอร์, สารสกัดมะลิบริสุทธิ์, กลีเซอรีน, ว่านหางจระเข้, โกโก้บัตเตอร์, วิตามินอี, น้ำมันอัลมอนด์หวาน',
    },
    category: 'body',
    price: 0,
    images: [`${UNSPLASH_BASE}photo-1608571423902-eed4a5ad8108?w=300&h=375&fit=crop`],
    sizes: ['30ml'],
    tags: [],
    stock: 500,
    weight: 50,
    isActive: false, // GWP only — hidden from product listings
  },
];

// ─── Promotions ──────────────────────────────────────────────────────
//
// Product IDs are injected at runtime after inserting products.
// We store a builder function that receives inserted product docs.

export interface InsertedProduct {
  _id: unknown; // mongoose ObjectId
  slug: string;
}

export function buildPromotions(products: InsertedProduct[]) {
  const bySlug = (slug: string) => {
    const p = products.find((p) => p.slug === slug);
    if (!p) throw new Error(`Seed product not found: ${slug}`);
    return p._id;
  };

  return [
    // 1. BOGO — Night Cream
    {
      slug: 'bogo-night-cream',
      type: 'bogo' as const,
      name: {
        en: 'Buy 1 Get 1 Free — Night Cream',
        th: 'ซื้อ 1 แถม 1 — ครีมกลางคืน',
      },
      description: {
        en: 'Purchase a Golden Orchid Night Cream and receive a second one absolutely free.',
        th: 'ซื้อครีมกลางคืนกล้วยไม้ทอง 1 กระปุก รับฟรีอีก 1 กระปุก',
      },
      isActive: true,
      conditions: {
        productIds: [bySlug('golden-orchid-night-cream')],
      },
      rewards: {},
    },
    // 2. GWP Product — Cleanser
    {
      slug: 'gwp-cleanser',
      type: 'gwp' as const,
      name: {
        en: 'Free Gift with Cleanser',
        th: 'ของแถมเมื่อซื้อคลีนเซอร์',
      },
      description: {
        en: 'Buy a Lemongrass Purifying Cleanser and receive a Mini Jasmine Hand Cream free.',
        th: 'ซื้อคลีนเซอร์ตะไคร้ รับครีมมือมะลิ มินิ ฟรี',
      },
      isActive: true,
      conditions: {
        productIds: [bySlug('lemongrass-purifying-cleanser')],
        minQty: 1,
      },
      rewards: {
        freeProductId: bySlug('mini-jasmine-hand-cream'),
        freeProductQty: 1,
      },
    },
    // 3. GWP Category — Face
    {
      slug: 'gwp-face-category',
      type: 'gwp' as const,
      name: {
        en: 'Buy 2 Face Products, Get Free Gift',
        th: 'ซื้อผลิตภัณฑ์บำรุงผิวหน้า 2 ชิ้น รับของแถมฟรี',
      },
      description: {
        en: 'Purchase any 2 face-category products and receive a Mini Jasmine Hand Cream as our gift to you.',
        th: 'ซื้อผลิตภัณฑ์หมวดบำรุงผิวหน้า 2 ชิ้น รับครีมมือมะลิ มินิ เป็นของขวัญจากเรา',
      },
      isActive: true,
      conditions: {
        categoryIds: ['face'],
        minQty: 2,
      },
      rewards: {
        freeProductId: bySlug('mini-jasmine-hand-cream'),
        freeProductQty: 1,
      },
    },
    // 4. Bundle — Radiance Ritual
    {
      slug: 'radiance-ritual-bundle',
      type: 'bundle' as const,
      name: {
        en: 'Radiance Ritual Set — Save ฿1,640',
        th: 'เซ็ตผิวเปล่งประกาย — ประหยัด ฿1,640',
      },
      description: {
        en: 'Get the Botanical Radiance Serum, Golden Orchid Night Cream, and Lemongrass Cleanser together for just ฿3,990.',
        th: 'รับเซรั่มผิวเปล่งประกาย ครีมกลางคืนกล้วยไม้ทอง และคลีนเซอร์ตะไคร้ ในราคาเพียง ฿3,990',
      },
      isActive: true,
      conditions: {},
      rewards: {
        bundleProductIds: [
          bySlug('botanical-radiance-serum'),
          bySlug('golden-orchid-night-cream'),
          bySlug('lemongrass-purifying-cleanser'),
        ],
        bundlePrice: 3990,
      },
      stockAllocation: 50,
    },
    // 5. Tier Discount
    {
      slug: 'tier-discount',
      type: 'tier_discount' as const,
      name: {
        en: 'Spend More, Save More',
        th: 'ยิ่งช้อป ยิ่งลด',
      },
      description: {
        en: 'Spend ฿3,000 for 5% off, ฿5,000 for 10% off, or ฿8,000 for 15% off your order.',
        th: 'ช้อปครบ ฿3,000 ลด 5% | ฿5,000 ลด 10% | ฿8,000 ลด 15%',
      },
      isActive: true,
      conditions: {
        tiers: [
          { threshold: 3000, discountPercent: 5 },
          { threshold: 5000, discountPercent: 10 },
          { threshold: 8000, discountPercent: 15 },
        ],
      },
      rewards: {},
    },
    // 6. Cashback
    {
      slug: 'cashback-4000',
      type: 'cashback' as const,
      name: {
        en: '3% Cashback on Orders ฿4,000+',
        th: 'คืนเงิน 3% เมื่อช้อปครบ ฿4,000',
      },
      description: {
        en: 'Earn 3% cashback credit on every order of ฿4,000 or more, redeemable on your next purchase.',
        th: 'รับเครดิตคืนเงิน 3% สำหรับทุกคำสั่งซื้อตั้งแต่ ฿4,000 ขึ้นไป ใช้ได้ในการสั่งซื้อครั้งถัดไป',
      },
      isActive: true,
      conditions: {
        minSpend: 4000,
      },
      rewards: {
        cashbackPercent: 3,
      },
    },
  ];
}

// ─── Coupons ─────────────────────────────────────────────────────────

export const seedCoupons = [
  {
    code: 'WELCOME10',
    type: 'percent' as const,
    value: 10,
    minOrderAmount: 1000,
    maxDiscount: 500,
    conditions: {},
    usageLimit: 9999,
    usageCount: 0,
    isActive: true,
  },
  {
    code: 'FREESHIP',
    type: 'free_shipping' as const,
    value: 0,
    minOrderAmount: 800,
    conditions: {},
    usageLimit: 9999,
    usageCount: 0,
    isActive: true,
  },
  {
    code: 'BEAUTY200',
    type: 'fixed' as const,
    value: 200,
    minOrderAmount: 2000,
    conditions: {},
    usageLimit: 9999,
    usageCount: 0,
    isActive: true,
  },
];

// ─── Mock Addresses ──────────────────────────────────────────────────

export const seedAddresses = [
  {
    sessionId: 'demo-session',
    label: 'บ้าน',
    fullName: 'สมศรี รุ่งเรือง',
    phone: '081-234-5678',
    addressLine1: '123/45 ซอยสุขุมวิท 55',
    district: 'วัฒนา',
    subDistrict: 'คลองตันเหนือ',
    province: 'กรุงเทพมหานคร',
    postalCode: '10110',
    isDefault: true,
  },
  {
    sessionId: 'demo-session',
    label: 'ออฟฟิศ',
    fullName: 'สมศรี รุ่งเรือง',
    phone: '02-345-6789',
    addressLine1: '88 อาคารสาทรสแควร์ ชั้น 25',
    addressLine2: 'ถนนสาทรเหนือ',
    district: 'สาทร',
    subDistrict: 'สีลม',
    province: 'กรุงเทพมหานคร',
    postalCode: '10500',
    isDefault: false,
  },
];
