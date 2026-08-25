export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');

/**
 * Returns the full API URL for a given relative endpoint path.
 * Normalizes leading slashes and prevents duplicate /api prefixes.
 */
export function getApiUrl(path = '') {
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Prevent duplicate /api prefix if caller passes '/api/something'
  if (cleanPath.startsWith('/api/') || cleanPath === '/api') {
    cleanPath = cleanPath.slice(4);
  }
  const base = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');
  return `${base}${cleanPath}`;
}

/**
 * Robustly extracts human-readable error messages from backend responses,
 * including DRF validation error dictionaries, detail strings, or HTTP status codes.
 */
export function extractErrorMessage(data, status, defaultMsg = 'Unable to submit the form.') {
  if (!data) {
    if (status) return `Server error (HTTP ${status}). Please try again.`;
    return defaultMsg;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.message && typeof data.message === 'string') {
    return data.message;
  }

  if (data.detail && typeof data.detail === 'string') {
    return data.detail;
  }

  if (data.error && typeof data.error === 'string') {
    return data.error;
  }

  if (data.errors) {
    if (typeof data.errors === 'string') return data.errors;
    if (Array.isArray(data.errors)) return data.errors.join(', ');
    if (typeof data.errors === 'object') {
      const messages = [];
      for (const [key, val] of Object.entries(data.errors)) {
        const fieldName = key === 'non_field_errors' ? '' : `${key}: `;
        if (Array.isArray(val)) {
          messages.push(`${fieldName}${val.join(', ')}`);
        } else if (typeof val === 'string') {
          messages.push(`${fieldName}${val}`);
        } else if (val && typeof val === 'object') {
          messages.push(`${fieldName}${JSON.stringify(val)}`);
        }
      }
      if (messages.length > 0) return messages.join(' | ');
    }
  }

  if (typeof data === 'object') {
    const messages = [];
    for (const [key, val] of Object.entries(data)) {
      if (key === 'success' || key === 'status') continue;
      const fieldName = key === 'non_field_errors' ? '' : `${key}: `;
      if (Array.isArray(val)) {
        messages.push(`${fieldName}${val.join(', ')}`);
      } else if (typeof val === 'string') {
        messages.push(`${fieldName}${val}`);
      }
    }
    if (messages.length > 0) return messages.join(' | ');
  }

  return defaultMsg;
}

/**
 * Formats a user-friendly error message, properly distinguishing
 * genuine network/fetch connectivity failures from API response errors.
 */
export function getFriendlyErrorMessage(err, fallback = 'Network error. Please try again.') {
  if (!err) return fallback;
  if (
    err.name === 'TypeError' ||
    err.message === 'Failed to fetch' ||
    err.message?.includes('NetworkError') ||
    err.message?.includes('fetch') ||
    err.message?.includes('Load failed')
  ) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  return err.message || fallback;
}
