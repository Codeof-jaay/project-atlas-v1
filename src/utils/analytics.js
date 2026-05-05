// Lightweight analytics helper for admin dashboard
// - fetchAdminAnalytics: fetches server-side analytics from the backend
// - isVercelAnalyticsLoaded / getVercelMetrics: safe wrappers around the optional Vercel client
// - trackEvent: best-effort emitter for custom events (no-op when unavailable)

export async function fetchAdminAnalytics(apiBaseUrl, token) {
  const res = await fetch(`${apiBaseUrl}/admin/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to load analytics: ${res.status} ${text}`);
  }

  return await res.json();
}

export function isVercelAnalyticsLoaded() {
  try {
    // The Vercel insights script sets globals in different shapes depending on integration.
    return !!(
      (typeof window !== 'undefined' && window.__vercel_insights) ||
      (typeof window !== 'undefined' && window.__VERCEL_INSIGHTS) ||
      (typeof window !== 'undefined' && window.__vercel_analytics)
    );
  } catch (e) {
    return false;
  }
}

export function getVercelMetrics() {
  try {
    if (typeof window === 'undefined') return null;

    // Try a few known globals; integrations vary so be permissive and safe.
    if (window.__vercel_insights && typeof window.__vercel_insights.getMetrics === 'function') {
      return window.__vercel_insights.getMetrics();
    }
    if (window.__vercel_insights && window.__vercel_insights.metrics) {
      return window.__vercel_insights.metrics;
    }
    if (window.__VERCEL_INSIGHTS && window.__VERCEL_INSIGHTS.metrics) {
      return window.__VERCEL_INSIGHTS.metrics;
    }
    // Some setups expose a flat analytics object
    if (window.__vercel_analytics && window.__vercel_analytics.metrics) {
      return window.__vercel_analytics.metrics;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export function trackEvent(name, payload = {}) {
  try {
    if (typeof window === 'undefined') return false;

    if (window.__vercel_analytics && typeof window.__vercel_analytics.track === 'function') {
      window.__vercel_analytics.track(name, payload);
      return true;
    }

    if (window.__vercel_insights && typeof window.__vercel_insights.track === 'function') {
      window.__vercel_insights.track(name, payload);
      return true;
    }
  } catch (e) {
    // swallow
  }

  return false;
}
