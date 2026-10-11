/** 同网址总结缓存有效期：10 分钟 */
const CACHE_TTL_MS = 10 * 60 * 1000;

export type CachedSummary = {
  title: string;
  summary: string;
  url: string;
};

type CacheEntry = CachedSummary & {
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

/**
 * 读取未过期的总结缓存；过期则删除并返回 null
 */
export function getCachedSummary(url: string): CachedSummary | null {
  const entry = cache.get(url);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(url);
    return null;
  }

  return {
    title: entry.title,
    summary: entry.summary,
    url: entry.url,
  };
}

/** 写入总结缓存 */
export function setCachedSummary(data: CachedSummary): void {
  cache.set(data.url, {
    ...data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}
