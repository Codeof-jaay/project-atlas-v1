import { isVercelAnalyticsLoaded, getVercelMetrics, trackEvent } from '../analytics';

describe('analytics helper (no globals)', () => {
  test('isVercelAnalyticsLoaded returns false when globals absent', () => {
    expect(isVercelAnalyticsLoaded()).toBe(false);
  });

  test('getVercelMetrics returns null when globals absent', () => {
    expect(getVercelMetrics()).toBeNull();
  });

  test('trackEvent returns false when no provider', () => {
    expect(trackEvent('test_event', {})).toBe(false);
  });
});
