#!/usr/bin/env node
/**
 * Bootstrap Stripe for Dew Theory (test or live keys via env).
 *
 * - Verifies API connection
 * - Ensures Virtual Consultation product + price exist
 * - Optionally registers production webhook endpoint
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-bootstrap.mjs
 *   node scripts/stripe-bootstrap.mjs --webhook-url https://dewtheoryco.com/api/webhooks/stripe
 *
 * Writes STRIPE_VIRTUAL_CONSULTATION_PRICE_ID (and webhook secret if created)
 * to .env.local — never commit secrets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStripeClient, verifyStripeConnection } from '../lib/stripe/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_LOCAL = path.join(ROOT, '.env.local');

const VC_PRODUCT_NAME = 'Virtual Skincare Consultation';
const VC_DEFAULT_CENTS = Number(process.env.CONSULTATION_DISPLAY_PRICE_CENTS || 9500);

function parseArgs(argv) {
  const out = { webhookUrl: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--webhook-url' && argv[i + 1]) {
      out.webhookUrl = argv[++i];
    } else if (argv[i] === '--dry-run') {
      out.dryRun = true;
    }
  }
  if (!out.webhookUrl) {
    out.webhookUrl =
      process.env.STRIPE_WEBHOOK_URL ||
      (process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/api/webhooks/stripe`
        : null);
  }
  return out;
}

const args = parseArgs(process.argv);

function upsertEnvLocal(updates) {
  let content = fs.existsSync(ENV_LOCAL) ? fs.readFileSync(ENV_LOCAL, 'utf8') : '';
  for (const [key, value] of Object.entries(updates)) {
    if (value == null || value === '') continue;
    const re = new RegExp(`^${key}=.*$`, 'm');
    const line = `${key}=${value}`;
    if (re.test(content)) {
      content = content.replace(re, line);
    } else {
      content += (content.endsWith('\n') || content === '' ? '' : '\n') + line + '\n';
    }
  }
  if (!args.dryRun) {
    fs.writeFileSync(ENV_LOCAL, content);
  }
  return content;
}

async function findOrCreateConsultationPrice(stripe) {
  const existingId = process.env.STRIPE_VIRTUAL_CONSULTATION_PRICE_ID;
  if (existingId) {
    try {
      const price = await stripe.prices.retrieve(existingId);
      if (price.active) {
        return { priceId: price.id, productId: price.product, created: false };
      }
    } catch {
      /* fall through to create */
    }
  }

  const products = await stripe.products.list({ limit: 100, active: true });
  let product = products.data.find((p) => p.name === VC_PRODUCT_NAME);
  if (!product) {
    product = await stripe.products.create({
      name: VC_PRODUCT_NAME,
      description:
        'Virtual skincare consultation with Dew Theory — personalized product guidance.',
      metadata: { app: 'dew-theory', service_type: 'virtual_consultation' }
    });
    console.log('[stripe-bootstrap] Created product:', product.id);
  } else {
    console.log('[stripe-bootstrap] Using existing product:', product.id);
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
  let price = prices.data.find((p) => p.unit_amount === VC_DEFAULT_CENTS && p.currency === 'usd');
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: VC_DEFAULT_CENTS,
      currency: 'usd',
      metadata: { app: 'dew-theory', service_type: 'virtual_consultation' }
    });
    console.log('[stripe-bootstrap] Created price:', price.id, `($${VC_DEFAULT_CENTS / 100})`);
  } else {
    console.log('[stripe-bootstrap] Using existing price:', price.id);
  }

  return { priceId: price.id, productId: product.id, created: true };
}

async function ensureWebhook(stripe, webhookUrl) {
  if (!webhookUrl) {
    console.log('[stripe-bootstrap] No webhook URL — skip (use --webhook-url or STRIPE_WEBHOOK_URL)');
    return null;
  }

  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  const match = existing.data.find((w) => w.url === webhookUrl && w.status !== 'disabled');
  if (match) {
    console.log('[stripe-bootstrap] Webhook endpoint already exists:', match.id);
    console.log('[stripe-bootstrap] Copy signing secret from Stripe Dashboard → Developers → Webhooks');
    return { id: match.id, secret: null, existing: true };
  }

  const endpoint = await stripe.webhookEndpoints.create({
    url: webhookUrl,
    enabled_events: [
      'checkout.session.completed',
      'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed'
    ],
    description: 'Dew Theory commerce + virtual consultation'
  });

  console.log('[stripe-bootstrap] Created webhook endpoint:', endpoint.id);
  return { id: endpoint.id, secret: endpoint.secret, existing: false };
}

async function main() {
  const conn = await verifyStripeConnection();
  if (!conn.ok) {
    console.error('[stripe-bootstrap] Stripe not connected:', conn.code, conn.message || '');
    process.exit(1);
  }
  console.log('[stripe-bootstrap] Connected — mode:', conn.mode);

  const stripe = await getStripeClient();
  const { priceId } = await findOrCreateConsultationPrice(stripe);

  const envUpdates = {
    STRIPE_VIRTUAL_CONSULTATION_PRICE_ID: priceId
  };

  if (args.webhookUrl) {
    const wh = await ensureWebhook(stripe, args.webhookUrl);
    if (wh?.secret) {
      envUpdates.STRIPE_WEBHOOK_SECRET = wh.secret;
      console.log('[stripe-bootstrap] Webhook secret written to .env.local (shown once in Stripe)');
    }
  }

  upsertEnvLocal(envUpdates);

  console.log('\n[stripe-bootstrap] Done.');
  console.log('  STRIPE_VIRTUAL_CONSULTATION_PRICE_ID =', priceId);
  console.log('\nProduction (Worker secrets — run locally with wrangler auth):');
  console.log('  npx wrangler secret put STRIPE_SECRET_KEY');
  console.log('  npx wrangler secret put NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  console.log('  npx wrangler secret put STRIPE_WEBHOOK_SECRET');
  console.log('  npx wrangler secret put STRIPE_VIRTUAL_CONSULTATION_PRICE_ID');
  console.log('\nEnable Stripe Tax: Dashboard → Settings → Tax → enable, then set STRIPE_TAX_ENABLED=true');
}

main().catch((e) => {
  console.error('[stripe-bootstrap] Fatal:', e.message || e);
  process.exit(1);
});
