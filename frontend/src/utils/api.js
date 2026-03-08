/**
 * API client — fetches data from the Express backend.
 * In development, Vite proxies /api to localhost:4000.
 * In production, set VITE_API_URL to the deployed backend URL.
 */

const BASE = import.meta.env.VITE_API_URL || '';

async function fetchJSON(endpoint) {
  const res = await fetch(`${BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  getKPIs: () => fetchJSON('/api/kpis'),
  getSalesTrends: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJSON(`/api/sales/trends${qs ? '?' + qs : ''}`);
  },
  getQuarterlySales: () => fetchJSON('/api/sales/quarterly'),
  getCustomerSegments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJSON(`/api/customers/segments${qs ? '?' + qs : ''}`);
  },
  getSegmentSummary: () => fetchJSON('/api/customers/segment-summary'),
  getChurnDistribution: () => fetchJSON('/api/customers/churn-distribution'),
  getRegions: () => fetchJSON('/api/regions'),
  getStates: () => fetchJSON('/api/regions/states'),
  getCategories: () => fetchJSON('/api/categories'),
  getForecast: () => fetchJSON('/api/forecast'),
  getFilters: () => fetchJSON('/api/filters'),
  getOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJSON(`/api/orders${qs ? '?' + qs : ''}`);
  },
  getHealth: () => fetchJSON('/api/health'),
};
