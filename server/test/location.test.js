import test from 'node:test';
import assert from 'node:assert/strict';
import { haversineDistanceKm } from '../src/utils/location.js';

test('haversineDistanceKm returns zero for identical coordinates', () => {
  assert.equal(haversineDistanceKm({ latitude: 28.05, longitude: 81.62 }, { latitude: 28.05, longitude: 81.62 }), 0);
});

test('haversineDistanceKm calculates a plausible Nepalgunj city distance', () => {
  const distance = haversineDistanceKm(
    { latitude: 28.0507, longitude: 81.6167 },
    { latitude: 28.0615, longitude: 81.6296 },
  );
  assert.ok(distance > 1 && distance < 3);
});

