import { WIKI_REGISTRY_ENCODED } from "./wiki-data";

export function getWikiContent(gameType: string): string | null {
  const encoded = WIKI_REGISTRY_ENCODED[gameType.toLowerCase()];
  if (!encoded) return null;

  // Base64 디코딩 (Edge Runtime 호환 방식)
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error("Decoding error:", e);
    return null;
  }
}

export function getAllWikiSlugs(): string[] {
  return Object.keys(WIKI_REGISTRY_ENCODED);
}