/**
 * API Configuration
 * 
 * Change this URL to switch between development and production environments
 */

// Production URL
export const API_BASE_URL = 'https://tripmanagerapi.dipoletechi.com';

// Development URL (for local testing)
// export const API_BASE_URL = 'http://192.168.1.3:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Mobile endpoints
  MOBILE: `${API_BASE_URL}/api/mobile`,
  MOBILE_QR: `${API_BASE_URL}/api/mobile-qr`,
  
  // Other endpoints
  TRIP_PLIGRIM: `${API_BASE_URL}/api/trip-pligrim`,
};

