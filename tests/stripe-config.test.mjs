/**
 * Stripe config + tax helpers
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isStripeConfigured,
  isStripeTaxEnabled,
  getStripeCheckoutExtensions,
  productPriceData
} from '../lib/stripe/config.js';

describe('stripe config', () => {
  it('detects configured keys', () => {
    assert.equal(isStripeConfigured({ STRIPE_SECRET_KEY: 'sk_test_x' }), true);
    assert.equal(isStripeConfigured({}), false);
  });

  it('tax enabled by default when stripe configured', () => {
    assert.equal(isStripeTaxEnabled({ STRIPE_SECRET_KEY: 'sk_test_x' }), true);
    assert.equal(
      isStripeTaxEnabled({ STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_TAX_ENABLED: 'false' }),
      false
    );
  });

  it('checkout extensions include US/CA shipping', () => {
    const ext = getStripeCheckoutExtensions({ STRIPE_SECRET_KEY: 'sk_test_x' });
    assert.ok(ext.shipping_address_collection);
    assert.equal(ext.automatic_tax?.enabled, true);
    assert.equal(ext.customer_update, undefined);
  });

  it('productPriceData sets exclusive tax behavior when tax on', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    const pd = productPriceData({ name: 'Serum', unitAmountCents: 3200 });
    assert.equal(pd.tax_behavior, 'exclusive');
    assert.equal(pd.product_data.tax_behavior, undefined);
    delete process.env.STRIPE_SECRET_KEY;
  });
});
