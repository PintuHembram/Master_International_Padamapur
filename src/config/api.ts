/**
 * API Configuration
 * Uses VITE_API_URL environment variable, defaults to '/api' for local development
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const API_URL = API_BASE;

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  // Admin authentication
  adminLogin: `${API_BASE}/admin/login`,
  
  // Public admissions
  submitApplication: `${API_BASE}/applications`,
  
  // Protected admin endpoints
  adminApplications: `${API_BASE}/admin/applications`,
  adminApplicationsExport: `${API_BASE}/admin/applications/export`,
  adminApplicationsDelete: (id?: number) => 
    id ? `${API_BASE}/admin/applications/${id}` : `${API_BASE}/admin/applications`,
};

export default API_ENDPOINTS;
