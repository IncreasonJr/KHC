// /home/caleb/Desktop/PROJECTS/KHC/src/services/api.js

/**
 * Resolves the backend API base URL from environment variables.
 * Handles both 'https://khc-jke2.onrender.com' and 'https://khc-jke2.onrender.com/api' formats,
 * as well as local development fallback to 'http://localhost:5000/api'.
 */
const rawEnvUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, '') : '';

let API_ROOT = '';
if (rawEnvUrl) {
  // If user configured VITE_API_URL with a trailing /api, strip it so root is origin
  API_ROOT = rawEnvUrl.endsWith('/api') ? rawEnvUrl.slice(0, -4) : rawEnvUrl;
} else if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  API_ROOT = 'http://localhost:5000';
} else {
  API_ROOT = ''; // Relative path fallback for production single-origin deployments
}

export const API_BASE_URL = `${API_ROOT}/api`;

console.log('[KHC API Client Initialized]: Environment VITE_API_URL =', import.meta.env.VITE_API_URL || '(not set)');
console.log('[KHC API Client Initialized]: Effective Backend API Base URL =', API_BASE_URL);

/**
 * Constructs a clean, absolute API URL ensuring no duplicate '/api/api' segments
 * @param {string} endpoint - e.g. '/members', 'members', or '/api/members'
 * @returns {string} Fully qualified URL e.g. 'https://khc-jke2.onrender.com/api/members'
 */
export const getApiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4); // Remove redundant leading /api
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Centralized fetch wrapper providing URL formatting, headers, and error handling
 * @param {string} endpoint - API path or endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch Response promise
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  console.log(`[API Request] ${options.method || 'GET'} -> ${url}`);
  
  const defaultHeaders = {
    'Accept': 'application/json'
  };

  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, mergedOptions);
    if (!response.ok) {
      console.warn(`[API Response Warning] ${options.method || 'GET'} ${url} returned status ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(`[API Network Error] ${options.method || 'GET'} ${url} failed:`, error.message);
    throw error;
  }
};

export default apiFetch;
