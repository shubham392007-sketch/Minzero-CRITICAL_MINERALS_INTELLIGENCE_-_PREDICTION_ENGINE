const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function fetchJSON(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      const detailMsg = typeof err.detail === 'object' ? JSON.stringify(err.detail) : err.detail;
      throw new Error(detailMsg || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  getHealth: () => fetchJSON('/health'),
  getMinerals: () => fetchJSON('/minerals'),
  getCountries: () => fetchJSON('/countries'),
  getYears: () => fetchJSON('/years'),
  getOverview: () => fetchJSON('/analytics/overview'),
  getConcentration: () => fetchJSON('/analytics/concentration'),
  getExportControls: () => fetchJSON('/analytics/export-controls'),
  getPrices: () => fetchJSON('/analytics/prices'),
  getMineralProfile: (mineral) => fetchJSON(`/mineral/${encodeURIComponent(mineral)}`),
  getCountryProfile: (country) => fetchJSON(`/country/${encodeURIComponent(country)}`),
  getModelMetrics: () => fetchJSON('/model/metrics'),
  getModelFeatures: () => fetchJSON('/model/features'),

  predictDisruption: (payload) => fetchJSON('/predict/disruption', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  predictRisk: (payload) => fetchJSON('/predict/risk', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  predictPrice: (payload) => fetchJSON('/predict/price', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  detectShock: (payload) => fetchJSON('/detect/shock', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};
