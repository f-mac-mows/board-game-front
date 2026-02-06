import fs from 'fs';
import path from 'path';

export function getWikiContent(gameType: string): string | null {
  const fileName = `${gameType.toLowerCase()}.md`;
  
  const fullPath = path.join(process.cwd(), 'src/content/wiki', fileName);
  
  try {
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
    }
  } catch (e) {
    console.error("Runtime fs error:", e);
  }

  return null;
}

// 모든 위키 게임 목록을 가져오는 함수 추가 (SSG용)
export function getAllWikiSlugs(): string[] {
  const wikiDir = path.join(process.cwd(), 'src/content/wiki');
  try {
    return fs.readdirSync(wikiDir)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
  } catch {
    return [];
  }
}