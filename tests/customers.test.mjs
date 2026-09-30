import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/*
 * Customer identity tests.
 *
 * The store is pointed at a throwaway file so a test run never touches real
 * runtime data. D1 is unavailable off Workers, so these exercise the file
 * backend — the same code path local dev uses, with identical query shapes.
 */
const dir = mkdtempSync(join(tmpdir(), 'dew-customers-'));
process.env.CUSTOMER_STORE_FILE = join(dir, 'customers.json');
process.env.STORE_BACKEND = 'file';

const {
  hashPassword,
  verifyPassword,
  passwordProblem,
  MIN_PASSWORD_LENGTH,
  PBKDF2_ITERATIONS
} = await import('../lib/customers/passwords.js');
const {
  createCustomer,
  findCustomerByEmail,
  createSessionRecord,
  getSessionRecord,
  deleteSessionRecord,
  deleteSessionsForCustomer,
  addFavorite,
  removeFavorite,
  listFavorites,
  hashToken,
  generateToken
} = await import('../lib/customers/store.js');
const {
  registerCustomer,
  authenticateCustomer,
  createPasswordReset,
  consumePasswordReset,
  GENERIC_AUTH_ERROR
} = await import('../lib/customers/auth.js');
const { normalizeEmail, isPlausibleEmail, CUSTOMER_TABLES, CUSTOMER_MIGRATION_SQL } = await import(
  '../lib/customers/schema.js'
);

after(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('customer password hashing', () => {
  it('round-trips a password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    assert.ok(hash.startsWith('pbkdf2$sha256$'));
    assert.equal(await verifyPassword('correct horse battery staple', hash), true);
  });

  it('rejects the wrong password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    assert.equal(await verifyPassword('Correct horse battery staple', hash), false);
    assert.equal(await verifyPassword('', hash), false);
  });

  it('uses a fresh salt each time', async () => {
    const a = await hashPassword('same-password-value');
    const b = await hashPassword('same-password-value');
    assert.notEqual(a, b);
    assert.equal(await verifyPassword('same-password-value', a), true);
    assert.equal(await verifyPassword('same-password-value', b), true);
  });

  it('fails closed on malformed stored records instead of throwing', async () => {
    for (const bad of ['', 'nope', 'pbkdf2$sha256$notanumber$a$b', 'bcrypt$x$1$a$b', null]) {
      assert.equal(await verifyPassword('whatever', bad), false);
    }
  });

  it('enforces a minimum length server-side', () => {
    assert.ok(passwordProblem('short'));
    assert.equal(passwordProblem('long'.repeat(3)), null);
    assert.ok(MIN_PASSWORD_LENGTH >= 10);
  });

  it('stays within the Cloudflare Workers PBKDF2 cap', () => {
    // Workers rejects PBKDF2 above 100000 iterations outright
    // ("iteration counts above 100000 are not supported"). Exceeding it throws
    // NotSupportedError at runtime and surfaces as a 500 on registration.
    assert.ok(
      PBKDF2_ITERATIONS <= 100000,
      'PBKDF2 iterations must not exceed the Workers cap of 100000'
    );
    assert.ok(PBKDF2_ITERATIONS >= 100000, 'use the strongest value the platform allows');
  });

  it('embeds the iteration count in the hash so it can be raised later', async () => {
    const hash = await hashPassword('a-password-for-format-check');
    assert.equal(hash.split('$')[2], String(PBKDF2_ITERATIONS));
  });
});

describe('customer schema', () => {
  it('declares only additive statements', () => {
    const sql = CUSTOMER_MIGRATION_SQL.toUpperCase();
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS'));
    assert.ok(!sql.includes('DROP '));
    assert.ok(!sql.includes('TRUNCATE'));
    assert.ok(!sql.includes('ALTER TABLE'));
    assert.deepEqual(CUSTOMER_TABLES, ['customers', 'customer_sessions', 'favorites']);
  });

  it('normalises and validates emails', () => {
    assert.equal(normalizeEmail('  Emily@Example.COM '), 'emily@example.com');
    assert.equal(isPlausibleEmail('a@b.co'), true);
    assert.equal(isPlausibleEmail('not-an-email'), false);
    assert.equal(isPlausibleEmail(''), false);
  });
});

describe('customer registration', () => {
  it('creates an account and rejects a duplicate address', async () => {
    const first = await registerCustomer({
      email: 'Isolation@Example.com',
      name: 'Isolation One',
      password: 'first-account-password'
    });
    assert.equal(first.ok, true);

    const duplicate = await registerCustomer({
      email: 'isolation@example.com',
      name: 'Impostor',
      password: 'second-account-password'
    });
    assert.equal(duplicate.ok, false);

    const found = await findCustomerByEmail('ISOLATION@example.com');
    assert.ok(found);
    assert.equal(found.name, 'Isolation One');
  });

  it('rejects a weak password and a bad address', async () => {
    assert.equal(
      (await registerCustomer({ email: 'weak@example.com', password: 'short' })).ok,
      false
    );
    assert.equal(
      (await registerCustomer({ email: 'nope', password: 'a-long-enough-password' })).ok,
      false
    );
  });
});

describe('customer authentication', () => {
  it('accepts the right password and rejects the wrong one', async () => {
    await registerCustomer({
      email: 'auth@example.com',
      name: 'Auth',
      password: 'the-right-password'
    });
    const good = await authenticateCustomer({
      email: 'AUTH@example.com',
      password: 'the-right-password'
    });
    assert.equal(good.ok, true);

    const bad = await authenticateCustomer({ email: 'auth@example.com', password: 'wrong' });
    assert.equal(bad.ok, false);
    assert.equal(bad.error, GENERIC_AUTH_ERROR);
  });

  it('returns the same error for an unknown address (no enumeration)', async () => {
    const unknown = await authenticateCustomer({
      email: 'nobody@example.com',
      password: 'anything'
    });
    assert.equal(unknown.ok, false);
    assert.equal(unknown.error, GENERIC_AUTH_ERROR);
  });
});

describe('sessions', () => {
  it('stores only a hash of the bearer value', async () => {
    const created = await createCustomer({
      email: 'session@example.com',
      passwordHash: await hashPassword('session-test-password')
    });
    assert.equal(created.ok, true);

    const token = generateToken();
    await createSessionRecord({
      tokenHash: hashToken(token),
      customerId: created.customer.id,
      ttlMs: 60000
    });

    const raw = readFileSync(process.env.CUSTOMER_STORE_FILE, 'utf8');
    assert.ok(!raw.includes(token), 'the raw session token must never be persisted');
    assert.ok(raw.includes(hashToken(token)), 'the hashed token should be persisted');

    const record = await getSessionRecord(hashToken(token), 'session');
    assert.ok(record);
    assert.equal(record.customer_id, created.customer.id);
  });

  it('treats an expired session as absent and removes it', async () => {
    const created = await createCustomer({
      email: 'expired@example.com',
      passwordHash: await hashPassword('expired-test-password')
    });
    const token = generateToken();
    await createSessionRecord({
      tokenHash: hashToken(token),
      customerId: created.customer.id,
      ttlMs: -1000
    });
    assert.equal(await getSessionRecord(hashToken(token), 'session'), null);
  });

  it('revokes sessions on demand', async () => {
    const created = await createCustomer({
      email: 'revoke@example.com',
      passwordHash: await hashPassword('revoke-test-password')
    });
    const token = generateToken();
    await createSessionRecord({
      tokenHash: hashToken(token),
      customerId: created.customer.id,
      ttlMs: 60000
    });
    assert.ok(await getSessionRecord(hashToken(token), 'session'));
    await deleteSessionRecord(hashToken(token));
    assert.equal(await getSessionRecord(hashToken(token), 'session'), null);

    const other = generateToken();
    await createSessionRecord({
      tokenHash: hashToken(other),
      customerId: created.customer.id,
      ttlMs: 60000
    });
    await deleteSessionsForCustomer(created.customer.id);
    assert.equal(await getSessionRecord(hashToken(other), 'session'), null);
  });

  it('keeps reset grants in a separate namespace from logins', async () => {
    const created = await createCustomer({
      email: 'kinds@example.com',
      passwordHash: await hashPassword('kinds-test-password')
    });
    const token = generateToken();
    await createSessionRecord({
      tokenHash: hashToken(token),
      customerId: created.customer.id,
      kind: 'reset',
      ttlMs: 60000
    });
    assert.ok(await getSessionRecord(hashToken(token), 'reset'));
    assert.equal(await getSessionRecord(hashToken(token), 'session'), null);
  });
});

describe('favorites cross-account isolation', () => {
  it('never returns one account favorites to another', async () => {
    const a = await createCustomer({
      email: 'fav-a@example.com',
      passwordHash: await hashPassword('fav-a-password-1')
    });
    const b = await createCustomer({
      email: 'fav-b@example.com',
      passwordHash: await hashPassword('fav-b-password-1')
    });
    assert.equal(a.ok, true);
    assert.equal(b.ok, true);

    await addFavorite(a.customer.id, 'hydrating-skin-serum');
    await addFavorite(a.customer.id, 'ageless-moisturizer');
    await addFavorite(b.customer.id, 'green-tea-citrus-cleanser');

    const aList = await listFavorites(a.customer.id);
    const bList = await listFavorites(b.customer.id);

    assert.deepEqual(aList.map((r) => r.product_id).sort(), [
      'ageless-moisturizer',
      'hydrating-skin-serum'
    ]);
    assert.deepEqual(bList.map((r) => r.product_id), ['green-tea-citrus-cleanser']);
    assert.ok(!aList.some((r) => r.product_id === 'green-tea-citrus-cleanser'));
  });

  it('is idempotent when saving the same product twice', async () => {
    const c = await createCustomer({
      email: 'fav-dup@example.com',
      passwordHash: await hashPassword('fav-dup-password')
    });
    await addFavorite(c.customer.id, 'ageless-moisturizer');
    await addFavorite(c.customer.id, 'ageless-moisturizer');
    assert.equal((await listFavorites(c.customer.id)).length, 1);
    await removeFavorite(c.customer.id, 'ageless-moisturizer');
    assert.equal((await listFavorites(c.customer.id)).length, 0);
  });

  it('returns an empty list for an unknown customer id', async () => {
    assert.deepEqual(await listFavorites('cus_does_not_exist'), []);
    assert.deepEqual(await listFavorites(null), []);
  });
});

describe('password reset', () => {
  it('issues a token only for a real account, and always reports success', async () => {
    await registerCustomer({
      email: 'reset@example.com',
      name: 'Reset',
      password: 'the-old-password-1'
    });

    const real = await createPasswordReset('reset@example.com');
    assert.equal(real.ok, true);
    assert.ok(real.token);

    const missing = await createPasswordReset('ghost@example.com');
    assert.equal(missing.ok, true);
    assert.equal(missing.token, null);
  });

  it('changes the password and revokes every prior session', async () => {
    const account = await registerCustomer({
      email: 'reset2@example.com',
      name: 'Reset Two',
      password: 'the-old-password-2'
    });
    assert.equal(account.ok, true);

    const loginToken = generateToken();
    await createSessionRecord({
      tokenHash: hashToken(loginToken),
      customerId: account.customer.id,
      ttlMs: 60000
    });

    const { token } = await createPasswordReset('reset2@example.com');
    const result = await consumePasswordReset(token, 'a-brand-new-password');
    assert.equal(result.ok, true);

    assert.equal(await getSessionRecord(hashToken(loginToken), 'session'), null);
    assert.equal(
      (
        await authenticateCustomer({
          email: 'reset2@example.com',
          password: 'a-brand-new-password'
        })
      ).ok,
      true
    );
    assert.equal(
      (await authenticateCustomer({ email: 'reset2@example.com', password: 'the-old-password-2' }))
        .ok,
      false
    );
  });

  it('rejects a reused or unknown reset token', async () => {
    const account = await registerCustomer({
      email: 'reset3@example.com',
      name: 'Reset Three',
      password: 'the-old-password-3'
    });
    assert.equal(account.ok, true);
    const { token } = await createPasswordReset('reset3@example.com');

    assert.equal((await consumePasswordReset(token, 'a-good-new-password')).ok, true);
    assert.equal((await consumePasswordReset(token, 'another-good-password')).ok, false);
    assert.equal((await consumePasswordReset('made-up-token', 'another-good-password')).ok, false);
  });
});

describe('protected route sources', () => {
  it('never takes a customer identifier from the URL', () => {
    const files = [
      'app/account/page.jsx',
      'app/favorites/page.jsx',
      'app/api/customer/favorites/route.js'
    ];
    for (const rel of files) {
      const src = readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
      assert.ok(
        !/searchParams\.get\(\s*['"](customer|userId|user_id|id)['"]/.test(src),
        `${rel} must not read an identity from the URL`
      );
      assert.ok(/requireCustomer/.test(src), `${rel} must use the server-side customer guard`);
    }
  });

  it('has a page for every shipped account route', () => {
    const expected = [
      'app/account/page.jsx',
      'app/account/login/page.jsx',
      'app/account/reset/page.jsx',
      'app/favorites/page.jsx',
      'app/api/customer/login/route.js',
      'app/api/customer/logout/route.js',
      'app/api/customer/register/route.js',
      'app/api/customer/recover/route.js',
      'app/api/customer/reset/route.js',
      'app/api/customer/favorites/route.js'
    ];
    for (const rel of expected) {
      assert.ok(existsSync(new URL(`../${rel}`, import.meta.url)), `missing ${rel}`);
    }
  });
});
