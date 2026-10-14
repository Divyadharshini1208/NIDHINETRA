import { fetchApi } from './api';
import { ApiResponse, State, District, Constituency } from '@/types';

// In-memory static cache with TTL expiration for geographic metadata
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour cache duration

let statesCacheItem: CacheItem<State[]> | null = null;
let statesPromise: Promise<ApiResponse<State[]>> | null = null;

const districtCacheMap = new Map<number, CacheItem<District[]>>();
const districtPromises = new Map<number, Promise<ApiResponse<District[]>>>();

const constituencyCacheMap = new Map<number, CacheItem<Constituency[]>>();
const constituencyPromises = new Map<number, Promise<ApiResponse<Constituency[]>>>();

function isFresh(item: CacheItem<any> | null | undefined, ttlMs = DEFAULT_TTL_MS): boolean {
  if (!item) return false;
  return Date.now() - item.timestamp < ttlMs;
}

export const locationService = {
  /**
   * Retrieves all Indian States and UTs with in-flight deduplication, TTL validation, and memory caching.
   * Eliminates redundant network requests across page navigation.
   */
  async getStates(forceRefresh = false): Promise<ApiResponse<State[]>> {
    if (!forceRefresh && isFresh(statesCacheItem)) {
      return { success: true, message: 'Retrieved from cache', data: statesCacheItem!.data };
    }
    if (statesPromise) return statesPromise;

    statesPromise = fetchApi<ApiResponse<State[]>>('/api/locations/states')
      .then((res) => {
        if (res.success && res.data) {
          statesCacheItem = { data: res.data, timestamp: Date.now() };
        }
        return res;
      })
      .catch((err) => {
        // Do not permanently cache errors
        statesCacheItem = null;
        throw err;
      })
      .finally(() => {
        statesPromise = null;
      });

    return statesPromise;
  },

  /**
   * Retrieves districts for a specific state with per-state memory caching and deduplication.
   */
  async getDistrictsByState(stateId: number, forceRefresh = false): Promise<ApiResponse<District[]>> {
    const cached = districtCacheMap.get(stateId);
    if (!forceRefresh && isFresh(cached)) {
      return { success: true, message: 'Retrieved from cache', data: cached!.data };
    }
    if (districtPromises.has(stateId)) return districtPromises.get(stateId)!;

    const p = fetchApi<ApiResponse<District[]>>(`/api/locations/states/${stateId}/districts`)
      .then((res) => {
        if (res.success && res.data) {
          districtCacheMap.set(stateId, { data: res.data, timestamp: Date.now() });
        }
        return res;
      })
      .catch((err) => {
        districtCacheMap.delete(stateId);
        throw err;
      })
      .finally(() => {
        districtPromises.delete(stateId);
      });

    districtPromises.set(stateId, p);
    return p;
  },

  /**
   * Retrieves constituencies for a specific district with caching and deduplication.
   */
  async getConstituenciesByDistrict(districtId: number, forceRefresh = false): Promise<ApiResponse<Constituency[]>> {
    const cached = constituencyCacheMap.get(districtId);
    if (!forceRefresh && isFresh(cached)) {
      return { success: true, message: 'Retrieved from cache', data: cached!.data };
    }
    if (constituencyPromises.has(districtId)) return constituencyPromises.get(districtId)!;

    const p = fetchApi<ApiResponse<Constituency[]>>(`/api/locations/districts/${districtId}/constituencies`)
      .then((res) => {
        if (res.success && res.data) {
          constituencyCacheMap.set(districtId, { data: res.data, timestamp: Date.now() });
        }
        return res;
      })
      .catch((err) => {
        constituencyCacheMap.delete(districtId);
        throw err;
      })
      .finally(() => {
        constituencyPromises.delete(districtId);
      });

    constituencyPromises.set(districtId, p);
    return p;
  },

  /**
   * Invalidate location caches (e.g. upon user logout or administrative data refresh).
   */
  clearCache(): void {
    statesCacheItem = null;
    districtCacheMap.clear();
    constituencyCacheMap.clear();
  }
};
