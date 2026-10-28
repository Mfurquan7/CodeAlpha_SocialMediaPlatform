const API_BASE = '/api';

/**
 * Helper to get stored auth token
 */
export function getToken() {
  return localStorage.getItem('vibely_token');
}

/**
 * Helper to set stored auth token
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem('vibely_token', token);
  } else {
    localStorage.removeItem('vibely_token');
  }
}

/**
 * Core fetch wrapper with JSON handling and token injection
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    throw new Error('Unable to connect to the server. Please check your network connection.');
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg = data && data.error ? data.error : `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Auth API
export const authApi = {
  login: (identifier, password) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  me: () => request('/auth/me')
};

// Posts API
export const postsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/posts${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/posts/${id}`),

  create: (content) =>
    request('/posts', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  delete: (id) =>
    request(`/posts/${id}`, {
      method: 'DELETE'
    })
};

// Likes API
export const likesApi = {
  like: (postId) =>
    request(`/posts/${postId}/like`, {
      method: 'POST'
    }),

  unlike: (postId) =>
    request(`/posts/${postId}/like`, {
      method: 'DELETE'
    })
};

// Comments API
export const commentsApi = {
  getByPost: (postId) => request(`/posts/${postId}/comments`),

  add: (postId, content) =>
    request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  delete: (commentId) =>
    request(`/comments/${commentId}`, {
      method: 'DELETE'
    })
};

// Users API
export const usersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  },

  getProfile: (idOrUsername) => request(`/users/${idOrUsername}`),

  updateProfile: (data) =>
    request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getUserPosts: (userId) => request(`/users/${userId}/posts`),

  follow: (userId) =>
    request(`/users/${userId}/follow`, {
      method: 'POST'
    }),

  unfollow: (userId) =>
    request(`/users/${userId}/follow`, {
      method: 'DELETE'
    })
};
