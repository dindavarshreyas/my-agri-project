import { supabase } from './supabaseClient';

const rawUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

/**
 * Helper to get the current Supabase session JWT
 */
async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('User is not authenticated. Please log in.');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Fetch all registered farms for authenticated user
 */
export async function getFarms() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/farms`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch farms');
  return data.farms || [];
}

/**
 * Fetch a specific farm by ID
 */
export async function getFarmById(id) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/farms/${id}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch farm details');
  return data.farm;
}

/**
 * Register a new farm plot
 */
export async function createFarm(farmData) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/farms`, {
    method: 'POST',
    headers,
    body: JSON.stringify(farmData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create farm');
  return data.farm;
}

/**
 * Trigger Gemini AI advisory generation
 */
export async function generateAdvisory(payload) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/advisory/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'AI Advisory generation failed');
  return data.advisory;
}

/**
 * Fetch all advisory history for authenticated user
 */
export async function getAdvisories() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/advisory`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch advisories');
  return data.advisories || [];
}

/**
 * Fetch specific advisory report by ID
 */
export async function getAdvisoryById(id) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/advisory/${id}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch advisory report');
  return data.advisory;
}
