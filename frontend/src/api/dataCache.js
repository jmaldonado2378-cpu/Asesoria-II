// Client-side Data Cache (Stale-While-Revalidate) & Navigation Optimizations
import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';

const CACHE_PREFIX = 'asesoria_cache_';
const memoryCache = new Map();

function getCacheKey(path) {
  return `${CACHE_PREFIX}${path}`;
}

export function getCachedData(path) {
  if (memoryCache.has(path)) {
    return memoryCache.get(path);
  }
  try {
    const raw = sessionStorage.getItem(getCacheKey(path));
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryCache.set(path, parsed);
      return parsed;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return null;
}

export function setCachedData(path, data) {
  memoryCache.set(path, data);
  try {
    sessionStorage.setItem(getCacheKey(path), JSON.stringify(data));
  } catch (e) {
    // Storage full or restricted
  }
}

export function clearCache(pattern = null) {
  if (!pattern) {
    memoryCache.clear();
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(key);
      });
    } catch (e) {}
    return;
  }
  
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) memoryCache.delete(key);
  }
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX) && key.includes(pattern)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {}
}

/**
 * Custom React hook for Stale-While-Revalidate data fetching.
 * Instantly returns cached data on mount (0ms delay), then updates from network in background.
 */
export function useDataCache(path, fetcherFn) {
  const cached = getCachedData(path);
  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  const revalidate = useCallback(async () => {
    try {
      const freshData = await fetcherFn();
      if (freshData !== undefined && freshData !== null) {
        setData(freshData);
        setCachedData(path, freshData);
      }
      setError(null);
    } catch (err) {
      console.error(`Cache revalidation error for ${path}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [path, fetcherFn]);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  return { data, loading, error, revalidate, setData };
}

/**
 * Preloads route components on mouse enter for 0ms JS bundle loading delay.
 */
const routeImports = {
  '/': () => import('../pages/Home'),
  '/projects': () => import('../pages/Projects'),
  '/essays': () => import('../pages/Essays'),
  '/clients': () => import('../pages/Clients'),
  '/visits': () => import('../pages/VisitList'),
  '/ingredients': () => import('../pages/IngredientList'),
  '/finanzas': () => import('../pages/Finance'),
  '/settings': () => import('../pages/Settings'),
};

const preloadedRoutes = new Set();

export function preloadRoute(path) {
  const baseRoute = '/' + (path.split('/')[1] || '');
  if (routeImports[baseRoute] && !preloadedRoutes.has(baseRoute)) {
    preloadedRoutes.add(baseRoute);
    routeImports[baseRoute]();
  }
}
