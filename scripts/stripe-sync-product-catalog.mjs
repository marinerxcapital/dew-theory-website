#!/usr/bin/env node
/**
 * Idempotent Stripe Product/Price sync for Dew Theory Skin Script catalog.
 * Modes: --dry-run --mode=test|live
 * Never writes wholesale into customer-visible metadata.
 * NO GitHub.
 */
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products.json'), 'utf8'));

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const mode = [...args].find((a) => a.startsWith('--mode='))?.split('=')[1] || 'test';
if (!['test', 'live'].includes(mode)) {
  console.error('Use --mode=test or --mode=live');
  process.exit(2);
}

const key =
  mode === 'live'
    ? process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;

if (!key) {
  console.error(`Missing Stripe secret for mode=${mode}`);
  process.exit(3);
}
if (mode === 'live' && !key.startsWith('sk_live_') && !dryRun) {
  console.error('Refusing live sync without sk_live_ key (unless --dry-run)');
  process.exit(4);
}
if (mode === 'test' && key.startsWith('sk_live_')) {
  console.error('Refusing test sync with live key');
  process.exit(5);
}

const stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
const outDir = path.join(ROOT, '.artifacts/final-catalog');
fs.mkdirSync(outDir, { recursive: true });

function hash(obj) {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

const products = (catalog.products || []).filter(
  (p) => p.active !== false && p.publish_status !== 'BLOCKED_MISSING_OFFICIAL_SRP'
);

const report = { mode, dryRun, synced: [], skipped: [], errors: [] };

async function findManagedProduct(dewId) {
  const list = await stripe.products.search({
    query: `metadata['dew_product_id']:'${dewId}'`,
    limit: 5
  });
  return list.data[0] || null;
}

async function syncOne(p) {
  const amountCents = Math.round(Number(p.retail_price) * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    report.skipped.push({ id: p.id, reason: 'invalid_retail' });
    return;
  }
  const meta = {
    dew_product_id: p.id,
    skin_script_sku: String(p.skin_script_sku || ''),
    managed_by: 'dew-theory-stripe-sync',
    pricing_policy: 'official_srp_august_2026'
  };
  let product = await findManagedProduct(p.id);
  if (!product) {
    if (dryRun) {
      report.synced.push({ id: p.id, action: 'would_create_product_price', amountCents });
      return;
    }
    product = await stripe.products.create({
      name: `Skin Script ${p.name}`,
      description: (p.description_short || '').slice(0, 400) || undefined,
      active: true,
      metadata: meta
    });
  } else if (!dryRun) {
    product = await stripe.products.update(product.id, {
      name: `Skin Script ${p.name}`,
      description: (p.description_short || '').slice(0, 400) || undefined,
      active: true,
      metadata: { ...product.metadata, ...meta }
    });
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
  let price = prices.data.find(
    (pr) => pr.unit_amount === amountCents && pr.currency === 'usd' && pr.type === 'one_time'
  );
  if (!price) {
    if (dryRun) {
      report.synced.push({ id: p.id, action: 'would_create_price', amountCents, product: product.id });
      return;
    }
    // retire old active one-time prices from new checkout by deactivating
    for (const old of prices.data.filter((pr) => pr.type === 'one_time')) {
      if (old.unit_amount !== amountCents) {
        await stripe.prices.update(old.id, { active: false });
      }
    }
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: amountCents,
      currency: 'usd',
      metadata: meta
    });
  }

  report.synced.push({
    id: p.id,
    stripe_product_id: product.id,
    stripe_price_id: price.id,
    unit_amount_cents: amountCents,
    sku: p.skin_script_sku,
    catalog_hash: hash({ id: p.id, amountCents, sku: p.skin_script_sku })
  });
}

for (const p of products) {
  try {
    await syncOne(p);
  } catch (e) {
    report.errors.push({ id: p.id, error: e.message || String(e) });
  }
}

const outPath = path.join(outDir, `stripe-sync-${mode}${dryRun ? '-dryrun' : ''}.json`);
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ mode, dryRun, synced: report.synced.length, errors: report.errors.length, outPath }, null, 2));
if (report.errors.length) process.exit(10);
