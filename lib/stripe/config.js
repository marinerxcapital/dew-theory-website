/**
 * Shared Stripe client + Checkout session options (Payments + Tax).
 * Never log or return secret key values.
 */

const DEFAULT_API_VERSION = '2024-11-20.acacia';

export function isStripeConfigured(env = process.env) {
  return Boolean(env.STRIPE_SECRET_KEY);
}

export function isStripeTaxEnabled(env = process.env) {
  if (!isStripeConfigured(env)) return false;
  const flag = env.STRIPE_TAX_ENABLED;
  if (flag === 'false' || flag === '0') return false;
  // Default on when Stripe is configured — requires Stripe Tax enabled in Dashboard.
  return true;
}

/**
 * Tax + address options merged into Checkout Session create params.
 */
export function getStripeCheckoutExtensions(env = process.env) {
  const extensions = {
    shipping_address_collection: { allowed_countries: ['US', 'CA'] }
  };

  if (isStripeTaxEnabled(env)) {
    extensions.automatic_tax = { enabled: true };
    extensions.customer_update = {
      shipping: 'auto'
    };
  }

  return extensions;
}

/**
 * price_data helper — tax behavior for ad-hoc catalog line items.
 */
export function productPriceData({ name, unitAmountCents, taxCode }) {
  const product_data = { name };
  if (taxCode) {
    product_data.tax_code = taxCode;
  }
  if (isStripeTaxEnabled()) {
    product_data.tax_behavior = 'exclusive';
  }
  return {
    currency: 'usd',
    product_data,
    unit_amount: unitAmountCents
  };
}

/**
 * @returns {import('stripe').default | null}
 */
export async function getStripeClient(env = process.env) {
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  const Stripe = (await import('stripe')).default;
  return new Stripe(secret, {
    apiVersion: env.STRIPE_API_VERSION || DEFAULT_API_VERSION,
    timeout: Number(env.STRIPE_TIMEOUT_MS || 15000),
    httpClient:
      typeof Stripe.createFetchHttpClient === 'function' && typeof fetch === 'function'
        ? Stripe.createFetchHttpClient(fetch)
        : undefined
  });
}

export async function verifyStripeConnection(env = process.env) {
  const stripe = await getStripeClient(env);
  if (!stripe) {
    return { ok: false, code: 'not_configured', mode: null };
  }
  try {
    const balance = await stripe.balance.retrieve();
    const mode = String(env.STRIPE_SECRET_KEY || '').startsWith('sk_live_') ? 'live' : 'test';
    return {
      ok: true,
      code: 'connected',
      mode,
      currency: balance.available?.[0]?.currency || 'usd'
    };
  } catch (e) {
    return {
      ok: false,
      code: 'api_error',
      message: String(e.message || 'Stripe API error').slice(0, 160)
    };
  }
}
