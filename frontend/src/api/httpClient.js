import { API_URL } from '../config.js';

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

let connectionListeners = [];

export function onConnectionChange(callback) {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter((cb) => cb !== callback);
  };
}

function notifyConnectionChange(isRetrying) {
  connectionListeners.forEach((cb) => cb(isRetrying));
}

async function parseErrorResponse(response) {
  let body = {};
  try {
    body = await response.json();
  } catch (e) {
    // If not JSON, try text
    try {
      const text = await response.text();
      body = { detail: text || 'Error del servidor' };
    } catch (e2) {
      body = { detail: 'Error del servidor' };
    }
  }

  let message = 'Error en la solicitud';
  let fieldErrors = {};

  if (body) {
    if (body.non_field_errors && Array.isArray(body.non_field_errors)) {
      message = body.non_field_errors[0];
    } else if (body.detail) {
      message = body.detail;
    } else if (typeof body === 'object') {
      const firstKey = Object.keys(body)[0];
      if (firstKey) {
        if (Array.isArray(body[firstKey])) {
          message = body[firstKey][0];
        } else if (typeof body[firstKey] === 'string') {
          message = body[firstKey];
        } else {
          message = 'Error de validación';
        }
      }

      // Flatten field errors
      for (const [key, value] of Object.entries(body)) {
        if (key === 'non_field_errors' || key === 'detail') continue;
        if (Array.isArray(value)) {
          fieldErrors[key] = value[0];
        } else if (typeof value === 'string') {
          fieldErrors[key] = value;
        }
      }
    }
  }

  return new ApiError(message, response.status, fieldErrors);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, retries = 3) {
  let attempt = 0;
  let delay = 1000;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        if (attempt > 0) notifyConnectionChange(false);
        
        // Handle 204 No Content
        if (response.status === 204) {
          return null;
        }
        
        return await response.json();
      }

      const isRetriable = [502, 503, 504].includes(response.status);

      if (isRetriable && attempt < retries) {
        attempt++;
        notifyConnectionChange(true);
        await sleep(delay);
        delay *= 2; // Exponential backoff
        continue;
      }

      if (attempt > 0) notifyConnectionChange(false);
      throw await parseErrorResponse(response);
    } catch (error) {
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (attempt < retries) {
          attempt++;
          notifyConnectionChange(true);
          await sleep(delay);
          delay *= 2;
          continue;
        }
      }
      
      if (attempt > 0) notifyConnectionChange(false);
      throw error;
    }
  }
}

function getDefaultHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

export function apiGet(path) {
  return fetchWithRetry(`${API_URL}${path}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
}

export function apiPost(path, data) {
  return fetchWithRetry(`${API_URL}${path}`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
}

export function apiPut(path, data) {
  return fetchWithRetry(`${API_URL}${path}`, {
    method: 'PUT',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
}

export function apiPatch(path, data) {
  return fetchWithRetry(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
}

export function apiDelete(path) {
  return fetchWithRetry(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: getDefaultHeaders(),
  });
}
