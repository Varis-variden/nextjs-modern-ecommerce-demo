/**
 * CLI seed script for the SIRIN e-commerce demo.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Reads MONGODB_URI from .env.local (Node 20+ process.loadEnvFile)
 * or falls back to process.env.MONGODB_URI if already set.
 */

// ── Load environment variables ──────────────────────────────────────
try {
  process.loadEnvFile('.env.local');
} catch {
  // process.loadEnvFile is Node 20.12+; if it fails the env var must
  // already be set (e.g. via shell export or CI secret).
  if (!process.env.MONGODB_URI) {
    console.error(
      'ERROR: MONGODB_URI is not set.\n' +
        'Either create a .env.local file with MONGODB_URI or export it in your shell.'
    );
    process.exit(1);
  }
}

import mongoose from 'mongoose';
import Product from '../models/Product';
import Promotion from '../models/Promotion';
import Coupon from '../models/Coupon';
import Address from '../models/Address';
import Cart from '../models/Cart';
import {
  seedProducts,
  buildPromotions,
  seedCoupons,
  seedAddresses,
} from '../lib/seedData';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not defined.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.');

  // ── Clear existing data ─────────────────────────────────────
  console.log('Clearing existing collections...');
  await Promise.all([
    Product.deleteMany({}),
    Promotion.deleteMany({}),
    Coupon.deleteMany({}),
    Address.deleteMany({}),
    Cart.deleteMany({}),
  ]);

  // ── Insert products ─────────────────────────────────────────
  console.log('Inserting products...');
  const products = await Product.insertMany(seedProducts);
  console.log(`  ${products.length} products inserted.`);

  // ── Insert promotions ───────────────────────────────────────
  console.log('Inserting promotions...');
  const promotionData = buildPromotions(
    products.map((p) => ({ _id: p._id, slug: p.slug }))
  );
  const promotions = await Promotion.insertMany(promotionData);
  console.log(`  ${promotions.length} promotions inserted.`);

  // ── Insert coupons ──────────────────────────────────────────
  console.log('Inserting coupons...');
  const coupons = await Coupon.insertMany(seedCoupons);
  console.log(`  ${coupons.length} coupons inserted.`);

  // ── Insert mock addresses ───────────────────────────────────
  console.log('Inserting addresses...');
  const addresses = await Address.insertMany(seedAddresses);
  console.log(`  ${addresses.length} addresses inserted.`);

  // ── Summary ─────────────────────────────────────────────────
  console.log('\nSeed complete:');
  console.log(`  Products:   ${products.length}`);
  console.log(`  Promotions: ${promotions.length}`);
  console.log(`  Coupons:    ${coupons.length}`);
  console.log(`  Addresses:  ${addresses.length}`);

  await mongoose.disconnect();
  console.log('Disconnected. Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
