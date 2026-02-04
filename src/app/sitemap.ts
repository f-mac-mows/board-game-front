// app/sitemap.ts
import { MetadataRoute } from 'next';
import { GAME_TYPE_CONFIG } from '@/types/rooms';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://walrung.com';

  // 1. 위키 상세 페이지들 생성
  const wikiUrls = Object.keys(GAME_TYPE_CONFIG).map((type) => ({
    url: `${baseUrl}/wiki/${type.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 2. 기본 페이지들 (메인, 위키 목록 등)
  const routes = ['', '/wiki', '/privacy', '/terms', '/cookie'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  return [...routes, ...wikiUrls];
}