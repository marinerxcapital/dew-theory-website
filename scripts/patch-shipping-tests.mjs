import fs from 'fs';
const p = 'tests/shipping.test.mjs';
let t = fs.readFileSync(p, 'utf8');
const reps = [
  ['assert.equal(FLAT_SHIPPING_USD, 7)', 'assert.equal(FLAT_SHIPPING_USD, 12)'],
  ['charges $7 below', 'charges $12 below'],
  ['assert.equal(calculateShipping(0), 7)', 'assert.equal(calculateShipping(0), 12)'],
  ['assert.equal(calculateShipping(48.99), 7)', 'assert.equal(calculateShipping(48.99), 12)'],
  ['assert.equal(calculateShipping(1), 7)', 'assert.equal(calculateShipping(1), 12)'],
  ["assert.equal(calculateShipping(40, 40, 'pre_discount'), 7)", "assert.equal(calculateShipping(40, 40, 'pre_discount'), 12)"],
  ["assert.equal(calculateShipping(56, 47.6, 'post_discount'), 7)", "assert.equal(calculateShipping(56, 47.6, 'post_discount'), 12)"],
  ["assert.equal(calculateShipping(48, null, 'post_discount'), 7)", "assert.equal(calculateShipping(48, null, 'post_discount'), 12)"],
  ["assert.equal(formatMoney(7), '$7')", "assert.equal(formatMoney(12), '$12')"],
  ['no discount, under threshold → $7 ship', 'no discount, under threshold → $12 ship'],
  ['assert.equal(t.shipping_fee, 7)', 'assert.equal(t.shipping_fee, 12)'],
  ['assert.equal(t.total, 37)', 'assert.equal(t.total, 42)']
];
for (const [a, b] of reps) t = t.split(a).join(b);
fs.writeFileSync(p, t);
console.log('patched');
