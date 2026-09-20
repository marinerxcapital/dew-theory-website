import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  collectGuestCheckoutIssues,
  fieldErrorsFromCheckoutResponse,
  fieldErrorsFromIssues,
  validateCustomer,
  validateShippingAddress
} from '../lib/checkout.js';

describe('guest checkout validation', () => {
  it('lists every missing required field with a human label', () => {
    const issues = collectGuestCheckoutIssues({});
    const fields = issues.map((i) => i.field);
    const labels = issues.map((i) => i.label);
    assert.deepEqual(fields, ['name', 'email', 'line1', 'city', 'state', 'postal_code']);
    assert.deepEqual(labels, [
      'Full name',
      'Email',
      'Address',
      'City',
      'State',
      'Postal code'
    ]);
    assert.ok(!fields.includes('phone'), 'phone stays optional');
  });

  it('rejects invalid email even when other fields are present', () => {
    const issues = collectGuestCheckoutIssues({
      name: 'Ada',
      email: 'not-an-email',
      line1: '1 Dew St',
      city: 'Austin',
      state: 'TX',
      postal_code: '78701'
    });
    assert.equal(issues.length, 1);
    assert.equal(issues[0].field, 'email');
    assert.match(issues[0].error, /valid email/i);
  });

  it('accepts a complete guest payload without requiring phone', () => {
    const issues = collectGuestCheckoutIssues({
      name: 'Ada',
      email: 'ada@example.com',
      line1: '1 Dew St',
      city: 'Austin',
      state: 'TX',
      postal_code: '78701'
    });
    assert.deepEqual(issues, []);
    assert.deepEqual(fieldErrorsFromIssues(issues), {});
  });

  it('maps API shipping_incomplete details onto guest keys', () => {
    const ship = validateShippingAddress({ city: 'Austin' });
    assert.equal(ship.ok, false);
    assert.equal(ship.code, 'shipping_incomplete');
    assert.match(ship.error, /Missing: Address, State, Postal code/);
    const mapped = fieldErrorsFromCheckoutResponse(ship);
    assert.equal(mapped.line1, 'Address is required');
    assert.equal(mapped.state, 'State is required');
    assert.equal(mapped.postal_code, 'Postal code is required');
    assert.equal(mapped.city, undefined);
  });

  it('validateCustomer requires name and a valid email', () => {
    assert.equal(validateCustomer({}).ok, false);
    assert.equal(validateCustomer({ name: 'Ada' }).code, 'customer_email_invalid');
    const ok = validateCustomer({ name: 'Ada', email: 'ada@example.com' });
    assert.equal(ok.ok, true);
    assert.equal(ok.customer.phone, '');
  });
});
