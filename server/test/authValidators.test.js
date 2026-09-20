import test from 'node:test';
import assert from 'node:assert/strict';
import { nepalPhoneSchema, strongPasswordSchema } from '../src/validators/authValidators.js';

test('Nepal phone validation normalizes a local mobile number', () => {
  assert.equal(nepalPhoneSchema.parse('9801234567'), '+9779801234567');
});

test('Nepal phone validation rejects non-mobile numbers', () => {
  assert.equal(nepalPhoneSchema.safeParse('12345').success, false);
});

test('strong password requires mixed character classes', () => {
  assert.equal(strongPasswordSchema.safeParse('Strong!123').success, true);
  assert.equal(strongPasswordSchema.safeParse('password').success, false);
});

