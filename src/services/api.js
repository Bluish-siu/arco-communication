const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Custom fetch client with JWT authorization header and error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('arco_auth_token') || localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (!path.startsWith('/login') && !path.startsWith('/signup')) {
          localStorage.removeItem('arco_auth_token');
          localStorage.removeItem('token');
          const isWorkspaceRoute = ['/dashboard', '/campaigns', '/inbox', '/contacts', '/templates', '/automation', '/sales', '/commerce', '/notification', '/analytics', '/segments', '/flows', '/chat-assignment'].some((prefix) => path.startsWith(prefix));
          if (isWorkspaceRoute) {
            window.location.href = `/login?redirect=${encodeURIComponent(path + window.location.search)}`;
          }
        }
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`[API Call to ${endpoint} failed, continuing with client state]`, error.message);
    throw error;
  }
}
