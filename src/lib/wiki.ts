import { WIKI_REGISTRY_ENCODED } from "./wiki-data";

export function getWikiContent(gameType: string): string | null {
  const encoded = WIKI_REGISTRY_ENCODED[gameType.toLowerCase()];
  if (!encoded) return null;

  try {
    // 1. Base64 문자열을 바이너리로 변환
    const binaryString = atob(encoded);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    // 2. UTF-8로 디코딩 (한글 보존)
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error("Wiki decoding failed:", e);
    return null;
  }
}

export function getAllWikiSlugs(): string[] {
  return Object.keys(WIKI_REGISTRY_ENCODED);
}